import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { FileText, TrendingUp, CheckCircle, BarChart } from 'lucide-react';

export const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const classData = await studentService.getClasses();
        setClasses(classData);
        const statsData = await studentService.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Strategic Reports</h2>
        <p style={{ color: 'var(--text-muted)' }}>School performance, enrollments, and revenue metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" />
            <span>Report Downloads</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', cursor: 'pointer' }}>
              <strong>Student Roster.xlsx</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Download complete registry list</div>
            </li>
            <li style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', cursor: 'pointer' }}>
              <strong>Tuition Revenue.pdf</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Log of fee collections and dues</div>
            </li>
            <li style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', cursor: 'pointer' }}>
              <strong>Academic Performance.csv</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Grades across classes and subjects</div>
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart size={18} color="var(--secondary)" />
            <span>Class Demographics</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {classes.map((c, idx) => {
              // Mock demographic split
              const count = idx === 0 ? 12 : 8;
              const max = 20;
              const pct = (count / max) * 100;
              return (
                <div key={c._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{c.name} (Capacity)</span>
                    <strong>{count} / {max} Students ({pct}%)</strong>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: 'var(--secondary)', 
                      width: `${pct}%`, 
                      height: '100%',
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
