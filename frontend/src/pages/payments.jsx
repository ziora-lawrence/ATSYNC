import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const Payments = () => {
  const { triggerToast } = useOutletContext();
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(1); // Default expand first item

  const ledgerItems = [
    {
      id: 1,
      type: 'Approvals',
      badgeClass: 'bd',
      badgeText: 'Delivery approval',
      client: 'Madestone Football Academy',
      desc: 'Phase 2 — Brand assets + wireframes delivered',
      time: 'Today, 10:24 AM',
      amount: '₦120,000',
      status: 'Awaiting approval',
      statusClass: 'st-pend',
      details: {
        invoiceRef: 'INV-2026-004',
        contact: 'Adaeze Okonkwo',
        method: 'Paystack · Bank transfer',
        statusDesc: 'Awaiting client approval'
      }
    },
    {
      id: 2,
      type: 'Change requests',
      badgeClass: 'bc',
      badgeText: 'Change request',
      client: 'Madestone Football Academy',
      desc: 'CR #001 — Add gallery section to homepage',
      time: 'Yesterday, 3:12 PM',
      amount: '₦25,000',
      status: 'Pending consent',
      statusClass: 'st-pend',
      details: {
        invoiceRef: 'CR-2026-001',
        contact: 'Adaeze Okonkwo',
        method: 'Scope addition: Gallery section — 3 days',
        statusDesc: 'Awaiting client sign-off'
      }
    },
    {
      id: 3,
      type: 'Scope creep',
      badgeClass: 'bs',
      badgeText: 'Scope creep flag',
      client: 'Don Frayo Real Estate',
      desc: '3rd revision — exceeds 2 free revisions',
      time: 'Mon, 11:40 AM',
      amount: '₦20,000',
      status: 'Client warned',
      statusClass: 'st-flag',
      details: {
        invoiceRef: 'SYS-FLAG-003',
        contact: 'System Auto-flagged',
        method: 'Revision count: 3 of 2 allowed',
        statusDesc: 'Waive or convert to CR'
      }
    },
    {
      id: 4,
      type: 'Approvals',
      badgeClass: 'bd',
      badgeText: 'Delivery approval',
      client: 'Tolans Bakery',
      desc: 'Phase 1 — Full e-commerce site delivered',
      time: 'Fri May 30, 4:01 PM',
      amount: '₦180,000',
      status: 'Approved · Paid',
      statusClass: 'st-paid',
      details: {
        invoiceRef: 'INV-2026-003',
        contact: 'Tolani Adeyemi',
        method: 'Paystack · Card',
        statusDesc: 'Payout: Fri May 30, 6:14 PM'
      }
    }
  ];

  const handleAction = (actionName) => {
    triggerToast(`Action "${actionName}" performed successfully!`);
  };

  const filteredItems = activeFilter === 'All' 
    ? ledgerItems 
    : ledgerItems.filter(item => item.type === activeFilter);

  return (
    <div className="view" id="view-payments">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="mc accent">
          <div className="mc-label">Collected this month</div>
          <div className="mc-val">₦340k</div>
          <div className="mc-sub">3 payments</div>
        </div>
        <div className="mc">
          <div className="mc-label">Pending approvals</div>
          <div className="mc-val">₦180k</div>
          <div className="mc-sub warn">2 awaiting clients</div>
        </div>
        <div className="mc">
          <div className="mc-label">Change requests</div>
          <div className="mc-val">₦45k</div>
          <div className="mc-sub">2 open this month</div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="filter-strip">
        {['All', 'Approvals', 'Change requests', 'Scope creep'].map((filter) => (
          <button
            key={filter}
            className={`fp ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Ledger Stack */}
      <div className="ledger-stack">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className={`le ${isExpanded ? 'expanded' : ''}`}>
              <div className="le-sum" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                <span className={`tbadge ${item.badgeClass}`}>{item.badgeText}</span>
                <div className="le-info">
                  <div className="le-client">{item.client}</div>
                  <div className="le-desc">{item.desc}</div>
                  <div className="le-time">{item.time}</div>
                </div>
                <div className="le-right">
                  <div className="le-amt">{item.amount}</div>
                  <div className={`le-status ${item.statusClass}`}>⬤ {item.status}</div>
                </div>
                <i className="ti ti-chevron-down le-chev"></i>
              </div>

              {isExpanded && (
                <div className="le-drawer">
                  <div className="drawer-grid">
                    <div>
                      Reference code
                      <span>{item.details.invoiceRef}</span>
                    </div>
                    <div>
                      Client contact
                      <span>{item.details.contact}</span>
                    </div>
                    <div>
                      Payment details / Note
                      <span>{item.details.method}</span>
                    </div>
                    <div>
                      Status
                      <span>{item.details.statusDesc}</span>
                    </div>
                  </div>
                  <div className="drawer-acts">
                    {item.type === 'Approvals' && item.status !== 'Approved · Paid' && (
                      <>
                        <button className="db" onClick={() => handleAction('Resend Link')}>Resend link</button>
                        <button className="db" onClick={() => handleAction('View Deliverable')}>View deliverable</button>
                        <button className="db p" onClick={() => handleAction('Send Approval Request')}>Send approval request</button>
                      </>
                    )}
                    {item.type === 'Change requests' && (
                      <>
                        <button className="db p" onClick={() => handleAction('Approve & Send')}>Approve &amp; send to client</button>
                        <button className="db d" onClick={() => handleAction('Decline CR')}>Decline</button>
                      </>
                    )}
                    {item.type === 'Scope creep' && (
                      <>
                        <button className="db p" onClick={() => handleAction('Convert to CR')}>Convert to CR</button>
                        <button className="db" onClick={() => handleAction('Waive Charge')}>Waive charge</button>
                      </>
                    )}
                    {item.status === 'Approved · Paid' && (
                      <button className="db" onClick={() => handleAction('Download Receipt')}>Download receipt</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Payments;
