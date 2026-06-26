import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '~components/ui/input';
import { Label } from '~components/ui/label';


import { useWalletStore } from '@/stors/walletStore';
import { useState } from 'react';
import { Button } from '~components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '~components/ui/textarea';
import { set } from 'react-hook-form';

export default function WalletSetup() {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mnemonic, setMnemonic] = useState('');
    const [privateKey, setPrivateKey] = useState('');


    const { createWallet, importWallet, importPrivateKey } = useWalletStore();
    const { toast } = useToast();


    //创建钱包逻辑
    const handleCreateWallet = async () => {
        //判断密码是否一致
        if (password !== confirmPassword) {
            toast({
                title: '密码不一致',
                description: '请重新输入密码',
                variant: 'destructive',
            })
            return;
        }
        setIsLoading(true);
        try {
            //发请求
            const { mnemonic: _mnemonic } = await createWallet(password);
            //设置助记词
            setMnemonic(_mnemonic);
            toast({
                title: '创建成功',
                description: '请妥善保管助记词',
            })
        } catch (error) {
            toast({
                title: '创建失败',
                description: '钱包创建过程中出现错误',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false);
        }

    }

    //导入钱包逻辑
    const handleImportWallet = async () => {
        if (!mnemonic.trim()) {
            toast({
                title: '请输入助记词',
                variant: 'destructive',
            })
            return;
        }
        setIsLoading(true);
        try {
            await importWallet(mnemonic, password);
            toast({
                title: '导入成功',
            })

        } catch (error) {
            toast({
                title: '导入失败',
                description: '助记词有误',
                variant: 'destructive',
            })

        } finally {
            setIsLoading(false);
        }

    }

    //导入私钥逻辑
    const handleImportPrivateKey = async () => {
        if (!privateKey.trim()) {
            toast({
                title: '请输入私钥',
                variant: 'destructive',
            })
            return;
        }
        setIsLoading(true);
        try {
            await importPrivateKey(privateKey.trim(), password);
            toast({
                title: "导入成功",
            });
        } catch (error) {
            toast({
                title: "导入失败",
                description: "私钥无效或其他错误",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }

    }


    //
    return (
        <div>

            <h1>my-meta-mask</h1>
            <Tabs>
                <TabsList className='plasmo-grid plasmo-w-full plasmo-grid-cols-3'>
                    <TabsTrigger value="create">创建钱包</TabsTrigger>
                    <TabsTrigger value="import">导入助计词</TabsTrigger>
                    <TabsTrigger value="privatekey">导入私钥</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className='plasmo-p-4'>
                    <h2>创建钱包</h2>
                    <div>
                        <Label htmlFor='password'>设置密码：</Label>
                        <Input
                            id='password'
                            type="password"
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                        />
                    </div>
                    <div>
                        <Label htmlFor='confirmPassword'>确认密码：</Label>
                        <Input
                            id='confirmPassword'
                            type="password"
                            placeholder="再次输入密码"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                        />
                    </div>

                    {/* 展示助记词 */}

                    {mnemonic && (
                        <div>
                            <Label htmlFor='mnemonic'>助记词请保存：</Label>
                            <Textarea
                                id='mnemonic'
                                value={mnemonic}
                                className='plasmo-min-h-[100px]'
                            >
                            </Textarea>
                        </div>
                    )}
                    <Button
                        onClick={handleCreateWallet}
                        disabled={isLoading || !confirmPassword || !password}
                        className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500'
                    >
                        {isLoading ? '创建中...' : '创建钱包'}
                    </Button>
                </TabsContent>

                <TabsContent value="import" className='plasmo-p-4'>
                    <h2>导入助计词</h2>
                    <div>
                        <Label htmlFor='mnemonic'>助记词：</Label>
                        <Textarea
                            id='mnemonic'
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            placeholder='请输入12个助记词，用空行隔开'
                            className='plasmo-min-h-[100px]'
                            rows={4}
                            cols={50}
                        >
                        </Textarea>
                    </div>
                    <div>
                        <Label htmlFor='importpassword'>设置密码：</Label>
                        <Input
                            id='importpassword'
                            type="password"
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                        />
                    </div>
                    <Button
                        onClick={handleImportWallet}
                        disabled={isLoading || !password || !mnemonic}
                        className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500'
                    >
                        {isLoading ? '导入中...' : '导入钱包'}
                    </Button>
                </TabsContent>

                <TabsContent value="privatekey" className='plasmo-p-4'>
                    <h2>导入私钥</h2>
                    <div>
                        <Label htmlFor='privatekey'>私钥：</Label>
                        <Input
                            id='privatekey'
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder='请输入私钥'
                            className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                        />
                    </div>
                    <div>
                        <Label htmlFor='importpassword'>设置密码：</Label>
                        <Input
                            id='importpassword'
                            type="password"
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='plasmo-w-50 plasmo-h-8 plasmo-p-2'
                        />
                    </div>
                    <Button
                        onClick={handleImportPrivateKey}
                        disabled={isLoading || !password || !privateKey}
                        className='plasmo-w-full plasmo-h-8 plasmo-p-2 plasmo-bg-blue-500'
                    >
                        {isLoading ? '导入中...' : '导入私钥'}
                    </Button>
                </TabsContent>
            </Tabs>


        </div>
    )
}