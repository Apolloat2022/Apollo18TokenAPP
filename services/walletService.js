import { Linking, Alert } from 'react-native';

export const walletService = {
  // Open MetaMask with pre-filled ETH transfer
  openMetaMask: (contractAddress, ethAmount = '') => {
    const metamaskUrl = `https://metamask.app.link/send/${contractAddress}${ethAmount ? `?value=${ethAmount}` : ''}`;
    
    Linking.openURL(metamaskUrl).catch(() => {
      Alert.alert(
        'MetaMask Not Found',
        'Please install MetaMask from the App Store or Google Play',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Install', onPress: () => Linking.openURL('https://metamask.io/download/') }
        ]
      );
    });
  },

  // Open Coinbase Wallet
  openCoinbase: (contractAddress, ethAmount = '') => {
    const coinbaseUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(`https://wallet.coinbase.com/send?address=${contractAddress}${ethAmount ? `&amount=${ethAmount}` : ''}`)}`;
    
    Linking.openURL(coinbaseUrl).catch(() => {
      Alert.alert(
        'Coinbase Wallet Not Found',
        'Please install Coinbase Wallet from the App Store or Google Play',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Install', onPress: () => Linking.openURL('https://coinbase.com/wallet/download') }
        ]
      );
    });
  },

  // ADD THIS MISSING MOONPAY FUNCTION:
  openMoonPay: (contractAddress, ethAmount = '') => {
    try {
      const moonPayUrl = `https://buy.moonpay.com/?currencyCode=eth${ethAmount ? `&baseCurrencyAmount=${ethAmount}` : ''}${contractAddress ? `&walletAddress=${contractAddress}` : ''}`;
      
      console.log('🔗 Opening MoonPay:', moonPayUrl);
      
      Linking.openURL(moonPayUrl).catch((error) => {
        Alert.alert('Error', 'Cannot open MoonPay. Please check your connection.');
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open MoonPay. Please try again.');
    }
  },

  // Generic ETH transfer deep link
  sendETH: (contractAddress, ethAmount = '') => {
    const ethUrl = `ethereum:${contractAddress}${ethAmount ? `?value=${ethAmount}` : ''}`;
    
    Linking.openURL(ethUrl).catch(() => {
      Alert.alert(
        'Choose Wallet',
        'Select your preferred wallet to send ETH',
        [
          { text: 'MetaMask', onPress: () => walletService.openMetaMask(contractAddress, ethAmount) },
          { text: 'Coinbase', onPress: () => walletService.openCoinbase(contractAddress, ethAmount) },
          { text: 'MoonPay', onPress: () => walletService.openMoonPay(contractAddress, ethAmount) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    });
  }
};