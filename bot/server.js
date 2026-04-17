import express from 'express';
import cors from 'cors';
import { calculateScore, formatAdminMessage } from './scoring.js';
import { sendToGoogleSheets } from './sheets.js';

// In-memory diagnostic log (last 30 events). Use /api/diag to inspect.
const diagLog = [];
function logDiag(entry) {
  diagLog.unshift({ ts: new Date().toISOString(), ...entry });
  if (diagLog.length > 30) diagLog.length = 30;
}

export function createServer(bot) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Log every /api request
  app.use('/api', (req, res, next) => {
    logDiag({
      type: 'req',
      method: req.method,
      path: req.path,
      origin: req.get('origin') || '',
      userAgent: req.get('user-agent')?.slice(0, 100) || '',
      bodyKeys: req.body ? Object.keys(req.body) : [],
    });
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'karcrypto-bot' });
  });

  // Ping — called by webapp on load to confirm network reachability
  app.get('/api/ping', (req, res) => {
    res.json({ pong: true, ts: Date.now() });
  });

  // Diagnostic: view recent requests (no secrets exposed)
  app.get('/api/diag', (req, res) => {
    res.json({ events: diagLog });
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
        try {
          await bot.api.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'HTML' });
          logDiag({ type: 'admin_sent', priority: score.priority, name: caseData.name });
        } catch (sendErr) {
          // HTML parse mode fails if description contains unescaped <, >, &.
          // Retry as plain text — more robust for user-generated content.
          logDiag({ type: 'admin_html_fail', error: sendErr.message });
          const plainMsg = adminMsg.replace(/<[^>]+>/g, '');
          await bot.api.sendMessage(ADMIN_CHAT_ID, plainMsg);
          logDiag({ type: 'admin_sent_plain', priority: score.priority, name: caseData.name });
        }
      } else {
        logDiag({ type: 'admin_skipped', hasAdminId: !!ADMIN_CHAT_ID, hasBot: !!bot });
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
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return app;
}
