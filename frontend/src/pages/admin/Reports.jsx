import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { FileText, TrendingUp, CheckCircle, BarChart } from 'lucide-react';

export const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Download form states
  const [reportType, setReportType] = useState('student_roster');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const classData = await studentService.getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClassId(classData[0]._id);
        }
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

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setError('Please select a target class standard first.');
      return;
    }

    setDownloading(true);
    setError('');
    setSuccess('');

    const targetClass = classes.find(c => c._id === selectedClassId);
    const className = targetClass ? targetClass.name : 'Unknown Class';

    try {
      let csvContent = '';
      let filename = '';

      if (reportType === 'student_roster') {
        const sectionQuery = selectedSection === 'All' ? '' : selectedSection;
        const students = await studentService.getStudentsByClass(selectedClassId, sectionQuery);
        
        if (students.length === 0) {
          throw new Error('No student records found matching the selected class and section criteria.');
        }

        const headers = ['Roll Number', 'Student Name', 'Email', 'Phone', 'Parent Name', 'Parent Email', 'Parent Phone', 'Blood Group', 'Aadhaar Number'];
        const rows = students.map(s => [
          s.studentInfo?.rollNumber || '',
          s.name || '',
          s.email || '',
          s.phone || '',
          s.studentInfo?.parentName || '',
          s.studentInfo?.parentEmail || '',
          s.studentInfo?.parentPhone || '',
          s.studentInfo?.bloodGroup || '',
          s.studentInfo?.aadhaarNumber || ''
        ]);

        csvContent = [
          [`Student Roster - ${className} (Section: ${selectedSection})`],
          [],
          headers,
          ...rows
        ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

        filename = `Student_Roster_${className.replace(/\s+/g, '_')}_Sec_${selectedSection}.csv`;

      } else if (reportType === 'academic_performance') {
        const sectionQuery = selectedSection === 'All' ? '' : selectedSection;
        const grades = await studentService.getGradesByClass(selectedClassId, '', '', sectionQuery);

        if (grades.length === 0) {
          throw new Error('No academic grade records found matching the selected class and section criteria.');
        }

        const headers = ['Roll Number', 'Student Name', 'Subject', 'Exam Term', 'Marks Obtained', 'Max Marks', 'Percentage', 'Remarks'];
        const rows = grades.map(g => {
          const pct = g.maxMarks > 0 ? Math.round((g.marksObtained / g.maxMarks) * 100) : 0;
          return [
            g.student?.studentInfo?.rollNumber || '',
            g.student?.name || '',
            g.subjectName || '',
            g.examName || '',
            g.marksObtained,
            g.maxMarks,
            `${pct}%`,
            g.remarks || ''
          ];
        });

        csvContent = [
          [`Academic Performance Report - ${className} (Section: ${selectedSection})`],
          [],
          headers,
          ...rows
        ].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

        filename = `Academic_Performance_${className.replace(/\s+/g, '_')}_Sec_${selectedSection}.csv`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Successfully generated and downloaded "${filename}"`);
    } catch (err) {
      setError(err.message || 'Failed to generate and download report CSV file.');
    } finally {
      setDownloading(false);
    }
  };

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
            <span>Generate Strategic Reports</span>
          </h3>
          
          <form onSubmit={handleGenerateReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report Type</label>
              <select 
                className="form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                <option value="student_roster">Student Roster (CSV)</option>
                <option value="academic_performance">Academic Performance (CSV)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Class Standard</label>
              <select
                className="form-control"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
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
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                required
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', background: 'var(--danger-glow)', padding: '10px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: 'var(--success)', fontSize: '0.85rem', background: 'var(--success-glow)', padding: '10px', borderRadius: '6px' }}>
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '8px', padding: '12px', justifyContent: 'center' }}
              disabled={downloading}
            >
              {downloading ? 'Fetching & Formatting...' : 'Generate & Download CSV'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart size={18} color="var(--secondary)" />
            <span>Class Demographics</span>
          </h3>

          {loading ? (
            <div style={{ display: 'flex', height: '20vh', alignItems: 'center', justifyContent: 'center' }}>
              <h4>Loading demographic metrics...</h4>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {classes.map((c) => {
                const count = c.studentCount || 0;
                const max = 40; // Assume 40 is standard cohort capacity limit
                const pct = Math.min(100, Math.round((count / max) * 100));
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
