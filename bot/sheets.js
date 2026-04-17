/**
 * Google Sheets integration via Google Apps Script webhook.
 *
 * Setup:
 * 1. Create a Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste the script from google-apps-script.js
 * 4. Deploy as Web App (execute as: me, access: anyone)
 * 5. Copy the URL to GOOGLE_SHEETS_WEBHOOK_URL in .env
 */
export async function sendToGoogleSheets(data) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[Sheets] No webhook URL configured — skipping Google Sheets');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name || '',
        telegramUsername: data.telegramUsername || '',
        telegramId: data.telegramId || '',
        email: data.email || '',
        issueType: data.issueType || '',
        fundsLocation: data.fundsLocation || '',
        lossAmount: data.lossAmount || '',
        incidentDate: data.incidentDate || '',
        network: data.network || '',
        txHash: data.txHash || '',
        walletAddress: data.walletAddress || '',
        description: data.description || '',
        language: data.language || '',
        priority: data.priority || '',
        score: data.score ?? '',
        submittedAt: data.submittedAt || '',
      }),
    });

    if (!response.ok) {
      console.error('[Sheets] Webhook error:', response.status);
    } else {
      console.log('[Sheets] Data sent successfully');
    }
  } catch (err) {
    console.error('[Sheets] Failed to send:', err.message);
  }
}
