function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action;
    
    let result;
    let requestData;
    
    // Parse the incoming data
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      requestData = e.parameter;
    }
    
    switch(action) {
      case 'recordEmail':
        result = recordUserEmail(requestData.data);
        break;
      case 'recordTransaction':
        result = recordTransaction(requestData.data);
        break;
      case 'getTransactions':
        result = getLatestTransactions();
        break;
      case 'getUserTransactions':
        result = getUserTransactions(requestData.data.email);
        break;
      case 'getEthPrice':
        result = getEthPrice();
        break;
      case 'test':
        result = { success: true, message: '✅ Google Script is working!' };
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: error.toString(),
        stack: error.stack
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Record user email - FOR FORM RESPONSES SHEET
function recordUserEmail(data) {
  try {
    // Use the specific sheet for form responses
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    
    try {
      // Try to get the "Form Responses" sheet
      sheet = ss.getSheetByName("Form Responses");
    } catch (e) {
      // If it doesn't exist, use active sheet
      sheet = ss.getActiveSheet();
    }
    
    // Create headers if first time (YOUR FORM RESPONSE COLUMNS)
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([[
        'Form Response', 'Email address', 'Ethereum address', 'Country', 'How did you hear about us?'
      ]]);
    }
    
    // Add the email record to Form Responses
    sheet.appendRow([
      new Date().toISOString(),           // Form Response (timestamp)
      data.email,                         // Email address
      '',                                 // Ethereum address (empty)
      '',                                 // Country (empty)
      ''                                  // How did you hear about us? (empty)
    ]);
    
    return { 
      success: true, 
      message: 'Email recorded to Form Responses',
      row: sheet.getLastRow()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Record transaction - FOR MAIN TRACKING SHEET
function recordTransaction(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    
    try {
      // Try to get the main tracking sheet (you might name it differently)
      sheet = ss.getSheetByName("Transactions") || ss.getSheetByName("Deposit Tracking") || ss.getActiveSheet();
    } catch (e) {
      sheet = ss.getActiveSheet();
    }
    
    // Create headers if first time (YOUR EXACT COLUMNS)
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Email', 'Timestamp', 'Wallet', 'ETH_Amount', 'USD_Spot', 'APOLO_Due', 'Tx_Hash', 'Day_ID'
      ]]);
    }
    
    // Add the transaction record
    sheet.appendRow([
      data.email || '',                                    // Email
      data.timestamp || new Date().toISOString(),          // Timestamp
      data.wallet || data.walletType || 'unknown',         // Wallet
      data.ethAmount || data.amount || 0,                  // ETH_Amount
      data.usdSpot || data.usdValue || 0,                  // USD_Spot
      data.apoloDue || data.apoloTokens || 0,              // APOLO_Due
      data.txHash || 'pending-tx-hash',                    // Tx_Hash
      data.dayId || new Date().toISOString().split('T')[0].replace(/-/g, '') // Day_ID
    ]);
    
    return { 
      success: true, 
      message: 'Transaction recorded successfully',
      row: sheet.getLastRow()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get latest transactions
function getLatestTransactions() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    
    try {
      sheet = ss.getSheetByName("Transactions") || ss.getSheetByName("Deposit Tracking") || ss.getActiveSheet();
    } catch (e) {
      sheet = ss.getActiveSheet();
    }
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, data: [] };
    }
    
    const data = sheet.getDataRange().getValues();
    // Get rows that have ETH_Amount (transaction completed)
    const transactions = data.slice(1)
      .filter(row => row[3] && row[3] !== '' && row[3] > 0) // ETH_Amount not empty and > 0
      .slice(-5) // Last 5 transactions
      .reverse()
      .map(row => ({
        email: row[0],
        amount: row[3], // ETH_Amount
        hash: row[6] ? (row[6].length > 10 ? row[6].substring(0, 8) + '...' + row[6].substring(row[6].length - 6) : row[6]) : 'pending...',
        apoloTokens: row[5] ? row[5].toLocaleString() : '0',
        time: 'recent'
      }));
    
    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get user transactions by email
function getUserTransactions(email) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    
    try {
      sheet = ss.getSheetByName("Transactions") || ss.getSheetByName("Deposit Tracking") || ss.getActiveSheet();
    } catch (e) {
      sheet = ss.getActiveSheet();
    }
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, data: [] };
    }
    
    const data = sheet.getDataRange().getValues();
    const userTransactions = data.slice(1)
      .filter(row => row[0] === email && row[3] && row[3] !== '' && row[3] > 0)
      .map(row => ({
        email: row[0],
        amount: row[3], // ETH_Amount
        hash: row[6] ? (row[6].length > 10 ? row[6].substring(0, 8) + '...' + row[6].substring(row[6].length - 6) : row[6]) : 'pending...',
        apoloTokens: row[5] ? row[5].toLocaleString() : '0',
        timestamp: row[1]
      }));
    
    return { success: true, data: userTransactions };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get ETH price (mock for now)
function getEthPrice() {
  try {
    // Mock ETH price - you can replace with real API call
    const mockPrice = 3586.78;
    return { success: true, price: mockPrice };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}