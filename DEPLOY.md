# KarCrypto Telegram Bot — Deployment Guide

Deploy both the Mini App (webapp) and the bot backend to [Render](https://render.com) via GitHub.

## 1. Create the Telegram bot (2 min)

1. Open Telegram, search `@BotFather`
2. Send `/newbot`
3. Choose a name: `KarCrypto`
4. Choose a username: `karcrypto_bot`
5. Save the token BotFather gives you (looks like `123456:ABC-xyz...`) → this is your **`TELEGRAM_BOT_TOKEN`**
6. Send `/setdomain` → select your bot → you'll add the webapp URL here **after step 3** (once you have it)

Get your **`ADMIN_CHAT_ID`**:
- Start your bot and send any message to it
- Open `https://api.telegram.org/bot<TOKEN>/getUpdates`
- Find `"chat":{"id":12345678}` — that number is your chat ID
- *(Alternatively, add the bot to a group and use the group's chat ID instead)*

## 2. Push code to GitHub

```bash
# From /Users/andrewerikashvili/Documents/KarCrypto/telegram-bot

git init
git add .
git commit -m "Initial commit: KarCrypto Telegram Mini App"

# Create a new repo on https://github.com/new (e.g. "karcrypto-bot")
git remote add origin https://github.com/<YOUR_USERNAME>/karcrypto-bot.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Render (Blueprint)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repo
4. Render will read `render.yaml` and propose two services:
   - `karcrypto-webapp` (static site)
   - `karcrypto-bot` (Node web service)
5. Click **Apply** — Render creates both services (first deploy will fail on env vars, that's expected)

## 4. Set environment variables

After the first deploy attempt, open each service in Render dashboard:

### `karcrypto-bot` → Environment tab
| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | From step 1 |
| `ADMIN_CHAT_ID` | From step 1 |
| `WEBAPP_URL` | `https://karcrypto-webapp.onrender.com` (check actual URL) |
| `WEBHOOK_URL` | `https://karcrypto-bot.onrender.com` (this service's URL) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | From Google Apps Script (see section 5, optional) |

### `karcrypto-webapp` → Environment tab
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://karcrypto-bot.onrender.com` |

Then click **Manual Deploy → Deploy latest commit** on each service.

## 5. Google Sheets integration (optional)

1. Create a new Google Sheet with columns:
   `Timestamp | Name | Telegram | TG ID | Email | Issue | Funds Location | Amount | Incident Date | Network | TX Hash | Wallet | Description | Language | Priority | Score`
2. Extensions → Apps Script
3. Paste contents of [`bot/google-apps-script.js`](bot/google-apps-script.js)
4. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the URL and set as `GOOGLE_SHEETS_WEBHOOK_URL` in the bot service

## 6. Final setup in BotFather

Once deployed, return to `@BotFather`:

1. `/setdomain` → select bot → send `https://karcrypto-webapp.onrender.com`
2. `/setmenubutton` → select bot → text: `Открыть приложение` → URL: `https://karcrypto-webapp.onrender.com`
3. `/setdescription` → "KarCrypto — крипто-криминалистика и возврат активов"

## 7. Test

1. Open your bot in Telegram
2. Send `/start`
3. Click the Mini App button → fill the form → submit
4. Verify:
   - You receive a confirmation in the chat
   - Admin chat receives the case details
   - Google Sheet gets a new row

## Notes

- **Free tier sleep**: Render free services spin down after 15 min of inactivity. The bot uses **webhook mode** so it wakes up instantly on each message — no data loss.
- **Custom domain**: On Render → service → Settings → Custom Domains to use `bot.karcrypto.com` / `app.karcrypto.com`.
- **Logs**: Render → service → Logs to debug issues.
