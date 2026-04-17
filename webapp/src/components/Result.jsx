const TG_CHANNEL = 'https://t.me/KarCrypto97';
const WEBSITE_URL = 'https://karcrypto.com';
const SUPPORT_CONTACT = 'https://t.me/KarCryptoSupport';

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

function openExternalLink(url) {
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function openTelegramLink(url) {
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function Result({ t, result }) {
  const priority = result?.priority || 'medium';
  const priorityData = t.result.priorities[priority];

  const priorityEmoji = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <>
      <div className="card">
        <div className="result-header">
          <div className="result-check">✅</div>
          <h2 className="card-title" style={{ marginBottom: 4 }}>
            {t.result.title}
          </h2>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="form-label" style={{ marginBottom: 8 }}>
            {t.result.priorityLabel}
          </div>
          <div className={`priority-badge ${priority}`}>
            {priorityEmoji[priority]} {priorityData.label}
          </div>
          <p className="priority-desc">{priorityData.desc}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ fontSize: 16 }}>
          {t.result.nextSteps}
        </h3>
        <div className="result-cta">
          <button className="btn-primary" onClick={() => openExternalLink(WEBSITE_URL)}>
            {t.result.cta.visitWebsite}
          </button>
          <button className="btn-secondary" onClick={() => openTelegramLink(SUPPORT_CONTACT)}>
            {t.result.cta.contact}
          </button>
        </div>
      </div>

      <a
        href={TG_CHANNEL}
        onClick={(e) => { e.preventDefault(); openTelegramLink(TG_CHANNEL); }}
        target="_blank"
        rel="noopener noreferrer"
        className="tg-banner"
      >
        <span className="tg-banner-text">{t.telegram.subscribe}</span>
        <span className="tg-banner-desc">{t.telegram.subscribeDesc}</span>
      </a>
    </>
  );
}
