import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export const Marketplace = () => {
  const { triggerToast } = useOutletContext();
  const [notified, setNotified] = useState(false);

  const handleNotifyClick = () => {
    if (notified) return;
    setNotified(true);
    triggerToast('Subscribed to Marketplace launch updates!');
  };

  const integrations = [
    {
      icon: 'ti-brand-whatsapp',
      name: 'WhatsApp Bridge',
      desc: 'Pull WhatsApp messages into ATSYNC threads so nothing lives in your personal DMs.',
      tag: 'Comms'
    },
    {
      icon: 'ti-credit-card',
      name: 'Paystack Pro',
      desc: 'Advanced payment flows, automatic invoices, and installment payments for Nigeria.',
      tag: 'Payments'
    },
    {
      icon: 'ti-file-invoice',
      name: 'Tax & Compliance',
      desc: 'Auto-generate tax compliance audits and invoices local to your agency region.',
      tag: 'Legal'
    }
  ];

  return (
    <div className="view" id="view-marketplace">
      <div className="sec-header" style={{ marginBottom: '18px' }}>
        <div>
          <div className="sec-title" style={{ marginBottom: '4px', fontSize: '15px' }}>Marketplace</div>
          <div style={{ fontSize: '13px', color: 'var(--text-sec)' }}>Tools and integrations for African digital agencies</div>
        </div>
        <span className="coming-badge" style={{ fontSize: '11px', padding: '4px 10px' }}>Coming V1</span>
      </div>

      <div className="mkt-grid">
        {integrations.map((item, idx) => (
          <div key={idx} className="mkt-card">
            <div className="mkt-icon">
              <i className={`ti ${item.icon}`}></i>
            </div>
            <div className="mkt-name">{item.name}</div>
            <div className="mkt-desc">{item.desc}</div>
            <div className="mkt-tag">{item.tag}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          className="cs-notify"
          onClick={handleNotifyClick}
          style={{
            borderColor: notified ? 'var(--green)' : 'var(--ac)',
            color: notified ? 'var(--green)' : 'var(--ac-mid)',
            cursor: notified ? 'default' : 'pointer',
          }}
          type="button"
        >
          <i className={`ti ${notified ? 'ti-check' : 'ti-bell'}`} style={{ fontSize: '12px' }}></i>{' '}
          {notified ? 'Subscribed ✓' : 'Notify me on launch'}
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
