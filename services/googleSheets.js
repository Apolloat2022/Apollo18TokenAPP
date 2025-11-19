// services/googleSheets.js - Use GET to avoid CORS
const GSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzp8fwqReOpmrveJfk1yBfrGWGPuwoWXu0ZOKDtwujNtU73HHr0qrjrEXWynZrotQyjYQ/exec';

export const googleSheetsService = {
  recordUserEmail: async (email, walletAddress = '') => {
    console.log('📊 Recording email via GET:', email);
    
    try {
      // Use GET request with URL parameters
      const url = `${GSCRIPT_URL}?action=recordEmail&email=${encodeURIComponent(email)}&wallet=${encodeURIComponent(walletAddress)}`;
      
      console.log('🔗 GET URL:', url);
      
      const response = await fetch(url);
      const resultText = await response.text();
      
      console.log('📥 Response:', resultText);
      
      const json = JSON.parse(resultText);
      console.log('✅ GET recording result:', json);
      
      return json;
      
    } catch (error) {
      console.error('❌ GET recording failed:', error);
      return { success: false, error: error.message };
    }
  },

  getEthPrice: async () => {
    try {
      const response = await fetch(`${GSCRIPT_URL}?action=getEthPrice`);
      const resultText = await response.text();
      const json = JSON.parse(resultText);
      return json.price || 2884.32;
    } catch (error) {
      return 2884.32;
    }
  }
};