import { useWalletStore } from "@/stors/walletStore";
import WalletSetup from "@/components/wallet/WalletSetup";
import WalletUnlock from "@/components/wallet/WalletUnlock";
import WalletDashboard from "@/components/wallet/WalletDashboard";



const Index = () =>{
    const {accounts, isLocked} = useWalletStore()
    console.log("accounts",accounts,"isLocked",isLocked);
    

    //如果没有账户，显示页面

    if(accounts.length === 0){
        return <WalletSetup />
    }
    //如果钱包被锁定，显示页面
    if(isLocked){
        return <WalletUnlock />
    } 

    //显示钱包主页
    return <WalletDashboard />
}

export default Index;