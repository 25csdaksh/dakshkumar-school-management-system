import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Calendar, Search, Check, ClipboardList } from 'lucide-react';

export const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'mark'

  // View Logs State
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mark Attendance State
  const [markClassId, setMarkClassId] = useState('');
  const [markSection, setMarkSection] = useState('A');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStudents, setMarkStudents] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState({}); // studentId -> status
  const [markLoading, setMarkLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Shared status state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await studentService.getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setClassId(classData[0]._id);
          setMarkClassId(classData[0]._id);
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
    setSuccess('');
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

  const handleFetchStudentsForMarking = async (e) => {
    e.preventDefault();
    if (!markClassId) return;

    setMarkLoading(true);
    setError('');
    setSuccess('');
    try {
      const studentData = await studentService.getStudentsByClass(markClassId, markSection);
      setMarkStudents(studentData);

      // Prepopulate statuses with 'Present'
      const initialStatuses = {};
      studentData.forEach(student => {
        initialStatuses[student._id] = 'Present';
      });
      setAttendanceStatuses(initialStatuses);
    } catch (err) {
      setError(err.message || 'Failed to fetch class students.');
      setMarkStudents([]);
    } finally {
      setMarkLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const attendanceData = Object.keys(attendanceStatuses).map(studentId => ({
      studentId,
      status: attendanceStatuses[studentId]
    }));

    try {
      await studentService.markAttendance(markClassId, markSection, markDate, attendanceData);
      setSuccess('Attendance logs saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to submit attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Attendance Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and mark daily student presence logs on the portal.</p>
      </div>

      {/* Tabs System */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('view'); setError(''); setSuccess(''); }}
          style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Search size={16} />
          <span>Search Logs</span>
        </button>
        <button 
          className={`btn ${activeTab === 'mark' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('mark'); setError(''); setSuccess(''); }}
          style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ClipboardList size={16} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {activeTab === 'view' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <form onSubmit={handleFetchStudentsForMarking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Grade Class</label>
                <select 
                  className="form-control" 
                  value={markClassId} 
                  onChange={(e) => setMarkClassId(e.target.value)}
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
                  value={markSection} 
                  onChange={(e) => setMarkSection(e.target.value)}
                  required
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={markDate} 
                  onChange={(e) => setMarkDate(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Load Student List
              </button>
            </form>
          </div>

          {markLoading ? (
            <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
              <h4>Retrieving class list...</h4>
            </div>
          ) : markStudents.length > 0 ? (
            <div>
              <div className="glass-panel table-responsive" style={{ marginBottom: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markStudents.map((student) => (
                      <tr key={student._id}>
                        <td>{student.studentInfo?.rollNumber || '-'}</td>
                        <td><strong style={{ color: 'var(--text-main)' }}>{student.name}</strong></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.8rem',
                                background: attendanceStatuses[student._id] === 'Present' ? 'var(--success)' : 'var(--border-color)',
                                color: attendanceStatuses[student._id] === 'Present' ? 'white' : 'var(--text-main)'
                              }}
                              onClick={() => handleStatusChange(student._id, 'Present')}
                            >
                              Present
                            </button>
                            <button 
                              className="btn" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.8rem',
                                background: attendanceStatuses[student._id] === 'Absent' ? 'var(--danger)' : 'var(--border-color)',
                                color: attendanceStatuses[student._id] === 'Absent' ? 'white' : 'var(--text-main)'
                              }}
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                            >
                              Absent
                            </button>
                            <button 
                              className="btn" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.8rem',
                                background: attendanceStatuses[student._id] === 'Late' ? 'var(--warning)' : 'var(--border-color)',
                                color: attendanceStatuses[student._id] === 'Late' ? 'white' : 'var(--text-main)'
                              }}
                              onClick={() => handleStatusChange(student._id, 'Late')}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSubmitAttendance} disabled={saving}>
                  <Check size={18} />
                  <span>{saving ? 'Saving attendance...' : 'Save Attendance Records'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
              No roster retrieved. Please pick a class details and click Load Student List.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;
