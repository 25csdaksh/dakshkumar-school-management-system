import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import aiService from '../../services/aiService.js';

export const Results = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Modal States
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStudentName, setAiStudentName] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await studentService.getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setClassId(classData[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch class lists.');
      }
    };
    fetchClasses();
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!classId) return;

    setLoading(true);
    setError('');
    try {
      const grades = await studentService.getGradesByClass(classId);
      setRecords(grades);
    } catch (err) {
      setError('Failed to load grades data.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalysis = async (studentId, studentName) => {
    setAiStudentName(studentName);
    setAiText('');
    setAiLoading(true);
    setShowAiModal(true);
    try {
      const data = await aiService.analyzeReport(studentId);
      setAiText(data.analysis);
    } catch (err) {
      setAiText('Could not generate AI report analysis at this time. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Academic Gradebook</h2>
        <p style={{ color: 'var(--text-muted)' }}>Browse student examination grades and marks.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0, flexGrow: 1 }}>
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
          <button type="submit" className="btn btn-primary">
            Search Grades
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
          <h4>Searching grade logs...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student</th>
                <th>Subject Course</th>
                <th>Exam Name</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No grades logged for this class yet. Select a class and click Search Grades.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const pct = Math.round((rec.marksObtained / rec.maxMarks) * 100);
                  const stId = rec.student?._id || rec.student;
                  const stName = rec.student?.name || 'Student';
                  return (
                    <tr key={rec._id}>
                      <td>{rec.student?.studentInfo?.rollNumber || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-main)' }}>{stName}</strong>
                          {stId && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', marginLeft: '12px' }}
                              onClick={() => handleAiAnalysis(stId, stName)}
                            >
                              AI Analyze
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{rec.subjectName}</td>
                      <td>{rec.examName}</td>
                      <td>{rec.marksObtained} / {rec.maxMarks}</td>
                      <td>
                        <span className={`badge ${
                          pct >= 85 ? 'badge-success' : 
                          pct >= 60 ? 'badge-primary' : 
                          pct >= 40 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td>{rec.remarks || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨ AI Performance Summary</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Synthesizing grade metrics and academic trends for <strong>{aiStudentName}</strong>.
            </p>

            {aiLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Querying Gemini API...</span>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '10px', whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
                {aiText}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>
                Dismiss Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
