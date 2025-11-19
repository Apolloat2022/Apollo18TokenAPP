import googleSheetsService from './googleSheets';

console.log('📧 Email Service Loading...');

const emailService = {
  // ✅ EMAIL VALIDATION
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // ✅ EMAIL VERIFICATION (for reserve page)
  verifyEmail: async (email) => {
    console.log('🎯 Verifying email:', email);
    
    if (!emailService.isValidEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    try {
      // Record the email verification attempt
      const result = await googleSheetsService.recordUserEmail(email, '');
      console.log('✅ Email verification result:', result);
      return result;
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ MAIN EMAIL RECORDING FUNCTION
  recordUserEmail: async (email, walletAddress = '') => {
    console.log('📧 Recording email via Google Sheets service...');
    console.log('📧 Email:', email);
    console.log('👛 Wallet:', walletAddress || 'Not provided');

    // Validate email first
    if (!emailService.isValidEmail(email)) {
      const error = 'Invalid email address format';
      console.error('❌', error);
      return { success: false, error };
    }

    try {
      const result = await googleSheetsService.recordUserEmail(email, walletAddress);
      console.log('📧 Email service result:', result);
      return result;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ BULK EMAIL VALIDATION (if needed)
  validateEmails: (emails) => {
    return emails.filter(email => emailService.isValidEmail(email));
  },

  // ✅ EMAIL FORMATTING UTILITY
  formatEmail: (email) => {
    return email.trim().toLowerCase();
  }
};

export default emailService;