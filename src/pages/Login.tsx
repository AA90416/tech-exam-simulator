import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export function Login() {
  const { login, users, addUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isFirstTime = users.length === 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');
    const success = await login(username.trim(), password);
    if (success) {
      navigate('/', { replace: true });
    } else {
      setError('Incorrect username or password.');
    }
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    setSuccessMessage('');
    const normalizedUsername = setupUsername.trim();
    if (!normalizedUsername) return setSetupError('Username is required.');
    if (setupPassword.length < 4) return setSetupError('Password must be at least 4 characters.');
    if (setupPassword !== setupConfirm) return setSetupError('Passwords do not match.');

    await addUser(normalizedUsername, setupPassword, 'admin');
    const success = await login(normalizedUsername, setupPassword);

    if (success) {
      navigate('/', { replace: true });
      return;
    }

    setUsername(normalizedUsername);
    setPassword('');
    setSetupUsername('');
    setSetupPassword('');
    setSetupConfirm('');
    setShowSetup(false);
    setSuccessMessage('Account created. Sign in with your username and password.');
  };

  if (showSetup) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo__icon">📋</span>
          </div>
          <h1>Tech Exam Simulator</h1>
          <p className="login-subtitle">{isFirstTime ? 'Create your admin account to get started' : 'Create a new account'}</p>

          <form onSubmit={handleSetup} className="login-form">
            <div className="login-field">
              <label htmlFor="setupUsername">Username</label>
              <input
                id="setupUsername"
                type="text"
                value={setupUsername}
                onChange={e => setSetupUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
            <div className="login-field">
              <label htmlFor="setupPassword">Password</label>
              <input
                id="setupPassword"
                type="password"
                value={setupPassword}
                onChange={e => setSetupPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
            </div>
            <div className="login-field">
              <label htmlFor="setupConfirm">Confirm Password</label>
              <input
                id="setupConfirm"
                type="password"
                value={setupConfirm}
                onChange={e => setSetupConfirm(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
            {setupError && <p className="login-error">{setupError}</p>}
            <button
              type="submit"
              className="login-btn"
              disabled={!setupUsername.trim() || !setupPassword || !setupConfirm}
            >
              Create Account
            </button>
            <button type="button" className="login-link" onClick={() => setShowSetup(false)}>
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo__icon">📋</span>
        </div>
        <h1>Tech Exam Simulator</h1>
        <p className="login-subtitle">Sign in to continue</p>

        {isFirstTime && (
          <div className="login-notice">
            <p>No local account was found for this browser and app URL. If you used a different localhost port yesterday, that account will not appear here.</p>
            <button type="button" className="login-btn login-btn--secondary" onClick={() => setShowSetup(true)}>
              Create Admin Account
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoCapitalize="none"
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          {successMessage && <p className="login-success">{successMessage}</p>}
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            className="login-btn"
            disabled={!username.trim() || !password || loading || isFirstTime}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
