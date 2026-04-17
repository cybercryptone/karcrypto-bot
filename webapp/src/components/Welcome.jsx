const TG_CHANNEL = 'https://t.me/KarCrypto97';

export default function Welcome({ t, onSituation, onSubmit, onHow, onLangChange }) {
  return (
    <>
      <a href={TG_CHANNEL} target="_blank" rel="noopener noreferrer" className="tg-banner">
        <span className="tg-banner-text">{t.telegram.subscribe}</span>
        <span className="tg-banner-desc">{t.telegram.subscribeDesc}</span>
      </a>

      <div className="card">
        <div className="gold-accent" />
        <p className="card-desc">{t.welcome.description}</p>
        <div className="welcome-actions">
          <button className="btn-primary" onClick={onSituation}>
            {t.welcome.mySituation}
          </button>
          <button className="btn-secondary" onClick={onSubmit}>
            {t.welcome.submitRequest}
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
