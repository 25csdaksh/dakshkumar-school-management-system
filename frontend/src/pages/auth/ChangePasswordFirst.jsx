import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authService } from '../../services/authService.js';
import { useTranslation } from 'react-i18next';
import { KeyRound, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import LanguageSelector from '../../components/LanguageSelector.jsx';

export const ChangePasswordFirst = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError(t('password_length_error') || 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwords_dont_match') || 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePasswordFirst(password);
      setSuccess(t('password_change_success') || 'Password changed successfully!');
      setTimeout(() => {
        navigate(`/${user.role}/dashboard`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      fontFamily: 'var(--font-body)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Floating controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 100
      }}>
        <LanguageSelector />
      </div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Top Gradient Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '30px 24px',
          color: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <KeyRound size={24} />
          </div>
          <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
            {t('change_password_title') || 'Change Your Password'}
          </h3>
          <span style={{ fontSize: '0.8rem', opacity: '0.9', lineHeight: '1.4' }}>
            {t('change_password_subtitle') || 'This is your first login. Please set a secure password before continuing.'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '32px 24px' }}>
          {error && (
            <div style={{
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              border: '1px solid var(--danger)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: 'var(--success-glow)',
              color: 'var(--success)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              border: '1px solid var(--success)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>{success}</div>
          )}

          {/* New Password Input */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>
              {t('new_password') || 'New Password'}
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '6px 0'
            }}>
              <span style={{ marginRight: '10px', color: 'var(--primary)' }}>
                <Lock size={16} />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)'
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>
              {t('confirm_password') || 'Confirm New Password'}
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '6px 0'
            }}>
              <span style={{ marginRight: '10px', color: 'var(--primary)' }}>
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)'
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '10px',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{loading ? (t('updating_password') || 'Updating...') : (t('change_password_button') || 'Update Password')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordFirst;
