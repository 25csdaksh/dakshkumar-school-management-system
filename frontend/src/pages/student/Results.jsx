import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Award } from 'lucide-react';

export const Results = ({ studentId }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const data = await studentService.getStudentGrades(studentId);
        setGrades(data);
      } catch (err) {
        setError('Failed to fetch academic grades.');
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, [studentId]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Academic Report Card</h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of exam results and course progress.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving grades records...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Subject Course</th>
                <th>Marks Obtained</th>
                <th>Maximum Marks</th>
                <th>Percentage</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No exam results recorded yet.
                  </td>
                </tr>
              ) : (
                grades.map((g) => {
                  const pct = Math.round((g.marksObtained / g.maxMarks) * 100);
                  return (
                    <tr key={g._id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{g.examName}</strong></td>
                      <td><span className="badge badge-primary">{g.subjectName}</span></td>
                      <td>{g.marksObtained}</td>
                      <td>{g.maxMarks}</td>
                      <td>
                        <span className={`badge ${
                          pct >= 85 ? 'badge-success' : 
                          pct >= 60 ? 'badge-primary' : 
                          pct >= 40 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td>{g.remarks || 'No remarks'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results;
