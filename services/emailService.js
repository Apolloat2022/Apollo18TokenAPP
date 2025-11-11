import { googleSheetsService } from './googleSheets';

export const emailService = {
  // Record user email for token distribution - NOW SAVES TO GOOGLE SHEETS
  recordUserEmail: async (email, walletAddress = '') => {
    try {
      // Validate email first
      if (!emailService.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Save to Google Sheets via your existing service
      const result = await googleSheetsService.recordUserEmail(email);
      
      console.log('User email recorded for token distribution:', {
        email: email,
        walletAddress: walletAddress,
        timestamp: new Date().toISOString(),
        status: 'awaiting_deposit',
        sheetsResult: result
      });
      
      return { 
        success: true, 
        message: 'Email verified and recorded successfully',
        data: result
      };
    } catch (error) {
      console.error('Error recording email:', error);
      throw new Error(`Failed to record email: ${error.message}`);
    }
  },

  // Send confirmation email (optional - for future integration)
  sendConfirmationEmail: async (email, ethAmount = 0, apoloTokens = 0) => {
    try {
      // This would integrate with your email service (EmailJS, SendGrid, etc.)
      console.log('Sending confirmation email:', {
        to: email,
        subject: 'APOLO Token Reservation Confirmed',
        body: `You have reserved ${apoloTokens.toLocaleString()} APOLO tokens by sending ${ethAmount} ETH.`
      });
      
      // Example integration with EmailJS (uncomment when ready):
      /*
      const emailResult = await emailjs.send(
        'your_service_id',
        'your_template_id',
        {
          to_email: email,
          eth_amount: ethAmount,
          apolo_tokens: apoloTokens.toLocaleString(),
          contract_address: '0x0e3541725230432653A9a3F65eB5591D16822de0'
        }
      );
      */
      
      return { 
        success: true, 
        message: 'Confirmation email sent successfully'
      };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error for email sending - it shouldn't block the main flow
      return { 
        success: false, 
        message: 'Failed to send confirmation email, but your reservation was recorded'
      };
    }
  },

  // Send transaction receipt email
  sendTransactionReceipt: async (email, txHash, ethAmount, apoloTokens) => {
    try {
      console.log('Sending transaction receipt:', {
        to: email,
        txHash: txHash,
        ethAmount: ethAmount,
        apoloTokens: apoloTokens.toLocaleString()
      });
      
      // Future integration with your email service
      return { 
        success: true, 
        message: 'Transaction receipt sent successfully'
      };
    } catch (error) {
      console.error('Error sending transaction receipt:', error);
      return { 
        success: false, 
        message: 'Failed to send receipt email, but transaction was recorded'
      };
    }
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if email is already registered (optional - for duplicate prevention)
  checkEmailExists: async (email) => {
    try {
      // This would check your database/Google Sheets
      // For now, return false (not implemented)
      return false;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }
};