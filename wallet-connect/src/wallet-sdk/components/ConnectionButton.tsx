import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../provider/useWallet'
import { ethers } from 'ethers'
import type { Chain } from '../type'

interface ConnectionButtonPrps {
    label?: string
    showBalance?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string

    onConnect?: () => void
    onDisconnect?: () => void
    onChainChange?: () => void
    onBalanceChange?: () => void
}

function toHexChainId(chainId: number): string {
    return '0x' + BigInt(chainId).toString(16)
}

const ConnectionButton = ({
    label = 'Connect wallet',
    showBalance = false,
    size = 'md',
    className = '',
    onConnect,

}: ConnectionButtonPrps) => {
    const { disconnect, isConnected, address, chainID, chains, openModal } = useWallet()

    const networkPickerRef = useRef<HTMLDivElement>(null)
    const [networkMenuOpen, setNetworkMenuOpen] = useState(false)
    const [activeChainId, setActiveChainId] = useState<number>(
        typeof chainID === 'number' && chainID > 0 ? chainID : 1
    )

    useEffect(() => {
        if (typeof chainID === 'number' && chainID > 0) {
            setActiveChainId(chainID)
        }
    }, [chainID])

    useEffect(() => {
        const eth = (
            window as Window & {
                ethereum?: {
                    on: (ev: string, cb: (...a: unknown[]) => void) => void
                    removeListener: (ev: string, cb: (...a: unknown[]) => void) => void
                }
            }
        ).ethereum
        if (!eth?.on) return
        const onChainChanged = (hex: string) => {
            try {
                setActiveChainId(parseInt(hex, 16))
            } catch {
                /* ignore */
            }
        }
        eth.on('chainChanged', onChainChanged)
        return () => eth.removeListener('chainChanged', onChainChanged)
    }, [])

    useEffect(() => {
        const onWalletChain = (ev: Event) => {
            const e = ev as CustomEvent<{ chainId?: number }>
            const id = e.detail?.chainId
            if (typeof id === 'number') setActiveChainId(id)
        }
        window.addEventListener('wallet-chain-changed', onWalletChain)
        return () => window.removeEventListener('wallet-chain-changed', onWalletChain)
    }, [])

    useEffect(() => {
        if (!networkMenuOpen) return
        const onDocDown = (e: MouseEvent) => {
            if (networkPickerRef.current && !networkPickerRef.current.contains(e.target as Node)) {
                setNetworkMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', onDocDown)
        return () => document.removeEventListener('mousedown', onDocDown)
    }, [networkMenuOpen])

    //展示余额
    const [balance, setBalance] = useState<string | null>('');
    
    // 获取余额
    useEffect(() => {
        let isMounted = true;
        
        const fetchBalance = async () => {
            try {
                if (!isConnected || !address || !(window as any).ethereum) {
                    if (isMounted) setBalance('');
                    return;
                }
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const balanceBigNumber = await provider.getBalance(address);
                // 转换为 ETH 单位，保留4位小数
                const balanceEth = ethers.formatEther(balanceBigNumber);
                if (isMounted) setBalance(parseFloat(balanceEth).toFixed(4));
            } catch (error) {
                console.error('Failed to fetch balance:', error);
                if (isMounted) setBalance('0.0000');
            }
        };
        
        fetchBalance();
        
        // 清理函数，防止组件卸载后更新状态
        return () => { isMounted = false; };
    }, [isConnected, address, activeChainId]);

    const switchWalletChain = async (chain: Chain) => {
        const eth = window.ethereum
        if (!eth?.request) return
        const chainIdHex = toHexChainId(chain.id)

        try {
            await eth.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            })
            setActiveChainId(chain.id)
            setNetworkMenuOpen(false)
        } catch (e: unknown) {
            const err = e as { code?: number }
            if (err?.code !== 4902) {
                console.warn('Switch chain cancelled or failed', e)
                return
            }
            try {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: chainIdHex,
                            chainName: chain.name,
                            rpcUrls: [chain.rpcUrls],
                            nativeCurrency: chain.currency,
                            blockExplorerUrls: [chain.blockExplorer.url],
                        },
                    ],
                })
                setActiveChainId(chain.id)
                setNetworkMenuOpen(false)
            } catch (addErr) {
                console.warn('Add Ethereum chain cancelled or failed', addErr)
            }
        }
    }

    const currentChain = chains?.find((c) => c.id === activeChainId)
    const currentChainName =
        currentChain?.name ?? (chains?.[0]?.name ?? 'Ethereum')

    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-2.5'
    }

    const handleDisConnect = async () => {
        try {
            await disconnect(); //断开连接
        } catch (e) {
            console.error('Failed to disconnect wallet', e);
        }
    }

    // 地址缩短显示（设计稿样式：0x7b40……）
    const shortAddress = address ? `${address.slice(0, 6)}......` : ''

    const balanceLabel =
        `${Number(balance || 0) < 0.0001 ? '0' : Number(balance || 0).toFixed(4)} ${currentChain?.currency.symbol ?? 'ETH'}`

    if (!isConnected) {
        return (
            <button className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
                onClick={openModal}>
                {label}
            </button>
        )
    }

    // 已连接：右上角与设计稿一致的胶囊区域
    return (
        <div
            className={`fixed top-4 right-4 z-[150] flex items-center gap-3 ${className}`}
            role="status"
            aria-live="polite"
        >
            {/* 网络选择 */}
            <div className="relative" ref={networkPickerRef}>
                <button
                    type="button"
                    aria-expanded={networkMenuOpen}
                    aria-haspopup="listbox"
                    className="flex items-center gap-2 rounded-[999px] border border-neutral-200 bg-white px-3.5 py-2 text-[13px] font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
                    onClick={() => setNetworkMenuOpen((o) => !o)}
                >
                    <GlobeIcon className="h-6 w-6 shrink-0 text-[#2962FF]" aria-hidden />
                    <span>{currentChainName}</span>
                    <ChevronDownIcon
                        className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${networkMenuOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                    />
                </button>
                {networkMenuOpen && chains?.length ? (
                    <div
                        className="absolute right-0 z-[200] mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg"
                        role="listbox"
                    >
                        <ul className="max-h-60 overflow-auto py-1">
                            {chains.map((c) => (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={c.id === activeChainId}
                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm hover:bg-neutral-50 ${
                                            c.id === activeChainId ? 'font-semibold text-neutral-900 bg-neutral-50' : 'text-neutral-700'
                                        }`}
                                        onClick={() => void switchWalletChain(c)}
                                    >
                                        {c.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>

            {/* 地址 + 余额 + 断开 */}
            <div className="flex items-center gap-2 rounded-[999px] border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-700 shadow-sm">
                <span className="truncate font-medium tabular-nums max-w-[9.5rem] sm:max-w-[11rem]">
                    {shortAddress || address}
                </span>
                {showBalance ? (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[13px] font-medium text-neutral-800">
                        {balanceLabel}
                    </span>
                ) : null}
                <button
                    type="button"
                    title="Disconnect"
                    aria-label="Disconnect wallet"
                    className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#E53935] hover:bg-red-50"
                    onClick={(ev) => {
                        ev.stopPropagation()
                        void handleDisConnect()
                    }}
                >
                    <PowerIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    )
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M2.5 12h19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M12 21.75c2.761-5.087 3.087-17.086 0-20.75-3.087 3.664-2.761 15.663 0 20.75Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function PowerIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2v10"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
            />
            <path
                d="M8.464 7.757a9 9 0 107.072 0"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
            />
        </svg>
    )
}

export default ConnectionButton
