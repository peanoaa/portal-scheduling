import { Chain, Wallet,metamaskConnector,okxWalletConnector,phantomConnector } from '@leimoyi/wallet-connect-sdk'
// connectors 目前需从 wallet-connect 源码复制，或等 SDK 导出
export const chains: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrls: 'https://...',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrls: 'https://sepolia.infura.io/v3/...',
    currency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
]
export const wallets: Wallet[] = [
  metamaskConnector,
  okxWalletConnector,
  phantomConnector,
]