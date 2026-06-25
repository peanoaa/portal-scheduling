/*
*钱包状态管理，
*基于Zustand+persist管理钱包状态
*通过 chrome.storage.local 持久化数据
 * 主要功能模块：
 * 1. 钱包管理：创建钱包、导入钱包（助记词/私钥）、解锁/锁定钱包
 * 2. 账户管理：创建账户、切换账户、更新账户名称
 * 3. 网络管理：添加自定义网络、切换网络
 * 4. 代币管理：添加/删除代币、更新代币余额
 * 5. DApp 集成：连接钱包、签名消息、断开连接
 * 
 *  * 安全特性：
 * - 使用 AES 加密存储助记词和私钥
 * - 使用 SHA256 哈希存储密码
 * - 所有敏感数据在存储前均经过加密处理
 * 
 *  * 
 * 技术实现：
 * - 使用 BIP39 标准生成和验证助记词
 * - 使用 BIP44 路径 (m/44'/60'/0'/0/0) 派生账户
 * - 使用 ethers.js 进行钱包操作和 RPC 交互
*/

//导入钱包相关类型
import { type Network, type Token, type WalletAccount, type WalletState, DEFAULT_NETWORKS } from '@/types/wallet';
//导入助记词生成库
import * as bip39 from 'bip39';//？？？？
import { AES, SHA256, enc } from 'crypto-js';//？？？
import { ethers } from 'ethers';
import { log } from 'node:console';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


//先继承WalletState，再定义方法
interface WalletStore extends WalletState {
    //钱包管理
    //创建新钱包：生成助记词、派生第一个账户，用密码加密后存起来。返回助记词和账户信息。
    createWallet: (password: string) => Promise<{ mnemonic: string, account: WalletAccount }>;
    //用助记词导入已有钱包，验证助记词后派生账户并加密存储。
    importWallet: (mnemonic: string, password: string) => Promise<WalletAccount>;
    //用私钥导入单个账户（可指定名称），追加到账户列表。
    importPrivateKey: (privateKey: string, password: string, name?: string) => Promise<WalletAccount>;
    //用密码解锁钱包。密码正确返回 true，否则 false
    unlockWallet: (password: string) => boolean;
    //锁定钱包，敏感操作前需要重新解锁。
    lockWallet: () => void;

    //账户管理
    //从同一助记词按 BIP44 路径派生新账户（m/44'/60'/0'/0/n）。
    createAccount: (name?: string) => WalletAccount;
    //把当前使用的账户切换到指定地址。
    switchAccount: (address: string) => void;
    //修改某个账户的显示名称。
    updateAccountName: (address: string, name: string) => void;

    //网络管理
    //添加自定义 RPC 网络（如测试网、侧链）
    addNetwork: (network: Network) => void;
    //切换到指定 id 的网络（如 sepolia、ethereum）。
    switchNetwork: (networkId: string) => void;

    //代币管理
    //添加 ERC20/721/1155 代币到资产列表
    addToken: (token: Token) => void;
    //从列表移除指定合约地址的代币
    removeToken: (address: string) => void;
    //更新某个代币的余额显示
    updateTokenBalance: (address: string, balance: string) => void;

    //工具方法
    //根据当前网络的 rpcUrl 创建 ethers.JsonRpcProvider，用于读链上数据、发交易。
    getProvider: () => ethers.JsonRpcProvider | null;
    //校验输入密码是否与已保存的密码哈希一致。
    isValidPassword: (password: string) => boolean;

    //扩展
    //供网页 DApp 连接钱包：从 chrome.storage.local 读取账户，设置 isConnected: true。
    connect: () => Promise<WalletAccount>;
    //用当前账户私钥对消息签名（DApp 登录、授权等场景
    signMessage: (message: string) => Promise<string>;
    //断开 DApp 连接，清空当前账户连接状态
    disconnect: () => void;


}

//初始状态
const initialState: WalletState = {
    isLocked: false,//钱包是否锁定
    isConnected: false,//当前是否连接 DApp
    accounts: [],//钱包账户列表
    currentAccount: null,//当前选中的账户
    mnemonic: null,//加密后的助记词
    password: null,//SHA256 后的密码
    currentNetwork: DEFAULT_NETWORKS[0],//当前网络
    networks: DEFAULT_NETWORKS,//网络列表
    tokens: []//代币列表

}

