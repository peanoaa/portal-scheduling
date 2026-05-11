import { useState } from "react"
import styles from '../../styles/Home.module.css'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function Tranfer() {
    const [addressValue, setAddressValue] = useState('');
    const [moneyValue, setMoneyValue] = useState('');
    const { sendTransaction, data, isPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();
    const handleClick = (addressValue: string, moneyValue: string) => {
        console.log(addressValue, moneyValue, 'addressValue,moneyValue');
        const res = sendTransaction({
            to: addressValue as `0x${string}`,
            value: parseEther(moneyValue)
        })
        console.log(res,'res');
        



    }
    return (
        <div className={styles.main}>
            <input
                name="address"
                placeholder="请输入账户地址"
                className={styles.input}
                value={addressValue}
                onChange={(e) => setAddressValue(e.target.value)}
            />
            <input
                name="value"
                placeholder="请输入金额"
                className={styles.input}
                value={moneyValue}
                onChange={(e) => setMoneyValue(e.target.value)}
            />
            <button
                className={styles.button}
                onClick={() => handleClick(addressValue, moneyValue)}
                disabled={isPending}
            > {isPending ? 'Confirming...' : 'Send'}</button>

        </div>
    )
}