import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';

const Marketplace = () => {
  const { triggerToast } = useOutletContext();
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    setNotified(true);
    triggerToast("Notification registered! We will ping you when the Marketplace goes live.");
  };

  return (
    <div className="cs-page">
      {/* Blurred background mock skeleton */}
      <div className="cs-skeleton">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '8px' }}>
          <div className="skel" style={{ height: '45px', border: '0.5px solid #1e2a38' }}></div>
          <div className="skel" style={{ height: '45px', border: '0.5px solid #1e2a38' }}></div>
          <div className="skel" style={{ height: '45px', border: '0.5px solid #1e2a38' }}></div>
          <div className="skel" style={{ height: '45px', border: '0.5px solid #1e2a38' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <div className="skel" style={{ height: '22px', width: '70px', border: '0.5px solid #1e2a38' }}></div>
          <div className="skel" style={{ height: '22px', width: '90px', border: '0.5px solid #1e2a38' }}></div>
        </div>
        <div className="skel" style={{ height: '50px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
        <div className="skel" style={{ height: '50px', border: '0.5px solid #1e2a38', marginBottom: '8px' }}></div>
      </div>

      {/* Foreground Overlay Content */}
      <div className="cs-overlay">
        <span className="cs-badge">COMING IN V1</span>
        
        <h2 className="cs-title">The Agency Marketplace</h2>
        <p className="cs-desc">
          Rejected a lead? List it on the public directory. Another ATSYNC agency claims the lead, pays a finder's fee, and matches seamlessly. Nobody loses business again.
        </p>

        <div className="cs-features" style={{ margin: '12px 0' }}>
          <div className="cs-feat">
            <i className="ti ti-arrows-exchange"></i>
            <span>Reroute rejected leads to certified partner agencies</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-cash"></i>
            <span>Earn a finder's commission payout on every sold lead</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-user-check"></i>
            <span>Client profile match notification sequence triggers</span>
          </div>
          <div className="cs-feat">
            <i className="ti ti-building-store"></i>
            <span>Public agency portfolios and custom ratings — coming in V2</span>
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

export default Marketplace;
