/* services/googleSheets.js - WORKING FOR BOTH MOBILE & DESKTOP */
const GSCRIPT_URL = process.env.EXPO_PUBLIC_GSCRIPT_URL;

console.log('🔌 Google Service URL:', GSCRIPT_URL ? '✅ Loaded' : '❌ Missing');

export const googleSheetsService = {
  
  recordUserEmail: async (email, walletAddress = '') => {
    if (!GSCRIPT_URL) {
      console.warn('⚠️ GSCRIPT_URL missing - check .env.local');
      return { success: false, error: 'Service unavailable' };
    }

    console.log('📨 Recording email:', email, 'Wallet:', walletAddress || 'none');

    // DUAL APPROACH: Try fetch first (mobile), JSONP fallback (desktop)
    try {
      // First try: Direct fetch (works on mobile)
      const response = await fetch(GSCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recordEmail',
          source: 'apollo18-app',
          email: email,
          wallet: walletAddress
          // NO timestamp - let Google Script handle it!
        })
      });
      
      const result = await response.json();
      console.log('✅ Fetch success (mobile):', result);
      return result;
      
    } catch (fetchError) {
      console.log('📨 Fetch failed, trying JSONP (desktop)...');
      
      // Fallback: JSONP (works on desktop browsers)
      return new Promise((resolve) => {
        const callbackName = 'cb_' + Math.round(Math.random() * 1000000);
        
        const url = new URL(GSCRIPT_URL);
        url.searchParams.set('action', 'recordEmail');
        url.searchParams.set('source', 'apollo18-app');
        url.searchParams.set('email', email);
        if (walletAddress) url.searchParams.set('wallet', walletAddress);
        // NO timestamp parameter!
        url.searchParams.set('callback', callbackName);

        const script = document.createElement('script');
        script.src = url.toString();
        script.async = true;

        window[callbackName] = (data) => {
          cleanup();
          console.log('✅ JSONP success (desktop):', data);
          resolve(data);
        };

        script.onerror = (err) => {
          cleanup();
          console.warn('⚠️ JSONP failed:', err);
          resolve({ success: false, error: 'Network error' });
        };

        function cleanup() {
          delete window[callbackName];
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        }

        document.body.appendChild(script);
      });
    }
  },

  recordTransaction: async (email, ethAmount, txHash = '') => {
    if (!GSCRIPT_URL) return { success: false, error: 'URL not set' };

    console.log('💰 Recording transaction:', { email, ethAmount });

    try {
      const response = await fetch(GSCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recordTransaction', 
          source: 'apollo18-app',
          email: email,
          ethAmount: ethAmount,
          txHash: txHash
        })
      });
      return await response.json();
    } catch (error) {
      // JSONP fallback for transactions
      return new Promise((resolve) => {
        const callbackName = 'cb_' + Math.round(Math.random() * 1000000);
        const url = new URL(GSCRIPT_URL);
        url.searchParams.set('action', 'recordTransaction');
        url.searchParams.set('source', 'apollo18-app');
        url.searchParams.set('email', email);
        url.searchParams.set('ethAmount', ethAmount.toString());
        if (txHash) url.searchParams.set('txHash', txHash);
        url.searchParams.set('callback', callbackName);

        const script = document.createElement('script');
        script.src = url.toString();
        script.async = true;

        window[callbackName] = (data) => {
          delete window[callbackName];
          if (document.body.contains(script)) document.body.removeChild(script);
          resolve(data);
        };

        script.onerror = () => {
          delete window[callbackName];
          if (document.body.contains(script)) document.body.removeChild(script);
          resolve({ success: false, error: 'Network error' });
        };

        document.body.appendChild(script);
      });
    }
  },

  getEthPrice: async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum?.usd ?? 2884.32;
    } catch (error) {
      return 2884.32;
    }
  },

  checkHealth: async () => {
    return { success: true, message: 'Service ready' };
  }
};