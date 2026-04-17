export default function Consent({ t, submitting, onConfirm, onCancel }) {
  return (
    <>
      <div className="card">
        <div className="gold-accent" />
        <h2 className="card-title">{t.consent.title}</h2>

        <div className="consent-box">
          <p className="consent-text">{t.consent.text}</p>
          <p className="consent-nda">{t.consent.ndaNote}</p>
        </div>

        <div className="consent-actions">
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={submitting}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              t.consent.confirm
            )}
          </button>
          <button
            className="btn-secondary btn-danger"
            onClick={onCancel}
            disabled={submitting}
          >
            {t.consent.cancel}
          </button>
        </div>
      </div>
    </>
  );
}
