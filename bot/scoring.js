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

// Returns true if a string has meaningful content (non-empty, non-whitespace).
function has(v) {
  return v !== undefined && v !== null && String(v).trim() !== '';
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

  // Collect only populated lines for each section.
  const contactLines = [];
  if (has(data.name)) contactLines.push(`Name: ${esc(data.name)}`);
  if (has(data.telegramUsername) || has(data.telegramId)) {
    const u = has(data.telegramUsername) ? '@' + esc(data.telegramUsername) : '';
    const id = has(data.telegramId) ? ` (ID: ${esc(data.telegramId)})` : '';
    contactLines.push(`Telegram: ${u}${id}`.trim());
  }
  if (has(data.email)) contactLines.push(`Email: ${esc(data.email)}`);
  // Website form has a generic `contact` free-text field (phone / email / telegram).
  if (has(data.contact)) contactLines.push(`Contact: ${esc(data.contact)}`);

  const caseLines = [];
  if (has(data.issueType)) {
    caseLines.push(`Issue: ${issueLabels[data.issueType] || esc(data.issueType)}`);
  }
  // Website form uses free-text `problem` chips (multi-select joined by comma).
  if (has(data.problem)) caseLines.push(`Problem: ${esc(data.problem)}`);
  if (has(data.fundsLocation)) {
    caseLines.push(`Funds location: ${fundLabels[data.fundsLocation] || esc(data.fundsLocation)}`);
  }
  // Website form uses `exchange` name directly (Binance/Bybit/OKX/etc.).
  if (has(data.exchange)) caseLines.push(`Exchange: ${esc(data.exchange)}`);
  if (has(data.lossAmount)) caseLines.push(`Amount: ${esc(data.lossAmount)}`);
  if (has(data.amount)) caseLines.push(`Amount: ${esc(data.amount)}`);
  if (has(data.incidentDate)) caseLines.push(`Date: ${esc(data.incidentDate)}`);
  if (has(data.network)) caseLines.push(`Network/Token: ${esc(data.network)}`);
  if (has(data.txHash)) caseLines.push(`TX Hash: <code>${esc(data.txHash)}</code>`);
  if (has(data.walletAddress)) caseLines.push(`Wallet: <code>${esc(data.walletAddress)}</code>`);

  const breakdown = score.breakdown.length ? esc(score.breakdown.join(', ')) : '';

  const sections = [
    `<b>📋 New Case — ${priorityLabel[score.priority]}</b>`,
    breakdown
      ? `<b>Score:</b> ${score.total} (${breakdown})`
      : `<b>Score:</b> ${score.total}`,
  ];

  if (contactLines.length) {
    sections.push('');
    sections.push('<b>👤 Contact</b>');
    sections.push(contactLines.join('\n'));
  }

  if (caseLines.length) {
    sections.push('');
    sections.push('<b>📌 Case Details</b>');
    sections.push(caseLines.join('\n'));
  }

  if (has(data.description)) {
    sections.push('');
    sections.push('<b>📝 Description</b>');
    sections.push(esc(data.description));
  }

  const metaLines = [];
  if (has(data.source)) metaLines.push(`<b>📍 Source:</b> ${esc(data.source)}`);
  if (has(data.page)) metaLines.push(`<b>🔗 Page:</b> ${esc(data.page)}`);
  if (has(data.language)) metaLines.push(`<b>🌐 Language:</b> ${esc(data.language)}`);
  if (has(data.submittedAt)) metaLines.push(`<b>🕐 Submitted:</b> ${esc(data.submittedAt)}`);
  if (metaLines.length) {
    sections.push('');
    sections.push(metaLines.join('\n'));
  }

  return sections.join('\n');
}
