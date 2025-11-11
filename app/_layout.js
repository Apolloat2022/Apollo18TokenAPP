import 'react-native-get-random-values';

// Remove this line - it's causing the error
// import 'process/browser';

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { Stack } from 'expo-router';
import { View } from 'react-native';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Simple wagmi config without Reown AppKit
const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </QueryClientProvider>
    </WagmiProvider>
  );
}