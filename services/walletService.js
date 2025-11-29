// services/walletService.js
console.log('👛 Wallet Service Loading...');

export const walletService = {
  // Validate Ethereum address
  isValidEthereumAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Format wallet address for display
  formatWalletAddress(address, startLength = 6, endLength = 4) {
    if (!address || address.length < startLength + endLength) {
      return address || 'Not Connected';
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  },

  // Get transaction link
  getTransactionLink(txHash) {
    return `https://etherscan.io/tx/${txHash}`;
  },

  // Get address link
  getAddressLink(address) {
    return `https://etherscan.io/address/${address}`;
  }
};