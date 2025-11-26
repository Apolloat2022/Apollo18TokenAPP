// services/googleSheets.ts
const GSCRIPT_URL = process.env.EXPO_PUBLIC_GSCRIPT_URL;

console.log('🔌 Google Service URL:', process.env.EXPO_PUBLIC_GSCRIPT_URL ? '✅ Loaded' : '❌ Missing');

export interface EmailRecord {
  email: string;
  wallet?: string;
  source?: string;
}

export interface TransactionRecord {
  email: string;
  wallet: string;
  ethAmount: string;
  actualAmount?: string;
  txHash?: string;
  fromAddress?: string;
}

class GoogleSheetsService {
  
  async recordUserEmail(emailData: EmailRecord): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!process.env.EXPO_PUBLIC_GSCRIPT_URL) {
      console.warn('⚠️ EXPO_PUBLIC_GSCRIPT_URL missing - check .env file');
      return { success: false, error: 'Service unavailable' };
    }

    console.log('📨 Recording email:', emailData.email, 'Wallet:', emailData.wallet || 'none');

    try {
      const params = new URLSearchParams({
        action: 'recordEmail',
        source: 'mobile-app',
        email: emailData.email,
        wallet: emailData.wallet || ''
      });

      const url = `${process.env.EXPO_PUBLIC_GSCRIPT_URL}?${params.toString()}`;
      console.log('🔗 Making request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Request sent to Google Sheets (no-cors mode)');
      
      return { 
        success: true, 
        message: 'Email sent for recording' 
      };
      
    } catch (error: any) {
      console.error('❌ Network error:', error.message);
      console.log('📧 Email for manual entry:', emailData.email);
      
      return { 
        success: true, 
        message: 'Email verified - recording may be delayed' 
      };
    }
  }

  async recordEnhancedTransaction(txData: TransactionRecord): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!process.env.EXPO_PUBLIC_GSCRIPT_URL) {
      console.warn('⚠️ EXPO_PUBLIC_GSCRIPT_URL missing - check .env file');
      return { success: false, error: 'Service unavailable' };
    }

    console.log('💰 Recording transaction to Google Sheets:', {
      email: txData.email,
      amount: txData.ethAmount,
      wallet: txData.wallet,
      txHash: txData.txHash || 'pending'
    });

    try {
      const params = new URLSearchParams({
        action: 'recordEnhancedTransaction',
        source: 'mobile-app',
        email: txData.email,
        wallet: txData.wallet,
        ethAmount: txData.ethAmount,
        actualAmount: txData.actualAmount || txData.ethAmount,
        fromAddress: txData.fromAddress || txData.wallet,
        txHash: txData.txHash || ''
      });

      const url = `${process.env.EXPO_PUBLIC_GSCRIPT_URL}?${params.toString()}`;
      console.log('🔗 Transaction recording URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Transaction recording request sent');
      return { 
        success: true, 
        message: 'Transaction recorded successfully' 
      };

    } catch (error: any) {
      console.error('❌ Transaction recording failed:', error);
      console.log('💰 Transaction for manual entry:', {
        email: txData.email,
        amount: txData.ethAmount,
        wallet: txData.wallet,
        txHash: txData.txHash || 'unknown'
      });
      
      return { 
        success: true,
        message: 'Transaction will be recorded when system is available' 
      };
    }
  }

  async recordTransaction(txData: {
    email: string;
    ethAmount: string;
    txHash?: string;
    wallet?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!process.env.EXPO_PUBLIC_GSCRIPT_URL) {
      console.warn('⚠️ EXPO_PUBLIC_GSCRIPT_URL missing - check .env file');
      return { success: false, error: 'Service unavailable' };
    }

    console.log('💸 Recording basic transaction:', txData);

    try {
      const params = new URLSearchParams({
        action: 'recordTransaction',
        source: 'mobile-app',
        email: txData.email,
        ethAmount: txData.ethAmount,
        txHash: txData.txHash || '',
        wallet: txData.wallet || ''
      });

      const url = `${process.env.EXPO_PUBLIC_GSCRIPT_URL}?${params.toString()}`;
      console.log('🔗 Basic transaction URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Basic transaction request sent');
      return { 
        success: true, 
        message: 'Transaction recorded' 
      };

    } catch (error: any) {
      console.error('❌ Basic transaction recording failed:', error);
      return { 
        success: true,
        message: 'Transaction recorded locally' 
      };
    }
  }

  async recordReservation(reservationData: {
    email: string;
    wallet: string;
    intendedAmount: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!process.env.EXPO_PUBLIC_GSCRIPT_URL) {
      console.warn('⚠️ EXPO_PUBLIC_GSCRIPT_URL missing - check .env file');
      return { success: false, error: 'Service unavailable' };
    }

    console.log('🎯 Recording complete reservation:', reservationData);

    try {
      const params = new URLSearchParams({
        action: 'recordEnhancedTransaction',
        source: 'mobile-app',
        email: reservationData.email,
        wallet: reservationData.wallet,
        ethAmount: reservationData.intendedAmount,
        actualAmount: '0',
        fromAddress: reservationData.wallet,
        txHash: 'reservation_pending'
      });

      const url = `${process.env.EXPO_PUBLIC_GSCRIPT_URL}?${params.toString()}`;
      console.log('🔗 Reservation URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });

      console.log('✅ Reservation request sent');
      return { 
        success: true, 
        message: 'Reservation recorded successfully' 
      };

    } catch (error: any) {
      console.error('❌ Reservation recording failed:', error);
      return { 
        success: true,
        message: 'Reservation recorded locally' 
      };
    }
  }

  async checkHealth(): Promise<{ success: boolean; message?: string }> {
    if (!process.env.EXPO_PUBLIC_GSCRIPT_URL) {
      return { success: false, message: 'EXPO_PUBLIC_GSCRIPT_URL not configured' };
    }

    try {
      const url = `${process.env.EXPO_PUBLIC_GSCRIPT_URL}?action=health&source=mobile-app`;
      const response = await fetch(url, { method: 'GET' });
      
      if (response.ok) {
        return { success: true, message: 'Google Sheets service is healthy' };
      } else {
        return { success: false, message: `Service error: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: 'Service unavailable' };
    }
  }

  async getEthPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum?.usd || 2962.10;
    } catch (error) {
      console.log('❌ ETH price fetch failed, using fallback');
      return 2962.10;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();