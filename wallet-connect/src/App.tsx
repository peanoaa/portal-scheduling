import { useState } from 'react'
import {WalletProvider,ConnectionButton} from './wallet-sdk'
import { ethers } from 'ethers'
import type { Wallet } from './wallet-sdk/type';
import metamaskConnector from './wallet-sdk/connectors/metamesk';

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

const wallets: Wallet[] = [metamaskConnector];

function App() {
  // const [count, setCount] = useState(0)

  const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;

  return (
    <>
      
        <WalletProvider chains={chains} provider={provider} autoConnect={true} wallets={wallets}>
          <div className='bg-[#f40] w-[40px] h-[20px]'>
            test
          </div>
          <ConnectionButton showBalance={true} />
        </WalletProvider>
    </>
  )
}

export default App
