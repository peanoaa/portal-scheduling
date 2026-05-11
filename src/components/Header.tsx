import  Link from 'next/link';
import { ConnectButton} from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <div style={{display: 'flex', justifyContent:'space-between',gap: '1rem', alignItems:'center', padding: '1rem 2rem', borderBottom: '1px solid #eaeaea'}}>
            <div >myTransaction</div>
            <div style={{display: 'flex', gap: '1rem', alignItems:'center'}}>
                <Link href="/">Home</Link>
                <Link href="/AddressBalance">AddressBalance</Link>
                <Link href="/Tranfer">Transactions</Link>
                <Link href="/Monitor">Monitor</Link>
                <Link href="/BalanceOf">BalanceOf</Link>
                <Link href="/TokenTransfer">TokenTransfer</Link>
                <ConnectButton />
            </div>
        </div>
    )
        
}