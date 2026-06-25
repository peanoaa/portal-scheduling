//入口文件
// 把钱包能力暴露给普通网页 DApp，并把网页请求安全地转发到扩展后台处理。
// 普通网页 DApp
//   -> window.myWallet.connect()
//   -> injected-helper.ts
//   -> window.postMessage
//   -> contents/message-bridge.ts
//   -> chrome.runtime.sendMessage
//   -> background/index.ts
//   -> walletStore
//   -> 返回结果
// 普通网页不能直接访问 chrome.runtime。
// Content Script 可以访问 chrome.runtime，但它和网页 JS 不是同一个 JS 上下文。
// Background 可以访问扩展 API、storage、状态管理，是处理钱包敏感逻辑的地方。
// 如果想让网页调用钱包，就必须把一个 API 对象注入到网页的 window 上。
// injected-helper.ts 负责给网页暴露 API
// ，message-bridge.ts 负责桥接
// index.ts 负责后台处理
// type_constant.ts 和 types.ts 负责协议和类型辅助

import { useWalletStore } from '@/stors/walletStore';
import * as constant from './type_constant';
import injectMyWallet from './injected-helper';
import { electroneum } from 'wagmi/chains';


//初始化函数

const initWallet = () => {
    const walletStore = useWalletStore.getState();
    //ToDO初始化逻辑实现
    console.log('初始化钱包');
}

//注册消息监听器
const setupMessageListener = () => {
    console.log('监听来自message-bridge的消息');
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('收到消息:', message, '来自:', sender.tab?.id);

        //处理链接钱包
        if (message.type === constant.WALLET_CONNECT) {
            const walletStore = useWalletStore.getState();

            try {
                walletStore.connect().then(() => {
                    // 去钱包 store 中读取当前账户。如果插件里没有账户，会抛出错误；如果有账户，则返回当前账户给网页。
                    const account = walletStore.currentAccount;
                    sendResponse({
                        data: { account }
                    })
                }).catch((error) => {
                    sendResponse({
                        data: { error: error.message }
                    })
                })
            } catch (error) {
                sendResponse({
                    data: { error: error instanceof Error ? error.message : '链接失败' }
                })
            }
            //异步调用 sendResponse，必须返回 true，否则消息通道会提前关闭
            return true;
        }


        //获取账号请求
        //网页调用 window.myWallet.getAccount() 时，返回当前账户。
        if(message.type === constant.WALLET_GET_ACCOUNT) {
            const walletStore = useWalletStore.getState();
            const account = walletStore.currentAccount;
            sendResponse({
                data: { account }
            })
            return true;
        }

        //处理签名
        // 网页传入一段消息，background 调用 walletStore.signMessage() 进行签名。
        //先检查是否有内容
        if(message.type === constant.WALLET_SIGN_MESSAGE) {
            if(!message.data || !message.data.message) {
                sendResponse({
                    data:{error:'缺少签名消息'}
                })
                return true;
            }

            const walletStore = useWalletStore.getState();
            try{
                walletStore.signMessage(message.data.message).then((signedMessage) =>{
                    sendResponse({
                        data:{signedMessage}
                    })
                }).catch((error) => {
                    sendResponse({
                        data: { error: error.message },
                      })
                })
            }catch(error){
                sendResponse({
                    data: { error: error instanceof Error ? error.message : '签名失败' }
                })
            }
            return true;
        }

        //处理断开链接
        // 网页请求断开连接时，调用 store 的 disconnect()，然后返回成功
        if(message.type === constant.WALLET_DISCONNECT) {
            const walletStore = useWalletStore.getState();
            walletStore.disconnect();
            sendResponse({
                data: { success: true }
            })
            return true;
        }
    })
}



//注入钱包脚本到网页
//让DApp 能访问 window.ethereum 或 window.mywallet。
//浏览器扩展的content script 默认运行在隔离环境里，网页自己的js访问不到，dapp调用的是网页环境的window.ethereum
//所以钱包provider必须注入到MAIN world，Dapp才能访问
const setupScriptInjection = () => {
    //当页面加载完成时注入
    //tabId: 页面ID，changeInfo: 变化信息，tab: 页面信息
    //
    chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
        if(changeInfo.status === 'complete'  && tab.url && !tab.url.startsWith('chrome://')) {
            console.log('页面加载完成，注入mywallet',tab.url);
            chrome.scripting.executeScript({
                target:{tabId},
                world:'MAIN',
                func:injectMyWallet
            },() =>{
                if(chrome.runtime.lastError) {
                    console.error('注入脚本失败',chrome.runtime.lastError);
                    
                }else{
                    console.log('脚本注入成功');
                    
                }
            })
        }

    })


    //当便签激活时也注入（备用）
    chrome.tabs.onActivated.addListener((e) => {
        chrome.tabs.get(e.tabId,(tab) => {
            if(tab.url && !tab.url.startsWith('chrome://')){
                console.log("标签激活，注入mywallet",tab.url);
                chrome.scripting.executeScript({
                    target:{tabId:e.tabId},
                    world:'MAIN',
                    func:injectMyWallet
                },() =>{
                    if(chrome.runtime.lastError) {
                        console.error('注入脚本失败',chrome.runtime.lastError);
                    }else{
                        console.log('脚本注入成功');
                        
                    }
                })
                
            }
        })

    })

}


//初始化
initWallet()

//监听来自message-bridge的消息
setupMessageListener()

//注入钱包脚本到页面
setupScriptInjection()




