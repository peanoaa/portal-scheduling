import type { Wallet } from "../type";
import { ethers } from "ethers";

//声明window.phantom
declare global {
    interface Window {
        phantom?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, handler: (...args: unknown[]) => void) => void;
        };
    }
}

//连接成功后的返回值类型
type PhantomConnectResult = {
    accounts: string[];
    chainId: number;
    address: string;
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


//连接Phantom
const connectPhantom = async (): Promise<PhantomConnectResult> => {
    const eip = window.phantom;
    if (!eip) {
        throw new Error('当前 window.phantom 不是 Phantom，请检查钱包设置');
    }
    eip.on('accountsChanged', onAccountsChanged);
    eip.on('chainChanged', onChainChanged);
    try {
        const accounts = await eip.request({ method: 'eth_requestAccounts' }) as string[];
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const provider = new ethers.BrowserProvider(eip);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const { chainId } = await provider.getNetwork();
        return {accounts, chainId: Number(chainId), address};

    } catch (error) {
        throw new Error('Failed to connect Phantom', { cause: error });
    }
}






export const phantomConnector: Wallet = {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://phantom.app/favicon.ico',
    connector: connectPhantom,
    discription: 'Phantom is a wallet for the Solana blockchain.',
    installed: true,
    downloadlink: 'https://phantom.app/download',
}

export default phantomConnector;