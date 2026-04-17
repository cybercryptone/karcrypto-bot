import { translations } from '../i18n/translations.js';

const languages = [
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
];

export default function LanguageSelect({ onSelect }) {
  return (
    <div className="card">
      <div className="gold-accent" />
      <h2 className="card-title" style={{ textAlign: 'center' }}>
        Select Language
      </h2>
      <div className="lang-grid">
        {languages.map((l) => (
          <button
            key={l.code}
            className="lang-btn"
            onClick={() => onSelect(l.code)}
          >
            <span className="flag">{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
