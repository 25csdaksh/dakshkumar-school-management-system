import React, { useState, useEffect } from 'react';
import academicService from '../../services/academicService.js';
import { Calendar, Award } from 'lucide-react';

export const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExams = async () => {
      try {
        const data = await academicService.getExams();
        setExams(data);
      } catch (err) {
        setError('Failed to fetch exam schedules.');
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Exam Schedules</h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of upcoming examinations, term tests, and scheduling timelines.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving examination schedules...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Academic Term</th>
                <th>Target Class</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No exam schedules have been posted yet.
                  </td>
                </tr>
              ) : (
                exams.map((ex) => (
                  <tr key={ex._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="var(--primary)" />
                        <strong style={{ color: 'var(--text-main)' }}>{ex.name}</strong>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{ex.term}</span></td>
                    <td>{ex.classId?.name || 'School Wide'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{ex.startDate ? new Date(ex.startDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Scheduled</span>
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

export default Exams;
