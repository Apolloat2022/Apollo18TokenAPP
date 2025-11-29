// services/walletConnect.ts
import { UniversalProvider } from '@walletconnect/universal-provider';
import { ethers } from 'ethers';

// Debug: Check if env variable is loaded
console.log('🔌 WalletConnect Project ID:', process.env.EXPO_PUBLIC_W3M_PROJECT_ID);

class WalletConnectService {
  private provider: UniversalProvider | null = null;
  private ethersProvider: ethers.providers.Web3Provider | null = null;
  public isConnected = false;
  public address: string | null = null;

  async initialize() {
    try {
      const projectId = process.env.EXPO_PUBLIC_W3M_PROJECT_ID;
      
      if (!projectId) {
        console.error('❌ WalletConnect Project ID is missing!');
        return false;
      }

      console.log('🔌 Initializing WalletConnect with Project ID:', projectId);
      
      this.provider = await UniversalProvider.init({
        projectId: projectId,
        metadata: {
          name: 'APOLO Token Reserve',
          description: 'Reserve APOLO tokens with ETH',
          url: window.location.origin,
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        }
      });

      this.setupEventListeners();
      await this.checkExistingSession();
      
      return true;
    } catch (error) {
      console.error('WalletConnect initialization failed:', error);
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.provider) return;

    this.provider.on('display_uri', (uri: string) => {
      console.log('🔗 WalletConnect URI:', uri);
      this.openWalletApp(uri); // This will handle mobile deep links
    });

    this.provider.on('connect', () => {
      console.log('✅ WalletConnect connected');
      this.isConnected = true;
      this.updateConnectionState();
    });

    this.provider.on('disconnect', () => {
      console.log('❌ WalletConnect disconnected');
      this.isConnected = false;
      this.address = null;
      this.ethersProvider = null;
    });

    this.provider.on('session_update', () => {
      this.updateConnectionState();
    });
  }

  private async checkExistingSession() {
    if (this.provider?.session) {
      await this.updateConnectionState();
    }
  }

  private async updateConnectionState() {
    if (!this.provider?.session) return;

    try {
      const accounts = this.provider.session.namespaces.eip155.accounts;
      if (accounts.length > 0) {
        // Extract address from CAIP-10 format: "eip155:1:0x..."
        this.address = accounts[0].split(':')[2];
        this.isConnected = true;
        
        // Setup ethers provider for Web3 interactions
        this.ethersProvider = new ethers.providers.Web3Provider(this.provider);
        console.log('✅ WalletConnect connection state updated:', this.address);
      }
    } catch (error) {
      console.error('Error updating connection state:', error);
    }
  }

  async connect() {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const namespaces = {
        eip155: {
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          chains: ['eip155:1'], // Ethereum Mainnet
          events: ['chainChanged', 'accountsChanged'],
          rpcMap: {
            1: `https://mainnet.infura.io/v3/${process.env.EXPO_PUBLIC_INFURA_KEY || ''}`
          }
        }
      };

      const { uri, approval } = await this.provider!.connect({
        namespaces
      });

      // For mobile: trigger wallet app opening
      if (uri) {
        this.openWalletApp(uri);
      }

      const session = await approval();
      console.log('✅ WalletConnect session established:', session);
      
      await this.updateConnectionState();
      return { success: true, address: this.address };

    } catch (error: any) {
      console.error('❌ WalletConnect connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  private openWalletApp(uri: string) {
    if (typeof window !== 'undefined') {
      // Mobile deep links
      const metamaskLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;
      const coinbaseLink = `coinbase-wallet://wc?uri=${encodeURIComponent(uri)}`;
      
      // Try to open wallet apps
      window.location.href = metamaskLink;
      
      // Fallback: show URI for manual connection
      setTimeout(() => {
        const shouldShowManual = confirm(`Can't open wallet automatically. Would you like to see the connection URI for manual connection?`);
        if (shouldShowManual) {
          alert(`WalletConnect URI:\n${uri}`);
        }
      }, 1000);
    }
  }

  async disconnect() {
    if (this.provider?.session) {
      await this.provider.disconnect();
    }
    this.isConnected = false;
    this.address = null;
    this.ethersProvider = null;
    console.log('✅ WalletConnect disconnected');
  }

  getProvider() {
    return this.ethersProvider;
  }

  // This method is used by the useWeb3 hook
  formatAddress(address: string | null): string {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// ⭐⭐⭐ MAKE SURE THIS EXPORT IS AT THE END ⭐⭐⭐
export const walletConnectService = new WalletConnectService();