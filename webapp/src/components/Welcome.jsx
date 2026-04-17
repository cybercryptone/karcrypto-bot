const TG_CHANNEL = 'https://t.me/KarCrypto97';
const WEBSITE_URL = 'https://karcrypto.com';

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

export default function Welcome({ t, onSubmit, onHow, onLangChange }) {
  return (
    <>
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

      <div className="card">
        <div className="gold-accent" />
        <p className="card-desc">{t.welcome.description}</p>
        <div className="welcome-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {t.welcome.submitRequest}
          </button>
          <button className="btn-secondary" onClick={() => openExternalLink(WEBSITE_URL)}>
            {t.result.cta.visitWebsite}
          </button>
          <button className="btn-secondary" onClick={onHow}>
            {t.welcome.howItWorks}
          </button>
        </div>
      </div>

      <button className="btn-ghost" onClick={onLangChange} style={{ marginTop: 4 }}>
        {t.langFlag} {t.lang} — {t.selectLanguage}
      </button>
    </>
  );
}
