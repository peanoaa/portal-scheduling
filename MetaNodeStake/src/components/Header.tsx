import  Link from 'next/link';
import { ConnectButton} from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <div style={{display: 'flex', justifyContent:'space-between',gap: '1rem', alignItems:'center', padding: '1rem 2rem', borderBottom: '1px solid #eaeaea'}}>
            <div >myTransaction</div>
            <div style={{display: 'flex', gap: '1rem', alignItems:'center'}}>
                <Link href="/wagmi">wagmi</Link>
                <Link href="/viem">viem</Link>
                <Link href="/Ethers">Ethers</Link>
                <Link href="/Test">Test</Link>
                <Link href="/withdraw">Withdraw</Link>
                <Link href="/stake">Stake</Link>
                <Link href="/claim">Claim</Link>
                <ConnectButton />
            </div>
        </div>
    )
        
}