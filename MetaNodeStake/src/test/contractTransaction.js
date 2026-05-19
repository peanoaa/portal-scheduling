import { ethers } from 'ethers';

async function main() {
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');

    const privaceKey = '0f03a73988c990c2333bbbcd99d442377fedbe48083a8a9c4426ace223c33e5d';
    const wallet = new ethers.Wallet(privaceKey, provider);

    const abiWETH = [
        "function balanceOf(address) public view returns(uint)",
        "function deposit() public payable",
        "function transfer(address, uint) public returns (bool)",
        "function withdraw(uint) public",
    ];
    const addresscontract = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9';

    const contract = new ethers.Contract(addresscontract, abiWETH, wallet);

    //看余额
    const address = await wallet.getAddress();
    const balancevalue = await contract.balanceOf(address);
    console.log(`地址余额：${ethers.formatEther(balancevalue)}`);
    
    const tx = await contract.deposit({value: ethers.parseEther('0.01')});

    await tx.wait();

    console.log(`交易已确认`);

    const balalceValuedeposit  = await contract.balanceOf(address);
    console.log(`存款后余额：${ethers.formatEther(balalceValuedeposit)}`);

    //调用合约的转账

    const tx2 = await contract.transfer('vitalik.eth',ethers.parseEther('0.01'));
    await tx2.wait();
    console.log(`交易已确认`);
    //查转账后的余额
    const balanceWETH_transfer = await contract.balanceOf(address)
    console.log(`转账后WETH持仓: ${ethers.formatEther(balanceWETH_transfer)}\n`)



}

main()