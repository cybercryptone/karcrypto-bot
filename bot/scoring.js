/**
 * Auto-scoring logic for case prioritization.
 *
 * Scoring rules:
 *  TX hash present     → +2
 *  Amount > $5k        → +2
 *  Fresh case (<30d)   → +2
 *  CEX freeze          → +1
 *  No data / vague     → -2
 */
export function calculateScore(data) {
  let total = 0;
  const breakdown = [];

  // TX hash present
  if (data.txHash && data.txHash.trim().length > 10) {
    total += 2;
    breakdown.push('+2 TX hash provided');
  }

  // Amount > $5k
  const amountMap = {
    '1k-5k': 3000,
    '5k-20k': 12000,
    '20k-100k': 60000,
    '100k+': 150000,
    'under1k': 500,
  };
  const estimatedAmount = amountMap[data.lossAmount] || 0;
  if (estimatedAmount > 5000) {
    total += 2;
    breakdown.push('+2 amount > $5K');
  }

  // Fresh case (<30 days)
  if (data.incidentDate) {
    const incidentDate = new Date(data.incidentDate);
    const daysSince = (Date.now() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 30) {
      total += 2;
      breakdown.push('+2 fresh case (<30 days)');
    }
  }

  // CEX freeze
  if (data.issueType === 'exchange_freeze') {
    total += 1;
    breakdown.push('+1 CEX freeze');
  }

  // No useful data
  const hasUsefulData = data.txHash || data.walletAddress || data.description?.length > 20;
  if (!hasUsefulData) {
    total -= 2;
    breakdown.push('-2 insufficient data');
  }

  // Priority shown to the user: always "high" (every submitted case is treated as priority).
  // Internal `total` score is still calculated above for admin triage in Telegram notifications.
  const priority = 'high';

  return { total, priority, breakdown };
}

// Escape HTML special chars so user-supplied strings don't break Telegram's HTML parse mode.
function esc(s) {
  if (s === undefined || s === null) return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatAdminMessage(data, score) {
  const priorityLabel = {
    high: '🔴 HIGH',
    medium: '🟡 MEDIUM',
    low: '🟢 LOW',
  };

  const issueLabels = {
    scam: 'Scam / Phishing',
    exchange_freeze: 'Exchange Freeze',
    transfer_error: 'Transfer Error',
    wallet_hack: 'Wallet Hack',
    other: 'Other',
  };

  const fundLabels = {
    cex: 'CEX (Binance/OKX/Bybit)',
    defi: 'DeFi Wallet (MetaMask etc.)',
    bank: 'Bank Transfer',
    unknown: "Don't know",
  };

  const breakdown = score.breakdown.length ? esc(score.breakdown.join(', ')) : '—';
  const name = data.name ? esc(data.name) : '—';
  const username = data.telegramUsername ? '@' + esc(data.telegramUsername) : '—';
  const tgId = data.telegramId ? esc(data.telegramId) : '—';
  const email = data.email ? esc(data.email) : '—';
  const issue = issueLabels[data.issueType] || esc(data.issueType) || '—';
  const funds = fundLabels[data.fundsLocation] || esc(data.fundsLocation) || '—';
  const amount = data.lossAmount ? esc(data.lossAmount) : '—';
  const date = data.incidentDate ? esc(data.incidentDate) : '—';
  const network = data.network ? esc(data.network) : '—';
  const txHash = data.txHash ? esc(data.txHash) : '—';
  const wallet = data.walletAddress ? esc(data.walletAddress) : '—';
  const description = data.description ? esc(data.description) : '—';
  const language = data.language ? esc(data.language) : '—';
  const submittedAt = data.submittedAt ? esc(data.submittedAt) : '—';

  return (
    `<b>📋 New Case — ${priorityLabel[score.priority]}</b>\n` +
    `<b>Score:</b> ${score.total} (${breakdown})\n\n` +
    `<b>👤 Contact</b>\n` +
    `Name: ${name}\n` +
    `Telegram: ${username} (ID: ${tgId})\n` +
    `Email: ${email}\n\n` +
    `<b>📌 Case Details</b>\n` +
    `Issue: ${issue}\n` +
    `Funds location: ${funds}\n` +
    `Amount: ${amount}\n` +
    `Date: ${date}\n` +
    `Network/Token: ${network}\n` +
    `TX Hash: <code>${txHash}</code>\n` +
    `Wallet: <code>${wallet}</code>\n\n` +
    `<b>📝 Description</b>\n${description}\n\n` +
    `<b>🌐 Language:</b> ${language}\n` +
    `<b>🕐 Submitted:</b> ${submittedAt}`
  );
}
