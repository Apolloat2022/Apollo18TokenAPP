// services/useWeb3.ts
import { useState, useEffect } from 'react';
import { web3Service } from './web3';

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await web3Service.checkConnection();
      setIsConnected(connected);
      setAddress(web3Service.getCurrentAddress());
    } catch (err) {
      console.error('Connection check error:', err);
    }
  };

  const connect = async (walletType: 'metamask' | 'coinbase' = 'metamask') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.connectWallet(walletType);
      
      if (result.success) {
        setAddress(result.address || null);
        setIsConnected(true);
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    web3Service.disconnect();
    setAddress(null);
    setIsConnected(false);
    setError(null);
  };

  return {
    address,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    formatAddress: web3Service.formatAddress,
    isValidAddress: web3Service.isValidEthereumAddress,
  };
}