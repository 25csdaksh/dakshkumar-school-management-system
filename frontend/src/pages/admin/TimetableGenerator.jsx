import React, { useState, useEffect } from 'react';
import academicService from '../../services/academicService.js';
import { studentService } from '../../services/studentService.js';
import { Clock, Plus, Trash, Save } from 'lucide-react';

export const TimetableGenerator = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [timetable, setTimetable] = useState([]);
  const [newPeriod, setNewPeriod] = useState({ subject: '', teacher: '', startTime: '08:30', endTime: '09:20' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      loadClassTimetable();
    }
  }, [selectedClass, selectedSection, selectedDay]);

  const loadClassTimetable = async () => {
    try {
      setError('');
      const data = await academicService.getTimetable(selectedClass, selectedSection);
      // Filter for currently selected day
      const dayData = data.find(t => t.day === selectedDay);
      setTimetable(dayData ? dayData.periods : []);
    } catch (err) {
      setError(err.message || 'Error fetching timetable records');
    }
  };

  const handleAddPeriod = () => {
    if (!newPeriod.subject || !newPeriod.teacher) {
      setError('Please select both a subject and a teacher');
      return;
    }
    
    // Add period local
    setTimetable([...timetable, newPeriod]);
    setNewPeriod({ subject: '', teacher: '', startTime: '08:30', endTime: '09:20' });
    setError('');
  };

  const handleRemovePeriod = (index) => {
    setTimetable(timetable.filter((_, i) => i !== index));
  };

  const handleSaveTimetable = async () => {
    try {
      setMessage('');
      setError('');
      
      const payload = {
        classId: selectedClass,
        section: selectedSection,
        day: selectedDay,
        periods: timetable.map(p => ({
          subject: p.subject._id || p.subject,
          teacher: p.teacher._id || p.teacher,
          startTime: p.startTime,
          endTime: p.endTime
        }))
      };

      await academicService.saveTimetable(payload);
      setMessage('Timetable saved successfully!');
      loadClassTimetable();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Timetable Editor...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Timetable Generation & Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Auto-arrange or plan schedules for grade levels and assignments.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Class Selection Options */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary)" />
            <span>Select Target Layout</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Grade / Class</label>
            <select 
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Section</label>
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

          <div className="form-group">
            <label className="form-label">Day of the Week</label>
            <select 
              className="form-control"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Planner Grid */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Planner Matrix - {selectedDay}s</h3>
            <button className="btn btn-primary" onClick={handleSaveTimetable} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>

          {/* Add period inline bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr 0.8fr auto', gap: '10px', background: 'var(--bg-app)', padding: '16px', borderRadius: '10px', marginBottom: '20px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject</label>
              <select 
                className="form-control"
                value={newPeriod.subject}
                onChange={(e) => setNewPeriod({ ...newPeriod, subject: e.target.value })}
              >
                <option value="">Select...</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Teacher</label>
              <select 
                className="form-control"
                value={newPeriod.teacher}
                onChange={(e) => setNewPeriod({ ...newPeriod, teacher: e.target.value })}
              >
                <option value="">Select...</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start</label>
              <input 
                type="time" 
                className="form-control"
                value={newPeriod.startTime}
                onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">End</label>
              <input 
                type="time" 
                className="form-control"
                value={newPeriod.endTime}
                onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
              />
            </div>

            <button className="btn btn-primary" onClick={handleAddPeriod} style={{ height: '46px' }}>
              <Plus size={16} /> Add Period
            </button>
          </div>

          {/* Matrix view table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Period Timing</th>
                  <th>Subject</th>
                  <th>Assigned Teacher</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {timetable.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center" style={{ color: 'var(--text-muted)' }}>
                      No periods configured for this day. Use the form above to add periods.
                    </td>
                  </tr>
                ) : (
                  timetable.map((period, index) => {
                    const subName = subjects.find(s => s._id === (period.subject?._id || period.subject))?.name || 'Subject';
                    const teachName = teachers.find(t => t._id === (period.teacher?._id || period.teacher))?.name || 'Faculty Member';
                    
                    return (
                      <tr key={index}>
                        <td><strong>{period.startTime} - {period.endTime}</strong></td>
                        <td>{subName}</td>
                        <td>{teachName}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleRemovePeriod(index)}>
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimetableGenerator;
