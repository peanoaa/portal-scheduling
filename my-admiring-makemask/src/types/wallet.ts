/**
 * 钱包扩展核心类型定义
 * 供 walletStore、background、popup 等模块共享使用
 */

/** 单个钱包账户（由助记词按 BIP44 路径派生，或私钥导入） */
export interface WalletAccount {
    /** 公钥地址，如 0x742d35... */
    address: string;
    /** 私钥；持久化时为 AES 加密字符串，内存中可能为明文 */
    privateKey: string;
    /** 用户自定义显示名称，如 "Account 1" */
    name: string;
    /** HD 派生索引，对应路径 m/44'/60'/0'/0/{index} */
    index: number;
}

/** Zustand store 的数据部分（不含方法） */
export interface WalletState {
    /** 钱包是否锁定；锁定后不可签名、发交易 */
    isLocked: boolean;
    /** 当前是否已与 DApp 建立连接 */
    isConnected: boolean;
    /** 所有账户列表 */
    accounts: WalletAccount[];
    /** 当前选中的账户 */
    currentAccount: WalletAccount | null;
    /** AES 加密后的助记词 */
    mnemonic: string | null;
    /** SHA256 密码哈希，用于 unlockWallet 校验 */
    password: string | null;
    /** 当前使用的网络 */
    currentNetwork: Network;
    /** 用户可切换的网络列表（含自定义网络） */
    networks: Network[];
    /** 用户手动添加的代币 / NFT 资产 */
    tokens: Token[];
}

/** 区块链网络配置 */
export interface Network {
    /** 内部唯一标识，如 'sepolia'、'ethereum' */
    id: string;
    /** UI 显示名称 */
    name: string;
    /** JSON-RPC 节点地址，用于读链、发交易 */
    rpcUrl: string;
    /** 链 ID，如 1=主网、11155111=Sepolia */
    chainId: number;
    /** 原生代币符号，如 ETH、POL */
    symbol: string;
    /** 区块浏览器地址，可选 */
    blockExplorerUrl?: string;
}

/** 代币或 NFT 资产 */
export interface Token {
    /** 合约地址 */
    address: string;
    /** 代币符号，如 USDT */
    symbol: string;
    /** 代币全名 */
    name: string;
    /** 精度，ERC20 通常为 18 */
    decimals: number;
    /** 代币标准类型 */
    type: 'ERC20' | 'ERC721' | 'ERC1155';
    /** 余额，链上查询后填充 */
    balance?: string;
    /** NFT 的 tokenId，ERC721/1155 使用 */
    tokenId?: string;
    /** 代币或 NFT 图标 URL */
    image?: string;
}

/** 本地交易历史记录（用于 UI 展示，非链上原始格式） */
export interface Transaction {
    /** 交易哈希 */
    hash: string;
    /** 发送方地址 */
    from: string;
    /** 接收方地址 */
    to: string;
    /** 转账金额（wei 字符串） */
    value: string;
    gasLimit: string;
    gasPrice: string;
    /** 合约调用 calldata，普通转账可省略 */
    data?: string;
    /** 交易方向 */
    type: 'send' | 'receive';
    /** 交易状态 */
    status: 'pending' | 'confirmed' | 'failed';
    /** 时间戳（毫秒） */
    timestamp: number;
    /** 代币合约地址，代币转账时使用 */
    tokenAddress?: string;
    /** 代币符号 */
    tokenSymbol?: string;
}

/**
 * DApp 发来的 RPC 请求（放入队列，由 popup 审批）
 * 对应网页调用 window.ethereum.request(...)
 */
export interface DappRequest {
    /** 请求唯一 ID */
    id: string;
    /** RPC 方法名，如 eth_sendTransaction */
    method: string;
    params: any[];
    /** 请求来源域名 */
    origin: string;
    /** 请求时间戳 */
    timestamp: number;
}

/** EIP-1102：DApp 请求连接钱包、获取账户地址 */
export interface EthRequestAccountsParams {
    method: 'eth_requestAccounts';
    params: [];
}

/** EIP-747：DApp 请求将代币添加到钱包资产列表 */
export interface WatchAssetParams {
    method: 'wallet_watchAsset';
    params: {
        type: 'ERC20' | 'ERC721' | 'ERC1155';
        options: {
            address: string;
            symbol: string;
            decimals?: number;
            image?: string;
            tokenId?: string;
        };
    };
}

/** 内置默认网络列表，walletStore 初始化时使用 */
export const DEFAULT_NETWORKS: Network[] = [
    {
        id: 'sepolia',
        name: 'Ethereum Sepolia Testnet',
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
        chainId: 11155111,
        symbol: 'ETH',
        blockExplorerUrl: 'https://sepolia.etherscan.io'
    },
    {
        id: 'ethereum',
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
        chainId: 1,
        symbol: 'ETH',
        blockExplorerUrl: 'https://etherscan.io'
    },
    {
        id: 'polygon',
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
        chainId: 137,
        symbol: 'POL',
        blockExplorerUrl: 'https://polygonscan.com'
    },
    {
        id: 'polygon-amoy',
        name: 'Polygon Amoy Testnet',
        rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/Hqd_61uGu4Xbq16eZ2j5N',
        chainId: 80002,
        symbol: 'POL',
        blockExplorerUrl: 'https://www.oklink.com/amoy'
    }
];
