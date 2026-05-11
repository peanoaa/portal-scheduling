import { parseEther, type Address } from 'viem';
import { useState } from 'react';
import styles from '../../styles/Home.module.css'
import { useWriteContract } from 'wagmi';
import {abi} from '../../abi/abi'

export default function TokenTransfer() {
    const [toAddress, setToAddress] = useState("");
    const [moneyvalue, setMoneyValue] = useState('');

    // ✅ useWriteContract 必须在组件顶层调用（不在函数内部）
    const { writeContract, isPending, error } = useWriteContract();

    const onTransfer = () => {
        // ✅ abi、address、functionName、args 都传给 writeContract 函数
        writeContract({
            abi,
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as Address,
            functionName: 'transfer',
            args: [toAddress as Address, parseEther(moneyvalue)],
        })
    }

    return (
        <div className={styles.main}>
            <div>ERC20token的转账功能,transfer</div>
            <input
                type="text"
                placeholder="输入接收地址"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className={styles.input}

            />
            <input
                type="text"
                placeholder="输入转账金额"
                value={moneyvalue}
                onChange={(e) => setMoneyValue(e.target.value)}
                className={styles.input}
            />
            <button className={styles.button} onClick={onTransfer} disabled={isPending}>
                {isPending ? '发送中...' : '发送'}
            </button>
            {error && <p style={{color:'red'}}>{(error as Error).message}</p>}
        </div>
    )
}
