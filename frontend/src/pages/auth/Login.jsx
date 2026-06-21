import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { studentService } from '../../services/studentService.js';
import { LogIn, HelpCircle, UserPlus, ArrowLeft } from 'lucide-react';

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

  const { login, register } = useAuth();
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
    <div className="login-page">
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>

      <div className="login-card glass-panel" style={{ maxWidth: isRegister ? '540px' : '420px', transition: 'all 0.3s ease' }}>
        <div className="login-header">
          <div style={{
            background: 'var(--primary)',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.8rem',
            marginBottom: '16px'
          }}>S</div>
          <h2>{isRegister ? 'Create Account' : 'Welcome to EduSphere'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>School ERP Administration & Portals</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid var(--danger)'
          }}>
            {error}
          </div>
        )}

        {!isRegister ? (
          /* ==========================================
             LOGIN FORM
             ========================================== */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@schoolerp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              <LogIn size={18} />
              <span>{loading ? 'Logging you in...' : 'Sign In'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>New to EduSphere? </span>
              <button 
                type="button" 
                onClick={() => setIsRegister(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                Register Here
              </button>
            </div>
          </form>
        ) : (
          /* ==========================================
             REGISTRATION FORM
             ========================================== */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Select Your Role</label>
              <select 
                className="form-control" 
                value={regRole} 
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. email@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone contact (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91 9988776655"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>

            {/* Role Specific Fields */}
            {regRole === 'student' && (
              <div style={{ padding: '16px', background: 'var(--border-color)', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Roll Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 104"
                      value={regRollNumber}
                      onChange={e => setRegRollNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Grade Class</label>
                    <select 
                      className="form-control" 
                      value={regClassId}
                      onChange={e => setRegClassId(e.target.value)}
                      required
                    >
                      {classes.length === 0 ? (
                        <option value="">No classes found</option>
                      ) : (
                        classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Parent's Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="parent@schoolerp.com"
                    value={regParentEmail}
                    onChange={e => setRegParentEmail(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Links this student automatically to parent accounts.
                  </span>
                </div>
              </div>
            )}

            {regRole === 'teacher' && (
              <div style={{ padding: '16px', background: 'var(--border-color)', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Qualifications</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Master of Science in Physics"
                    value={regQualification}
                    onChange={e => setRegQualification(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Specialty Subject</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Mathematics"
                    value={regSubject}
                    onChange={e => setRegSubject(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary w-full mt-2" 
              onClick={() => setIsRegister(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        )}

        {showDemoBox && !isRegister && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--primary-glow)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--primary)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>
              <HelpCircle size={16} />
              <span>Demo Accounts (Click to Fill)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', background: 'var(--bg-app)' }}
                onClick={() => handleFillDemo('admin@schoolerp.com', 'admin123')}
              >
                <strong>Admin:</strong> admin@schoolerp.com (pwd: admin123)
              </div>
              <div 
                style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', background: 'var(--bg-app)' }}
                onClick={() => handleFillDemo('teacher1@schoolerp.com', 'teacher123')}
              >
                <strong>Teacher:</strong> teacher1@schoolerp.com (pwd: teacher123)
              </div>
              <div 
                style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', background: 'var(--bg-app)' }}
                onClick={() => handleFillDemo('student1@schoolerp.com', 'student123')}
              >
                <strong>Student:</strong> student1@schoolerp.com (pwd: student123)
              </div>
              <div 
                style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', background: 'var(--bg-app)' }}
                onClick={() => handleFillDemo('parent1@schoolerp.com', 'parent123')}
              >
                <strong>Parent:</strong> parent1@schoolerp.com (pwd: parent123)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
