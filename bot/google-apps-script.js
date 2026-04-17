/**
 * Google Apps Script — paste this into your Google Sheet's Apps Script editor.
 *
 * Setup:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Replace Code.gs contents with this script
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the URL and set it as GOOGLE_SHEETS_WEBHOOK_URL in .env
 *
 * The sheet should have these columns in row 1:
 * Timestamp | Name | Telegram | TG ID | Email | Issue | Funds Location |
 * Amount | Incident Date | Network | TX Hash | Wallet | Description |
 * Language | Priority | Score
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toISOString(),
      data.name || '',
      data.telegramUsername || '',
      data.telegramId || '',
      data.email || '',
      data.issueType || '',
      data.fundsLocation || '',
      data.lossAmount || '',
      data.incidentDate || '',
      data.network || '',
      data.txHash || '',
      data.walletAddress || '',
      data.description || '',
      data.language || '',
      data.priority || '',
      data.score || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'karcrypto-sheets' }))
    .setMimeType(ContentService.MimeType.JSON);
}
