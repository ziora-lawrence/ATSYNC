import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './dashboard.css';

const Clients = () => {
  const {
    clients,
    setClients,
    activeClient,
    loading,
    triggerToast
  } = useOutletContext();

  const [chatInputText, setChatInputText] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState('Final Phase 2 Wireframes');

  // Send a regular chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'agency',
      senderName: 'YOU',
      avatar: 'DZ',
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setClients(prev => prev.map(c => {
      if (c.id === activeClient.id) {
        return {
          ...c,
          chatLog: [...(c.chatLog || []), newMsg]
        };
      }
      return c;
    }));

    setChatInputText('');
    triggerToast("Message sent to client!");
  };

  // Submit approval request from Modal
  const handleSendApprovalRequest = (e) => {
    e.preventDefault();
    if (!approvalItem.trim()) return;

    const systemMsg = {
      id: Date.now(),
      sender: 'system',
      senderName: 'SYSTEM',
      avatar: 'SYS',
      text: `SYSTEM: Approval request sent for "${approvalItem}" — Locked Price: ${activeClient.budget || '—'} (1% platform fee applied upon payout).`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setClients(prev => prev.map(c => {
      if (c.id === activeClient.id) {
        return {
          ...c,
          chatLog: [...(c.chatLog || []), systemMsg],
          alertBadge: 'urgent',
          alertDesc: `Awaiting approval response on "${approvalItem}"`
        };
      }
      return c;
    }));

    setIsApprovalModalOpen(false);
    triggerToast("Approval request dispatched to client!");
  };

  // Safe checks for rendering
  if (!activeClient || !activeClient.id) {
    return (
      <div className="view" style={{ padding: '24px', color: 'var(--text-secondary)' }}>
        No active client selected. Please click a roster client.
      </div>
    );
  }

  return (
    <div className="view" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Chat Header */}
      <div className="chat-header">
        {loading ? (
          <div style={{ width: '150px' }}>
            <div className="db-skeleton-text" style={{ height: '14px', marginBottom: '4px' }}></div>
            <div className="db-skeleton-text short" style={{ height: '8px' }}></div>
          </div>
        ) : (
          <div>
            <h2>{activeClient.name}</h2>
            <div className="chat-sub">
              <span className={`cdot ${activeClient.statusDot}`} style={{ width: '6px', height: '6px', display: 'inline-block' }}></span>
              {activeClient.type === 'active' ? 'Active client roster' : 'Pending Intake review'} · {activeClient.alertDesc || 'Synchronized'}
            </div>
          </div>
        )}

        <div className="hbtns">
          <button className="hbtn" onClick={() => window.open('https://calendly.com', '_blank')}>
            <i className="ti ti-calendar"></i> Book a call
          </button>
          <button className="hbtn hbtn-ghost" onClick={() => triggerToast("Additional options...")}>
            <i className="ti ti-dots"></i>
          </button>
        </div>
      </div>

      {/* Chat messages list area */}
      <div className="chat-body" style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <>
            <div className="msg-row" style={{ gap: '8px' }}>
              <div className="db-skeleton db-skeleton-circle"></div>
              <div className="db-skeleton" style={{ height: '45px', width: '220px', borderRadius: '10px' }}></div>
            </div>
            <div className="msg-row you-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <div className="db-skeleton" style={{ height: '40px', width: '180px', borderRadius: '10px' }}></div>
            </div>
          </>
        ) : activeClient.chatLog && activeClient.chatLog.length > 0 ? (
          activeClient.chatLog.map(m => {
            if (m.sender === 'system') {
              return (
                <div key={m.id} className="system-msg" style={{ margin: '8px 0', textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {m.text}
                </div>
              );
            }
            const isYou = m.sender === 'agency';
            return (
              <div key={m.id} className={`msg-row ${isYou ? 'you-row' : ''}`} style={isYou ? { display: 'flex', justifyContent: 'flex-end' } : {}}>
                {!isYou && <div className="mavatar" style={{ marginRight: '8px' }}>{m.avatar}</div>}
                <div className={isYou ? 'yoububble' : 'mbubble'}>
                  {!isYou && <div className="mname" style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '2px' }}>{m.senderName}</div>}
                  <div>{m.text}</div>
                  <div className="mtime" style={{ fontSize: '8px', color: '#475569', marginTop: '4px', textAlign: isYou ? 'right' : 'left' }}>
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '80px', fontSize: '0.8rem' }}>
            No messages logged with {activeClient.name} yet. Send a text below to initiate communication.
          </div>
        )}
      </div>

      {/* "Send Approval Request" Trigger Banner */}
      {!loading && activeClient.alertBadge === 'ready' && (
        <div className="approval-trigger">
          <div className="at-left">
            <i className="ti ti-circle-check"></i> Project phase is ready. Draft final approval for client signature?
          </div>
          <button className="at-btn" onClick={() => setIsApprovalModalOpen(true)}>
            Send approval request
          </button>
        </div>
      )}

      {/* Input Message Area */}
      <div className="input-area">
        <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <input
            className="cinput"
            type="text"
            placeholder={loading ? "Loading chat sync..." : `Type a message to ${activeClient.name}...`}
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="sbtn" disabled={loading}>
            <i className="ti ti-send" style={{ color: '#090d12' }}></i>
          </button>
        </form>
      </div>

      {/* APPROVAL POPUP MODAL */}
      {isApprovalModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Send Approval Request</h3>
            <p>Specify the deliverables being approved. This will lock the brief and notify the client team.</p>
            
            <form onSubmit={handleSendApprovalRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                className="modal-input"
                type="text"
                placeholder="Deliverables description e.g. Phase 2 Wireframes"
                value={approvalItem}
                onChange={(e) => setApprovalItem(e.target.value)}
                required
              />

              <div className="modal-price">
                <span className="mp-label">Locked Price</span>
                <span className="mp-price">{activeClient.budget || '—'}</span>
              </div>
              
              <div className="mp-note" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>
                Note: ATSYNC collects a 1% platform fee upon clearance of this contract payout.
              </div>

              <div className="modal-btns">
                <button type="button" className="modal-cancel" onClick={() => setIsApprovalModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-send">
                  <i className="ti ti-send"></i> Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
