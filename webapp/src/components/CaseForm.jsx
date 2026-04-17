import { useState } from 'react';

export default function CaseForm({ t, initial, onDone, onBack }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    incidentDate: initial.incidentDate || '',
    description: initial.description || '',
  });

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid = form.name.trim().length > 0;

  return (
    <>
      <div className="card">
        <div className="gold-accent" />
        <h2 className="card-title">{t.form.title}</h2>

        <div className="form-group">
          <label className="form-label">{t.form.name} *</label>
          <input
            className="form-input"
            type="text"
            placeholder={t.form.namePlaceholder}
            value={form.name}
            onChange={update('name')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.form.email}</label>
          <input
            className="form-input"
            type="email"
            placeholder={t.form.emailPlaceholder}
            value={form.email}
            onChange={update('email')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.form.incidentDate}</label>
          <input
            className="form-input"
            type="date"
            value={form.incidentDate}
            onChange={update('incidentDate')}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.form.description}</label>
          <textarea
            className="form-textarea"
            placeholder={t.form.descriptionPlaceholder}
            value={form.description}
            onChange={update('description')}
          />
        </div>
      </div>

      <div className="nav-bar">
        <button className="btn-ghost" onClick={onBack}>
          {t.form.back}
        </button>
        <button
          className="btn-primary"
          onClick={() => onDone(form)}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          {t.form.next}
        </button>
      </div>
    </>
  );
}
