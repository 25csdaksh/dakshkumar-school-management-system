import React, { useState, useEffect } from 'react';
import { Navigation, Phone, User, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const BusTracking = () => {
  // Simulator states
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(35);
  const [eta, setEta] = useState(14);
  const [nextStop, setNextStop] = useState('Sector 15 Crossroad');
  const [isPlaying, setIsPlaying] = useState(true);

  // SVG route path coordinates mapping
  const routePoints = [
    { x: 50, y: 350, name: 'Main Depot (Start)', time: '08:00 AM' },
    { x: 150, y: 300, name: 'Metro Station Stop', time: '08:15 AM' },
    { x: 280, y: 220, name: 'Sector 15 Crossroad', time: '08:30 AM' },
    { x: 420, y: 260, name: 'Central Mall Hub', time: '08:45 AM' },
    { x: 550, y: 150, name: 'Greenwood Apartments', time: '09:00 AM' },
    { x: 680, y: 100, name: 'Dakshkumar Academy (Dest)', time: '09:15 AM' }
  ];

  // Map progress (0-100) to X & Y coordinates along the path
  const getCoordinates = (p) => {
    const totalPoints = routePoints.length;
    const segment = 100 / (totalPoints - 1);
    const index = Math.min(Math.floor(p / segment), totalPoints - 2);
    const segmentProgress = (p - index * segment) / segment;

    const start = routePoints[index];
    const end = routePoints[index + 1];

    const x = start.x + (end.x - start.x) * segmentProgress;
    const y = start.y + (end.y - start.y) * segmentProgress;

    return { x, y, currentSegment: index };
  };

  const { x, y, currentSegment } = getCoordinates(progress);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop tracking back to depot
        }
        const nextProgress = prev + 0.5;
        
        // Update ETA and Speed dynamically
        const nextSeg = Math.min(Math.floor(nextProgress / 20), routePoints.length - 2);
        if (nextSeg < routePoints.length - 1) {
          setNextStop(routePoints[nextSeg + 1].name);
          const remainingSegments = (routePoints.length - 1) - (nextProgress / 20);
          setEta(Math.max(1, Math.round(remainingSegments * 6)));
        }
        setSpeed(Math.round(30 + Math.random() * 12));
        
        return nextProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Live GPS Bus Route Tracker</h2>
        <p style={{ color: 'var(--text-muted)' }}>Simulate real-time transport dispatch tracking, driver detail feeds, and ETAs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Side: Animated SVG Map Grid */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Active Route Map - Route 4 (North Extension)</h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            </button>
          </div>

          {/* SVG Map Canvas */}
          <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '400px', width: '100%', position: 'relative', overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 450" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Grid Lines for aesthetics */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <radialGradient id="bus-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--warning)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--warning)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Road / Path drawing */}
              <path 
                d="M 50 350 L 150 300 L 280 220 L 420 260 L 550 150 L 680 100" 
                fill="none" 
                stroke="var(--primary-glow)" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 50 350 L 150 300 L 280 220 L 420 260 L 550 150 L 680 100" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeDasharray="8 6"
              />

              {/* Stop Markers */}
              {routePoints.map((pt, i) => (
                <g key={i}>
                  {/* Outer circle glow if next */}
                  {nextStop === pt.name && (
                    <circle cx={pt.x} cy={pt.y} r="18" fill="var(--success-glow)" opacity="0.6">
                      <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Pin core */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="8" 
                    fill={i === 0 ? 'var(--text-muted)' : i === routePoints.length - 1 ? 'var(--success)' : 'var(--primary)'} 
                    stroke="var(--bg-app)" 
                    strokeWidth="2" 
                  />
                  {/* Label Text */}
                  <text 
                    x={pt.x} 
                    y={pt.y - 15} 
                    textAnchor="middle" 
                    fill="var(--text-main)" 
                    style={{ fontSize: '11px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {pt.name}
                  </text>
                </g>
              ))}

              {/* Animated glowing bus marker */}
              <g transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r="24" fill="url(#bus-glow)" />
                <circle cx="0" cy="0" r="10" fill="var(--warning)" stroke="var(--bg-app)" strokeWidth="2" />
                <path d="M-6 -4 L6 -4 L4 4 L-4 4 Z" fill="var(--text-inverse)" />
              </g>
            </svg>

            {/* School Campus Overlay Pin */}
            <div style={{
              position: 'absolute',
              top: '100px',
              left: '680px',
              transform: 'translate(-50%, -100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{
                background: 'var(--success)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-md)',
                whiteSpace: 'nowrap'
              }}>
                Dakshkumar Academy
              </div>
              <div style={{ width: '2px', height: '10px', background: 'var(--success)' }} />
            </div>
          </div>
        </div>

        {/* Right Side: Route stats and info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tracking Stats */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Telemetry Feed</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current Speed</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{speed} km/h</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estimated Arrival</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} /> {eta} mins
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Approaching Stop</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} style={{ color: 'var(--danger)' }} /> {nextStop}
                </strong>
              </div>
            </div>
          </div>

          {/* Driver details card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Driver Credentials</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <img 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Ramesh Singh" 
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
              />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Ramesh Singh</h4>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> Certified Staff
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bus Registration</span>
                <strong style={{ color: 'var(--text-main)' }}>DL-01-B-9988</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fleet Mobile</span>
                <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} /> +91 98765 43210
                </strong>
              </div>
            </div>
          </div>

          {/* List of stops */}
          <div className="glass-panel" style={{ padding: '24px', flexGrow: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Route Checkpoints</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {routePoints.map((pt, i) => {
                const isPassed = currentSegment >= i;
                return (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: isPassed ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--text-muted)' : 'var(--primary)',
                        border: '2px solid var(--bg-sidebar)'
                      }} />
                      {i < routePoints.length - 1 && (
                        <div style={{ width: '2px', height: '30px', background: 'var(--border-color)' }} />
                      )}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>{pt.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled: {pt.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BusTracking;
