// services/walletConnectSimple.ts
export const walletConnectSimpleService = {
  isConnected: false,
  address: string | null = null,

  async initialize() {
    console.log('🔧 Simple: Initialize called');
    return true; // Always succeed for now
  },

  async connect() {
    console.log('🔧 Simple: Connect called');
    
    // Simple mobile deeplink without WalletConnect dependencies
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Simple MetaMask deeplink
        const currentUrl = encodeURIComponent(window.location.href);
        const metamaskLink = `metamask://wc?uri=${currentUrl}`;
        window.location.href = metamaskLink;
        
        return { success: true, method: 'mobile_deeplink' };
      } else {
        return { success: false, error: 'Use desktop wallet buttons' };
      }
    }
    
    return { success: false, error: 'Window not available' };
  },

  async disconnect() {
    this.isConnected = false;
    this.address = null;
  }
};