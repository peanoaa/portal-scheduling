
import { ethers } from 'ethers'

//将链id转换为十六进制
export function toHexChainId(chainId: number) {
    return '0x' + BigInt(chainId).toString(16)
}

//根据钱包id获取钱包的provider
export function getEipByWalletId(walletId: string) {
    switch (walletId) {
        case 'MetaMask': {
            const { ethereum } = window as any
            if (!ethereum) return null
            if (ethereum.providers?.length) {
                return ethereum.providers.find((p: any) => p.isMetaMask) ?? null
            }
            return ethereum.isMetaMask ? ethereum : null
        }
        case 'OkxWallet':
            return (window as any).okxwallet ?? null
        case 'phantom':
            return (window as any).phantom ?? null
        default:
            return null
    }
}

//创建浏览器提供者
export function createBrowserProvider(walletId: string) {
    const eip = getEipByWalletId(walletId)
    if (!eip) return undefined
    return new ethers.BrowserProvider(eip)
}