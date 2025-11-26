// services/web3.ts
import { Alert, Platform } from 'react-native';

class Web3Service {
  walletAddress: string | null = null;
  isConnected = false;

  // Check if Web3 is available
  isWeb3Available() {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && !!(window as any).ethereum;
    }
    return false;
  }

  // Connect to wallet - ADD THIS METHOD
  async connectWallet(walletType: 'metamask' | 'coinbase' = 'metamask') {
    if (walletType === 'metamask') {
      return this.connectMetaMask();
    } else {
      return this.connectCoinbase();
    }
  }

  // Connect to MetaMask
  async connectMetaMask() {
    try {
      if (!this.isWeb3Available()) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          this.showMobileWalletInstructions('MetaMask');
          return { success: false, error: 'Open in MetaMask browser' };
        }
        return { success: false, error: 'MetaMask not found. Please install MetaMask.' };
      }

      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.isConnected = true;
        
        // Set up event listeners
        this.setupEventListeners();
        
        return { success: true, address: this.walletAddress };
      } else {
        return { success: false, error: 'No accounts found' };
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Connect to Coinbase Wallet
  async connectCoinbase() {
    try {
      if (this.isWeb3Available() && (window as any).ethereum.isCoinbaseWallet) {
        return await this.connectMetaMask(); // Same flow for Coinbase
      }
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        this.showMobileWalletInstructions('Coinbase Wallet');
        return { success: false, error: 'Open in Coinbase Wallet browser' };
      }
      
      // Fallback: Open Coinbase Wallet app
      if (Platform.OS === 'web') {
        window.open('https://go.cb-w.com/walletconnect', '_blank');
      }
      
      return { success: false, error: 'Coinbase Wallet not detected. Please connect manually.' };
    } catch (error: any) {
      console.error('Coinbase connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check connection status - RENAME THIS METHOD
  async checkConnection() {
    if (!this.isWeb3Available()) return false;
    
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts && accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Get current wallet address - ADD THIS METHOD
  getCurrentAddress(): string | null {
    return this.walletAddress;
  }

  // Show instructions for mobile users
  showMobileWalletInstructions(walletName: string) {
    Alert.alert(
      `${walletName} Required`,
      `To connect your wallet:\n\n1. Open this app in ${walletName} browser\n2. Or copy the contract address and send manually\n3. Make sure you're on Ethereum Mainnet`,
      [
        { text: 'Copy Address', onPress: () => this.copyContractAddress() },
        { text: 'OK', style: 'default' }
      ]
    );
  }

  // Copy contract address to clipboard
  async copyContractAddress() {
    const contractAddress = '0x0e3541725230432653A9a3F65eB5591D16822de0';
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(contractAddress);
      Alert.alert('✅ Copied!', 'Contract address copied to clipboard.');
    }
  }

  // Setup event listeners for account changes
  setupEventListeners() {
    if (!this.isWeb3Available()) return;

    const ethereum = (window as any).ethereum;
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        this.disconnect();
      } else {
        // User switched accounts
        this.walletAddress = accounts[0];
      }
    });

    ethereum.on('chainChanged', (chainId: string) => {
      // Handle network changes
      console.log('Chain changed:', chainId);
    });
  }

  // Disconnect wallet
  disconnect() {
    this.walletAddress = null;
    this.isConnected = false;
  }

  // Format address for display - ADD THIS METHOD
  formatAddress(address: string | null): string {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Validate Ethereum address - ADD THIS METHOD
  isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Get network information
  async getNetwork() {
    if (!this.isWeb3Available()) return null;
    
    try {
      const ethereum = (window as any).ethereum;
      const chainId = await ethereum.request({ 
        method: 'eth_chainId' 
      });
      return { chainId };
    } catch (error) {
      console.error('Get network error:', error);
      return null;
    }
  }

  // Send transaction (optional - for direct sending)
  async sendTransaction(toAddress: string, valueInEth: string) {
    if (!this.isWeb3Available() || !this.isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const valueInWei = Math.floor(parseFloat(valueInEth) * 1e18).toString(16);
      
      const transactionParameters = {
        to: toAddress,
        from: this.walletAddress,
        value: '0x' + valueInWei,
      };

      const ethereum = (window as any).ethereum;
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Send transaction error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
export const web3Service = new Web3Service();