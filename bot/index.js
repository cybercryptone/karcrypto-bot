import 'dotenv/config';
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import { createServer } from './server.js';
import { formatAdminMessage, calculateScore } from './scoring.js';
import { sendToGoogleSheets } from './sheets.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Set in production (e.g. https://karcrypto-bot.onrender.com)

let bot = null;
if (BOT_TOKEN) {
  bot = new Bot(BOT_TOKEN);
} else {
  console.warn('[Bot] No TELEGRAM_BOT_TOKEN — running API server only (no Telegram bot)');
}

if (bot) {
// /start — open Mini App
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp(
    '🔍 Открыть KarCrypto',
    WEBAPP_URL
  );

  await ctx.reply(
    '🛡 *KarCrypto — Blockchain Forensics & Asset Recovery*\n\n' +
    'Помогаем анализировать и сопровождать кейсы по утрате, блокировке и краже криптоактивов.\n\n' +
    'Нажмите кнопку ниже, чтобы открыть приложение.',
    {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  );
});

// Handle data sent from Mini App
bot.on('message:web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    const user = ctx.from;

    const caseData = {
      ...data,
      telegramId: user.id,
      telegramUsername: user.username || '',
      telegramName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Calculate score
    const score = calculateScore(caseData);
    caseData.score = score.total;
    caseData.priority = score.priority;

    // Send to admin
    if (ADMIN_CHAT_ID) {
      const adminMsg = formatAdminMessage(caseData, score);
      await bot.api.sendMessage(ADMIN_CHAT_ID, adminMsg, {
        parse_mode: 'HTML',
      });
    }

    // Send to Google Sheets
    await sendToGoogleSheets(caseData);

    // Confirm to user
    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };

    const lang = caseData.language || 'ru';
    const confirmMessages = {
      ru: `✅ *Заявка принята*\n\nПриоритет: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\nМы свяжемся с вами в ближайшее время.`,
      en: `✅ *Request received*\n\nPriority: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\nWe will contact you shortly.`,
      es: `✅ *Solicitud recibida*\n\nPrioridad: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\nNos pondremos en contacto pronto.`,
      fr: `✅ *Demande reçue*\n\nPriorité: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\nNous vous contacterons sous peu.`,
      de: `✅ *Anfrage erhalten*\n\nPriorität: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\nWir werden uns in Kürze bei Ihnen melden.`,
      zh: `✅ *申请已收到*\n\n优先级: ${priorityEmoji[score.priority]} ${score.priority.toUpperCase()}\n\n我们会尽快与您联系。`,
    };

    const ctaMessages = {
      ru: '\n\n📞 /consult — Получить разбор кейса\n🧠 /analysis — Запросить анализ транзакций\n💬 /contact — Связаться со специалистом',
      en: '\n\n📞 /consult — Get case review\n🧠 /analysis — Request TX analysis\n💬 /contact — Contact specialist',
      es: '\n\n📞 /consult — Obtener revisión\n🧠 /analysis — Solicitar análisis\n💬 /contact — Contactar especialista',
      fr: '\n\n📞 /consult — Obtenir une analyse\n🧠 /analysis — Demander une analyse TX\n💬 /contact — Contacter un spécialiste',
      de: '\n\n📞 /consult — Fallbewertung erhalten\n🧠 /analysis — TX-Analyse anfordern\n💬 /contact — Spezialisten kontaktieren',
      zh: '\n\n📞 /consult — 获取案例审查\n🧠 /analysis — 请求交易分析\n💬 /contact — 联系专家',
    };

    await ctx.reply(
      (confirmMessages[lang] || confirmMessages.en) +
      (ctaMessages[lang] || ctaMessages.en),
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Error processing web_app_data:', err);
    await ctx.reply('An error occurred processing your request. Please try again.');
  }
});

// CTA commands
bot.command('consult', async (ctx) => {
  await ctx.reply(
    '📞 Для получения разбора кейса свяжитесь с нами:\n\n' +
    'Telegram: @karcrypto_bot | Канал: @KarCrypto97\n' +
    'Email: cases@karcrypto.com'
  );
});

bot.command('analysis', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🧠 Открыть форму', WEBAPP_URL);
  await ctx.reply('Для запроса анализа транзакций заполните форму:', {
    reply_markup: keyboard,
  });
});

bot.command('contact', async (ctx) => {
  await ctx.reply(
    '💬 Связаться со специалистом:\n\n' +
    'Telegram: @karcrypto_bot | Канал: @KarCrypto97\n' +
    'Email: cases@karcrypto.com\n' +
    'Время ответа: до 15 минут в рабочие часы'
  );
});

} // end if (bot)

// Start Express server for API + bot webhook
const server = createServer(bot);
const PORT = process.env.PORT || 3001;

// Mount bot webhook endpoint if in webhook mode
if (bot && WEBHOOK_URL) {
  server.use(`/bot${BOT_TOKEN}`, webhookCallback(bot, 'express'));
}

server.listen(PORT, async () => {
  console.log(`API server running on port ${PORT}`);

  if (bot) {
    if (WEBHOOK_URL) {
      // Production: webhook mode
      const webhookEndpoint = `${WEBHOOK_URL}/bot${BOT_TOKEN}`;
      try {
        await bot.api.setWebhook(webhookEndpoint);
        console.log(`[Bot] Webhook set: ${WEBHOOK_URL}/bot<TOKEN>`);
      } catch (err) {
        console.error('[Bot] Failed to set webhook:', err.message);
      }
    } else {
      // Local dev: long-polling
      await bot.api.deleteWebhook().catch(() => {});
      bot.start({
        onStart: () => console.log('KarCrypto bot is running (polling)'),
      });
    }
  }
});
