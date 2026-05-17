import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

type Settings = { defaultDifficulty: 'beginner' | 'intermediate' | 'advanced' };

export function Admin() {
  const navigate = useNavigate();
  const { settings, updateSettings, isApiKeySet } = useSettings();
  const { users, addUser, removeUser, currentUser, logout } = useAuth();

  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const handleSaveApiKey = () => {
    updateSettings({ openaiApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    updateSettings({ openaiApiKey: '' });
  };

  const handleAddUser = async () => {
    setUserError('');
    if (!newUsername.trim()) return setUserError('Username is required.');
    if (newPassword.length < 4) return setUserError('Password must be at least 4 characters.');
    if (users.find(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      return setUserError('Username already exists.');
    }
    await addUser(newUsername.trim(), newPassword, newRole);
    setNewUsername('');
    setNewPassword('');
    setUserSuccess(`User "${newUsername.trim()}" added.`);
    setTimeout(() => setUserSuccess(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const maskedKey = apiKey ? `sk-...${apiKey.slice(-4)}` : '';

  return (
    <div className="admin">
      <header className="admin__header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h1>Admin Settings</h1>
          <button className="btn btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
        {currentUser && (
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Signed in as <strong>{currentUser.username}</strong> ({currentUser.role})
          </p>
        )}
      </header>

      <div className="admin__content">
        {/* OpenAI API Key */}
        <section className="settings-section">
          <h2>OpenAI API Configuration</h2>
          <p className="section-description">
            Your key is stored locally in your browser and never sent anywhere except OpenAI.
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
              <button type="button" className="toggle-visibility" onClick={() => setShowKey(!showKey)}>
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {isApiKeySet && !showKey && (
              <p className="current-key">Current: {maskedKey}</p>
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn--primary" onClick={handleSaveApiKey} disabled={!apiKey}>
              {saved ? '✓ Saved!' : 'Save Key'}
            </button>
            {isApiKeySet && (
              <button className="btn btn--danger" onClick={handleClearApiKey}>Remove Key</button>
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

        {/* Default Settings */}
        <section className="settings-section">
          <h2>Default Settings</h2>

          <div className="form-group">
            <label htmlFor="questionCount">Default number of questions</label>
            <select
              id="questionCount"
              value={settings.defaultQuestionCount}
              onChange={(e) => updateSettings({ defaultQuestionCount: Number(e.target.value) })}
            >
              {[5,10,15,20,25,50,60,100,120].map(n => (
                <option key={n} value={n}>{n} questions</option>
              ))}
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

        {/* User Management — admin only */}
        {currentUser?.role === 'admin' && (
          <section className="settings-section">
            <h2>User Management</h2>
            <p className="section-description">
              Add or remove users who can access the exam simulator.
            </p>

            <div className="users-list">
              {users.map(user => (
                <div key={user.username} className="user-item">
                  <div className="user-item__info">
                    <span className="user-item__name">{user.username}</span>
                    <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
                  </div>
                  <div className="user-item__actions">
                    {user.username !== currentUser.username && (
                      <button
                        className="remove-user-btn"
                        onClick={() => removeUser(user.username)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-user-form">
              <h4>Add New User</h4>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Username"
                autoCapitalize="none"
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Password (min 4 chars)"
              />
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'user')}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {userError && <p style={{ margin: 0, fontSize: '0.85rem', color: '#dc2626' }}>{userError}</p>}
              {userSuccess && <p style={{ margin: 0, fontSize: '0.85rem', color: '#16a34a' }}>{userSuccess}</p>}
              <button
                className="add-user-btn"
                onClick={handleAddUser}
                disabled={!newUsername.trim() || newPassword.length < 4}
              >
                Add User
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
