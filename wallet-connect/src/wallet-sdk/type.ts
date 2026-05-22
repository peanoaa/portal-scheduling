export interface WalletStatus {//钱包状态
    isConnected: boolean;//判断是否连接钱包
    address: string | null;//用户所在地址
    chainID: number | null;//区块链网络所在id
    isConnecting: boolean;//判断是否正在连接中
    ensname: string | null;//用户ens名称
    error: Error | null;//错误信息
    chains: Chain[];//区块链网络列表
    provider?: any; 
    balance:string | null;
}

export interface WalletContextValue extends WalletStatus {//操作
    connect: (WalletID: string) => Promise<void>;// 连接钱包
    disconnect: () => Promise<void>;//断开连接
    switchChain: (chainID: string) => Promise<void>;//切换网络
    openModal: () => void;//打开钱包选择模态框
    closeModal: () => void;//关闭钱包选择模态框

}

export type Chain = {//网络
    id: number,//区块链网络id
    name: string,//区块链网络名称
    rpcUrls: string,//区块链网络rpc地址
    currency: {
        name: string,//币种名称
        symbol: string,//币种符号
        decimals: number,//币种精度
    },
    blockExplorer: {
        name: string,//区块链网络浏览器名称
        url: string,//区块链网络浏览器地址
    },
}

export type WalletProviderProps = {//配置
    children: React.ReactNode;
    chains: Chain[];
    wallets?: Wallet[];
    autoConnect?: boolean;
    provider?: any;
}

export interface Wallet {
    chainID: number;
    address: string;//钱包
    id: string;
    name: string;
    icon: string;
    connector: () => Promise<any>;
    discription?: string;
    installed?: boolean;
    downloadlink?: string;
}