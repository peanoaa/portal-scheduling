
// DApp Provider 服务文件
// 实现一个类似 MetaMask window.ethereum 的 Provider
// 让网页 DApp 可以通过标准 JSON-RPC 方法和钱包交互

// DApp Provider Service - 实现EIP-1102和EIP-747标准、

//钱包状态来源
import { useWalletStore } from '@/stors/walletStore';

//定义请求和provider接口
//描述一个Dapp请求
interface DappRequest {
    id: string;//请求id
    method: string;//rpc方法名，如：eth_requestAccounts
    params: any[];//参数数组
    origin: string;//请求来源域名
}

//模仿EIP-1193 provider形态
interface WalletProvider {
    isMyWallet: boolean;//标识这是你自己的钱包 Provider
    request: (request: { method: string; params?: any[] }) => Promise<any>;//DApp 调用钱包能力的统一入口
    on: (event: string, handler: Function) => void;//监听事件，比如 accountsChanged
    removeListener: (event: string, handler: Function) => void;//移除事件监听
    selectedAddress: string | null;//当前选中的账户地址
    chainId: string | null;//当前链 ID，十六进制格式，例如 0x1
    networkVersion: string | null;//当前网络 ID，十进制字符串，例如 1
}

//实现MyWalletProvider类

class MyWalletProvider implements WalletProvider {

    //暴露给Dapp使用
    //使用
    //if (window.ethereum?.isMyWallet) {
    // 当前钱包是你的钱包
    // }
    public isMyWallet = true;//标识这是你自己的钱包 Provider
    public selectedAddress: string | null = null;//当前选中的账户地址
    public chainId: string | null = null;//当前链 ID，十六进制格式，例如 0x1
    public networkVersion: string | null = null;//当前网络ID

    //内部属性
    private eventListeners: Map<string, Function[]> = new Map();//用来保存事件监听器
    //例如：window.ethereum.on('accountsChanged', handler)会把 handler 存到 eventListeners 里。
    private connectedAccounts: string[] = [];//保存已经授权给 DApp 的账户地址列表

    //构造函数
    //创建 Provider 实例时，会立刻同步一次钱包状态
    //也就是说初始化时会从 walletStore 里读取：
    //当前账户
    //当前网络
    //是否锁定
    //等状态，更新到内部属性里。
    constructor() {
        this.updateWalletState();
    }

    //Zustand 钱包状态同步到 Provider 属性
    private updateWalletState() {
        //获取钱包状态
        const store = useWalletStore.getState();
        //如果当前账户存在且未锁定，则更新 Provider 属性
        if (store.currentAccount && !store.isLocked) {
            this.selectedAddress = store.currentAccount.address;//当前选中的账户地址
            this.chainId = `0x${store.currentNetwork.chainId.toString(16)}`;//当前链 ID，十六进制格式，例如 0x1
            this.networkVersion = store.currentNetwork.chainId.toString();//当前网络 ID，十进制字符串，例如 1
        } else {
            this.selectedAddress = null;
            this.chainId = null;
            this.networkVersion = null;
        }
    }

    // 实现各种Dapp请求方法
    //核心函数，Dapp调用钱包的统一入口
    async request(request: { method: string; params?: any[] }): Promise<any> {
        const { method, params } = request;
        switch (method) {
            // 用于请求连接钱包账户。对应 EIP-1102。
            case 'eth_requestAccounts':
                return await this.requestAccounts();

            // 返回当前已经授权给 DApp 的账户列表
            case 'eth_accounts':
                return this.connectedAccounts;

            //返回当前链 ID，十六进制字符串
            case 'eth_chainId':
                this.updateWalletState();
                return this.chainId;

            //返回当前网络 ID，十进制字符串
            case 'net_version':
                this.updateWalletState();
                return this.networkVersion;

            //用于让 DApp 请求钱包添加某个代币。对应 EIP-747。
            case 'wallet_watchAsset':
                return this.handleWatchAsset(params[0]);

            //用于让 DApp 请求添加一条新的 EVM 网络。
            case 'wallet_addEthereumChain':
                return this.handleAddEthereumChain(params[0]);

            //用于让 DApp 请求切换当前网络
            case 'wallet_switchEthereumChain':
                return this.handleSwitchEthereumChain(params[0]);

            //用于发送交易
            case 'eth_sendTransaction':
                return this.handleSendTransaction(params[0]);

            //用于普通消息签名。
            case 'eth_sign':
            case 'personal_sign':
                return this.handleSign(method, params);

            //于结构化数据签名，例如 EIP-712。
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
                return this.handleSignTypedData(method, params);

            default:
                // 不是上面列出的特殊钱包方法，就转发到当前网络的 JSON-RPC Provider
                const store = useWalletStore.getState();
                const provider = store.getProvider();
                if (provider) {
                    return provider.send(method, params);
                }
                throw new Error(`Unsupported method: ${method}`);
        }
    }

