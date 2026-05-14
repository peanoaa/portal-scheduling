import { ethers } from 'ehters'

async function name() {
    //创建provide实例
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    //创建随机的wallet对象
    const wallet1 = ethers.Wallet.createRandom();
    const wallet1WithProvider = wallet1.connect(provider)
    const mnemonic = wallet1.mnemonic // 获取助记词

    // 用私钥创建 wallet 对象
    const privatekey = '0f03a73988c990c2333bbbcd99d442377fedbe48083a8a9c4426ace223c33e5d';//私钥
    const wallet2 = new ethers.Wallet(privatekey, provider)

    // 从助记词创建 wallet 对象
    const wallet3 = ethers.Wallet.fromPhrase(mnemonic.phrase)

    //发送交易
    const tx = {
        to: address,
        value: ethers.parseEther('0.01')
    }
    const txRes = await wallet2.sendTransaction(tx);
    const receipt = await txRes.wait();// 等待链上确认交易
    console.log(receipt);// 等待链上确认交易

    //获取钱包地址
    const address1 = await wallet1.getAddress();
    const address2 = await wallet2.getAddress();
    const address3 = await wallet3.getAddress();


    console.log(`address1: ${address1}`);
    console.log(`address2: ${address2}`);
    console.log(`address3: ${address3}`);

    //获取注词器
    console.log(`钱包1助词器：${wallet1.mnemonic.phrase}`);
    console.log(`钱包2助词器：${wallet2.mnemonic.phrase}`);
    console.log(`钱包3助词器：${wallet3.mnemonic.phrase}`);

    //获取私钥
    console.log(`钱包2私钥：${wallet2.privateKey}`);

    // // 等待链上确认交易
    const count1 = await providet.getTransactionCount(wallet1WithProvider);
    const txCount2 = await provider.getTransactionCount(wallet2)
    console.log(`钱包1发送交易次数: ${count1}`)
    console.log(`钱包2发送交易次数: ${txCount2}`)

    //发送ETH
    console.log(`打印address1的钱包余额：${ethers.formatEther(await provider.getBalance(address1))}`);
    console.log(`打印address2的钱包余额：${ethers.formatEther(await provider.getBalance(address2))}`);
    const tx2 = {
        to: address1,
        value: ethers.parseEthers('0.01');
    }
    //发送
    const rescpt = await wallet2.sendTransaction(tx2);
    await receipt.wait();//等待链上确认
    console.log('交易已确认');
    console.log(`打印address1的钱包余额：${ethers.formatEther(await provider.getBalance(address1))}`);
    console.log(`打印address2的钱包余额：${ethers.formatEther(await provider.getBalance(address2))}`);
    
}

name()