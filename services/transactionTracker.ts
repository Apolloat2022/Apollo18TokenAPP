// services/transactionTracker.ts
import { googleSheetsService } from './googleSheets';

export interface TransactionData {
  email: string;
  fromAddress: string;
  toAddress: string;
  ethAmount: string;
  txHash: string;
  timestamp: number;
}

class TransactionTracker {
  private monitoredAddress = '0x0e3541725230432653A9a3F65eB5591D16822de0';
  private userRegistrations: { [email: string]: string } = {};

  registerUser(email: string, walletAddress: string) {
    this.userRegistrations[email] = walletAddress;
    console.log('👤 Registered user:', email, 'wallet:', walletAddress);
  }

  async recordManualTransaction(
    email: string, 
    ethAmount: string, 
    txHash: string, 
    fromAddress?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const userWallet = this.userRegistrations[email] || fromAddress;
      
      if (!userWallet) {
        return { 
          success: false, 
          message: 'No wallet address found for this email' 
        };
      }

      console.log('💰 Recording manual transaction:', {
        email,
        ethAmount,
        txHash,
        fromAddress: userWallet
      });

      const result = await googleSheetsService.recordEnhancedTransaction({
        email: email,
        wallet: userWallet,
        ethAmount: ethAmount,
        txHash: txHash,
        fromAddress: userWallet
      });

      return result;

    } catch (error) {
      console.error('❌ Transaction recording error:', error);
      return { 
        success: false, 
        message: 'Failed to record transaction' 
      };
    }
  }

  async verifyTransactionManually(email: string) {
    return {
      instructions: `To verify your ETH deposit:\n\n1. Find your transaction hash from your wallet\n2. Note the amount of ETH sent\n3. Contact support with these details\n\nYour email: ${email}\nContract: ${this.monitoredAddress}`,
      monitoredAddress: this.monitoredAddress
    };
  }

  getMonitoredAddress() {
    return this.monitoredAddress;
  }
}

export const transactionTracker = new TransactionTracker();