import { Label } from "~components/ui/label";
import { Input } from "~components/ui/input";
import { useState } from "react";
import { Button } from "~components/ui/button";
import { useWalletStore } from "@/stors/walletStore";
import { useToast } from "@/hooks/use-toast";
import { CandlestickChart } from "lucide-react";

export default function WalletUnlock() {

    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { unlockWallet } = useWalletStore();
    const { toast } = useToast();
    //解锁
    const handleUnlock = async () => {

        if(!password){
            toast({
                title: '请输入密码',
                variant: 'destructive',
            })
            return;
        }
        setIsLoading(true);
        try{
            const success =  unlockWallet(password);
            if(!success){
                toast({
                    title: '密码错误',
                    description: '请重新输入密码',
                    variant: 'destructive',
                })
            }
        }catch(error){
            console.error("error",error);
            toast({
                title: '解锁失败',
                variant: 'destructive',
            })
        }finally{
            setIsLoading(false);
        }
    }
    return (
        <div>
            <h1>解锁钱包</h1>
            <div>
                <Label htmlFor='password'>密码：</Label>
                <Input
                    id='password'
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                />
            </div>
            <Button
            onClick={handleUnlock}
            disabled={isLoading || !password}
            className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500'
            >
                {isLoading ? '解锁中...' : '解锁'}
            </Button>
        </div>
    )
}