    //连接钱包账户，EIP-1102: eth_requestAccounts
    // 如果钱包锁定，拒绝连接。
    // 如果没有当前账户，拒绝连接。
    // 否则直接把当前账户授权给 DApp。
    // 触发 accountsChanged 事件。
    // 返回账户地址数组。
    private async requestAccounts(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            //获取钱包状态
            const store = useWalletStore.getState();

            //如果钱包锁定，拒绝连接。
            if (store.isLocked) {
                reject(new Error('Wallet is locked'));
                return;
            }

            //如果没有当前账户，拒绝连接。
            if (!store.currentAccount) {
                reject(new Error('No current account'));
                return;
            }

            // 在实际实现中，这里应该显示一个确认对话框让用户批准
            // 目前简化处理，直接返回当前账户
            //直接把当前账户授权给 DApp。
            const account = store.currentAccount.address;
            this.connectedAccounts = [account];//保存已经授权给 DApp 的账户地址列表
            this.selectedAddress = account;//当前选中的账户地址
            this.emit('accountsChanged', [account]);//触发 accountsChanged 事件
            resolve([account]);//返回账户地址数组
        })

    }


    //让 DApp 请求添加代币
    private async handleWatchAsset(params: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                // 从参数中取出：
                const { type, options } = params;
                //获取钱包状态
                const store = useWalletStore.getState();
                // 检查代币类型是否支持：
                if (!['ERC20', 'ERC721', 'ERC1155'].includes(type)) {
                    reject(new Error('Unsupported asset type'));
                    return;
                }
                // 在实际实现中，这里应该显示一个确认对话框
                // 目前简化处理，直接添加代币
                // 构造 token 对象：
                const token = {
                    address: options.address,
                    symbol: options.symbol,
                    name: options.name,
                    decimals: options.decimals || 18,
                    type: type as 'ERC20' | 'ERC721' | 'ERC1155',
                    image: options.image,
                }

                store.addToken(token);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        })
    }

    // 添加一条 EVM 网络
    //它会从 DApp 传入的参数中构造项目内部的 Network 对象
    private async handleAddEthereumChain(params: any): Promise<null> {
        return new Promise((resolve, reject) => {
            try {
                const store = useWalletStore.getState();
                const network = {
                    id: params.chainName.toLowerCase().replace(/\s+/g, '-'),
                    name: params.chainName,
                    rpcUrl: params.rpcUrls[0],
                    chainId: parseInt(params.chainId, 16),
                    symbol: params.nativeCurrency.symbol,
                    blockExplorerUrl: params.blockExplorerUrls[0],
                };
                store.addNetwork(network);
                resolve(null);

            } catch (error) {
                reject(error);
            }

        })

    }

    private async handleSwitchEthereumChain(params: any): Promise<null> {
        return new Promise((resolve, reject) => {
            try {
                //获取钱包状态
                const store = useWalletStore.getState();
                //解析十六进制chainld
                const chainId = parseInt(params.chainId, 16);
                //从已有的网络中查找对应的网络
                const network = store.networks.find(net => net.chainId === chainId);

                if (!network) {
                    reject(new Error('Network not found'));
                    return;
                }
                //找到就调用
                store.switchNetwork(network.id);
                //触发事件
                this.emit('chainChanged', params.chainId);
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }


    //发送交易
    private async handleSendTransaction(params: any): Promise<string> {
        // 在实际实现中，这里应该打开发送交易的界面
        // 目前返回模拟的交易哈希
        throw new Error('Please use the wallet interface to send transactions');
    }

    //普通签名
    private async handleSign(method: string, params: any[]): Promise<string> {
        // 在实际实现中，这里应该打开签名确认界面
        throw new Error('Signing not implemented');
    }

    //结构化数据签名
    private async handleSignTypedData(method: string, params: any[]): Promise<string> {
        // 在实际实现中，这里应该打开签名确认界面
        throw new Error('Typed data signing not implemented');
    }


    //实现事件监听机制


    //注册事件监听器
    on(event: string, handler: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(handler);
    }

    //移除事件监听器
    removeListener(event: string, handler: Function): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }


    //触发事件
    private emit(event: string, data?: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

}



//创建provider实例注入到window.ethereum和window.mywallet

// 创建provider实例
export const myWalletProvider = new MyWalletProvider();

// 注入到window对象 (模拟content script)
export const injectProvider = () => {
    if (typeof window !== 'undefined') {
        // 注入到window.ethereum (兼容MetaMask)
        (window as any).ethereum = myWalletProvider;

        // 注入到window.mywallet
        (window as any).mywallet = myWalletProvider;

        // 触发ethereum注入事件
        window.dispatchEvent(new Event('ethereum#initialized'));
    }
};

// 在应用启动时自动注入
if (typeof window !== 'undefined') {
    injectProvider();
}




