import styles from '../../styles/Home.module.css';
import { useState } from 'react';
import { useBalance } from 'wagmi';

export default function AddressBalance() {
    const [inputValue, setInputValue] = useState('');
    const [queryAddress, setQueryAddress] = useState<`0x${string}` | undefined>();
    const { data } = useBalance({address: queryAddress})
    const handleClick = () => {
        if (inputValue) {
            setQueryAddress(inputValue as `0x${string}`)
        }
    }
    

    return (
        <div className={styles.main}>
            <div>
                <input
                    placeholder="请输入要查询的地址"
                    className={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button className={styles.button} onClick={handleClick}>
                    查询
                </button>
                <div className={styles.balance}>余额：{data?.formatted || '0'}</div>
            </div>

        </div>
    )
}