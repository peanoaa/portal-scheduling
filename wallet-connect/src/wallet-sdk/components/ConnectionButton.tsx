import { useState, useEffect } from 'react';
import { useWallet } from '../provider/useWallet'
import { ethers } from 'ethers'

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

const ConnectionButton = ({
    label = 'Connect wallet',
    showBalance = false,
    size = 'md',
    className = '',
    onConnect,

}: ConnectionButtonPrps) => {
    const { connect, disconnect, isConnected, address, chainID, ensname, openModal, closeModal } = useWallet()

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
    }, [isConnected, address]);

    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-2.5'
    }

    const handleDisConnect = async () => {
        try {
            await disconnect();
        } catch (e) {
            console.error('Failed to disconnect wallet', e);
        }
    }

    // 地址缩短显示：0x1234...abcd
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

    if (!isConnected) {
        return (
            <button className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
                onClick={openModal}>
                {label}
            </button>
        )
    }

    // 已连接状态：显示地址和余额
    return (
        <div className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer ${sizeClasses[size]} ${className}`}
             onClick={handleDisConnect}>
            {/* 连接状态指示点 */}
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            
            {/* 显示余额（如果启用） */}
            {showBalance && balance && (
                <span>{balance} ETH</span>
            )}
            
            {/* 显示缩短的地址 */}
            <span>{shortAddress || address}</span>
            
            {/* 断开提示 */}
            <span className="text-xs opacity-75">(点击断开)</span>
        </div>
    )
}

export default ConnectionButton
