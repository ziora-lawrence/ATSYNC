import React, { useEffect, useState } from 'react';
import './dashboard.css';
import Nav from '../nav/nav';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({ waitlist: 0, profiles: 0, speed: 3, chaos: 100 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Animated counter helper
  const animateValue = (start, end, duration, callback) => {
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      callback(Math.floor(start + progress * (end - start)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 1. Waitlist count
        const { count: waitlistCount } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });

        // 2. Agent profiles count
        const { count: profilesCount } = await supabase
          .from('agent_profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Monthly waitlist signups for chart (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            month: d.getMonth() + 1,
          });
        }

        const chartResults = await Promise.all(
          months.map(async ({ label, year, month }) => {
            const from = `${year}-${String(month).padStart(2, '0')}-01`;
            const toDate = new Date(year, month, 1);
            const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-01`;

            const { count } = await supabase
              .from('waitlist')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', from)
              .lt('created_at', to);

            return { label, value: count || 0 };
          })
        );

        setChartData(chartResults);

        // Animate stats
        const wl = waitlistCount || 0;
        const pr = profilesCount || 0;
        animateValue(0, wl, 1500, (v) => setStats(s => ({ ...s, waitlist: v })));
        animateValue(0, pr, 1500, (v) => setStats(s => ({ ...s, profiles: v })));
        animateValue(0, 3, 1500, (v) => setStats(s => ({ ...s, speed: v })));
        animateValue(0, 100, 1500, (v) => setStats(s => ({ ...s, chaos: v })));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const agencyName = (() => {
    try {
      return JSON.parse(localStorage.getItem('atsync_user'))?.agencyName || 'your agency';
    } catch {
      return 'your agency';
    }
  })();

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="dashboard-page">
      <Nav />

      <section className="dashboard-header">
        <h1>
          {loading ? 'Loading…' : `Welcome back${agencyName !== 'your agency' ? `, ${agencyName}` : ''}! 👋`}
        </h1>
        <p>Real‑time overview of your ATSYNC ecosystem.</p>
      </section>

      <section className="stats-grid">
        <div className="stat-card glassmorphism">
          <h3>
            {stats.waitlist}+
            <span className="stat-label">On the Waitlist</span>
          </h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>
            {stats.profiles}
            <span className="stat-label">Agencies Onboarded</span>
          </h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>
            {stats.speed}x
            <span className="stat-label">Faster Onboarding</span>
          </h3>
        </div>
        <div className="stat-card glassmorphism">
          <h3>
            {stats.chaos}%
            <span className="stat-label">WhatsApp Chaos Eliminated</span>
          </h3>
        </div>
      </section>

      <section className="chart-section glassmorphism">
        <h2>Monthly Waitlist Sign‑ups</h2>
        {loading ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '40px 0' }}>Fetching data…</p>
        ) : (
          <div className="bar-chart">
            {chartData.map((item, idx) => (
              <div
                className="bar"
                key={idx}
                style={{ '--value': Math.round((item.value / maxChartValue) * 100) }}
              >
                <span className="bar-label">{item.label}</span>
                <span className="bar-value">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
