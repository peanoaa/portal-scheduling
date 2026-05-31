import { useEffect, useRef } from 'react';
import { useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '@leimoyi/wallet-connect-sdk';

/**
 * 桥接组件：当自定义 WalletProvider 连接/断开时，同步 wagmi 的连接状态。
 * 确保 wagmi hooks（useSendTransaction、useWriteContract 等）使用正确的钱包。
 */
export function WagmiWalletSync() {
  const { isConnected, address } = useWallet();
  const { connectors, connectAsync } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    const walletId = localStorage.getItem('wallet-connect:lastWalletId');

    // 已连接且钱包有变化：同步到 wagmi
    if (isConnected && walletId && walletId !== lastSyncedId.current) {
      lastSyncedId.current = walletId;

      // 根据自定义 SDK 的钱包 ID 找到对应的 wagmi connector
      const targetConnector = connectors.find((c) => {
        switch (walletId) {
          case 'MetaMask':
            return c.id === 'metaMask';
          case 'OkxWallet':
            return c.id === 'okxWallet';
          case 'phantom':
            return c.id === 'phantom';
          default:
            return false;
        }
      });

      if (targetConnector) {
        connectAsync({ connector: targetConnector }).catch((err) => {
          console.warn('Wagmi sync connect failed:', err);
          lastSyncedId.current = null;
        });
      }
    }

    // 已断开连接：同步到 wagmi
    if (!isConnected && lastSyncedId.current) {
      lastSyncedId.current = null;
      wagmiDisconnect().catch(() => {});
    }
  }, [isConnected, address, connectors, connectAsync, wagmiDisconnect]);

  return null;
}
