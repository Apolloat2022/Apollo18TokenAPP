// services/web3ModalService.ts - SAFE FALLBACK
class Web3ModalService {
  public isConnected = false;
  public address: string | null = null;

  async initialize() {
    console.log('ℹ️ Web3Modal service initializing...');
    return true;
  }

  async connect() {
    console.log('ℹ️ Web3Modal connection - use desktop wallets for now');
    return { 
      success: false, 
      error: 'Mobile wallet connection upgrading. Please use MetaMask/Coinbase on desktop.' 
    };
  }

  async disconnect() {
    this.isConnected = false;
    this.address = null;
    console.log('✅ Web3Modal disconnected');
  }

  getProvider() {
    return null;
  }
}

export const web3ModalService = new Web3ModalService();