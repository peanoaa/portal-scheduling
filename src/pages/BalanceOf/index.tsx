import { useReadContract } from "wagmi";
import { abi } from "../../abi/abi";
import { useState } from "react";
import styles from '../../styles/Home.module.css'
import {Address} from 'viem'

export default function BalanceOf() {
    const [address, setAddress] = useState('');


    const handleClick = () => {
        const result = useReadContract({
            abi,
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as Address,//合约的地址
            functionName: 'balanceOf',
            args:[address as Address]
        })
        //打印result
        console.log(result);
        
    }

    return (
        <div className={styles.main}>
            <div>ERC20合于的BalanceOf方法</div>
            <input
                name="address"
                placeholder="请输入地址"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
            />
            <button onClick={handleClick} className={styles.button}>查询</button>
            <div>地址余额为：</div>
        </div>
    )
}