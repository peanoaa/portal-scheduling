//注入到网页的钱包对象

// 这个函数不是普通 import 后直接调用的业务函数，而是会被 chrome.scripting.executeScript 注入到网页中执行
// 它的核心作用是给网页挂载：
// window.myWallet
// 最终：
// window.myWallet = myWallet
// window.myWalletInjected = true
// console.log("myWallet 已经注入到页面"); 
// 这样 DApp 页面就可以写：
// await window.myWallet.connect()
// await window.myWallet.getAccount()
// await window.myWallet.signMessage("hello")
// await window.myWallet.disconnect()

export default function injectMyWallet() {
    console.log('injected-helper');

    //防止重复注入
    if (window.myWallet && window.myWalletInjected) {
        return
    }

    //消息类型常量
    // 这里和 type_constant.ts 里重复定义了一份。
    // 原因是：injectMyWallet 会被作为函数注入到页面主世界执行。注入执行时，
    // 它不是正常模块运行环境，不能可靠依赖外部 import 的变量。
    // 所以这些常量必须写在函数内部，确保函数被序列化注入后还能独立运行。
    const WALLET_CONNECT = 'WALLET_CONNECT';
    const WALLET_GET_ACCOUNT = 'WALLET_GET_ACCOUNT';
    const WALLET_SIGN_MESSAGE = 'WALLET_SIGN_MESSAGE';
    const WALLET_DISCONNECT = 'WALLET_DISCONNECT';

    // requestId的作用
    //请求id,每次请求都生成唯一id，因为网页可能同事发多个请求，所有需要
    const generateRequestId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    //链接钱包
    // 网页调用 window.myWallet.connect() 时，它不会直接连钱包，而是发一个 window.postMessage 消息出去。
    // 这个消息会被 message-bridge.ts 接收到，然后转发给 background。
    // 之后它注册一个监听器等待响应：
    // 当收到正确响应时：成功：resolve(account)，失败：reject(error)，还有超时处理
    const myWallet = {
        connect: async () => {
            console.log('connect');

            return new Promise((resolve, reject) => {
                console.log('发送消失到，message-bridge.ts');
                const requestId = generateRequestId()
                //打印信息
                console.log('requestId :', requestId);
                console.log("aaaaaa");
                console.log(WALLET_CONNECT);

                //向桥接发送链接请求
                // 这个消息会被 message-bridge.ts 接收到，然后转发给 background。
                const message = {
                    type: WALLET_CONNECT,
                    requestId,
                    from: 'injected-helper',
                }

                // window.postMessage(message, '*')
                console.log(message);
                console.log(window.location.origin);

                // 发送到所有域
                window.postMessage(message, "*")

                //监听链接结果
                const handleResponse = (event: MessageEvent) => {
                    console.log("handleResponse:", event);

                    if (!_isValidResponse(event, requestId)) return
                    //清除监听
                    window.removeEventListener('message', handleResponse);

                    if (event.data.success) {
                        resolve(event.data.data.account);
                    } else {
                        reject(event.data.error || '链接失败');
                    }
                }
                window.addEventListener('message', handleResponse);
                //超时处理
                setTimeout(() => {
                    window.removeEventListener('message', handleResponse);
                    reject(new Error('连接超时'));
                }, 3000)
            })
        },

        //获取当前账户信息，只读取，不触发连接逻辑
        getAccount: async () => {
            return new Promise((resolve, reject) => {
                const requestId = generateRequestId();
                const message = {
                    type: WALLET_GET_ACCOUNT,
                    requestId,
                    from: 'injected-helper',
                }
                window.postMessage(message, "*")

                const handleResponse = (event: MessageEvent) => {
                    if (!_isValidResponse(event, requestId)) return

                    window.removeEventListener('message', handleResponse);
                    if (event.data.success) {
                        resolve(event.data.data.account);
                    } else {
                        reject(event.data.error || '获取账户信息失败');
                    }
                }
                window.addEventListener('message', handleResponse);
            })
        },

        //签名信息
        signMessage: async (message: string) => {
            console.log('message:', message);
            return new Promise((resolve, reject) => {
                const requestId = generateRequestId();
                const messageData = {
                    type: WALLET_SIGN_MESSAGE,
                    requestId,
                    from: 'injected-helper',
                    data: {
                        message,
                    }
                }

                console.log(messageData);
                window.postMessage(messageData, window.location.origin)
                console.log('22');
                const handleResponse = (event: MessageEvent) => {
                    console.log(event);

                    if (!_isValidResponse(event, requestId)) return
                    window.removeEventListener('message', handleResponse);

                    if (event.data.success) {
                        resolve(event.data.data.signature);
                    } else {
                        reject(event.data.error || '签名失败');
                    }
                }
                window.addEventListener('message', handleResponse);
                setTimeout(() => {
                    window.removeEventListener('message', handleResponse);
                    reject(new Error('签名超时'));
                }, 3000)
            })
        },

        //断开连接
        disconnect: async () => {
            return new Promise((resolve, reject) => {
                const requestId = generateRequestId();
                const message = {
                    type: WALLET_DISCONNECT,
                    requestId,
                    from: 'injected-helper',
                }
                window.postMessage(message, "*")
                const handleResponse = (event: MessageEvent) => {

                    if (!_isValidResponse(event, requestId)) return

                    window.removeEventListener('message', handleResponse);
                    resolve(true);
                }
                window.addEventListener('message', handleResponse);
            })
        }
    }


    //这个函数保证只处理符合预期的响应。
    // 它检查：
    // 消息来源是当前 window
    // 有 data
    // data.from 是 message-bridge
    // requestId 和当前请求一致
    // 这可以避免页面上其他脚本发来的无关 message 被误处理。
    function _isValidResponse(event: MessageEvent, requestId: string) {
        return event.source === window &&
               event.data && 
               event.data.from === 'message-bridge' &&
               event.data.requestId === requestId;
    }

    window.myWallet = myWallet;
    window.myWalletInjected = true;
    console.log('mywallet,已经注入到页面');
    
}