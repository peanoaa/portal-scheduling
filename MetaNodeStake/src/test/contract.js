import { ethers } from 'ethers';
import { abi } from './abi.json';
async function main() {
    

    const ALCHEMY_SEPOLIA_URL = 'https://rpc.sepolia.org';
    //链接测试网
    const provider  = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)

    //合约操作
    //abi？

    const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const contract = new ethers.Contract(address,abi,provider);
    //读取合于链上信息
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    console.log(`name: ${name}`);//名字
    console.log(`symbol: ${symbol}`);//代号
    console.log(`totalSupply: ${totalSupply}`);//总供给
    const balacnce = await contract.balanceOf('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    console.log(`balacnce持仓: ${ethers.formatEther(balacnce)}`);//余额


    
}


main()