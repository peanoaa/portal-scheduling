import { useEffect, useState } from 'react'
import { abi } from '../../abi/abi'
import { Address, formatEther } from 'viem'
import styles from '../../styles/Home.module.css'

import { useWallet } from '@leimoyi/wallet-connect-sdk'
import { useReadContract } from 'wagmi'
import { ethers } from 'ethers'

export default function Stake() {
    const contractAddress = "0x56682aa855226f3228b374a69aF5017D174372Fe";
    const { address, balance, provider, isConnected } = useWallet()
    const [stakeAmount, setStakeAmount] = useState('');
    const [stakeResult, setStakeResult] = useState('');
    const [isPending, setIsPending] = useState(false);
    const stakeid = 0;


    //读取
    //查质押池余额
    const result = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: 'stakingBalance',
        args: [BigInt(stakeid), address as Address],
        query: { enabled: !!address },
    })
    //展示质押池余额
    useEffect(() => {
        if (!address) {
          setStakeResult('')
          return
        }
        if (result.data !== undefined) {
          setStakeResult(formatEther(result.data))
        }
      }, [address, result.data])

    //质押按钮
    const handleStake = async () => {
        if (!address) {
            alert('请先连接钱包');
            return;
        }
        if (!stakeAmount || Number(stakeAmount) <= 0) {
            alert('请输入正确的质押数量');
            return;
        }
        if (!provider) {
            alert('钱包未就绪');
            return;
        }
        setIsPending(true);
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const tx = await contract.depositETH({ value: ethers.parseEther(stakeAmount) });
            await tx.wait();
            alert('质押成功');
            //更新质押池余额
            result.refetch().then((res) => {
                const d = res.data;
                if(d !== undefined){
                    setStakeResult(formatEther(d as bigint) || "0");
                }
            });
            //清空输入框
            setStakeAmount('');
        } catch (error: any) {
            alert('质押失败: ' + (error?.message || String(error)));
        } finally {
            setIsPending(false);
        }
    }


    return (
        <div className={styles.main}>
            <h1>Stake</h1>
            <p>以质押金额：{stakeResult}</p>
            <input
                type="text"
                placeholder='请输入质押的数量'
                className={styles.input}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
            />
            <p>钱包余额：{balance}</p>
            <button className={styles.button} onClick={handleStake} disabled={isPending || !isConnected}>
                {isPending ? '质押中...' : '质押'}
            </button>
            <p>钱包地址：{address}</p>


        </div>
    )


}
