import React, { useState } from 'react';
import { useWallet } from '../provider'
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
    const { connect, desconnect, isConnected, address, chainID, ensname, openModal, closeModal } = useWallet()

    //展示余额
    const [balance, setBalance] = useState<string | null>('');
    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-2.5'
    }

    const handleConnect = async () => {
        try {
            await connect('injected');
        } catch (e) {
            console.error('Failed to connect wallet', e);
        }
    }

    const handleDisConnect = async () => {
        try {
            await connect('injected');
        } catch (e) {
            console.error('Failed to disconnect wallet', e);
        }
    }
    if (!isConnected) {
        return (
            <button className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
                onClick={openModal}>
                {label}
            </button>
        )
    }
    return (
        <button className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
            onClick={closeModal}>
            {label}
        </button>
    )

}

export default ConnectionButton