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

// eslint-disable-next-line react-hooks/rules-of-hooks
const WalletMap = useMemo(() => {
    return wallets?.reduce((acc, wallet) => {
        acc[wallet.id] = wallet;
        return acc;
    }, {} as Record<string, Wallet>);
},[wallets]);

const WalletProvider: React.FC<WalletProviderProps> = ({//2.定义组件
    children,
    chains,
    provider,
    autoConnect,
    wallets
}) => {
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
                await wallet.connector();
                setState({...state,  error: null, isConnected: true, address: wallet.address, chainID: wallet.chainID});
            } catch (error) {
                setState({...state, error: error as Error});
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
            onSelectWallet={value.connect} 
            connecting={false} 
            error={null} />
        </WalletContext.Provider>
    )

}
export const useWallet = (): WalletContextValue => {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('usewaller must be used within a WalletProvider')
    }
    return context;
} 

export default WalletProvider;