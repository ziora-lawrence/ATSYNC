import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

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
      <div className="bob-coming">
        <div className="bob-icon">
          <i className="ti ti-robot"></i>
        </div>
        <div className="bob-title">Meet Bob</div>
        <div className="bob-sub">
          Bob is your AI co-worker for ATSYNC. He reads your clients, knows your tasks, and helps you stay ahead. Coming in V1.
        </div>
        <div className="bob-modes">
          <div className="bob-mode-card">
            <div className="bmc-title">
              <i className="ti ti-building" style={{ color: 'var(--ac-mid)' }}></i> Company Bob <span className="coming-badge">V1</span>
            </div>
            <div className="bmc-sub">
              Trained on your agency's tone, SOPs, and past projects. Speaks for your brand.
            </div>
          </div>
          <div className="bob-mode-card">
            <div className="bmc-title">
              <i className="ti ti-user" style={{ color: 'var(--ac-mid)' }}></i> Your Bob <span className="coming-badge">V1</span>
            </div>
            <div className="bmc-sub">
              Your personal AI — handles follow-ups, drafts messages, and flags risks before they hit.
            </div>
          </div>
        </div>

        <button
          className="cs-notify"
          onClick={handleNotifyClick}
          style={{
            borderColor: notified ? 'var(--green)' : 'var(--ac)',
            color: notified ? 'var(--green)' : 'var(--ac-mid)',
            cursor: notified ? 'default' : 'pointer',
            marginTop: '20px'
          }}
          type="button"
        >
          <i className={`ti ${notified ? 'ti-check' : 'ti-bell'}`} style={{ fontSize: '12px' }}></i>{' '}
          {notified ? 'Subscribed ✓' : 'Notify me when it\'s live'}
        </button>
      </div>
    </div>
  );
};

export default Bob;
