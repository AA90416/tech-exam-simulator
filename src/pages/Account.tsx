import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Account.css';

export function Account() {
  const navigate = useNavigate();
  const { currentUser, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    const changed = await changePassword(currentPassword, newPassword);

    if (!changed) {
      setError('Current password is incorrect.');
      setSaving(false);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('Password updated successfully.');
    setSaving(false);
  };

  return (
    <div className="account-page">
      <div className="account-card">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        <h1>Change Password</h1>
        <p className="account-subtitle">
          Update the password for <strong>{currentUser.username}</strong>.
        </p>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="account-field">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
            />
          </div>

          <div className="account-field">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter new password"
            />
          </div>

          <div className="account-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
            />
          </div>

          {error && <p className="account-message account-message--error">{error}</p>}
          {success && <p className="account-message account-message--success">{success}</p>}

          <button
            type="submit"
            className="account-submit"
            disabled={!currentPassword || !newPassword || !confirmPassword || saving}
          >
            {saving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}