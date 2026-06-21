import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import StudentResults from '../student/Results.jsx';

export const Results = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const list = await studentService.getParentChildren();
        setChildren(list);
        if (list.length > 0) {
          setSelectedChildId(list[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) return <div>Syncing gradebooks...</div>;
  if (children.length === 0) return <div className="glass-panel" style={{ padding: '24px' }}>No linked students.</div>;

  return (
    <div>
      {children.length > 1 && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Show Report Card for:</span>
          <select 
            className="form-control" 
            style={{ width: '200px' }}
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <StudentResults studentId={selectedChildId} />
    </div>
  );
};

export default Results;
