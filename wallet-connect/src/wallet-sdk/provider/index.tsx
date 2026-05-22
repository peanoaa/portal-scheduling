import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { Wallet, WalletContextValue, WalletProviderProps, WalletStatus } from '../type'
import WalletModal from '../components/WalletModal'
import { ethers } from 'ethers'
import { watchNativeBalance } from '../balance/watchNativeBalance'
import { createBrowserProvider, getEipByWalletId, toHexChainId } from '../utils'




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
    provider: undefined,
    balance: null,
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
        provider,
        balance: null,
    })

    const [isModalOpen, setIsModalOpen] = useState(false);

    const value: WalletContextValue = {//定义操作方法
        ...state,
        connect: async (walletID: string) => {
            const wallet = WalletMap[walletID];//获取钱包
            if (!wallet) {
                throw new Error(`Wallet ${walletID} not found`);
            }
            // setState({...state, isConnecting: true, error: null});
            setState((prev) => ({ ...prev, isConnecting: true, error: null }))//设置连接中状态
            try {
                const result = await wallet.connector();//连接钱包
                const browserProvider = createBrowserProvider(walletID);//创建浏览器提供者
                // setState({...state, isConnecting: false, error: null, isConnected: true, address: result.address, chainID: result.chainId});
                setState((prev) => ({ //设置状态
                    ...prev, 
                    isConnecting: false, 
                    error: null, 
                    isConnected: true, 
                    address: result.address, 
                    chainID: result.chainId,
                    provider: browserProvider,

                }))
                setIsModalOpen(false); // 连接成功后关闭弹窗
                localStorage.setItem('wallet-connect:lastWalletId', walletID);
            } catch (error) {
                // setState({...state, isConnecting: false, error: error as Error});
                setState((prev) => ({ ...prev, isConnecting: false, error: error as Error }))
                throw error;
            }

        },
        disconnect: async () => {
            setIsModalOpen(false);
            const walletId = localStorage.getItem('wallet-connect:lastWalletId')
            const eip = walletId ? getEipByWalletId(walletId) : null;
            eip?.removeAllListeners?.();

            setState((prev) => ({
                ...prev, 
                isConnected: false, 
                address: '', 
                chainID: -1, 
                provider: undefined,
                balance: null,
            }));
            window.dispatchEvent(new CustomEvent('wallet-disconnected'));//触发断开连接事件
            localStorage.removeItem('wallet-connect:lastWalletId');
        },
        switchChain: async (chainID: string) => {
            const chainId = Number(chainID)
            const chain = state.chains.find((c) => c.id === chainId)
            if (!chain) throw new Error(`Unsupported chain: ${chainId}`)
            const walletId = localStorage.getItem('wallet-connect:lastWalletId')
            if (!walletId) throw new Error('Wallet not connected')
            const eip = getEipByWalletId(walletId)
            if (!eip?.request) throw new Error('Wallet provider not available')
            const chainIdHex = toHexChainId(chainId)
            try {
                await eip.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainIdHex }],
                })
            } catch (e: unknown) {
                const code = (e as { code?: number })?.code
                if (code !== 4902) throw e
                await eip.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: chainIdHex,
                        chainName: chain.name,
                        rpcUrls: [chain.rpcUrls],
                        nativeCurrency: chain.currency,
                        blockExplorerUrls: [chain.blockExplorer.url],
                    }],
                })
            }
            setState((prev) => ({ ...prev, chainID: chainId, error: null }))

        },
        openModal: function (): void {
            setIsModalOpen(true);

        },
        closeModal: function (): void {
            setIsModalOpen(false);
        },
    }

    //自动连接钱包
    useEffect(() => {
        if (!autoConnect) return;
        const lastId = localStorage.getItem('wallet-connect:lastWalletId');
        if (!lastId || !WalletMap[lastId]) return;
        value.connect(lastId).catch((error) => {
            localStorage.removeItem('wallet-connect:lastWalletId');
        });
    }, [autoConnect, WalletMap]);

    //监听区块链网络的切换
    useEffect(() => {
        const onChain = (e: Event) => {
            const { chainId } = (e as CustomEvent<{ chainId: number }>).detail;
            setState((prev) => ({ ...prev, chainID: chainId }))
        }
        window.addEventListener('wallet-chain-changed', onChain);
        return () => window.removeEventListener('wallet-chain-changed', onChain);
    }, []);

    //监听账户的变化
    useEffect(() => {
        const onAccounts = (e: Event) => {
            const accounts = (e as CustomEvent<string[]>).detail
            setState((prev) => ({ ...prev, address: accounts[0] }))
        }
        window.addEventListener('wallet-accounts-changed', onAccounts);
        return () => window.removeEventListener('wallet-accounts-changed', onAccounts);
    }, []);

    //监听原生币余额的变化
    useEffect(() => {
        if (!state.provider || !state.address) return;
        const walletId = localStorage.getItem('wallet-connect:lastWalletId')
        if(!walletId) return;
        const eip = getEipByWalletId(walletId)
        if(!eip) return;

        const stop = watchNativeBalance(
            eip, 
            state.address, 
            (balanceWei) => {
                const eth = ethers.formatEther(balanceWei)
                const formatted = parseFloat(eth).toFixed(4)
                setState((prev) => ({ ...prev, balance: formatted }))
            },
            { pollIntervalMs: 15_000 }
        )
        return stop;
    }, [state.isConnected, state.address, state.chainID]);


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