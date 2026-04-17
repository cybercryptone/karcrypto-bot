import { useState, useCallback, useEffect } from 'react';
import { translations } from './i18n/translations.js';
import LanguageSelect from './components/LanguageSelect.jsx';
import Welcome from './components/Welcome.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Classify from './components/Classify.jsx';
import CaseForm from './components/CaseForm.jsx';
import Consent from './components/Consent.jsx';
import Result from './components/Result.jsx';

// Telegram Web App API
const tg = window.Telegram?.WebApp;

const SCREENS = {
  LANG: 'lang',
  WELCOME: 'welcome',
  HOW: 'how',
  CLASSIFY: 'classify',
  FORM: 'form',
  CONSENT: 'consent',
  RESULT: 'result',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANG);
  const [lang, setLang] = useState('ru');
  const [caseData, setCaseData] = useState({
    issueType: '',
    fundsLocation: '',
    name: '',
    email: '',
    lossAmount: '',
    incidentDate: '',
    network: '',
    txHash: '',
    walletAddress: '',
    description: '',
  });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState(null);
  const t = translations[lang];

  // Expand Telegram Web App on open + diagnostic ping
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
    // Diagnostic ping — confirms webapp can reach bot API from user's client
    fetch(`${API_URL}/api/ping?src=webapp&v=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
    }).catch(() => { /* silent: will show up as absence in diag log */ });
  }, []);

  const handleLangSelect = useCallback((selectedLang) => {
    setLang(selectedLang);
    setScreen(SCREENS.WELCOME);
  }, []);

  const handleClassifyDone = useCallback((issueType, fundsLocation) => {
    setCaseData((prev) => ({ ...prev, issueType, fundsLocation }));
    setScreen(SCREENS.FORM);
  }, []);

  const handleFormDone = useCallback((formData) => {
    setCaseData((prev) => ({ ...prev, ...formData }));
    setScreen(SCREENS.CONSENT);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      ...caseData,
      language: lang,
      telegramId: tg?.initDataUnsafe?.user?.id || '',
      telegramUsername: tg?.initDataUnsafe?.user?.username || '',
      telegramName: [
        tg?.initDataUnsafe?.user?.first_name || '',
        tg?.initDataUnsafe?.user?.last_name || '',
      ].filter(Boolean).join(' '),
      initData: tg?.initData || '',
    };

    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'submit failed');

      setResult(data);
      setSubmitting(false);
      setScreen(SCREENS.RESULT);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitting(false);
      const errorMsg = err.message || 'Network error';
      setSubmitError(errorMsg);
      // Show error via Telegram alert if available, otherwise fall through to UI
      if (tg?.showAlert) {
        tg.showAlert(`Ошибка отправки: ${errorMsg}. Попробуйте ещё раз.`);
      }
    }
  }, [caseData, lang]);

  return (
    <>
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-kar">Kar</span>
            <span className="logo-crypto">Crypto</span>
          </div>
          {screen !== SCREENS.LANG && (
            <div className="header-subtitle">{t.welcome.subtitle}</div>
          )}
        </header>

        <div className="screen" key={screen}>
          {screen === SCREENS.LANG && (
            <LanguageSelect onSelect={handleLangSelect} />
          )}

          {screen === SCREENS.WELCOME && (
            <Welcome
              t={t}
              onSubmit={() => setScreen(SCREENS.CLASSIFY)}
              onHow={() => setScreen(SCREENS.HOW)}
              onLangChange={() => setScreen(SCREENS.LANG)}
            />
          )}

          {screen === SCREENS.HOW && (
            <HowItWorks
              t={t}
              onBack={() => setScreen(SCREENS.WELCOME)}
              onStart={() => setScreen(SCREENS.CLASSIFY)}
            />
          )}

          {screen === SCREENS.CLASSIFY && (
            <Classify
              t={t}
              initial={caseData}
              onDone={handleClassifyDone}
              onBack={() => setScreen(SCREENS.WELCOME)}
            />
          )}

          {screen === SCREENS.FORM && (
            <CaseForm
              t={t}
              initial={caseData}
              onDone={handleFormDone}
              onBack={() => setScreen(SCREENS.CLASSIFY)}
            />
          )}

          {screen === SCREENS.CONSENT && (
            <Consent
              t={t}
              submitting={submitting}
              onConfirm={handleSubmit}
              onCancel={() => setScreen(SCREENS.FORM)}
            />
          )}

          {screen === SCREENS.RESULT && (
            <Result t={t} result={result} />
          )}
        </div>
      </div>
    </>
  );
}
