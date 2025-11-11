import { Linking } from 'react-native';

export const tokenContractService = {
  contractAddress: '0x0e3541725230432653A9a3F65eB5591D16822de0',
  
  // Etherscan URLs
  getEtherscanUrl: (address = null) => {
    const addr = address || tokenContractService.contractAddress;
    return `https://etherscan.io/address/${addr}`;
  },
  
  getTransactionUrl: (txHash) => {
    return `https://etherscan.io/tx/${txHash}`;
  },
  
  // Calculate APOLO tokens (1 ETH = 100,000,000 APOLO at $1 each)
  calculateApoloTokens: (ethAmount, ethPrice) => {
    if (!ethAmount || !ethPrice) return 0;
    const usdValue = ethAmount * ethPrice;
    return Math.floor(usdValue * 100000); // $1 = 100,000 APOLO
  },
  
  // Open contract on Etherscan
  openEtherscan: () => {
    Linking.openURL(tokenContractService.getEtherscanUrl());
  },
  
  // Open transaction on Etherscan
  openTransaction: (txHash) => {
    Linking.openURL(tokenContractService.getTransactionUrl(txHash));
  }
};