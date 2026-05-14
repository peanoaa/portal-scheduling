import { ethers } from "ethers";
const provider = ethers.getDefaultProvider();
const main = async () => {
    const balance = await provider.getBalance(`vitalik.eth`);
    console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`);
    // 利用公共rpc节点连接以太坊网络
    // 可以在 https://chainlist.org 上找到
    const ALCHEMY_MAINNET_URL = 'https://rpc.ankr.com/eth';
    const ALCHEMY_SEPOLIA_URL = 'https://rpc.sepolia.org';

    
    // 连接以太坊主网
    const providerETH = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)
    // 连接Sepolia测试网
    const providerSepolia = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)
    //查主链余额
    const balanceof = await providerETH.getBalance(`vitalik.eth`)
    console.log(`ETH Balance of vitalik 主链: ${ethers.formatEther(balanceof)} ETH`);
    //查测试链余额
    const balanceofsepolia = await providerSepolia.getBalance(`vitalik.eth`)
    console.log(`ETH Balance of vitalik 测试链: ${ethers.formatEther(balanceofsepolia)} ETH`);

    //查链地址
    const network = await prowiderEth.getNetwork()
    console.log(`network: ${network}`);
    const networkSepolia = await providerSepolia.getNetwork()
    console.log(`networkSepolia: ${networkSepolia}`);

    //查区块高度
    const blockNumber = await providerEth.getBlockNumber()
    console.log(`blockNumber: ${blockNumber}`);
    const blockNumberSepolia = await providerSepolia.getBlockNumber()
    console.log(`blockNumberSepolia: ${blockNumberSepolia}`);

    //查钱包交易次数
    const transactionCount = await providerETH.getTransactionCount(`vitalik.eth`)
    console.log(`transactionCount: ${transactionCount}`);
    const transactionCountSepolia = await providerSepolia.getTransactionCount(`vitalik.eth`)
    console.log(`transactionCountSepolia: ${transactionCountSepolia}`);

    // 查询当前建议的 gas 设置
    const gasPrice = await providerETH.getFeeData(`vitalik.eth`)
    console.log(`gasPrice: ${gasPrice}`);
    const gasPriceSepolia = await providerSepolia.getFeeData(`vitalik.eth`)
    console.log(`gasPriceSepolia: ${gasPriceSepolia}`);

    //查区块信息
    const block = await providerEth.getBlock(0);//参数为区块高低
    console.log(`block: ${block}`);
    const blockSepolia = await providerSepolia.getBlock(0);//参数为区块高低
    console.log(`blockSepolia: ${blockSepolia}`);
    

    //查某个地址的合约bytecode
    const contract = await providerEth.getCoder('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');//参数为合约地址
    



}



main()