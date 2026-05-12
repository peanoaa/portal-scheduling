import { useMemo } from "react";
import { useChainId, useConfig } from "wagmi";
import { JsonRpcProvider,BrowserProvider } from "ethers";

export function useEthersReadProvider() {
    const chainId = useChainId();
    const wagmiConfig = useConfig();
    return useMemo(() => {
      const chain = wagmiConfig.chains.find((c) => c.id === chainId);
      const url = chain?.rpcUrls?.default?.http?.[0];
      if (!url) return null;
      return new JsonRpcProvider(url, chainId);
    }, [chainId, wagmiConfig.chains]);
  }
  


  export function getSigner() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("未检测到钱包");
    }
    const browserProvider = new BrowserProvider(window.ethereum);
    return browserProvider.getSigner();
  }