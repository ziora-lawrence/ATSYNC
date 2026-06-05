import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * Bob page – Coming Soon screen for the Bob AI assistant.
 * Demonstrates high-fidelity visual layout using skeleton blurs and interactive notifications.
 */
export const Bob = () => {
  const { triggerToast } = useOutletContext();
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    if (notified) return;
    setNotified(true);
    triggerToast('Added to Bob AI preview queue! We will notify you.');
  };

  return (
    <div className="view" id="view-bob" style={{ height: '100%' }}>
      <div className="chat-header">
        <div>
          <h2>Bob</h2>
          <div className="chat-sub">Your agency AI — coming in V1</div>
        </div>
      </div>

      <div className="cs-page">
        {/* Blurred skeleton background representation */}
        <div className="cs-skeleton">
          <div className="skel" style={{ height: '80px', borderRadius: '10px' }}></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skel" style={{ height: '55px', flex: 1, borderRadius: '8px' }}></div>
            <div className="skel" style={{ height: '55px', flex: 1, borderRadius: '8px' }}></div>
          </div>
          <div className="skel" style={{ height: '45px', borderRadius: '8px' }}></div>
          <div className="skel" style={{ height: '45px', borderRadius: '8px' }}></div>
          <div className="skel" style={{ height: '45px', borderRadius: '8px' }}></div>
        </div>

        {/* Dynamic content overlay */}
        <div className="cs-overlay">
          <span className="cs-badge">COMING IN V1</span>
          <div className="cs-title">Meet Bob — your agency AI</div>
          <div className="cs-desc">
            Bob handles client comms, drafts responses in your tone, flags sentiment shifts, and answers anything you throw at him. Team Bob and My Bob — two modes, one assistant.
          </div>
          <div className="cs-features">
            <div className="cs-feat">
              <i className="ti ti-brain"></i>
              <span>Team Bob — shared, client-aware, fully logged</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-lock"></i>
              <span>My Bob — private assistant only you can see</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-world"></i>
              <span>Research, weather, general Q&A anytime</span>
            </div>
            <div className="cs-feat">
              <i className="ti ti-chart-line"></i>
              <span>Sentiment tracking + proactive client alerts</span>
            </div>
          </div>
          <button
            className="cs-notify"
            onClick={handleNotifyClick}
            style={{
              borderColor: notified ? 'var(--green)' : 'var(--cyan)',
              color: notified ? 'var(--green)' : 'var(--cyan)',
              cursor: notified ? 'default' : 'pointer',
            }}
            type="button"
          >
            <i className={`ti ${notified ? 'ti-check' : 'ti-bell'}`} style={{ fontSize: '12px' }}></i>{' '}
            {notified ? 'Subscribed ✓' : 'Notify me when it\'s live'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bob;
