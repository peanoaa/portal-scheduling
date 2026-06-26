import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '~components/ui/button';

import { useWalletStore } from '@/stors/walletStore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '~components/ui/label';
import { Input } from '~components/ui/input';
import { useState } from 'react';
import { AES, SHA256, enc } from 'crypto-js';//？？？
import { Textarea } from '~components/ui/textarea';
import { set } from 'react-hook-form';

export default function WalletDashboard() {

    const { currentAccount, currentNetwork, switchAccount,createAccount,lockWallet, updateAccountName,mnemonic, password,accounts } = useWalletStore();
    // console.log("currentAccount", currentAccount, "currentNetwork", currentNetwork);
    const [thispassword, thissetPassword] = useState('');
    const { toast } = useToast();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);//控制助记词显示隐藏
    const [lastmnemonic, setLastmnemonic] = useState('');
    const [lastprivateKey, setLastprivateKey] = useState('');
    const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
    //账户列表控制
    const [isAccountsVisible, setIsAccountsVisible] = useState(false);

    // const [accountsList, setAccountsList] = useState(accounts);

    //钱包锁定逻辑
    const handleLockWallet = () => {
        lockWallet();
        toast({
            title: '钱包已锁定',
        })

    }
    //查看当前钱包的助词器
    const handleViewMnemonic = () => {

        // 对密码去哈希，然后对比password
        const hashedPassword = SHA256(thispassword).toString();
        if (hashedPassword !== password) {
            toast({
                title: '密码错误',
                variant: 'destructive',
            })
            return;
        }
        const decryptedMnemonic = AES.decrypt(mnemonic, thispassword).toString(enc.Utf8);
        console.log("decryptedMnemonic", decryptedMnemonic);
        setLastmnemonic(decryptedMnemonic);
        setIsPasswordVisible(true);
    }
    //查看当前钱包的私钥
    const handleViewPrivateKey = () => {
        const hashedPassword = SHA256(thispassword).toString();
        if (hashedPassword !== password) {
            toast({
                title: '密码错误',
                variant: 'destructive',
            })
            return;
        }
        // 
        // const decryptedPrivateKey = AES.decrypt(currentAccount?.privateKey, thispassword).toString(enc.Utf8);
        const decryptedPrivateKey = currentAccount?.privateKey;
        console.log("decryptedPrivateKey", decryptedPrivateKey);
        setLastprivateKey(decryptedPrivateKey);
        setIsPrivateKeyVisible(true);
    }

    //查看账户列表
    const handleViewAccounts = () => {
        // 先更新账户列表
        updateAccountName(currentAccount?.address, currentAccount?.name);
        console.log("accounts", accounts);
        // setAccountsList(accounts);
        
        setIsAccountsVisible(true);

    }
    //关闭账户列表
    const handleCloseAccounts = () => {
        setIsAccountsVisible(false);
    }
    //添加账户
    const handleAddAccount = () => {
        try{
            createAccount();
            console.log("accounts", accounts);
            
            toast({
                title: '账户添加成功',
            })
        }catch(error){
            toast({
                title: '账户添加失败',
                variant: 'destructive',
            })
        }
    }
    //切换账户
    const handleSwitchAccount = (address: string) => {
        try{
            switchAccount(address);
            console.log('1111111111');
            
        }catch(error){

        }

    }
    return (
        <div>
            <div>
                <h1>账户信息</h1>
            </div>
            <div>
                <Tabs>
                    <TabsList className='plasmo-grid plasmo-w-full plasmo-grid-cols-3'>
                        <TabsTrigger value="home">首页</TabsTrigger>
                        <TabsTrigger value="accounts">账户</TabsTrigger>
                        <TabsTrigger value="networks">网络</TabsTrigger>
                        <TabsTrigger value="tokens">代币</TabsTrigger>
                        <TabsTrigger value="transactions">转账</TabsTrigger>
                    </TabsList>

                    <TabsContent value="home" className='plasmo-p-4'>
                        <h2>首页</h2>
                        <div>
                            {/* 锁定钱包按钮 */}
                            <Button
                                onClick={handleLockWallet}
                                className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                            >
                                锁定钱包
                            </Button>
                            {/* 查看助记词按钮 */}
                            <Button
                                onClick={handleViewMnemonic}
                                className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                            >
                                查看助记词
                            </Button>
                            {/* 输入密码 */}
                            <div>
                                <Label>输入密码：</Label>
                                <Input
                                    id='password'
                                    type="password"
                                    placeholder="请输入密码"
                                    value={thispassword}
                                    onChange={(e) => thissetPassword(e.target.value)}
                                    className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                                />
                            </div>
                            {/* isPasswordVisible控制div是否显示 */}
                            {isPasswordVisible && (
                                <div>
                                    <Label>助记词：</Label>
                                    <Textarea
                                        id='mnemonic'
                                        value={lastmnemonic}
                                        className='plasmo-min-h-[100px]'>

                                    </Textarea>
                                </div>)}

                            {/* 查看私钥 */}
                            <Button
                                onClick={handleViewPrivateKey}
                                className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                            >
                                查看私钥
                            </Button>
                            {isPrivateKeyVisible && (
                                <div>
                                    <Label>私钥：</Label>
                                    <Textarea
                                        id='privateKey'
                                        value={lastprivateKey}
                                        className='plasmo-min-h-[100px]'>
                                    </Textarea>
                                </div>)}
                        </div>
                    </TabsContent>

                    <TabsContent value="accounts" className='plasmo-p-4'>
                        <h2>账户</h2>
                        <div>
                            <div></div>
                            <Label>当前账户名称：</Label>
                            <p>{currentAccount?.name}</p>
                            <p>{currentAccount?.address}</p>
                            {/* 账户列表 */}
                            <Button
                                onClick={handleViewAccounts}
                                className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                            >
                                账户列表
                            </Button>
                            {isAccountsVisible && (
                                <div>
                                    {/* 账户 */}
                                    {accounts.map((account) => (
                                        // 添加切换账户事件
                                        <div key={account.address} onClick={() => handleSwitchAccount(account.address)}>
                                            <p>{account.name}</p>
                                            <p>{account.address}</p>
                                        </div>
                                    ))}
                                    {/* 关闭账户列表 */}
                                    <Button
                                    onClick={handleCloseAccounts}
                                    className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                                    >
                                        关闭账户列表
                                    </Button>
                                </div>)}
                            {/* 添加账户 */}
                            <Button
                            onClick={handleAddAccount}
                            className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500 plasmo-mt-2'
                            >
                                添加账户
                            </Button>

                        </div>


                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}