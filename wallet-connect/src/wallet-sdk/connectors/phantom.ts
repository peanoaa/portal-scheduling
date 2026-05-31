import type { Wallet } from "../type";
import { ethers } from "ethers";

//声明window.phantom
declare global {
    interface Window {
        phantom?: {
            ethereum: any;
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
    const eip = window.phantom?.ethereum;
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
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADh0lEQVR4nOyaXW7aQBDH/2tAaqW2ITdwTpBwgpgTpJEapD4Vn4BwAuAG7QlMn/qRSJAT1D1ByWOfwg1CSKRIDfZ2BuxgjO1gbBMs5fcQs7ve3dnZmd2ddRTkHAU552UAz00RG6ZnyPI/3GqKEIdSSlVAqhIou+UCGNHfEYQYQOLiRH9rRrUnsAFY6AnGderuiJJanLok4NAGOjX9XTekPDvOjFuNejgSUta9Wl4HHkgBpeqx/nroy0+fnnGvTvBgIKa2V2AkoVRr+puBm5HqAGamctcC5CmyY1REqeLORGqrEJuLhds/GQvPlJ3ZnZJ4Bjak9SXIp3R27EQzwLa+Ia0vQZr/5DzXg02G1vBe0tUlCRJWpYA1ODfuGlT9O/18hWdEQPyNbUKk+ZaE/RmJkLTbyiatJntsy7Pd11MKOaS8Y1oyK0Hl8/egxTpKsPBUrY2ESIimZ2ft/jTGbMvG/A3R+aC/6zuJwZlxo1Jey9+OArG/8gykJTzjPxaUYPWjyoshM87+t9IA0hQ+iGN999FE+MgQVe7j6QH8MMbv0xa+Z1yri+n7xzRpVaXy8mL53UFYW0p0R/dqYcE202GCYsObtsRDy1feWiy3G2Fthe4DvMPyJsUaQTaYpO/fJMIhAg591G+f9pnLsHKGzS10AOfdsSEl6thmBMzAZZSWtfrWC09QRHe55ANs95TZQi4Qg6UBsENlaPcpYw0WfMCJpK6QA/i4UdN39hZ8wBsobDt0jDBnT4fz6YaVegybGXSe+spPZZ6BBnICm497XzQdgLOVa8gNouP+mg7Av5VvMzPnnZ9Wi06uhtww1/40Nb09g/yFHOAund48MiFbQy6QIwt21Z+rOKe9VDpAtnQ+6rtDfyYPIK1rkQushWyu8E7nRN8JDCtpAPIACaHzSJeuOPrxa8om1Rs+8Q4L3w4rTXw3yo5VgNW0Y19wzbRKdU1uI6hdUk01Sngm0Rca7oQdq0ZBN8WtgwnsVWs2XZPggP2bcV0tQDmlrzY7tpQ3Akqf1npzlZYEBS9XYo3jsyu817HOjDEvx1pUHRJOf+qzURwUBTK28wUJz0xg6eHmIDsl2JU0hWdib2QkzBcSpB1xV+Ne/JbZL0oomf7PQmkiZh3etIOu7nxvmpCik7YGk/IYkZEjqUUobcrZp4B+uqIIIYYcOLNTbZvgLhv5zJolL/9q8NzkfgD/AQAA//8R1GKdAAAABklEQVQDAEYJhzksC9GEAAAAAElFTkSuQmCC',
    connector: connectPhantom,
    discription: 'Phantom is a wallet for the Solana blockchain.',
    installed: true,
    downloadlink: 'https://phantom.app/download',
}

export default phantomConnector;