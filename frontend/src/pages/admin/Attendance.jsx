import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Calendar, Search } from 'lucide-react';

export const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await studentService.getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setClassId(classData[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch class lists.');
      }
    };
    fetchClasses();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!classId) return;

    setLoading(true);
    setError('');
    try {
      const logs = await studentService.getAttendanceRecord(classId, section, date);
      setRecords(logs);
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Attendance Logs</h2>
        <p style={{ color: 'var(--text-muted)' }}>Query and check daily student attendance log sheets.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Grade Class</label>
            <select 
              className="form-control" 
              value={classId} 
              onChange={(e) => setClassId(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Section</label>
            <select 
              className="form-control" 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              required
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Search size={18} />
            <span>Search Logs</span>
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Searching database logs...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Marked Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No attendance logs found for this date. Click Search Logs after picking a class and section.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id}>
                    <td>{rec.student?.studentInfo?.rollNumber || '-'}</td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{rec.student?.name || 'Unknown student'}</strong></td>
                    <td>{new Date(rec.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        rec.status === 'Present' ? 'badge-success' : 
                        rec.status === 'Late' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
