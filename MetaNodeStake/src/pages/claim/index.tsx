import styles from '../../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { abi } from '../../abi/abi'
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi'
import { Address, formatEther, parseEther, formatUnits } from 'viem'

export default function Claim() {

  const [claimResult, setClaimResult] = useState('');
  const contractAddress = "0x56682aa855226f3228b374a69aF5017D174372Fe";
  const { address } = useAccount();//获取当前钱包地址
  const stakeid = 0; //质押id，示例值为1，实际使用时根据需求设置

  const {
    writeContract,
    isPending: isPendingWrite,
    error,
    data: txHash,
  } = useWriteContract();
  //查询pendingMetaNode
  const pendingMetaNode = useReadContract({
    address: contractAddress as Address,
    abi,
    functionName: 'pendingMetaNode',
    args: [BigInt(stakeid), address as Address],
    query: { enabled: !!address },
  })
  useEffect(() => {
    if (pendingMetaNode.data !== undefined) {
      console.log(formatEther(pendingMetaNode.data), 'pendingMetaNode');
      setClaimResult(formatEther(pendingMetaNode.data));
    }
  }, [pendingMetaNode.data])

  const handleStake = () => {
    writeContract({
      abi,
      address: contractAddress as Address,
      functionName: 'claim',
      args: [BigInt(stakeid)],
    })
  }
  //提取成功后刷新
  useWatchContractEvent({
    address: contractAddress as Address,
    abi,
    eventName: 'Claim',
    onLogs() {
      alert('提取成功');
      pendingMetaNode.refetch().then((res) => {
        const d = res.data;
        if (d !== undefined) {
          setClaimResult(formatEther(d));
        }
      });
    }
  })

  
  return (
    <div className={styles.main}>
      <h1>Claim</h1>

      <input
        type="text"
        className={styles.input}
        value={claimResult}
        onChange={(e) => setClaimResult(e.target.value)}
        readOnly
        
      />
      <button className={styles.button} onClick={handleStake} disabled={isPendingWrite}>
        {isPendingWrite ? '提取中...' : '提取'}
      </button>
    </div>
  );
}