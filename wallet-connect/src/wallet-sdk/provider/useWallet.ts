import { useContext } from 'react'
import { WalletContext } from './index'
import type { WalletContextValue } from '../type'

export const useWallet = (): WalletContextValue => {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context;
}
