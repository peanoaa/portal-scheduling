import styles from '../../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { abi } from '../../abi/abi'
import { useWallet } from '@leimoyi/wallet-connect-sdk'
import { useReadContract, useWatchContractEvent } from 'wagmi'
import { Address, formatEther } from 'viem'
import { ethers }  from 'ethers'

export default function Claim() {

  const [claimResult, setClaimResult] = useState('');
  const [isPending, setIsPending] = useState(false);
  const contractAddress = "0x56682aa855226f3228b374a69aF5017D174372Fe";
  const { address, provider } = useWallet()
  const stakeid = 0;

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

  const handleStake = async () => {
    if (!provider) {
      alert('钱包未就绪');
      return;
    }
    setIsPending(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.claim(BigInt(stakeid));
      await tx.wait();
      alert('提取成功');
      pendingMetaNode.refetch().then((res) => {
        const d = res.data;
        if (d !== undefined) {
          setClaimResult(formatEther(d));
        }
      });
    } catch (error: any) {
      alert('提取失败: ' + (error?.message || String(error)));
    } finally {
      setIsPending(false);
    }
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
      <button className={styles.button} onClick={handleStake} disabled={isPending}>
        {isPending ? '提取中...' : '提取'}
      </button>
    </div>
  );
}