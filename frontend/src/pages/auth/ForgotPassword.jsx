import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const ForgotPassword = () => {
  return (
    <div className="login-page">
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>

      <div className="login-card glass-panel text-center">
        <div style={{ color: 'var(--primary)', marginBottom: '16px', display: 'inline-block' }}>
          <ShieldAlert size={56} />
        </div>
        
        <h2 style={{ marginBottom: '12px' }}>Reset Your Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
          For security reasons, password resets are handled directly by the School Administration Office. 
          Please contact your administrator or IT department to request a new password.
        </p>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link to="/login" className="btn btn-secondary w-full">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
