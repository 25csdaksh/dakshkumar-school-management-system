import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService.js';
import { Building, Plus, Bed, User, X, Trash2, Home } from 'lucide-react';

export const Hostel = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  
  // Selected context for allocations
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('Boys');
  const [roomListString, setRoomListString] = useState('101, 102, 103, 104');
  const [bedCountPerRoom, setBedCountPerRoom] = useState(4);

  const [studentEmail, setStudentEmail] = useState('');

  const loadHostels = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getHostels();
      setHostels(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve hostels registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Parse rooms from comma separated list
    const rooms = roomListString.split(',').map(r => r.trim()).filter(Boolean).map(r => ({
      roomNo: r,
      bedCount: Number(bedCountPerRoom)
    }));

    try {
      await resourceService.createHostel({ name, type, rooms });
      setSuccess('Hostel block registered successfully.');
      setShowAddModal(false);
      setName('');
      setType('Boys');
      setRoomListString('101, 102, 103, 104');
      setBedCountPerRoom(4);
      loadHostels();
    } catch (err) {
      setError(err.message || 'Failed to create hostel.');
    }
  };

  const handleAllocateBedSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resourceService.allocateBed(selectedHostel._id, selectedRoom._id, { studentEmail });
      setSuccess(`Student allocated to Room ${selectedRoom.roomNo} successfully.`);
      setShowAllocateModal(false);
      setStudentEmail('');
      loadHostels();
    } catch (err) {
      setError(err.message || 'Failed to allocate room.');
    }
  };

  const handleDeallocateBed = async (hostelId, roomId, studentId) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to deallocate this bed?')) return;
    try {
      await resourceService.deallocateBed(hostelId, roomId, { studentId });
      setSuccess('Bed deallocated successfully.');
      loadHostels();
    } catch (err) {
      setError(err.message || 'Failed to deallocate room.');
    }
  };

  // Stats
  const totalRooms = hostels.reduce((acc, curr) => acc + (curr.rooms?.length || 0), 0);
  const occupiedBeds = hostels.reduce((acc, curr) => 
    acc + curr.rooms.reduce((roomAcc, room) => roomAcc + (room.occupiedBy?.length || 0), 0), 0
  );
  const totalBeds = hostels.reduce((acc, curr) => 
    acc + curr.rooms.reduce((roomAcc, room) => roomAcc + (room.bedCount || 0), 0), 0
  );

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Hostel Allocation Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage hostel wings, configure bed capacities, and allocate rooms.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Hostel Block
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper primary">
            <Building size={24} />
          </div>
          <div>
            <div className="stat-value">{hostels.length}</div>
            <div className="stat-label">Hostel Blocks</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper warning">
            <Home size={24} />
          </div>
          <div>
            <div className="stat-value">{totalRooms}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper success">
            <Bed size={24} />
          </div>
          <div>
            <div className="stat-value">{totalBeds - occupiedBeds} / {totalBeds}</div>
            <div className="stat-label">Available Beds</div>
          </div>
        </div>
      </div>

      {/* Hostels Display */}
      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving hostel wings data...</h4>
        </div>
      ) : hostels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h4>No Hostel Blocks Registered.</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Start by creating your first hostel block registry.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add Hostel Block
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {hostels.map((hostel) => (
            <div key={hostel._id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={20} style={{ color: 'var(--primary)' }} />
                    {hostel.name}
                  </h3>
                  <span className={`badge ${hostel.type === 'Boys' ? 'badge-primary' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
                    {hostel.type} Hostel
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Rooms: <strong>{hostel.rooms?.length}</strong>
                </div>
              </div>

              {/* Rooms Grid inside Block */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {hostel.rooms.map((room) => {
                  const isFull = room.occupiedBy?.length >= room.bedCount;
                  return (
                    <div key={room._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.95rem' }}>Room {room.roomNo}</h4>
                          <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                            {room.occupiedBy?.length} / {room.bedCount} beds filled
                          </span>
                        </div>

                        {/* Occupied List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          {room.occupiedBy && room.occupiedBy.length > 0 ? (
                            room.occupiedBy.map((student, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--bg-sidebar)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <User size={12} style={{ color: 'var(--text-muted)' }} />
                                  {student.name}
                                </span>
                                <button 
                                  onClick={() => handleDeallocateBed(hostel._id, room._id, student._id)} 
                                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                  title="Evict student / Deallocate bed"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Room is empty</span>
                          )}
                        </div>
                      </div>

                      <button 
                        className="btn btn-secondary w-full btn-sm" 
                        disabled={isFull}
                        onClick={() => {
                          setSelectedHostel(hostel);
                          setSelectedRoom(room);
                          setShowAllocateModal(true);
                        }}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Allocate Bed
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Add Hostel Block Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Create Hostel Block</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHostel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Block / Wing Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Stark Wing Block A" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hostel Gender Wing Type</label>
                <select className="form-control" value={type} onChange={e => setType(e.target.value)} required>
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Room Numbers (Comma Separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={roomListString} 
                  onChange={e => setRoomListString(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bed Capacity (Per Room)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="10" 
                  value={bedCountPerRoom} 
                  onChange={e => setBedCountPerRoom(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Register Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Allocate Bed Modal */}
      {showAllocateModal && selectedHostel && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Allocate Hostel Room</h3>
              <button onClick={() => {
                setShowAllocateModal(false);
                setSelectedHostel(null);
                setSelectedRoom(null);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Allocating room in <strong>{selectedHostel.name}</strong>, Room <strong>{selectedRoom.roomNo}</strong>.
            </p>

            <form onSubmit={handleAllocateBedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Student Registered Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. student@school.com"
                  value={studentEmail} 
                  onChange={e => setStudentEmail(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Assign Bed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
