// services/simpleWalletService.ts
export const simpleWalletService = {
  async connectWalletConnect() {
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // SIMPLE MOBILE: Just open MetaMask app
        const currentUrl = encodeURIComponent(window.location.href);
        const metamaskLink = `metamask://wc?uri=${currentUrl}`;
        window.location.href = metamaskLink;
        
        // For mobile, we'll use manual address entry after they send ETH
        return { success: true, method: 'mobile_deeplink' };
      } else {
        // DESKTOP: Show simple message - NO QR CODE
        alert('For desktop, please use the MetaMask or Coinbase Wallet browser extension buttons below.');
        return { success: false, error: 'Use browser extension on desktop' };
      }
    }
    return { success: false, error: 'Window not available' };
  },

  async connectMetaMask() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts && accounts.length > 0) {
          return { success: true, address: accounts[0] };
        }
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'MetaMask not installed' };
  },

  async connectCoinbase() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts && accounts.length > 0) {
          return { success: true, address: accounts[0] };
        }
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Coinbase Wallet not installed' };
  },

  // Simple manual address entry for mobile users
  promptForAddress() {
    return new Promise((resolve) => {
      const address = prompt('Please enter your Ethereum wallet address (0x...):');
      if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
        resolve({ success: true, address: address });
      } else if (address) {
        alert('Invalid Ethereum address. Please enter a valid address starting with 0x and 42 characters long.');
        resolve(this.promptForAddress());
      } else {
        resolve({ success: false, error: 'No address provided' });
      }
    });
  }
};