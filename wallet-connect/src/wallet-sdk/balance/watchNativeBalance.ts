import { ethers } from 'ethers'

type EipProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/** 三个钱包共用：监听原生币余额变化 */
export function watchNativeBalance(
  eip: EipProvider,
  address: string,
  onUpdate: (balanceWei: bigint) => void,
  options?: { pollIntervalMs?: number } // 可选轮询兜底
) {
  const provider = new ethers.BrowserProvider(eip)
  let cancelled = false

  const fetchBalance = async () => {
    if (cancelled) return
    try {
      const wei = await provider.getBalance(address)
      if (!cancelled) onUpdate(wei)
    } catch (e) {
      console.error('getBalance failed', e)
    }
  }

  // 初次拉取
  void fetchBalance()

  // 方式 A：每个新区块查一次（实时，三个钱包都一样）
  const onBlock = () => void fetchBalance()
  provider.on('block', onBlock)

  // 方式 B：connector 已派发的账户/链变化 → 立刻刷新
  const onAccounts = () => void fetchBalance()
  const onChain = () => void fetchBalance()
  const onManual = () => void fetchBalance()

  window.addEventListener('wallet-accounts-changed', onAccounts)
  window.addEventListener('wallet-chain-changed', onChain)
  window.addEventListener('wallet-balance-refresh', onManual) // 交易 confirm 后手动触发

  // 可选：轮询兜底（部分环境 block 事件不稳定）
  const timer = options?.pollIntervalMs
    ? window.setInterval(() => void fetchBalance(), options.pollIntervalMs)
    : undefined

  // 清理函数（断开连接时必须调用）
  return () => {
    cancelled = true
    provider.off('block', onBlock)
    window.removeEventListener('wallet-accounts-changed', onAccounts)
    window.removeEventListener('wallet-chain-changed', onChain)
    window.removeEventListener('wallet-balance-refresh', onManual)
    if (timer != null) clearInterval(timer)
  }
}