import React, { useEffect, useState } from 'react';
import './dashboard.css';
import Nav from '../nav/nav';

// Mock data for demonstration purposes
const mockStats = {
  agencies: 128,
  speed: 4.2,
  chaos: 12,
  users: 542,
};

const mockChartData = [
  { label: 'Jan', value: 30 },
  { label: 'Feb', value: 45 },
  { label: 'Mar', value: 60 },
  { label: 'Apr', value: 20 },
  { label: 'May', value: 75 },
  { label: 'Jun', value: 50 },
];

const Dashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [chartData, setChartData] = useState(mockChartData);

  // Simulate animation of stats on mount
  useEffect(() => {
    const animate = (key, target, duration = 1500) => {
      const start = Date.now();
      const startVal = 0;
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(startVal + progress * target);
        setStats(prev => ({ ...prev, [key]: value }));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animate('agencies', mockStats.agencies);
    animate('speed', mockStats.speed);
    animate('chaos', mockStats.chaos);
    animate('users', mockStats.users);
  }, []);

  return (
    <div className="dashboard-page">
      <Nav />
      <section className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>Real‑time overview of your ATSYNC ecosystem.</p>
      </section>

      <section className="stats-grid">
        <div className="stat-card glassmorphism">
          <h3>{stats.agencies}+<span className="stat-label">Agencies</span></h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>{stats.speed}x<span className="stat-label">On‑boarding Speed</span></h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>{stats.chaos}%<span className="stat-label">WhatsApp Chaos</span></h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>{stats.users}+<span className="stat-label">Active Users</span></h3>
        </div>
      </section>

      <section className="chart-section glassmorphism">
        <h2>Monthly Sign‑ups</h2>
        <div className="bar-chart">
          {chartData.map((item, idx) => (
            <div className="bar" key={idx} style={{ '--value': item.value }}>
              <span className="bar-label">{item.label}</span>
              <span className="bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
