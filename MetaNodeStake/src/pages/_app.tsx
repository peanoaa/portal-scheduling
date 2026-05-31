import '../styles/globals.css';
import '@leimoyi/wallet-connect-sdk/style.css'
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { WalletProvider } from '@leimoyi/wallet-connect-sdk';
import Header from '../components/Header';
import { WagmiWalletSync } from '../components/WagmiWalletSync';
import { chains, wallets } from '../wallet-config';

import { config } from '../wagmi';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <WalletProvider chains={chains} wallets={wallets} autoConnect>
        <QueryClientProvider client={client}>
          <WagmiWalletSync />
            <Header />
            <Component {...pageProps} />
        </QueryClientProvider>
      </WalletProvider>
    </WagmiProvider>
  );
}

export default MyApp;
