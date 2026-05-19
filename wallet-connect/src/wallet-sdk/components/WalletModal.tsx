import React from 'react';
import type { Wallet } from '../type';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    onSelectWallet: (wallet: Wallet) => void;
    connecting: boolean;
    error: Error | null;
}

const WalletModal = ({ isOpen, onClose, wallets, onSelectWallet, connecting, error }: WalletModalProps) => {

    if (!isOpen) return null;
    return (
        <div className='fixed inset-0 bg-black/50 z-50 flex justify-center items-center' onClick={onClose}>
            <div className='bg-white p-4 rounded-lg'>
                <h2 className='text-2xl font-bold text-center' >Wallet Modal</h2>

                {/* 渲染 */}
                <div className='space-y-3 max-h-[60vh] overflow-y-auto pr-1'>
                    {
                        wallets.map((wallet) => (
                            <div key={wallet.id} className='flex items-center gap-2'
                                onClick={(e) => { 
                                    e.stopPropagation() 
                                    onSelectWallet(wallet) 
                                }}>
                                <img src={wallet.icon} alt={wallet.name} className='w-10 h-10 rounded-full' />
                                <span>{wallet.name}</span>
                            </div>
                        ))
                    }

                </div>
            </div>
        </div>
    )
}

export default WalletModal;