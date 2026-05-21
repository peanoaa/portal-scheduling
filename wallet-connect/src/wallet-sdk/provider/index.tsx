import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { Wallet, WalletContextValue, WalletProviderProps, WalletStatus } from '../type'
import { switchChain } from 'wagmi/actions'
import WalletModal from '../components/WalletModal'


const WalletContext = createContext<WalletContextValue>({//1.创建一个全局的仓库
    // wallet: null,
    connect: async () => { },
    disconnect: async () => { },
    switchChain: async () => { },
    openModal: function (): void { },
    closeModal: function (): void { },
    isConnected: false,
    isConnecting: false,
    address: '',
    chainID: 0,
    ensname: '',
    error: null,
    chains: [],
    provider: undefined
})

const WalletProvider: React.FC<WalletProviderProps> = ({//2.定义组件
    children,
    chains,
    provider,
    autoConnect,
    wallets
}) => {

    const WalletMap = useMemo(() => {
        return wallets?.reduce((acc, wallet) => {
            acc[wallet.id] = wallet;
            return acc;
        }, {} as Record<string, Wallet>);
    }, [wallets]);

    const [state, setState] = useState<WalletStatus>({//3维护状态
        isConnected: false,
        address: '',
        chainID: -1,
        isConnecting: false,
        ensname: '',
        error: null,
        chains,
        provider
    })

    const [isModalOpen, setIsModalOpen] = useState(false);

    const value: WalletContextValue = {//定义操作方法
        ...state,
        connect: async (walletID: string) => {
            const wallet = WalletMap[walletID];
            if (!wallet) {
                throw new Error(`Wallet ${walletID} not found`);
            }
            setState({...state, isConnecting: true, error: null});
            try {
                const result = await wallet.connector();
                setState({...state, isConnecting: false, error: null, isConnected: true, address: result.address, chainID: result.chainId});
                setIsModalOpen(false); // 连接成功后关闭弹窗
            } catch (error) {
                setState({...state, isConnecting: false, error: error as Error});
            }
              

        },
        disconnect: async () => {

        },
        switchChain: async () => {

        },
        openModal: function (): void {
            setIsModalOpen(true);

        },
        closeModal: function (): void {
            setIsModalOpen(false);
        },
    }

    useEffect(() => {
        if (autoConnect) {
            // value.connect()
        }
    })


    return (
        <WalletContext.Provider value={value}>
            {children}
            <WalletModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            wallets={wallets} 
            onSelectWallet={(wallet) => value.connect(wallet.id)} 
            connecting={false} 
            error={null} />
        </WalletContext.Provider>
    )

}

export default WalletProvider;
export { WalletContext }