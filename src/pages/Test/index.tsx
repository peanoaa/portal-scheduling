import { Block } from 'ethers'
import { createPublicClient, http, createWalletClient } from 'viem'
import { mainnet,sepolia } from 'viem/chains'
 
const client = createPublicClient({ 
  chain: sepolia, 
  transport: http('https://rpc.sepolia.org'), 
}) 

const walletClient = createWalletClient({
  chain: sepolia,
  transport: http('https://rpc.sepolia.org'),
})

const BlockNumber = client.getBlockNumber();


export default function Index() {
  return <div>Hello world</div>
}