export default function HowItWorks({ t, onBack, onStart }) {
  return (
    <>
      <div className="card">
        <div className="gold-accent" />
        <h2 className="card-title">{t.howItWorks.title}</h2>
        <div className="steps-list">
          {t.howItWorks.steps.map((step, i) => (
            <div className="step-item" key={i}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-bar">
        <button className="btn-ghost" onClick={onBack}>
          {t.howItWorks.back}
        </button>
        <button className="btn-primary" onClick={onStart}>
          {t.welcome.mySituation}
        </button>
      </div>
    </>
  );
}
