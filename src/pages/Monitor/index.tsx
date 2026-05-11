import { useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { abi } from '../../abi/abi'

export default function Monitor(){
    const [detected, setDetected] = useState(false)

    useWatchContractEvent({
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        abi,
        eventName: 'Transfer',
        onLogs() {
            setDetected(true)
        },
        syncConnectedChain: true
    })
    return (
        <div>
            <div>监控交易</div>
            {detected && <div>监控到了</div>}
        </div>
    )
}
