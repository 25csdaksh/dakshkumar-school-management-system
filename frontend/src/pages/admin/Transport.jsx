import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService.js';
import { studentService } from '../../services/studentService.js';
import { Bus, UserCheck, Plus, Trash } from 'lucide-react';

export const Transport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    model: '',
    capacity: 40,
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    routeName: '',
    pickupPointsStr: '',
    startLocation: '',
    endLocation: ''
  });

  const [assignment, setAssignment] = useState({
    studentId: '',
    vehicleId: '',
    routeName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const vData = await resourceService.getVehicles();
      setVehicles(vData);

      const stData = await studentService.getStudents();
      setStudents(stData);
    } catch (err) {
      setError(err.message || 'Failed to load transport details');
    } finally {
      setLoading(false);
    }
  };

  const formatVehicleNumber = (val) => {
    let cleaned = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let state = cleaned.slice(0, 2).replace(/[^A-Z]/g, '');
    let rto = cleaned.slice(2, 4).replace(/[^0-9]/g, '');
    
    let remaining = cleaned.slice(4);
    let digitIndex = remaining.search(/[0-9]/);
    let series = '';
    let number = '';
    if (digitIndex !== -1) {
      series = remaining.slice(0, digitIndex).replace(/[^A-Z]/g, '');
      number = remaining.slice(digitIndex).replace(/[^0-9]/g, '');
    } else {
      series = remaining.replace(/[^A-Z]/g, '');
    }
    
    let formatted = '';
    if (state) formatted += state;
    if (rto) formatted += '-' + rto;
    if (series) formatted += '-' + series;
    if (number) formatted += '-' + number;
    return formatted;
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');

      const vehicleRegex = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/;
      if (!vehicleRegex.test(newVehicle.vehicleNumber)) {
        setError('Vehicle number must be in standard Indian format (e.g., GJ-01-XX-1234 or GJ-01-X-1234).');
        return;
      }
      
      const payload = {
        vehicleNumber: newVehicle.vehicleNumber,
        model: newVehicle.model,
        capacity: Number(newVehicle.capacity),
        driverName: newVehicle.driverName,
        driverPhone: newVehicle.driverPhone,
        driverLicense: newVehicle.driverLicense,
        routeDetails: {
          routeName: newVehicle.routeName,
          pickupPoints: newVehicle.pickupPointsStr.split(',').map(p => p.trim()).filter(p => p),
          startLocation: newVehicle.startLocation,
          endLocation: newVehicle.endLocation
        }
      };

      await resourceService.createVehicle(payload);
      setMessage('Transport vehicle and route registered successfully!');
      setNewVehicle({
        vehicleNumber: '',
        model: '',
        capacity: 40,
        driverName: '',
        driverPhone: '',
        driverLicense: '',
        routeName: '',
        pickupPointsStr: '',
        startLocation: '',
        endLocation: ''
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await resourceService.deleteVehicle(id);
      setMessage('Vehicle deleted successfully.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignTransport = async (e) => {
    e.preventDefault();
    if (!assignment.studentId) {
      setError('Please select a student');
      return;
    }
    try {
      setMessage('');
      setError('');
      await resourceService.assignVehicleToStudent(assignment);
      setMessage('Student transport assignment updated successfully!');
      setAssignment({ studentId: '', vehicleId: '', routeName: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Transport Manager...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Transport & Routes Logistics</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure fleet vehicles, routes, drivers, and coordinate student bus assignments.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Register Fleet Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bus size={20} color="var(--primary)" />
            <span>Register Fleet Vehicle</span>
          </h3>

          <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Vehicle Number</label>
              <input 
                type="text" 
                placeholder="e.g. GJ-01-XX-0000" 
                className="form-control"
                value={newVehicle.vehicleNumber}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: formatVehicleNumber(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model Description</label>
              <input 
                type="text" 
                placeholder="e.g. Tata Starbus" 
                className="form-control"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seat Capacity</label>
              <input 
                type="number" 
                className="form-control"
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Driver Particulars</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Driver Name" 
                  className="form-control"
                  value={newVehicle.driverName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                  required
                />
                <input 
                  type="text" 
                  placeholder="License No" 
                  className="form-control"
                  value={newVehicle.driverLicense}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverLicense: e.target.value })}
                  required
                />
              </div>
              <input 
                type="text" 
                placeholder="Contact Phone" 
                className="form-control" 
                style={{ marginTop: '10px' }}
                value={newVehicle.driverPhone}
                onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Route Mapping</label>
              <input 
                type="text" 
                placeholder="Route Name (e.g. Area A Express)" 
                className="form-control"
                value={newVehicle.routeName}
                onChange={(e) => setNewVehicle({ ...newVehicle, routeName: e.target.value })}
                required
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Start Location" 
                  className="form-control"
                  value={newVehicle.startLocation}
                  onChange={(e) => setNewVehicle({ ...newVehicle, startLocation: e.target.value })}
                  required
                />
                <input 
                  type="text" 
                  placeholder="End Location" 
                  className="form-control"
                  value={newVehicle.endLocation}
                  onChange={(e) => setNewVehicle({ ...newVehicle, endLocation: e.target.value })}
                  required
                />
              </div>
              <input 
                type="text" 
                placeholder="Pickup points comma-separated (Point A, Point B...)" 
                className="form-control"
                style={{ marginTop: '10px' }}
                value={newVehicle.pickupPointsStr}
                onChange={(e) => setNewVehicle({ ...newVehicle, pickupPointsStr: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
              Create Fleet Record
            </button>
          </form>
        </div>

        {/* Student Assignment Form */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--secondary)" />
            <span>Student Bus Assignment</span>
          </h3>

          <form onSubmit={handleAssignTransport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select 
                className="form-control"
                value={assignment.studentId}
                onChange={(e) => setAssignment({ ...assignment, studentId: e.target.value })}
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentInfo?.rollNumber})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Vehicle</label>
              <select 
                className="form-control"
                value={assignment.vehicleId}
                onChange={(e) => setAssignment({ ...assignment, vehicleId: e.target.value })}
              >
                <option value="">-- No Vehicle Assigned --</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.model} ({v.vehicleNumber})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Route Name</label>
              <input 
                type="text" 
                placeholder="Route Name Override" 
                className="form-control"
                value={assignment.routeName}
                onChange={(e) => setAssignment({ ...assignment, routeName: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Assign Student Transport
            </button>
          </form>
        </div>
      </div>

      {/* Fleet list */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Active School Fleet & Driver Directory</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle Details</th>
                <th>Driver</th>
                <th>Capacity</th>
                <th>Route Name</th>
                <th>Stops</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    No transport vehicles configured in fleet.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <strong>{v.model}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.vehicleNumber}</div>
                    </td>
                    <td>
                      {v.driverName}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: {v.driverPhone}</div>
                    </td>
                    <td>{v.capacity} Seats</td>
                    <td>{v.routeDetails?.routeName || '-'}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {v.routeDetails?.pickupPoints?.join(' → ') || 'No stops mapped'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteVehicle(v._id)}>
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transport;
