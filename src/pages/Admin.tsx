import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Admin.css';

export function Admin() {
  const navigate = useNavigate();
  const { settings, updateSettings, isApiKeySet } = useSettings();
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveApiKey = () => {
    updateSettings({ openaiApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    updateSettings({ openaiApiKey: '' });
  };

  const maskedKey = apiKey ? `sk-...${apiKey.slice(-4)}` : '';

  return (
    <div className="admin">
      <header className="admin__header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Admin Settings</h1>
      </header>

      <div className="admin__content">
        <section className="settings-section">
          <h2>OpenAI API Configuration</h2>
          <p className="section-description">
            Enter your OpenAI API key to enable AI-powered exam generation.
            Your key is stored locally in your browser and never sent to any server except OpenAI.
          </p>

          <div className="api-key-status">
            <span className={`status-indicator ${isApiKeySet ? 'status--active' : 'status--inactive'}`}>
              {isApiKeySet ? '● Connected' : '○ Not configured'}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <div className="api-key-input">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {isApiKeySet && !showKey && (
              <p className="current-key">Current key: {maskedKey}</p>
            )}
          </div>

          <div className="form-actions">
            <button
              className="btn btn--primary"
              onClick={handleSaveApiKey}
              disabled={!apiKey}
            >
              {saved ? '✓ Saved!' : 'Save API Key'}
            </button>
            {isApiKeySet && (
              <button
                className="btn btn--danger"
                onClick={handleClearApiKey}
              >
                Remove Key
              </button>
            )}
          </div>

          <div className="help-text">
            <h4>How to get an API key:</h4>
            <ol>
              <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
              <li>Sign in or create an account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy and paste the key here</li>
            </ol>
          </div>
        </section>

        <section className="settings-section">
          <h2>Default Settings</h2>

          <div className="form-group">
            <label htmlFor="questionCount">Default number of questions</label>
            <select
              id="questionCount"
              value={settings.defaultQuestionCount}
              onChange={(e) => updateSettings({ defaultQuestionCount: Number(e.target.value) })}
            >
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
              <option value={15}>15 questions</option>
              <option value={20}>20 questions</option>
              <option value={25}>25 questions</option>
              <option value={50}>50 questions</option>
              <option value={60}>60 questions</option>
              <option value={100}>100 questions</option>
              <option value={120}>120 questions</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Default difficulty</label>
            <select
              id="difficulty"
              value={settings.defaultDifficulty}
              onChange={(e) => updateSettings({ defaultDifficulty: e.target.value as Settings['defaultDifficulty'] })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  );
}

type Settings = {
  defaultDifficulty: 'beginner' | 'intermediate' | 'advanced';
};
