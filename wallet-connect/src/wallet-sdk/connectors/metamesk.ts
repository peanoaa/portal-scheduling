import { ethers } from "ethers";
import type { Wallet } from "../type";
// import { }  from ''

//链接成功后的返回值类型
type MetamaskConnectResult = {
    accounts: string[];
    chainId: number;
    address: string;
};

//获取MetaMask的EIP的provider
function getmetaMaskEip() {
    const { ethereum } = window;
    if (!ethereum) return null;

    if (ethereum.providers?.length) {
        return ethereum.providers.find((p: { isMetaMask: boolean }) => p.isMetaMask) ?? null;
    }
    return ethereum.isMetaMask ? ethereum : null;
}

//监听账户链接变化
function onAccountsChanged(accounts: string[]) {
    console.log('accountsChanged', accounts);
    if (accounts.length === 0) {
        window.dispatchEvent(new CustomEvent('wallet-disconnected'));//触发断开连接事件
    } else {
        window.dispatchEvent(new CustomEvent('wallet-accounts-changed', { detail: accounts }));//触发账户变化事件
    }
}

//监听区块链网络的切换
function onChainChanged(newChainIdHex: string) {
    const newChainId = parseInt(newChainIdHex, 16);
    window.dispatchEvent(new CustomEvent('wallet-chain-changed', { detail: { chainId: newChainId } }));
}

//连接MetaMask

const connectMetamask = async (): Promise<MetamaskConnectResult> => {

    const eip = getmetaMaskEip();
    if (!eip) {
        throw new Error('当前 window.ethereum 不是 MetaMask，请检查钱包设置');
    }

    eip.on('accountsChanged', onAccountsChanged)
    eip.on('chainChanged', onChainChanged)
    try {
        const accounts = await eip.request({ method: 'eth_requestAccounts' }) as string[];
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const provider = new ethers.BrowserProvider(eip);

        //获取钱包地址
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const { chainId } = await provider.getNetwork();

        return { accounts, chainId: Number(chainId), address };
    } catch (error) {
        throw new Error('Failed to connect metamask', { cause: error });
    }

}

// function setState(arg0: any) {
//     throw new Error("Function not implemented.");
// }

export const metamaskConnector: Wallet = {
    id: 'MetaMask',
    name: 'MetaMask',
    icon: 'data:image/png;base64,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',
    connector: connectMetamask,
    discription: 'MetaMask is a browser extension that allows you to connect to the Ethereum network.',
    installed: true,
    downloadlink: 'https://metamask.io/download/',
}

export default metamaskConnector;