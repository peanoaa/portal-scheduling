/**
 * 桥接脚本
 * 
 * 网页(injected-helper)消息 => 桥接(message-bridge)转发 => 插件(background/index)接受到网页消息，处理消息并返回处理信息 => 桥接将处理的信息转给 => 网页
 * 
 * 网页脚本：插入到网页上下文， 但是不能访问不到 chrom.runtime
 */

import { dataLength, fromTwos } from "ethers";

// 是这个钱包扩展里的 Content Script 消息桥。它本身不处理钱包逻辑，只负责把网页主环境里的钱包请求转发给扩展后台，再把后台结果转回网页。
// DApp 页面
//   -> window.myWallet.connect/signMessage(...)
//   -> injected-helper.ts 通过 window.postMessage 发消息
//   -> message-bridge.ts 收到消息
//   -> chrome.runtime.sendMessage 发给 background/index.ts
//   -> background 调 walletStore 处理连接/签名/账户
//   -> message-bridge.ts 把结果 window.postMessage 回页面
//   -> injected-helper.ts 的 Promise resolve/reject

//监听来自 injected-helper 的消息
window.addEventListener("message", (event) => {
    console.log('message-bridge收到消息:', event);
//     这里的过滤条件很重要：
//     event.source !== window：只处理当前页面发给自己的消息。
//     event.data.from !== "injected-helper"：只接受钱包注入脚本发来的请求。
//     type：表示操作类型，比如连接钱包、获取账户、签名。
//     requestId：用于把异步响应匹配回原始请求。
//     requestId 对应 injected - helper.ts 里每次请求生成的 ID：
    if (
        event.source !== window ||
        !event.data ||
        event.data.from !== 'injected-helper' ||
        !event.data.requestId || 
        !event.data.type
    ) {
        return;
    }

    //转发消息被background
    chrome.runtime.sendMessage({
        type:event.data.type,
        requestId:event.data.requestId,
        data:event.data.data
    },(response) => {
        console.log('收到来自 background 的响应',response);
        if(chrome.runtime.lastError){
            console.log('转发消息到background失败',chrome.runtime.lastError);
            window.postMessage({
                from:'message-bridge',
                requestId:event.data.requestId,
                success:false,
                error:chrome.runtime.lastError?.message
            },window.location.origin);
            return;
            
        }
        window.postMessage({
            from:'message-bridge',
            requestId:event.data.requestId,
            success:true,
            data:response.data
        },"*")
    })

})


