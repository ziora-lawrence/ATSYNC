import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';

const Bob = () => {
  const { triggerToast } = useOutletContext();
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    setNotified(true);
    triggerToast("Notification registered! We will ping you when Bob AI goes live.");
  };

  return (
    <div className="cs-page">
      {/* Blurred background mock skeleton */}
      <div className="cs-skeleton">
        <div className="skel" style={{ height: '70px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div className="skel" style={{ height: '55px', flex: 1, border: '0.5px solid #1e2a38' }}></div>
          <div className="skel" style={{ height: '55px', flex: 1, border: '0.5px solid #1e2a38' }}></div>
        </div>
        <div className="skel" style={{ height: '40px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
        <div className="skel" style={{ height: '40px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
        <div className="skel" style={{ height: '40px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
      </div>

      {/* Foreground Overlay Content */}
      <div className="cs-overlay">
        <span className="cs-badge">COMING IN V1</span>
        
        <h2 className="cs-title">Meet Bob — your agency AI companion</h2>
        <p className="cs-desc">
          Bob handles client communications, drafts responses tailored to your custom tone, flags sentiment drops, and assists with research. Two modes, one AI helper.
        </p>

        <div className="cs-features" style={{ margin: '12px 0' }}>
          <div className="cs-feat">
            <i className="ti ti-brain"></i>
            <span>Team Bob — shared client-aware model, fully logged</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-lock"></i>
            <span>My Bob — private research assistant only you can see</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-world"></i>
            <span>Internet connectivity for real-time market queries</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-chart-line"></i>
            <span>Sentiment metrics + WhatsApp anomaly flags</span>
          </div>
        </div>

        <button className="cs-notify" onClick={handleNotifyClick} disabled={notified} style={notified ? { borderColor: 'var(--green)', color: 'var(--green)' } : {}}>
          <i className="ti ti-bell"></i> {notified ? 'Notified ✓' : "Notify me when it's live"}
        </button>

        <div style={{ fontSize: '8px', color: '#334155', marginTop: '16px', letterSpacing: '1px' }}>
          ATSYNC DEVELOPMENT ENVIRONMENT BUILD · V0.9.8
        </div>
      </div>
    </div>
  );
};

export default Bob;
