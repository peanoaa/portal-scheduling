import './styles.css'

import ConnectionButton from './components/ConnectionButton'
import WalletProvider from './provider'

export { useWallet } from './provider/useWallet'
export { ConnectionButton, WalletProvider }
export type {
    Chain,
    Wallet,
    WalletStatus,
    WalletContextValue,
    WalletProviderProps,
  } from './type'

export { metamaskConnector } from './connectors/metamesk'
export { okxWalletConnector } from './connectors/okxwallet'
export { phantomConnector } from './connectors/phantom'