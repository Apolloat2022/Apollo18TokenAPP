// services/walletConnectReal.ts
import { UniversalProvider } from '@walletconnect/universal-provider';
import { ethers } from 'ethers';

class WalletConnectRealService {
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

      console.log('🔌 Initializing Real WalletConnect with Project ID:', projectId);
      
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
      this.openWalletApp(uri);
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
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged'],
          rpcMap: {
            1: `https://mainnet.infura.io/v3/`
          }
        }
      };

      const { uri, approval } = await this.provider!.connect({
        namespaces
      });

      // Open wallet app with the URI
      if (uri) {
        this.openWalletApp(uri);
      }

      // Wait for user approval in their wallet
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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Open wallet app with WalletConnect URI
        const metamaskLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;
        const trustWalletLink = `trust://wc?uri=${encodeURIComponent(uri)}`;
        const rainbowLink = `rainbow://wc?uri=${encodeURIComponent(uri)}`;
        
        // Try MetaMask first
        window.location.href = metamaskLink;
        
        // Fallback to other wallets
        setTimeout(() => {
          if (confirm('MetaMask not detected. Try Trust Wallet?')) {
            window.location.href = trustWalletLink;
          }
        }, 1000);
      } else {
        // Desktop: Show the URI for manual connection or QR code
        const shouldShowQR = confirm('For desktop connection:\n\n1. Copy the WalletConnect URI\n2. Open your wallet app\n3. Paste the URI to connect\n\nWould you like to see the QR code?');
        
        if (shouldShowQR) {
          const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(uri)}&choe=UTF-8`;
          const qrWindow = window.open('', 'qrCode', 'width=400,height=500');
          if (qrWindow) {
            qrWindow.document.write(`
              <html>
                <head><title>Scan QR Code</title></head>
                <body style="text-align: center; padding: 20px; font-family: Arial;">
                  <h2>Scan with Your Wallet</h2>
                  <img src="${qrCodeUrl}" alt="QR Code" style="border: 1px solid #ccc;"/>
                  <p style="margin-top: 20px;">Scan this QR code with your mobile wallet app</p>
                  <p style="font-size: 12px; color: #666; word-break: break-all;">Or use this URI: ${uri}</p>
                  <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px;">Close</button>
                </body>
              </html>
            `);
          }
        } else {
          alert(`WalletConnect URI:\n\n${uri}\n\nCopy this to your wallet app to connect.`);
        }
      }
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

  formatAddress(address: string | null): string {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const walletConnectRealService = new WalletConnectRealService();