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

  // Determine priority
  let priority;
  if (total >= 4) priority = 'high';
  else if (total >= 2) priority = 'medium';
  else priority = 'low';

  return { total, priority, breakdown };
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

  return (
    `<b>📋 New Case — ${priorityLabel[score.priority]}</b>\n` +
    `<b>Score:</b> ${score.total} (${score.breakdown.join(', ')})\n\n` +
    `<b>👤 Contact</b>\n` +
    `Name: ${data.name || '—'}\n` +
    `Telegram: ${data.telegramUsername ? '@' + data.telegramUsername : '—'} (ID: ${data.telegramId || '—'})\n` +
    `Email: ${data.email || '—'}\n\n` +
    `<b>📌 Case Details</b>\n` +
    `Issue: ${issueLabels[data.issueType] || data.issueType || '—'}\n` +
    `Funds location: ${fundLabels[data.fundsLocation] || data.fundsLocation || '—'}\n` +
    `Amount: ${data.lossAmount || '—'}\n` +
    `Date: ${data.incidentDate || '—'}\n` +
    `Network/Token: ${data.network || '—'}\n` +
    `TX Hash: <code>${data.txHash || '—'}</code>\n` +
    `Wallet: <code>${data.walletAddress || '—'}</code>\n\n` +
    `<b>📝 Description</b>\n${data.description || '—'}\n\n` +
    `<b>🌐 Language:</b> ${data.language || '—'}\n` +
    `<b>🕐 Submitted:</b> ${data.submittedAt || '—'}`
  );
}
