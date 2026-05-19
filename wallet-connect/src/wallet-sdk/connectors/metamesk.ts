import { ethers } from "ethers";
import type { Wallet } from "../type";
// import { }  from ''


type MetamaskConnectResult = {
    accounts: string[];
    chainId: number;
    address: string;
};

const connectMetamask = async (): Promise<MetamaskConnectResult> => {
    //去判断
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const provider = new ethers.BrowserProvider(window.ethereum);

        //获取钱包地址
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const { chainId } = await provider.getNetwork();
        // const chainId = await window.ethereum.request({ method: 'eth_chainId' });


        //监听账户链接变化
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log('accountsChanged', accounts);
            if (accounts.length === 0) {
                // setState({...state, address: accounts[0]});
                window.dispatchEvent(new CustomEvent('wallet-disconnected'));
            } else {
                window.dispatchEvent(new CustomEvent('wallet-accounts-changed', { detail: accounts }));
            }
        });

        //监听区块链网络的切换
        window.ethereum.on('chainChanged', (newChainIdHex: string) => {
            // console.log('chainChanged', chainId);
            const newChainId = parseInt(newChainIdHex);
            window.dispatchEvent(new CustomEvent('wallet-chain-changed', { detail: {chainId: newChainId} }));
        });

        return { accounts, chainId: Number(chainId), address };
    } catch (error) {
        throw new Error('Failed to connect metamask', { cause: error });
    }

}

// function setState(arg0: any) {
//     throw new Error("Function not implemented.");
// }

export const metamaskConnector: Wallet = {
    id:'MetaMask', 
    name:'MetaMask',
    icon:'https://meta-mask.io/images/metamask-logo.png',
    connector:connectMetamask,
    discription:'MetaMask is a browser extension that allows you to connect to the Ethereum network.',
    installed:true,
    downloadlink:'https://metamask.io/download/',
  }

  export default metamaskConnector;