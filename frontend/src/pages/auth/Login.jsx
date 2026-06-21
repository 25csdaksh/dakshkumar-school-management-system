import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { studentService } from '../../services/studentService.js';
import { 
  LogIn, 
  HelpCircle, 
  UserPlus, 
  ArrowLeft, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Award, 
  Book, 
  Sun, 
  Moon 
} from 'lucide-react';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoBox, setShowDemoBox] = useState(true);

  // Registration states
  const [regRole, setRegRole] = useState('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regClassId, setRegClassId] = useState('');
  const [regParentEmail, setRegParentEmail] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regSubject, setRegSubject] = useState('');

  const [classes, setClasses] = useState([]);

  const { login, register, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRegister) {
      const fetchClasses = async () => {
        try {
          const classData = await studentService.getClasses();
          setClasses(classData);
          if (classData.length > 0) {
            setRegClassId(classData[0]._id);
          }
        } catch (err) {
          console.error('Failed to load classes', err);
        }
      };
      fetchClasses();
    }
  }, [isRegister]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      role: regRole,
      studentInfo: regRole === 'student' ? {
        rollNumber: regRollNumber,
        classId: regClassId,
        parentEmail: regParentEmail
      } : undefined,
      teacherInfo: regRole === 'teacher' ? {
        qualification: regQualification,
        subjects: regSubject ? [regSubject] : []
      } : undefined
    };

    try {
      const user = await register(payload);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsRegister(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Floating Theme Switcher */}
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 100,
          transition: 'all 0.2s ease'
        }}
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Main Container Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        zIndex: 10
      }}>
        <div className="glass-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          width: '100%',
          maxWidth: '1000px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)'
        }}>
          
          {/* LEFT COLUMN: BRANDING & ILLUSTRATION */}
          <div style={{
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRight: '1px solid var(--border-color)',
            position: 'relative'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1rem'
              }}>E</div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                letterSpacing: '0.5px'
              }}>EduSphere ERP</span>
            </div>

            {/* Academic Quote */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '2rem', color: 'var(--primary)', fontFamily: 'serif', lineHeight: 1, display: 'block' }}>“</span>
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: '600',
                lineHeight: '1.5',
                color: 'var(--text-main)',
                marginTop: '-8px',
                fontFamily: 'var(--font-heading)'
              }}>
                The beautiful thing about learning is that no one can take it away from you
              </h2>
            </div>

            {/* High-Fidelity SVG Graduation Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <svg viewBox="0 0 400 320" style={{ width: '280px', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
                {/* Academic Hat Mortarboard */}
                <path d="M200,50 L340,110 L200,170 L60,110 Z" fill="url(#primaryGrad)" />
                <path d="M200,60 L320,110 L200,160 L80,110 Z" fill="#1e293b" opacity="0.85" />
                <path d="M200,110 L200,150" stroke="#f59e0b" strokeWidth="3" />
                
                {/* Skull cap part */}
                <path d="M130,140 L130,190 C130,220 270,220 270,190 L270,140" fill="#0f172a" />
                
                {/* Tassel */}
                <path d="M200,110 Q100,120 90,170" stroke="#f59e0b" strokeWidth="3" fill="none" />
                <circle cx="90" cy="170" r="6" fill="#f59e0b" />
                <path d="M90,170 L85,210 L95,210 Z" fill="#f59e0b" />

                {/* Diploma Scroll */}
                <g transform="translate(140, 190) rotate(-12)">
                  <rect x="0" y="0" width="140" height="40" rx="8" fill="var(--bg-app)" stroke="var(--border-color)" strokeWidth="2.5" />
                  <ellipse cx="140" cy="20" rx="6" ry="20" fill="var(--border-color)" />
                  <ellipse cx="0" cy="20" rx="6" ry="20" fill="var(--border-color)" />
                  <rect x="60" y="0" width="20" height="40" fill="#ef4444" />
                  <circle cx="70" cy="20" r="5" fill="#f59e0b" />
                  <path d="M70,40 L60,56 L70,50 L80,56 Z" fill="#ef4444" />
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT COLUMN: CURVED LOGIN CARD */}
          <div style={{
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Floating Error Alert */}
            {error && (
              <div style={{
                background: 'var(--danger-glow)',
                color: 'var(--danger)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid var(--danger)',
                marginBottom: '20px',
                textAlign: 'center'
              }}>{error}</div>
            )}

            {/* Redesigned Card Container */}
            <div className="glass-panel" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              paddingBottom: '32px'
            }}>
              
              {/* Curve Accent Top Banner */}
              <div style={{ position: 'relative', width: '100%', height: '70px', overflow: 'hidden' }}>
                <svg viewBox="0 0 100 35" preserveAspectRatio="none" style={{ width: '100%', height: '100%', fill: 'var(--primary)' }}>
                  <path d="M0,0 L100,0 L100,20 Q50,35 0,20 Z" />
                </svg>
                {/* Floating Avatar Circular Frame */}
                <div style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '3px solid var(--bg-card)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <User size={26} />
                  </div>
                </div>
              </div>

              {/* Form Title */}
              <div style={{ textAlign: 'center', marginTop: '36px', padding: '0 24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {isRegister ? 'Create Credentials' : 'Welcome Portal'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isRegister ? 'Register academic record' : 'Sign in to access tools'}
                </span>
              </div>

              {/* Form Controls */}
              {!isRegister ? (
                /* LOGIN SCREEN */
                <form onSubmit={handleLoginSubmit} style={{ padding: '0 32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '8px 0',
                    marginBottom: '20px'
                  }}>
                    <span style={{ marginRight: '12px', color: 'var(--primary)' }}>
                      <Mail size={16} />
                    </span>
                    <input 
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '8px 0',
                    marginBottom: '20px'
                  }}>
                    <span style={{ marginRight: '12px', color: 'var(--primary)' }}>
                      <Lock size={16} />
                    </span>
                    <input 
                      type="password"
                      placeholder="Password"
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
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                      <span>Remember me</span>
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact administrative support to reset your passwords.'); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                      Forgot Password?
                    </a>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <LogIn size={16} />
                      <span>{loading ? 'Entering...' : 'Sign In'}</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setIsRegister(true)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}
                    >
                      New User? <strong style={{ color: 'var(--primary)' }}>Sign Up</strong>
                    </button>
                  </div>
                </form>
              ) : (
                /* REGISTRATION SCREEN */
                <form onSubmit={handleRegisterSubmit} style={{ padding: '0 24px', maxHeight: '380px', overflowY: 'auto', paddingRight: '6px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Role</label>
                    <select 
                      className="form-control" 
                      value={regRole} 
                      onChange={(e) => setRegRole(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      style={{ fontSize: '0.85rem', padding: '8px' }}
                    />
                  </div>

                  {/* Student Details */}
                  {regRole === 'student' && (
                    <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Roll Number</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={regRollNumber}
                          onChange={e => setRegRollNumber(e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Class Grade</label>
                        <select 
                          className="form-control" 
                          value={regClassId}
                          onChange={e => setRegClassId(e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                        >
                          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Parent's Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={regParentEmail}
                          onChange={e => setRegParentEmail(e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Teacher Details */}
                  {regRole === 'teacher' && (
                    <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Qualifications</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={regQualification}
                          onChange={e => setRegQualification(e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Specialty Subject</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={regSubject}
                          onChange={e => setRegSubject(e.target.value)}
                          required
                          style={{ fontSize: '0.8rem', padding: '6px' }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <UserPlus size={16} />
                      <span>{loading ? 'Creating...' : 'Register'}</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setIsRegister(false)}
                      className="btn btn-secondary w-full"
                      style={{ padding: '8px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Demo Fill Container */}
            {showDemoBox && !isRegister && (
              <div className="glass-panel" style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '16px',
                border: '1px dashed var(--primary)',
                background: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--primary)' }}>
                  <HelpCircle size={14} />
                  <span>Autofill Demo Accounts</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => handleFillDemo('admin@schoolerp.com', 'admin123')}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    Admin Account
                  </button>
                  <button 
                    onClick={() => handleFillDemo('teacher1@schoolerp.com', 'teacher123')}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    Teacher Account
                  </button>
                  <button 
                    onClick={() => handleFillDemo('student1@schoolerp.com', 'student123')}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    Student Account
                  </button>
                  <button 
                    onClick={() => handleFillDemo('parent1@schoolerp.com', 'parent123')}
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--text-main)' }}
                  >
                    Parent Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <footer style={{
        backgroundColor: '#111827',
        color: '#9ca3af',
        padding: '24px 20px',
        fontSize: '0.75rem',
        textAlign: 'center',
        zIndex: 10,
        borderTop: '1px solid #1f2937'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
          <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
          <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: '#9ca3af', textDecoration: 'none' }}>Policy & Procedures</a>
          <a href="#contact" onClick={(e) => e.preventDefault()} style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact Us</a>
          <a href="#help" onClick={(e) => e.preventDefault()} style={{ color: '#9ca3af', textDecoration: 'none' }}>Help</a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} EduSphere ERP. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;
