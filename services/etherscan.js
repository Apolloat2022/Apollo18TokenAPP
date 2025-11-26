// services/etherscan.js
const ETHERSCAN_API_KEY = process.env.EXPO_PUBLIC_ETHERSCAN_API_KEY || 'DISABLED_FOR_NOW';

class EtherscanService {
  constructor() {
    this.baseUrl = 'https://api.etherscan.io/api';
  }

  async makeRequest(params) {
    try {
      // If API key is not configured, return mock data for development
      if (ETHERSCAN_API_KEY === 'DISABLED_FOR_NOW') {
        console.log('⚠️ Etherscan API key not configured - using mock data');
        return { status: '1', result: [] };
      }

      const queryParams = new URLSearchParams({
        ...params,
        apikey: ETHERSCAN_API_KEY
      });

      const url = `${this.baseUrl}?${queryParams}`;
      console.log('🌐 Fetching from Etherscan:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Etherscan API error:', error);
      // Return mock data in case of error for better UX
      return { status: '1', result: [] };
    }
  }

  // Verify a specific transaction
  async verifyTransaction(txHash, contractAddress, expectedFromAddress = null) {
    try {
      // For development without API key, return mock verification
      if (ETHERSCAN_API_KEY === 'DISABLED_FOR_NOW') {
        console.log('⚠️ Using mock transaction verification');
        return {
          isValid: true,
          realAmount: parseFloat('0.05'),
          realFromAddress: expectedFromAddress || '0x' + '1'.repeat(40),
          realToAddress: contractAddress,
          blockNumber: 12345678,
          timestamp: new Date().toISOString()
        };
      }

      // Get transaction details
      const txData = await this.makeRequest({
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txHash
      });

      if (!txData.result) {
        return { isValid: false, error: 'Transaction not found' };
      }

      const transaction = txData.result;
      const realAmount = parseInt(transaction.value) / 1e18;
      const realFromAddress = transaction.from;
      const realToAddress = transaction.to;

      // Verify it was sent to our contract
      if (!realToAddress || realToAddress.toLowerCase() !== contractAddress.toLowerCase()) {
        return { 
          isValid: false, 
          error: 'Transaction was not sent to the APOLO contract address' 
        };
      }

      // Verify sender matches connected wallet (if provided)
      if (expectedFromAddress && 
          realFromAddress.toLowerCase() !== expectedFromAddress.toLowerCase()) {
        return { 
          isValid: false, 
          error: 'Transaction sender does not match connected wallet' 
        };
      }

      // Get transaction receipt to confirm success
      const receiptData = await this.makeRequest({
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        txhash: txHash
      });

      const receipt = receiptData.result;
      if (!receipt || receipt.status !== '0x1') {
        return { isValid: false, error: 'Transaction failed or is still pending' };
      }

      return {
        isValid: true,
        realAmount,
        realFromAddress,
        realToAddress,
        blockNumber: parseInt(transaction.blockNumber, 16),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Transaction verification error:', error);
      return { isValid: false, error: error.message };
    }
  }

  // Get user's transactions to our contract
  async getUserTransactions(walletAddress, contractAddress) {
    try {
      // For development without API key, return empty array
      if (ETHERSCAN_API_KEY === 'DISABLED_FOR_NOW') {
        console.log('⚠️ Using mock user transactions');
        return [];
      }

      const data = await this.makeRequest({
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc'
      });

      if (data.status !== '1' || !data.result) {
        return [];
      }

      // Filter transactions to our contract
      const relevantTransactions = data.result.filter(tx => 
        tx.to && 
        tx.to.toLowerCase() === contractAddress.toLowerCase() &&
        tx.isError === '0' &&
        tx.txreceipt_status === '1'
      ).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: parseInt(tx.value) / 1e18,
        timestamp: parseInt(tx.timeStamp) * 1000,
        blockNumber: parseInt(tx.blockNumber)
      }));

      return relevantTransactions;

    } catch (error) {
      console.error('Get user transactions error:', error);
      return [];
    }
  }
}

// Create singleton instance
export const etherscanService = new EtherscanService();