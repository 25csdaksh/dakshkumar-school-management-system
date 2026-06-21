import React, { useState, useEffect } from 'react';
import academicService from '../../services/academicService.js';
import { studentService } from '../../services/studentService.js';
import { Calendar, GraduationCap, FileText, Plus, ShieldCheck, Check } from 'lucide-react';

export const Academic = () => {
  const [years, setYears] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [newYear, setNewYear] = useState({ year: '', startDate: '', endDate: '', isActive: false });
  const [promotion, setPromotion] = useState({ fromClassId: '', toClassId: '' });
  const [certificate, setCertificate] = useState({ studentId: '', type: 'TC', leavingReason: '', conduct: 'Excellent' });

  // Academic year edit states
  const [editingYearId, setEditingYearId] = useState(null);
  const [editYearData, setEditYearData] = useState({ year: '', startDate: '', endDate: '', isActive: false });

  useEffect(() => {
    const loadData = async () => {
      try {
        const yrData = await academicService.getYears();
        setYears(yrData);

        const clsData = await studentService.getClasses();
        setClasses(clsData);

        // Fetch students to list for certificate issuance
        const stData = await studentService.getStudents();
        setStudents(stData);
      } catch (err) {
        setError(err.message || 'Failed to load academic data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    try {
      await academicService.createYear(newYear);
      setMessage('Academic year added successfully!');
      setNewYear({ year: '', startDate: '', endDate: '', isActive: false });
      const yrData = await academicService.getYears();
      setYears(yrData);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (y) => {
    setEditingYearId(y._id);
    setEditYearData({
      year: y.year,
      startDate: y.startDate ? new Date(y.startDate).toISOString().split('T')[0] : '',
      endDate: y.endDate ? new Date(y.endDate).toISOString().split('T')[0] : '',
      isActive: y.isActive
    });
  };

  const handleUpdateYear = async (id) => {
    try {
      await academicService.updateYear(id, editYearData);
      setMessage('Academic year updated successfully!');
      setEditingYearId(null);
      const yrData = await academicService.getYears();
      setYears(yrData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetActiveYear = async (id) => {
    try {
      await academicService.setActiveYear(id);
      setMessage('Active academic year updated.');
      const yrData = await academicService.getYears();
      setYears(yrData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!promotion.fromClassId || !promotion.toClassId) {
      setError('Please select both origin and destination classes');
      return;
    }
    if (promotion.fromClassId === promotion.toClassId) {
      setError('Cannot promote to the same class');
      return;
    }
    try {
      const res = await academicService.promoteStudents(promotion);
      setMessage(`Successfully promoted ${res.count} students!`);
      setPromotion({ fromClassId: '', toClassId: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!certificate.studentId) {
      setError('Please select a student');
      return;
    }
    try {
      const details = {
        leavingReason: certificate.leavingReason,
        conduct: certificate.conduct
      };
      await academicService.issueCertificate({
        studentId: certificate.studentId,
        type: certificate.type,
        details
      });
      setMessage(`${certificate.type} Certificate issued successfully!`);
      setCertificate({ studentId: '', type: 'TC', leavingReason: '', conduct: 'Excellent' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Academic Modules...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Academic & Records Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure terms, promote student grades, and issue school certificates.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Academic Years Block */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Calendar size={20} color="var(--primary)" />
            <span>Academic Years</span>
          </h3>

          <form onSubmit={handleCreateYear} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="e.g. 2026-2027" 
              className="form-control" 
              style={{ flex: 1, minWidth: '120px' }} 
              value={newYear.year} 
              onChange={(e) => setNewYear({ ...newYear, year: e.target.value })}
              required 
            />
            <input 
              type="date" 
              className="form-control" 
              style={{ flex: 1, minWidth: '120px' }} 
              value={newYear.startDate} 
              onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
              required 
            />
            <input 
              type="date" 
              className="form-control" 
              style={{ flex: 1, minWidth: '120px' }} 
              value={newYear.endDate} 
              onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
              required 
            />
            <button className="btn btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add
            </button>
          </form>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Term Year</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y._id}>
                    {editingYearId === y._id ? (
                      <>
                        <td>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ padding: '4px 8px', fontSize: '0.9rem' }} 
                            value={editYearData.year} 
                            onChange={(e) => setEditYearData({ ...editYearData, year: e.target.value })}
                            required 
                          />
                        </td>
                        <td>
                          <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '4px', fontSize: '0.8rem' }} 
                            value={editYearData.startDate} 
                            onChange={(e) => setEditYearData({ ...editYearData, startDate: e.target.value })}
                            required 
                          />
                        </td>
                        <td>
                          <input 
                            type="date" 
                            className="form-control" 
                            style={{ padding: '4px', fontSize: '0.8rem' }} 
                            value={editYearData.endDate} 
                            onChange={(e) => setEditYearData({ ...editYearData, endDate: e.target.value })}
                            required 
                          />
                        </td>
                        <td>
                          <select 
                            className="form-control" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={editYearData.isActive ? 'true' : 'false'}
                            onChange={(e) => setEditYearData({ ...editYearData, isActive: e.target.value === 'true' })}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleUpdateYear(y._id)}>
                              Save
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setEditingYearId(null)}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{y.year}</td>
                        <td>{new Date(y.startDate).toLocaleDateString()}</td>
                        <td>{new Date(y.endDate).toLocaleDateString()}</td>
                        <td>
                          {y.isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-primary">Inactive</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => startEdit(y)}>
                              Edit
                            </button>
                            {!y.isActive && (
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleSetActiveYear(y._id)}>
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotion Wizard Block */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <GraduationCap size={20} color="var(--secondary)" />
            <span>Promotion Wizard</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Promote all student cohorts from one class standard to the next (e.g. Grade 10 to Grade 11).
          </p>

          <form onSubmit={handlePromote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Source Class Standard</label>
              <select 
                className="form-control" 
                value={promotion.fromClassId} 
                onChange={(e) => setPromotion({ ...promotion, fromClassId: e.target.value })}
                required
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Promote to Class Target</label>
              <select 
                className="form-control" 
                value={promotion.toClassId} 
                onChange={(e) => setPromotion({ ...promotion, toClassId: e.target.value })}
                required
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Execute Cohort Promotion
            </button>
          </form>
        </div>
      </div>

      {/* Certificates Generator Block */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FileText size={20} color="var(--warning)" />
          <span>Certificate Dispatch Center</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Generate formal Transfer Certificates (TC) or Bonafide Certificates instantly.
        </p>

        <form onSubmit={handleIssueCertificate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select 
                className="form-control"
                value={certificate.studentId}
                onChange={(e) => setCertificate({ ...certificate, studentId: e.target.value })}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentInfo?.rollNumber})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Certificate Type</label>
              <select 
                className="form-control"
                value={certificate.type}
                onChange={(e) => setCertificate({ ...certificate, type: e.target.value })}
              >
                <option value="TC">Transfer Certificate (TC)</option>
                <option value="Bonafide">Bonafide Certificate</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Reason for leaving (For TC)</label>
              <input 
                type="text" 
                placeholder="Course Completion, Relocation, etc." 
                className="form-control"
                value={certificate.leavingReason}
                onChange={(e) => setCertificate({ ...certificate, leavingReason: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Behavior conduct statement</label>
              <input 
                type="text" 
                placeholder="Excellent / Good" 
                className="form-control"
                value={certificate.conduct}
                onChange={(e) => setCertificate({ ...certificate, conduct: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', justifySelf: 'flex-start' }}>
            Issue Certificate Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default Academic;
