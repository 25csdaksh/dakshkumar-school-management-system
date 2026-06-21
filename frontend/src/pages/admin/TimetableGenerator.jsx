import React, { useState, useEffect } from 'react';
import academicService from '../../services/academicService.js';
import { studentService } from '../../services/studentService.js';
import { Calendar, Save, Trash2 } from 'lucide-react';

export const TimetableGenerator = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const defaultTimings = [
    { startTime: '08:30', endTime: '09:20' },
    { startTime: '09:20', endTime: '10:10' },
    { startTime: '10:10', endTime: '11:00' },
    { startTime: '11:15', endTime: '12:05' },
    { startTime: '12:05', endTime: '12:55' },
    { startTime: '12:55', endTime: '01:45' }
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        const clsData = await studentService.getClasses();
        setClasses(clsData);
        if (clsData.length > 0) setSelectedClass(clsData[0]._id);

        const subData = await studentService.getSubjects();
        setSubjects(subData);

        const tcData = await studentService.getTeachers();
        setTeachers(tcData);
      } catch (err) {
        setError(err.message || 'Failed to initialize timetable wizard');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadWeeklyTimetable();
    }
  }, [selectedClass, selectedSection]);

  const loadWeeklyTimetable = async () => {
    try {
      setError('');
      setMessage('');
      const data = await academicService.getTimetable(selectedClass, selectedSection);
      
      const initialGrid = {};
      days.forEach(day => {
        const dayRecord = data.find(r => r.day === day);
        initialGrid[day] = Array.from({ length: 6 }, (_, index) => {
          const defaultTiming = defaultTimings[index];
          const periodRecord = dayRecord?.periods[index];
          
          return {
            subject: periodRecord?.subject?._id || periodRecord?.subject || '',
            teacher: periodRecord?.teacher?._id || periodRecord?.teacher || '',
            startTime: periodRecord?.startTime || defaultTiming.startTime,
            endTime: periodRecord?.endTime || defaultTiming.endTime
          };
        });
      });
      setGrid(initialGrid);
    } catch (err) {
      setError(err.message || 'Error fetching timetable records');
    }
  };

  const handleCellChange = (day, periodIndex, field, value) => {
    setGrid(prev => {
      const updatedDay = [...prev[day]];
      updatedDay[periodIndex] = {
        ...updatedDay[periodIndex],
        [field]: value
      };
      return {
        ...prev,
        [day]: updatedDay
      };
    });
  };

  const handleClearCell = (day, periodIndex) => {
    handleCellChange(day, periodIndex, 'subject', '');
    handleCellChange(day, periodIndex, 'teacher', '');
  };

  const handleSaveTimetable = async () => {
    try {
      setMessage('');
      setError('');
      
      const schedules = Object.entries(grid).map(([day, periods]) => {
        const mappedPeriods = periods.map(p => ({
          subject: p.subject || null,
          teacher: p.teacher || null,
          startTime: p.startTime,
          endTime: p.endTime
        })).filter(p => p.subject && p.teacher);

        return {
          day,
          periods: mappedPeriods
        };
      });

      const payload = {
        classId: selectedClass,
        section: selectedSection,
        schedules
      };

      await academicService.saveBulkTimetable(payload);
      setMessage('Weekly timetable saved successfully!');
      loadWeeklyTimetable();
    } catch (err) {
      setError(err.message || 'Failed to save timetable');
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Timetable Matrix...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Timetable Generation & Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure a full 6-period weekly schedule (Monday–Saturday) for standard and division combinations.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <label className="form-label">Grade / Class</label>
          <select 
            className="form-control"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 150px' }}>
          <label className="form-label">Division (Section)</label>
          <select 
            className="form-control"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleSaveTimetable} style={{ height: '46px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Save size={16} /> Save Weekly Timetable
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '20px' }}>Weekly Matrix Grid</h3>

        <table className="custom-table" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Day</th>
              {defaultTimings.map((time, idx) => (
                <th key={idx} style={{ textAlign: 'center' }}>
                  Period {idx + 1}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    {time.startTime} - {time.endTime}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td style={{ fontWeight: 'bold', verticalAlign: 'middle', color: 'var(--text-main)' }}>{day}</td>
                {grid[day]?.map((period, periodIndex) => (
                  <td key={periodIndex} style={{ padding: '8px', minWidth: '150px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-app)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <select
                        className="timetable-grid-select"
                        value={period.subject}
                        onChange={(e) => handleCellChange(day, periodIndex, 'subject', e.target.value)}
                      >
                        <option value="">-- Subject --</option>
                        {subjects.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>

                      <select
                        className="timetable-grid-select"
                        value={period.teacher}
                        onChange={(e) => handleCellChange(day, periodIndex, 'teacher', e.target.value)}
                      >
                        <option value="">-- Teacher --</option>
                        {teachers.map(teach => (
                          <option key={teach._id} value={teach._id}>{teach.name}</option>
                        ))}
                      </select>

                      {(period.subject || period.teacher) && (
                        <button 
                          onClick={() => handleClearCell(day, periodIndex)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Clear Period"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableGenerator;
