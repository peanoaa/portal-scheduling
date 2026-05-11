import { useAccount, useBalance } from 'wagmi';

export default function Info() {
    const { address } = useAccount();
    const { data } = useBalance({ address });
    const { data: formattedData } = useBalance({ address, token: '0x896eEeEA6536F30133af3e24CC9D5A416d9E5369' });


    return (
        <div>
            <div>Address:{address}</div>
            <div>ETH Balance:{data?.formatted}</div>
            <div>ERC20:{formattedData?.formatted}</div>
        </div>
    )

}