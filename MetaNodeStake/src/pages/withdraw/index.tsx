import { abi } from '../../abi/abi'
import { Address, formatEther, parseEther, formatUnits } from 'viem'
import styles from '../../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi'
import { log } from 'util'

let countvlaue = 0;

export default function Withdraw() {

    const { address } = useAccount()
    const contractAddress = "0x56682aa855226f3228b374a69aF5017D174372Fe";
    const stakeid = 0;
    const [stakeResult, setStakeResult] = useState('');//质押池余额
    const [withdrawResult, setWithdrawResult] = useState('');//可提取输入框
    const [reviewResult, setReviewResult] = useState('');//审核输入框
    const [canWithdrawResult, setCanWithdrawResult] = useState('');//可提取金额




    //读取质押池余额
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


    //UnstakeETH
    const { writeContract, isPending: isPendingWrite, error, data: txHash } = useWriteContract({
    })
    const handleReview = () => {
        if (!stakeResult || Number(stakeResult) <= 0) {
            alert('请先质押');
            return;
        }
        if (!withdrawResult || Number(withdrawResult) <= 0) {
            alert('请输入审核金额');
            return;
        }
        if (Number(withdrawResult) > Number(stakeResult)) {
            alert('审核金额不能大于质押金额');
            return;
        }
        writeContract({
            abi,
            address: contractAddress as Address,
            functionName: 'unstake',
            args: [BigInt(stakeid), parseEther(withdrawResult)]
        })
        // countvlaue += Number(withdrawResult);
        // console.log(countvlaue,'countvlaue');
        // setCanWithdrawResult(countvlaue);


    }

    //监听审核结果
    useWatchContractEvent({
        address: contractAddress as Address,
        abi,
        eventName: 'RequestUnstake',
        onLogs() {
            alert('审核成功');
            //审核成功，把输入框的值给canWithdrawResult
            // setCanWithdrawResult(countvlaue);
            //清空输入框
            setWithdrawResult('');
            //更新质押池余额
            result.refetch().then((res) => {
                const d = res.data;
                if (d !== undefined) {
                    setStakeResult(formatEther(d as bigint));
                }
            });
            //更新审核金额
            result2.refetch().then((res) => {
                const d = res.data;
                if (d !== undefined) {
                    const kmp = (formatEther(d[0] - d[1] ));
                    setReviewResult(kmp);
                }
            });
        }

    })

    //监听提取结果
    useWatchContractEvent({
        address: contractAddress as Address,
        abi,
        eventName: 'Withdraw',
        onLogs() {
            alert('提取成功');
            //更新可提取金额和审核金额
            result2.refetch().then((res) => {
                const d = res.data;
                if (d !== undefined) {
                    const kmp = Number(formatEther(d[0] as bigint)) - Number(formatEther(d[1] as bigint));
                    setReviewResult(formatEther(BigInt(kmp)));
                    setCanWithdrawResult(formatEther(d[1] as bigint));
                }
            });
        }
    })

    //查询进入审核的金额
    const result2 = useReadContract({
        address: contractAddress as Address,
        abi,
        functionName: 'withdrawAmount',
        args: [BigInt(stakeid), address as Address],
        query: { enabled: !!address },
    })
    //把余额给canWithdrawResult
    console.log(result2.data, 'result2.data');
    useEffect(() => {
        if (result2.data !== undefined) {
            const kmp = (formatEther(result2.data[0] - result2.data[1] ));
            setReviewResult(kmp);
            setCanWithdrawResult(formatEther(result2.data[1]));
        }
    }, [result2.data])


    //提取
    const handleWithdraw = () => {
        if (!canWithdrawResult || Number(canWithdrawResult) <= 0) {
            alert('请先审核');
            return;
        }
        writeContract({
            abi,
            address: contractAddress as Address,
            functionName: 'withdraw',
            args: [BigInt(stakeid)]

        })
        // //更新合于余额
        // result.refetch().then((res) => {
        //     const d = res.data;
        //     if(d !== undefined){
        //         setStakeResult(formatEther(d as bigint));
        //     }
        // });
        // //更新可提取金额
        // result2.refetch().then((res) => {
        //     const d = res.data;
        //     if(d !== undefined){
        //         setCanWithdrawResult(formatEther(d[1] as bigint));
        //     }
        // });
        // //更新审核金额
        // result2.refetch().then((res) => {
        //     const d = res.data;
        //     if(d !== undefined){
        //         setReviewResult(formatEther(d[0] as bigint));
        //     }
        // });
    }

    





    return (
        <div className={styles.main}>
            {/*  */}
            <div>
                {/* 质押金额 */}
                <div>
                    <p>质押金额：{stakeResult}</p>
                </div>
                {/* 可提取金额 */}
                <div>
                    <p>可提取金额：{canWithdrawResult}</p>
                </div>
                {/* 审核金额 */}
                <div>
                    <p>审核金额：{reviewResult}</p>
                </div>
            </div>

            <div>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="审核金额"
                    value={withdrawResult}
                    onChange={(e) => setWithdrawResult(e.target.value)}
                />
                <button className={styles.button} onClick={handleReview} disabled={isPendingWrite}>审核</button>
            </div>
            <div>

                <button className={styles.button} onClick={handleWithdraw} disabled={isPendingWrite}>提取</button>
            </div>

        </div>
    )
}