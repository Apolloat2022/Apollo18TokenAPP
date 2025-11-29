// services/walletConnectService.ts - WITH FIXED MODAL FUNCTION
import { UniversalProvider } from '@walletconnect/universal-provider';
import { ethers } from 'ethers';

class WalletConnectService {
  private provider: UniversalProvider | null = null;
  private ethersProvider: ethers.providers.Web3Provider | null = null;
  public isConnected = false;
  public address: string | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      console.log('🔌 WalletConnect already initialized');
      return true;
    }

    try {
      const projectId = process.env.EXPO_PUBLIC_W3M_PROJECT_ID;
      
      if (!projectId) {
        console.error('❌ WalletConnect Project ID missing');
        return false;
      }

      console.log('🔌 Initializing WalletConnect with Project ID:', projectId);
      
      this.provider = await UniversalProvider.init({
        projectId: projectId,
        metadata: {
          name: 'APOLO Token Reservation',
          description: 'Reserve your APOLO tokens',
          url: window.location.origin,
          icons: ['https://your-app.com/icon.png']
        }
      });

      this.setupEventListeners();
      await this.checkExistingSession();
      
      this.initialized = true;
      console.log('✅ WalletConnect initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ WalletConnect initialization failed:', error);
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.provider) return;

    this.provider.on('display_uri', (uri: string) => {
      console.log('🔗 WalletConnect URI:', uri);
      this.showWalletSelectionModal(uri); // This function was missing!
    });

    this.provider.on('connect', () => {
      console.log('✅ WalletConnect connected - SESSION ESTABLISHED');
      this.hideModal();
      this.isConnected = true;
      this.updateConnectionState();
    });

    this.provider.on('disconnect', () => {
      console.log('❌ WalletConnect disconnected');
      this.isConnected = false;
      this.address = null;
      this.ethersProvider = null;
    });

    this.provider.on('session_event', (event: any) => {
      console.log('🔄 Session event:', event);
      this.updateConnectionState();
    });

    this.provider.on('session_update', () => {
      console.log('🔄 Session updated');
      this.updateConnectionState();
    });
  }

  // ADD THIS MISSING FUNCTION:
  private showWalletSelectionModal(uri: string) {
    console.log('🎯 Showing wallet selection modal with URI:', uri);
    
    const modal = document.createElement('div');
    modal.id = 'wallet-select-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #1A1A1A; padding: 24px; border-radius: 20px; text-align: center; max-width: 90%; width: 380px; border: 2px solid #FFD700; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h3 style="color: #FFD700; margin-bottom: 24px; font-size: 20px;">🌐 Choose Your Wallet</h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <button id="wallet-metamask" style="background: #F6851B; color: white; border: none; padding: 16px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 16px; transition: all 0.2s;">
            <span style="font-size: 20px;">🦊</span>
            <span>MetaMask</span>
          </button>
          
          <button id="wallet-coinbase" style="background: #1652F0; color: white; border: none; padding: 16px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 16px; transition: all 0.2s;">
            <span style="font-size: 20px;">⚡</span>
            <span>Coinbase Wallet</span>
          </button>
          
          <button id="wallet-trust" style="background: #3375BB; color: white; border: none; padding: 16px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 16px; transition: all 0.2s;">
            <span style="font-size: 20px;">🔒</span>
            <span>Trust Wallet</span>
          </button>
          
          <button id="wallet-rainbow" style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white; border: none; padding: 16px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 16px; transition: all 0.2s;">
            <span style="font-size: 20px;">🌈</span>
            <span>Rainbow Wallet</span>
          </button>

          <button id="wallet-copy" style="background: #333; color: white; border: 1px solid #555; padding: 16px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 16px; transition: all 0.2s;">
            <span style="font-size: 20px;">📋</span>
            <span>Copy Connection Link</span>
          </button>
        </div>
        
        <button id="wallet-close" style="background: transparent; color: #888; border: 1px solid #555; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px; transition: all 0.2s;">
          Cancel
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add hover effects
    const addHoverEffect = (buttonId: string) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = 'none';
        });
      }
    };

    // Wallet deep links
    const walletLinks = {
      metamask: `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
      coinbase: `https://go.cb-w.com/wc?uri=${encodeURIComponent(uri)}`,
      trust: `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`,
      rainbow: `https://rnbwapp.com/wc?uri=${encodeURIComponent(uri)}`,
      universal: `https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`
    };

    // Add click handlers for each wallet
    document.getElementById('wallet-metamask')?.addEventListener('click', () => {
      this.openWalletLink(walletLinks.metamask);
      addHoverEffect('wallet-metamask');
    });
    
    document.getElementById('wallet-coinbase')?.addEventListener('click', () => {
      this.openWalletLink(walletLinks.coinbase);
      addHoverEffect('wallet-coinbase');
    });
    
    document.getElementById('wallet-trust')?.addEventListener('click', () => {
      this.openWalletLink(walletLinks.trust);
      addHoverEffect('wallet-trust');
    });
    
    document.getElementById('wallet-rainbow')?.addEventListener('click', () => {
      this.openWalletLink(walletLinks.rainbow);
      addHoverEffect('wallet-rainbow');
    });

    // Copy link functionality
    document.getElementById('wallet-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(uri).then(() => {
        const button = document.getElementById('wallet-copy');
        if (button) {
          button.innerHTML = '<span style="font-size: 20px;">✅</span><span>Copied! Paste in your wallet</span>';
          button.style.background = '#4CAF50';
          button.style.borderColor = '#4CAF50';
          
          setTimeout(() => {
            button.innerHTML = '<span style="font-size: 20px;">📋</span><span>Copy Connection Link</span>';
            button.style.background = '#333';
            button.style.borderColor = '#555';
          }, 3000);
        }
      });
      addHoverEffect('wallet-copy');
    });

    // Close button
    document.getElementById('wallet-close')?.addEventListener('click', () => {
      this.hideModal();
      this.disconnect();
    });

    // Add hover to close button
    addHoverEffect('wallet-close');
  }

  // ADD THIS FUNCTION TOO:
  private openWalletLink(url: string) {
    console.log('🔗 Opening wallet link:', url);
    // Use window.location for better mobile compatibility
    window.location.href = url;
    
    // Close modal after a short delay
    setTimeout(() => {
      this.hideModal();
    }, 500);
  }

  // AND THIS FUNCTION:
  private hideModal() {
    const modal = document.getElementById('wallet-select-modal');
    if (modal) {
      document.body.removeChild(modal);
    }
  }

  private async checkExistingSession() {
    if (this.provider?.session) {
      console.log('🔍 Found existing session');
      await this.updateConnectionState();
    }
  }

  private async updateConnectionState() {
    if (!this.provider?.session) return;

    try {
      const accounts = this.provider.session.namespaces.eip155.accounts;
      console.log('📝 Accounts from session:', accounts);
      
      if (accounts && accounts.length > 0) {
        // Extract address from CAIP-10 format: "eip155:1:0x..."
        const address = accounts[0].split(':')[2];
        this.address = address;
        this.isConnected = true;
        
        // Create ethers provider
        this.ethersProvider = new ethers.providers.Web3Provider(this.provider);
        
        console.log('✅ Connection state updated:', this.address);
      }
    } catch (error) {
      console.error('❌ Error updating connection state:', error);
    }
  }

  async connect() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('🔗 Starting WalletConnect connection...');
      
      // Create a new session
      await this.provider!.connect({
        namespaces: {
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
              1: `https://mainnet.infura.io/v3/${process.env.EXPO_PUBLIC_INFURA_PROJECT_ID}`
            }
          }
        }
      });

      // Connection initiated successfully
      console.log('✅ WalletConnect connection initiated - waiting for user approval');
      return { success: true, address: null };

    } catch (error: any) {
      console.error('❌ WalletConnect connection failed:', error);
      
      if (error?.message?.includes('User rejected')) {
        return { success: false, error: 'Connection cancelled by user' };
      }
      
      return { success: false, error: error.message || 'Connection failed' };
    }
  }

  async checkConnectionStatus(): Promise<boolean> {
    if (!this.provider?.session) {
      return false;
    }

    try {
      await this.updateConnectionState();
      return this.isConnected && this.address !== null;
    } catch (error) {
      console.error('❌ Error checking connection status:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.provider?.session) {
      try {
        await this.provider.disconnect();
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    }
    this.isConnected = false;
    this.address = null;
    this.ethersProvider = null;
    console.log('✅ Wallet disconnected');
  }

  getProvider() {
    return this.ethersProvider;
  }

  async getBalance(): Promise<string> {
    if (!this.ethersProvider || !this.address) {
      throw new Error('Not connected');
    }
    const balance = await this.ethersProvider.getBalance(this.address);
    return ethers.utils.formatEther(balance);
  }
}

export const walletConnectService = new WalletConnectService();