//钱包本地状态中心：保存账户、助记词、密码哈希、当前网络、代币列表、连接状态等
//钱包业务操作入口：提供创建钱包、导入钱包、切换账户、签名消息、连接 DApp 等方法。
export const useWalletStore = create<WalletStore>()(
    // 使用 persist 让状态持久化
    persist(
        (set, get) => ({
            //添加初始化状态
            ...initialState,

            //创建钱包
            createWallet: async (password: string) => {
                //生成助词器
                const mnemonic = bip39.generateMnemonic();
                //把助记词转成 seed
                const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
                // 转成 Uint8Array
                const seed = new Uint8Array(seedBuffer);
                console.log('seed', seed);
                console.log('mnemonic', mnemonic);
                console.log('seedBuffer', seedBuffer);

                //生成钱包
                const hdNode = ethers.HDNodeWallet.fromSeed(seed)
                //生成账户
                const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");
                //账户对象
                const account: WalletAccount = {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    name: 'Account 1',
                    index: 0
                }
                //使用 AES.encrypt 加密助记词和私钥。
                const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();
                const encryptedPrivateKey = AES.encrypt(account.privateKey, password).toString();

                //使用 SHA256(password) 保存密码哈希。
                set({
                    isLocked: false,
                    accounts: [{ ...account, privateKey: encryptedPrivateKey }],
                    currentAccount: account,
                    mnemonic: encryptedMnemonic,
                    password: SHA256(password).toString(),
                })

                return { mnemonic, account };
            },

            // 通过助记词导入钱包
            importWallet: async (mnemonic: string, password: string) => {
                //校验助词器
                if (!bip39.validateMnemonic(mnemonic)) {
                    throw new Error('Invalid mnemonic phrase');
                }
                //把助记词转成 seed
                const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
                // 转成 Uint8Array
                const seed = new Uint8Array(seedBuffer);
                //生成钱包
                const hdNode = ethers.HDNodeWallet.fromSeed(seed);
                //生成账户
                const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");

                //构建账户对象
                const account: WalletAccount = {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    name: 'Imported Account',
                    index: 0
                }

                //使用 AES.encrypt 加密助记词和私钥。
                const encryptedMnemonic = AES.encrypt(mnemonic, password).toString();
                const encryptedPrivateKey = AES.encrypt(account.privateKey, password).toString();

                set({
                    isLocked: false,
                    accounts: [{ ...account, privateKey: encryptedPrivateKey }],
                    currentAccount: account,
                    mnemonic: encryptedMnemonic,
                    password: SHA256(password).toString(),
                })
                return account;
            },
            //私钥导入
            importPrivateKey: async (privateKey: string, password: string, name = 'Imported Account') => {
                //用 new ethers.Wallet(privateKey) 校验并生成钱包。
                try {
                    const wallet = new ethers.Wallet(privateKey);//生成钱包
                    const existingAccounts = get().accounts;//获取现有账户列表

                    //构建账户
                    const account: WalletAccount = {
                        address: wallet.address,
                        privateKey: wallet.privateKey,
                        name,
                        index: existingAccounts.length,
                    }
                    //使用 AES.encrypt 加密私钥。
                    const encryptedPrivateKey = AES.encrypt(account.privateKey, password).toString();

                    //更新状态
                    set(state => ({
                        accounts: [...state.accounts, { ...account, privateKey: encryptedPrivateKey }],
                        currentAccount: account,
                        password: state.password || SHA256(password).toString(),
                    }));

                    return account
                } catch (error) {
                    throw new Error('Invalid private key');
                }
            },

            //解锁和锁定
            unlockWallet: (password: string) => {
                const state = get();
                //进行密码哈希对比，正确就把isLocked设置为false
                const hashedPassword = SHA256(password).toString();
                if (hashedPassword === state.password) {
                    set({ isLocked: false });
                    return true;
                }
                return false;
            },

            //锁定钱包
            lockWallet: () => {
                set({ isLocked: true });
            },

            //创建新账户
            createAccount: (name?: string) => {
                //检查助词器和密码是否存在
                const state = get();
                if (!state.mnemonic || !state.password) {
                    throw new Error('No Wallet found');
                }
                //解密助词器
                const decryptedMnemonic = AES.decrypt(state.mnemonic, state.password).toString(enc.Utf8);
                //把助记词转成 seed
                const seedBuffer = bip39.mnemonicToSeedSync(decryptedMnemonic);
                // 转成 Uint8Array
                const seed = new Uint8Array(seedBuffer);
                //生成钱包
                const hdNode = ethers.HDNodeWallet.fromSeed(seed);
                //获取账户索引
                const accountIndex = state.accounts.length;
                //生成账户
                const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${accountIndex}`);
                //构建账户对象
                const account: WalletAccount = {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    name: name || `Account ${accountIndex + 1}`,
                    index: accountIndex,
                }
                //使用 AES.encrypt 加密私钥。
                const encryptedPrivateKey = AES.encrypt(account.privateKey, state.password).toString();
                //更新状态
                set(state => ({
                    accounts: [...state.accounts, { ...account, privateKey: encryptedPrivateKey }],
                    currentAccount: account,
                }));
                return account;
            },
            //账户管理
            switchAccount: (address: string) => {
                //根据地址查找账户进行切换
                const state = get();
                const account = state.accounts.find(account => account.address === address);
                if (account) {
                    set({ currentAccount: account });
                }

            },

            //修改某个账户的显示名称
            updateAccountName: (address: string, name: string) => {
                //同时更新accounts列表里的账户名称
                //如果当前账户就是这个地址，也更新current.name
                set(state => ({
                    //更新accounts列表里的账户名称
                    accounts: state.accounts.map(account => account.address === address ? { ...account, name } : account),
                    //更新currentAccount的名称
                    currentAccount: state.currentAccount?.address === address ? { ...state.currentAccount, name } : state.currentAccount,
                }));
            },

            //网络管理
            addNetwork: (network: Network) => {
                //添加一个自定义网络
                set(state => ({
                    networks: [...state.networks, network],
                }))

            },

            //切换网络
            switchNetwork: (networkId: string) => {
                //根据网络id切换网络
                const state = get();
                const network = state.networks.find(network => network.id === networkId);
                if (network) {
                    set({ currentNetwork: network });
                }

            },
            //代币管理
            addToken: (token: Token) => {
                //添加代币时先过滤相同地址的旧代币，在加入新代币，即存在就更新，不存在就添加
                set(state => ({
                    tokens: state.tokens.filter(token => token.address !== token.address).concat(token),
                }))

            },
            //从列表移除指定合约地址的代币
            removeToken: (address: string) => {
                //根据地址删除代币
                set(state => ({
                    tokens: state.tokens.filter(token => token.address !== address),
                }));

            },
            //更新某个代币的余额显示
            updateTokenBalance: (address: string, balance: string) => {
                //根据token地址更新余额字段
                set(state => ({
                    tokens: state.tokens.map(token => token.address === address ? { ...token, balance } : token),
                }));

            },

            //Provider与密码校验
            getProvider: () => {
                //根据当前网络prc创建ethers provider
                //如果prc配置异常，捕获错误并返回null
                const state = get();
                try {
                    return new ethers.JsonRpcProvider(state.currentNetwork.rpcUrl);
                } catch (error) {
                    console.error('Failed to create provider', error);
                    return null;
                }
            },
            //校验输入密码是否与已保存的密码哈希一致。
            isValidPassword: (password: string) => {
                const state = get();
                const hashedPassword = SHA256(password).toString();
                return hashedPassword === state.password;

            },
            //拓展
            isConnected: false,
            //Dapp链接拓展能力
            connect: async (): Promise<WalletAccount> => {
                // 它直接从 chrome.storage.local 读取 wallet-store：
                const state = await new Promise<WalletState | null>((resolve) => {
                    chrome.storage.local.get('wallet-store', (result) => {
                        console.log('钱包信息:', result['wallet-store']);
                        resolve(result['wallet-store']?.state || null);
                    });
                })

                if (!state || state.isLocked) {
                    throw new Error('请先在插件中导入账户');
                }
                console.log(state);
                console.log(state.currentAccount);

                const account = state.currentAccount as WalletAccount;
                set({
                    currentAccount: account,
                    isConnected: true
                });
                return account;
            },
            //对 DApp 传来的消息签名。
            signMessage: async (message: string) => {
                // 从 localStorage.getItem("wallet-store") 读取钱包状态。
                const { state } = JSON.parse(localStorage.getItem("wallet-store"));
                console.log('钱包信息：', state);
                // 取当前账户。
                const account = state.currentAccount;
                if (!account) {
                    throw new Error('未链接钱包');
                }
                // 解密当前账户的私钥
                const bytes = AES.decrypt(account.privateKey, state.password);
                const privateKey = bytes.toString(enc.Utf8);
                //用 ethers.Wallet(privateKey) 创建钱包对象。
                const wallet = new ethers.Wallet(privateKey);
                //调用 wallet.signMessage(message) 返回签名
                return wallet.signMessage(message)
            },
            //断开 DApp 连接，清空当前账户连接状态
            disconnect: () => {
                set({
                    currentAccount: null,
                    isConnected: false
                });
            }

        }),
        {
            //持久化配置
            name: 'wallet-store',
            //自定义存储，使用chrome.storage.local
            storage: {
                getItem: async (name: string) => {
                    const result = await chrome.storage.local.get(name);
                    return result[name] || null;

                },
                setItem: async (name: string, value: any) => {
                    await chrome.storage.local.set({ [name]: value });

                },
                removeItem: async (name: string) => {
                    await chrome.storage.local.remove(name);

                }
            },
            //永久化配置：只保存必要的状态，不保存敏感信息。
            partialize: (state) => ({
                accounts: state.accounts,
                mnemonic: state.mnemonic,
                password: state.password,
                networks: state.networks,
                tokens: state.tokens,
                currentNetwork: state.currentNetwork,
                currentAccount: state.currentAccount,
                isConnected: state.isConnected
            })

        }
    )
);