import { ethers } from "ethers";
import type { Wallet } from "../type";


type OkxWalletConnectResult = {
    accounts: string[];
    chainId: number;
    address: string;
}

const connectOkxWallet = async (): Promise<OkxWalletConnectResult> => {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const { chainId } = await provider.getNetwork();
        return { accounts, chainId: Number(chainId), address };

        //监听账户链接变化
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log('accountsChanged', accounts);
            if (accounts.length === 0) {
                window.dispatchEvent(new CustomEvent('wallet-disconnected'));//触发断开连接事件
            } else {
                window.dispatchEvent(new CustomEvent('wallet-accounts-changed', { detail: accounts }));//触发账户变化事件
            }
        });

        //监听区块链网络的切换
        window.ethereum.on('chainChanged', (newChainIdHex: string) => {
            const newChainId = parseInt(newChainIdHex);
            window.dispatchEvent(new CustomEvent('wallet-chain-changed', { detail: {chainId: newChainId} }));
        });
    } catch (error) {
        throw new Error('Failed to connect okx wallet', { cause: error });
    }
}


export const okxWalletConnector: Wallet = {
    id: 'OkxWallet',
    name: 'OkxWallet',
    icon: 'data:image/png;base64,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',
    connector: connectOkxWallet,
    discription: 'OkxWallet is a browser extension that allows you to connect to the Ethereum network.',
    installed: true,
    downloadlink: 'https://okxwallet.io/download/',
}

export default okxWalletConnector;