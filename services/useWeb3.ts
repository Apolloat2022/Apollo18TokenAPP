// services/useWeb3.ts - FIXED CONNECTION DETECTION
import { useState, useEffect } from 'react';
import { web3Service } from './web3';
import { walletConnectService } from './walletConnectService';
import { walletService } from './walletService';

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  useEffect(() => {
    initializeWalletConnect();
    checkLegacyConnection();
    
    // Set up return detection for mobile
    setupReturnDetection();
  }, []);

  const initializeWalletConnect = async () => {
    try {
      console.log('🔄 Initializing WalletConnect...');
      const initialized = await walletConnectService.initialize();
      
      if (initialized && walletConnectService.isConnected) {
        setAddress(walletConnectService.address);
        setIsConnected(true);
        console.log('✅ WalletConnect already connected:', walletConnectService.address);
      }
    } catch (error) {
      console.error('❌ WalletConnect initialization error:', error);
    }
  };

  const setupReturnDetection = () => {
    // Check for connection when user returns to the app
    window.addEventListener('focus', () => {
      if (connectionAttempted) {
        console.log('🔄 Page focused - checking WalletConnect connection...');
        checkWalletConnectConnection();
      }
    });

    // Also check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && connectionAttempted) {
        console.log('📱 Page visible - checking connection...');
        setTimeout(() => {
          checkWalletConnectConnection();
        }, 1000);
      }
    });
  };

  const checkWalletConnectConnection = async () => {
    console.log('🔍 Checking WalletConnect connection status...');
    
    try {
      const isConnected = await walletConnectService.checkConnectionStatus();
      
      if (isConnected && walletConnectService.address) {
        setAddress(walletConnectService.address);
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        console.log('✅ WalletConnect connection detected:', walletConnectService.address);
      } else {
        console.log('❌ No active WalletConnect connection found');
      }
    } catch (error) {
      console.error('❌ Error checking WalletConnect connection:', error);
    }
  };

  const checkLegacyConnection = async () => {
    try {
      const connected = await web3Service.checkConnection();
      if (connected) {
        setIsConnected(true);
        setAddress(web3Service.getCurrentAddress());
      }
    } catch (err) {
      console.error('Legacy connection check error:', err);
    }
  };

  const connectWalletConnect = async () => {
    console.log('🔗 Connecting via WalletConnect...');
    setIsLoading(true);
    setError(null);
    setConnectionAttempted(true);
    
    try {
      const result = await walletConnectService.connect();
      console.log('🔗 WalletConnect connection result:', result);
      
      if (result.success) {
        // Connection initiated successfully - wait for user to approve in wallet
        console.log('✅ WalletConnect connection initiated - waiting for user...');
        
        // Start polling for connection status
        startConnectionPolling();
        
      } else {
        setError(result.error || 'WalletConnect connection failed');
        setIsLoading(false);
      }
      
    } catch (err: any) {
      console.error('❌ WalletConnect connection error:', err);
      setError(err.message || 'WalletConnect connection failed');
      setIsLoading(false);
    }
  };

  const startConnectionPolling = () => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    const pollConnection = setInterval(async () => {
      attempts++;
      
      if (walletConnectService.isConnected && walletConnectService.address) {
        clearInterval(pollConnection);
        setAddress(walletConnectService.address);
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        console.log('✅ WalletConnect connected successfully:', walletConnectService.address);
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(pollConnection);
        setIsLoading(false);
        setError('Connection timeout - please try again');
        console.log('❌ WalletConnect connection timeout');
      }
      
      console.log(`⏳ Waiting for connection... (${attempts}/${maxAttempts})`);
    }, 1000);
  };

  const connectDesktopWallet = async (walletType: 'metamask' | 'coinbase') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await web3Service.connectWallet(walletType);
      
      if (result.success && result.address) {
        setAddress(result.address);
        setIsConnected(true);
      } else if (result.error) {
        setError(result.error);
      }
      
    } catch (err: any) {
      setError(err.message || 'Desktop connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async (walletType: 'metamask' | 'coinbase' | 'walletconnect') => {
    console.log(`🎯 Connecting wallet: ${walletType}`);
    
    if (walletType === 'walletconnect') {
      await connectWalletConnect();
    } else {
      await connectDesktopWallet(walletType);
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting all wallets...');
    web3Service.disconnect();
    walletConnectService.disconnect();
    
    setAddress(null);
    setIsConnected(false);
    setError(null);
    setConnectionAttempted(false);
  };

  const formatAddress = (addr: string | null): string => {
    return walletService.formatWalletAddress(addr);
  };

  const isValidAddress = (addr: string): boolean => {
    return walletService.isValidEthereumAddress(addr);
  };

  return {
    address,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    formatAddress,
    isValidAddress,
  };
}