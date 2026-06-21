import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Check, ClipboardList, AlertCircle } from 'lucide-react';

export const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState({}); // studentId -> status
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await studentService.getTeacherClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setClassId(classData[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch assigned classes.');
      }
    };
    fetchClasses();
  }, []);

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    if (!classId) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const studentData = await studentService.getStudentsByClass(classId, section);
      setStudents(studentData);

      // Prepopulate statuses with 'Present'
      const initialStatuses = {};
      studentData.forEach(student => {
        initialStatuses[student._id] = 'Present';
      });
      setAttendanceStatuses(initialStatuses);
    } catch (err) {
      setError('Failed to fetch class students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const attendanceData = Object.keys(attendanceStatuses).map(studentId => ({
      studentId,
      status: attendanceStatuses[studentId]
    }));

    try {
      await studentService.markAttendance(classId, section, date, attendanceData);
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
        <h2>Daily Attendance Log</h2>
        <p style={{ color: 'var(--text-muted)' }}>Choose class details to mark student presence logs.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleFetchStudents} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
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
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Load Student List
          </button>
        </form>
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

      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving class list...</h4>
        </div>
      ) : students.length > 0 ? (
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
                {students.map((student) => (
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
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
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
    </div>
  );
};

export default Attendance;
