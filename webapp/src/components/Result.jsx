const TG_CHANNEL = 'https://t.me/KarCrypto97';

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
          <button className="btn-primary">
            {t.result.cta.consult}
          </button>
          <button className="btn-secondary">
            {t.result.cta.analysis}
          </button>
          <button className="btn-secondary">
            {t.result.cta.contact}
          </button>
        </div>
      </div>

      <a href={TG_CHANNEL} target="_blank" rel="noopener noreferrer" className="tg-banner">
        <span className="tg-banner-text">{t.telegram.subscribe}</span>
        <span className="tg-banner-desc">{t.telegram.subscribeDesc}</span>
      </a>
    </>
  );
}
