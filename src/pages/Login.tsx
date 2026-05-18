import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export function Login() {
  const { login, users, addUser, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isFirstTime = users.length === 0;

  const openSetup = () => {
    setError('');
    setSuccessMessage('');
    setSetupError('');
    setResetError('');
    setShowReset(false);
    setShowSetup(true);
  };

  const openReset = () => {
    setError('');
    setSuccessMessage('');
    setSetupError('');
    setResetError('');
    setShowSetup(false);
    setShowReset(true);
  };

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
    if (users.some(user => user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
      return setSetupError('Username already exists. Sign in or choose a different username.');
    }

    await addUser(normalizedUsername, setupPassword, isFirstTime ? 'admin' : 'user');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setSuccessMessage('');

    const normalizedUsername = resetUsername.trim();
    if (!normalizedUsername) return setResetError('Username is required.');
    if (!users.some(user => user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
      return setResetError('That username was not found on this device.');
    }
    if (resetNewPassword.length < 4) return setResetError('Password must be at least 4 characters.');
    if (resetNewPassword !== resetConfirm) return setResetError('Passwords do not match.');

    const resetWorked = await resetPassword(normalizedUsername, resetNewPassword);

    if (!resetWorked) {
      setResetError('Unable to reset that password.');
      return;
    }

    const success = await login(normalizedUsername, resetNewPassword);
    if (success) {
      navigate('/', { replace: true });
      return;
    }

    setUsername(normalizedUsername);
    setPassword('');
    setResetUsername('');
    setResetNewPassword('');
    setResetConfirm('');
    setShowReset(false);
    setSuccessMessage('Password reset. Sign in with your new password.');
  };

  if (showSetup) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo__icon">📋</span>
          </div>
          <h1>Tech Exam Simulator</h1>
          <p className="login-subtitle">{isFirstTime ? 'Create your admin account to get started' : 'Create a new account for this device'}</p>
          <p className="login-helper-text">Accounts are saved in this browser so you can sign in again later.</p>

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
              {isFirstTime ? 'Create Admin Account' : 'Create Account'}
            </button>
            <button type="button" className="login-link" onClick={() => setShowSetup(false)}>
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showReset) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo__icon">📋</span>
          </div>
          <h1>Tech Exam Simulator</h1>
          <p className="login-subtitle">Reset password for an existing local account</p>
          <p className="login-helper-text">This only works for accounts already saved in this browser on this device.</p>

          <form onSubmit={handleResetPassword} className="login-form">
            <div className="login-field">
              <label htmlFor="resetUsername">Username</label>
              <input
                id="resetUsername"
                type="text"
                value={resetUsername}
                onChange={e => setResetUsername(e.target.value)}
                placeholder="Enter existing username"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
            <div className="login-field">
              <label htmlFor="resetNewPassword">New Password</label>
              <input
                id="resetNewPassword"
                type="password"
                value={resetNewPassword}
                onChange={e => setResetNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>
            <div className="login-field">
              <label htmlFor="resetConfirm">Confirm New Password</label>
              <input
                id="resetConfirm"
                type="password"
                value={resetConfirm}
                onChange={e => setResetConfirm(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
            {resetError && <p className="login-error">{resetError}</p>}
            <button
              type="submit"
              className="login-btn"
              disabled={!resetUsername.trim() || !resetNewPassword || !resetConfirm}
            >
              Reset Password
            </button>
            <button type="button" className="login-link" onClick={() => setShowReset(false)}>
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
            <p>No local account was found for this browser and app URL. Create one now and it will be saved here for future logins.</p>
            <button type="button" className="login-btn login-btn--secondary" onClick={openSetup}>
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
          {!isFirstTime && (
            <div className="login-actions-footer">
              <span className="login-helper-text">Need a new account or forgot your password?</span>
              <button type="button" className="login-link" onClick={openSetup}>
                Create Account
              </button>
              <button type="button" className="login-link" onClick={openReset}>
                Forgot Password?
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
