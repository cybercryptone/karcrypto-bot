import express from 'express';
import cors from 'cors';
import { calculateScore, formatAdminMessage } from './scoring.js';
import { sendToGoogleSheets } from './sheets.js';

export function createServer(bot) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'karcrypto-bot' });
  });

  // API endpoint for Mini App form submission (fallback if web_app_data doesn't work)
  app.post('/api/submit', async (req, res) => {
    try {
      const data = req.body;

      const caseData = {
        ...data,
        submittedAt: new Date().toISOString(),
      };

      // Calculate score
      const score = calculateScore(caseData);
      caseData.score = score.total;
      caseData.priority = score.priority;

      // Send to admin
      const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
      if (ADMIN_CHAT_ID && bot) {
        const adminMsg = formatAdminMessage(caseData, score);
        await bot.api.sendMessage(ADMIN_CHAT_ID, adminMsg, {
          parse_mode: 'HTML',
        });
      }

      // Send to Google Sheets
      await sendToGoogleSheets(caseData);

      res.json({
        success: true,
        priority: score.priority,
        score: score.total,
      });
    } catch (err) {
      console.error('Submit error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
        hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasAdminId: !!process.env.ADMIN_CHAT_ID,
        hasSheetsUrl: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL,
      });
    }
  });

  return app;
}
