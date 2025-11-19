// services/tokenContract.js
console.log('📄 Token Contract Service Loading...');

export const tokenContractService = {
  contractAddress: '0x742d35Cc6634C0532925a3b8dc9D4a3b8D4b',
  
  calculateApoloTokens(ethAmount, ethPrice) {
    const usdValue = ethAmount * ethPrice;
    const apoloTokens = usdValue * 100000; // $1 = 100,000 APOLO
    return Math.floor(apoloTokens);
  },
  
  getContractInfo() {
    return {
      address: this.contractAddress,
      network: 'Ethereum Mainnet',
      tokenStandard: 'ERC-20',
      tokenName: 'APOLO',
      tokenSymbol: 'APOLO'
    };
  }
};