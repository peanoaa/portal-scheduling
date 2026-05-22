import {WalletProvider,ConnectionButton} from './wallet-sdk'
import type { Wallet } from './wallet-sdk/type';
import metamaskConnector from './wallet-sdk/connectors/metamesk';
import { okxWalletConnector } from './wallet-sdk/connectors/okxwallet';
import { phantomConnector } from './wallet-sdk/connectors/phantom';

declare global {
  interface Window {
    ethereum: any;
  }
}

const chains = [
  {
    id:1,
    name:'Ethereum',
    rpcUrls:'https://eth-mainner.g.alchemy.com/v2/your-api-key',
    currency:{
      name:'Ether',
      symbol:'ETH',
      decimals:18
    },
    blockExplorer: {
      name:'Etherscan',
      url:'https://etherscan.io',
    },
  },
  {
    id:11155111,
    name:'Sepolia',
    rpcUrls:'https://sepolia.infura.io/v3/d8ed0bd1de8242d998a1405b6932ab33',
    currency:{
      name:'Sepolia Ether',
      symbol:'ETH',
      decimals:18
    },
    blockExplorer: {
      name:'Etherscan',
      url:'https://sepolia.etherscan.io',
    },
  }
]

const wallets: Wallet[] = [metamaskConnector,okxWalletConnector,phantomConnector];

function App() {

  return (
    <>      
        <WalletProvider chains={chains}  autoConnect={true} wallets={wallets}>          
          <ConnectionButton showBalance={true} />
        </WalletProvider>
    </>
  )
}

export default App
