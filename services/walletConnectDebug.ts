// services/walletConnectDebug.ts
import { UniversalProvider } from '@walletconnect/universal-provider';
import { ethers } from 'ethers';

console.log('🔧 WalletConnect Debug: Loading...');

class WalletConnectDebugService {
  private provider: UniversalProvider | null = null;
  public isConnected = false;
  public address: string | null = null;

  async initialize() {
    try {
      console.log('🔧 Debug: Starting initialize()');
      
      const projectId = process.env.EXPO_PUBLIC_W3M_PROJECT_ID;
      console.log('🔧 Debug: Project ID available:', !!projectId);
      
      if (!projectId) {
        console.error('❌ Debug: Project ID missing');
        return false;
      }

      console.log('🔧 Debug: Before UniversalProvider.init');
      
      // Wrap in try-catch to catch initialization errors
      try {
        this.provider = await UniversalProvider.init({
          projectId: projectId,
          metadata: {
            name: 'APOLO Token Reserve',
            description: 'Reserve APOLO tokens with ETH',
            url: window.location.origin,
            icons: ['https://avatars.githubusercontent.com/u/37784886']
          }
        });
        console.log('🔧 Debug: UniversalProvider initialized successfully');
      } catch (initError) {
        console.error('❌ Debug: UniversalProvider.init failed:', initError);
        return false;
      }

      console.log('🔧 Debug: Setting up event listeners');
      this.setupEventListeners();
      
      console.log('🔧 Debug: Checking existing session');
      await this.checkExistingSession();
      
      console.log('🔧 Debug: Initialize completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Debug: Initialize failed completely:', error);
      return false;
    }
  }

  private setupEventListeners() {
    console.log('🔧 Debug: setupEventListeners called');
    if (!this.provider) {
      console.log('🔧 Debug: No provider available for event listeners');
      return;
    }

    // Add error handling to each event listener
    try {
      this.provider.on('display_uri', (uri: string) => {
        console.log('🔧 Debug: display_uri event:', uri);
        this.openWalletApp(uri);
      });
    } catch (e) {
      console.error('❌ Debug: display_uri listener failed:', e);
    }

    try {
      this.provider.on('connect', () => {
        console.log('🔧 Debug: connect event');
        this.isConnected = true;
        this.updateConnectionState();
      });
    } catch (e) {
      console.error('❌ Debug: connect listener failed:', e);
    }

    try {
      this.provider.on('disconnect', () => {
        console.log('🔧 Debug: disconnect event');
        this.isConnected = false;
        this.address = null;
      });
    } catch (e) {
      console.error('❌ Debug: disconnect listener failed:', e);
    }
  }

  private async checkExistingSession() {
    console.log('🔧 Debug: checkExistingSession called');
    if (this.provider?.session) {
      console.log('🔧 Debug: Existing session found');
      await this.updateConnectionState();
    } else {
      console.log('🔧 Debug: No existing session');
    }
  }

  private async updateConnectionState() {
    console.log('🔧 Debug: updateConnectionState called');
    if (!this.provider?.session) {
      console.log('🔧 Debug: No session for update');
      return;
    }

    try {
      console.log('🔧 Debug: Session namespace:', this.provider.session.namespaces);
      const accounts = this.provider.session.namespaces.eip155?.accounts || [];
      console.log('🔧 Debug: Accounts found:', accounts);
      
      if (accounts.length > 0) {
        this.address = accounts[0].split(':')[2];
        this.isConnected = true;
        console.log('🔧 Debug: Connection state updated:', this.address);
      }
    } catch (error) {
      console.error('❌ Debug: updateConnectionState failed:', error);
    }
  }

  async connect() {
    console.log('🔧 Debug: connect() method called');
    
    if (!this.provider) {
      console.log('🔧 Debug: No provider, initializing...');
      await this.initialize();
    }

    try {
      console.log('🔧 Debug: Before provider.connect()');
      
      const namespaces = {
        eip155: {
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged'],
          rpcMap: {
            1: `https://mainnet.infura.io/v3/`
          }
        }
      };

      console.log('🔧 Debug: Calling provider.connect()');
      const { uri, approval } = await this.provider!.connect({
        namespaces
      });

      console.log('🔧 Debug: URI received:', !!uri);
      
      if (uri) {
        console.log('🔧 Debug: Opening wallet app with URI');
        this.openWalletApp(uri);
      }

      console.log('🔧 Debug: Waiting for approval...');
      const session = await approval();
      console.log('🔧 Debug: Session approved:', session);
      
      await this.updateConnectionState();
      console.log('🔧 Debug: Connection successful');
      return { success: true, address: this.address };

    } catch (error: any) {
      console.error('❌ Debug: Connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  private openWalletApp(uri: string) {
    console.log('🔧 Debug: openWalletApp called with URI');
    
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log('🔧 Debug: Is mobile:', isMobile);
      
      if (isMobile) {
        console.log('🔧 Debug: Opening mobile wallet');
        // SIMPLIFIED: Just open MetaMask without aggressive fallbacks
        const metamaskLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;
        window.location.href = metamaskLink;
        console.log('🔧 Debug: Wallet app opened');
      } else {
        console.log('🔧 Debug: Desktop flow');
        alert(`WalletConnect URI for desktop:\n\n${uri}`);
      }
    }
  }

  async disconnect() {
    console.log('🔧 Debug: disconnect called');
    if (this.provider?.session) {
      await this.provider.disconnect();
    }
    this.isConnected = false;
    this.address = null;
  }
}

export const walletConnectDebugService = new WalletConnectDebugService();