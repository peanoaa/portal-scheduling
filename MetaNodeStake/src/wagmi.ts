import { http, createConfig, injected } from 'wagmi';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

const chains = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected({ target: 'metaMask' }),
    injected({ target: 'okxWallet' }),
    injected({ target: 'phantom' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  ssr: true,
});
