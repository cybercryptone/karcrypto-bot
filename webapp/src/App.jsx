import { useState, useCallback } from 'react';
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

  const t = translations[lang];

  // Expand Telegram Web App on open
  if (tg) {
    tg.ready();
    tg.expand();
  }

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

    const payload = {
      ...caseData,
      language: lang,
      telegramId: tg?.initDataUnsafe?.user?.id || '',
      telegramUsername: tg?.initDataUnsafe?.user?.username || '',
      telegramName: [
        tg?.initDataUnsafe?.user?.first_name || '',
        tg?.initDataUnsafe?.user?.last_name || '',
      ].filter(Boolean).join(' '),
    };

    try {
      // Try sending via Telegram Web App data first
      if (tg?.sendData) {
        tg.sendData(JSON.stringify(payload));
        // Telegram will close the Mini App after sendData
        // Set result optimistically
        setResult({ priority: 'medium', score: 0 });
        setScreen(SCREENS.RESULT);
      } else {
        // Fallback: send via API
        const res = await fetch(`${API_URL}/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setResult(data);
        setScreen(SCREENS.RESULT);
      }
    } catch (err) {
      console.error('Submit error:', err);
      // Still show result on error
      setResult({ priority: 'medium', score: 0 });
      setScreen(SCREENS.RESULT);
    } finally {
      setSubmitting(false);
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
