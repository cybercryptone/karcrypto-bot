import { useState } from 'react';

export default function Classify({ t, initial, onDone, onBack }) {
  const [step, setStep] = useState(1); // 1 = issue type, 2 = funds location
  const [issueType, setIssueType] = useState(initial.issueType || '');
  const [fundsLocation, setFundsLocation] = useState(initial.fundsLocation || '');

  const handleIssueSelect = (id) => {
    setIssueType(id);
    setStep(2);
  };

  const handleFundsSelect = (id) => {
    setFundsLocation(id);
  };

  if (step === 1) {
    return (
      <>
        <div className="card">
          <div className="gold-accent" />
          <h2 className="card-title">{t.classify.title}</h2>
          <div className="option-list">
            {t.classify.issueTypes.map((opt) => (
              <button
                key={opt.id}
                className={`option-btn ${issueType === opt.id ? 'selected' : ''}`}
                onClick={() => handleIssueSelect(opt.id)}
              >
                <span className="option-icon">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="nav-bar">
          <button className="btn-ghost" onClick={onBack}>
            {t.classify.back}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <div className="gold-accent" />
        <h2 className="card-title">{t.classify.fundsTitle}</h2>
        <div className="option-list">
          {t.classify.fundsLocations.map((opt) => (
            <button
              key={opt.id}
              className={`option-btn ${fundsLocation === opt.id ? 'selected' : ''}`}
              onClick={() => handleFundsSelect(opt.id)}
            >
              <span className="option-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="nav-bar">
        <button className="btn-ghost" onClick={() => setStep(1)}>
          {t.classify.back}
        </button>
        <button
          className="btn-primary"
          onClick={() => onDone(issueType, fundsLocation)}
          disabled={!fundsLocation}
          style={{ opacity: fundsLocation ? 1 : 0.5 }}
        >
          {t.classify.next}
        </button>
      </div>
    </>
  );
}
