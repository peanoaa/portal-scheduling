import { useEffect, useState } from 'react'
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi } from '../../abi/abi'
import { Address, formatEther, parseEther, formatUnits } from 'viem'
import styles from '../../styles/Home.module.css'

export default function Stake() {
    const contractAddress = "0x56682aa855226f3228b374a69aF5017D174372Fe";
    const { address } = useAccount();//获取当前钱包地址
    const [stakeAmount, setStakeAmount] = useState('');
    const { data: balanceData } = useBalance({ address });//获取当前钱包余额
    const [stakeResult, setStakeResult] = useState('');
    const stakeid = 0; //质押id，示例值为1，实际使用时根据需求设置


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

    //质押交易
    const {
        writeContract,
        isPending: isPendingWrite,
        error,
        data: txHash,
    } = useWriteContract();
    const {isSuccess} =useWaitForTransactionReceipt({ hash: txHash });
    console.log(isSuccess, 'isSuccess');
    
    //质押成功后更新质押池余额
    useEffect(() => {
        if (isSuccess) {
            alert('质押成功');
            //更新质押池余额
            result.refetch().then((res) => {
                const d = res.data;
                if(d !== undefined){
                    setStakeResult(formatUnits(d as bigint, 18) || "0");
                }
            });
        }
    }, [isSuccess,txHash]);

    //质押按钮
    const handleStake = () => {
        if (!address) {
            alert('请先连接钱包');
            return;
        }
        if (!stakeAmount || Number(stakeAmount) <= 0) {
            alert('请输入正确的质押数量');
            return;
        }
        //进行质押交易
        writeContract({
            abi,
            address: contractAddress as Address,
            functionName: "depositETH",
            value: parseEther(stakeAmount)
        })
        //清空输入框
        setStakeAmount('');
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
            <p>钱包余额：{balanceData?.formatted}</p>
            <button className={styles.button} onClick={handleStake} disabled={isPendingWrite}>
                {isPendingWrite ? '质押中...' : '质押'}
            </button>
            <p>钱包地址：{address}</p>


        </div>
    )



}


