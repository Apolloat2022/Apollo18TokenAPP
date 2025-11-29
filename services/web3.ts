// services/web3.ts
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  public isConnected = false;
  public address: string | null = null;

  // Check if Web3 is available
  isWeb3Available(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }

  // Initialize Web3 provider
  private initializeProvider() {
    if (!this.isWeb3Available()) {
      throw new Error('Web3 not available. Please install MetaMask or another Web3 wallet.');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    return this.provider;
  }

  // Check if already connected
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.isWeb3Available()) {
        return false;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts.length > 0) {
        this.address = accounts[0];
        this.isConnected = true;
        this.initializeProvider();
        console.log('✅ Web3: Already connected to', this.address);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Web3: Connection check failed:', error);
      return false;
    }
  }

  // Connect to wallet
  async connectWallet(walletType: 'metamask' | 'coinbase' = 'metamask'): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!this.isWeb3Available()) {
        const message = 'No Web3 wallet detected. Please install MetaMask or Coinbase Wallet.';
        console.error('❌ Web3:', message);
        return { success: false, error: message };
      }

      console.log(`🔌 Web3: Connecting to ${walletType}...`);

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        const message = 'No accounts found. Please unlock your wallet.';
        console.error('❌ Web3:', message);
        return { success: false, error: message };
      }

      this.address = accounts[0];
      this.isConnected = true;
      this.initializeProvider();

      console.log('✅ Web3: Connected successfully to', this.address);

      // Set up event listeners for account changes
      this.setupEventListeners();

      return { 
        success: true, 
        address: this.address 
      };

    } catch (error: any) {
      console.error('❌ Web3: Connection failed:', error);
      
      let errorMessage = 'Connection failed';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      } else if (error.message.includes('MetaMask')) {
        errorMessage = 'MetaMask connection failed. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Set up event listeners for account and chain changes
  private setupEventListeners() {
    if (!this.isWeb3Available()) return;

    // Handle account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('🔄 Web3: Accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected all accounts
        this.disconnect();
      } else {
        // User switched accounts
        this.address = accounts[0];
        this.initializeProvider();
        // You might want to trigger a UI update here
        window.dispatchEvent(new Event('web3AccountChanged'));
      }
    });

    // Handle chain changes
    window.ethereum.on('chainChanged', (chainId: string) => {
      console.log('🔄 Web3: Chain changed to:', chainId);
      // Re-initialize provider when chain changes
      this.initializeProvider();
      window.dispatchEvent(new Event('web3ChainChanged'));
    });

    // Handle disconnect
    window.ethereum.on('disconnect', (error: any) => {
      console.log('❌ Web3: Disconnected:', error);
      this.disconnect();
    });
  }

  // Disconnect wallet
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
    this.address = null;
    
    console.log('✅ Web3: Disconnected');
    
    // Dispatch event for UI updates
    window.dispatchEvent(new Event('web3Disconnected'));
  }

  // Get current address
  getCurrentAddress(): string | null {
    return this.address;
  }

  // Get provider instance
  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  // Get signer instance
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  // Get chain ID
  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  // Get ETH balance
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const targetAddress = address || this.address;
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    const balance = await this.provider.getBalance(targetAddress);
    return ethers.utils.formatEther(balance);
  }

  // Send transaction (basic example)
  async sendTransaction(to: string, value: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    const tx = {
      to,
      value: ethers.utils.parseEther(value)
    };

    return await this.signer.sendTransaction(tx);
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    return await this.signer.signMessage(message);
  }

  // Validate Ethereum address
  isValidEthereumAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  // Format address for display
  formatAddress(address: string | null, startLength: number = 6, endLength: number = 4): string {
    if (!address) return 'Not Connected';
    if (!this.isValidEthereumAddress(address)) return 'Invalid Address';
    
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  // Switch network (Ethereum Mainnet)
  async switchToMainnet(): Promise<boolean> {
    try {
      if (!this.isWeb3Available()) {
        throw new Error('Web3 not available');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });

      console.log('✅ Switched to Ethereum Mainnet');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to switch network:', error);
      
      // If chain is not added, try to add it
      if (error.code === 4902) {
        return await this.addEthereumMainnet();
      }
      
      return false;
    }
  }

  // Add Ethereum Mainnet if not present
  private async addEthereumMainnet(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io'],
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to add Ethereum Mainnet:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const web3Service = new Web3Service();