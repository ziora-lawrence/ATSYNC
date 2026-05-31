import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * Clients page – renders the client messaging interface, approval trigger, and approval request modal.
 * Uses context from DashboardLayout.
 */
export const Clients = () => {
  const {
    clients = [],
    setClients,
    activeClient = {},
    loading,
    triggerToast,
    setNotificationsList,
  } = useOutletContext();

  const [messageInput, setMessageInput] = useState('');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalRequestText, setApprovalRequestText] = useState('');
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeClient?.chatLog]);

  const hasClient = activeClient && activeClient.id;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !hasClient) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'agency',
      senderName: 'DANIEL',
      avatarInitials: 'DZ',
      text: messageInput.trim(),
      time: time,
    };

    // Update client chat log
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      return {
        ...c,
        chatLog: [...(c.chatLog || []), userMsg]
      };
    }));

    const clientMsgText = messageInput.trim();
    setMessageInput('');

    // Simulate client response after 1.5 seconds
    setTimeout(() => {
      let clientResponseText = "Thanks for the update, Daniel. Our team is reviewing this and will get back to you shortly.";
      
      const lowerText = clientMsgText.toLowerCase();
      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('budget')) {
        clientResponseText = "Yes, the budget of " + activeClient.budget + " works for us. Let's make sure the deliverable covers all requirements.";
      } else if (lowerText.includes('timeline') || lowerText.includes('schedule') || lowerText.includes('delay')) {
        clientResponseText = "Regarding the timeline: can we push the review meeting to next Tuesday instead?";
      } else if (lowerText.includes('approve') || lowerText.includes('sign off')) {
        clientResponseText = "Excellent. We will look out for the approval request banner and approve it on our portal.";
      }

      const clientMsg = {
        id: Date.now() + 1,
        sender: 'client',
        senderName: activeClient.name.toUpperCase(),
        avatarInitials: activeClient.chatLog?.[0]?.avatarInitials || activeClient.name.split(' ').map(n => n[0]).join(''),
        text: clientResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setClients(prev => prev.map(c => {
        if (c.id !== activeClient.id) return c;
        return {
          ...c,
          chatLog: [...(c.chatLog || []), clientMsg]
        };
      }));
    }, 1500);
  };

  const handleOpenApprovalModal = () => {
    setApprovalRequestText(`Approval request for ${activeClient.service || 'deliverables'}`);
    setIsApprovalOpen(true);
  };

  const handleSendApproval = (e) => {
    e.preventDefault();
    if (!hasClient) return;

    // Update client status/alerts
    setClients(prev => prev.map(c => {
      if (c.id !== activeClient.id) return c;
      return {
        ...c,
        alertBadge: 'ready',
        alertDesc: approvalRequestText || 'Awaiting client approval request.',
        priorityAction: 'Awaiting client approval response on portal.'
      };
    }));

    // Trigger toast and notification
    triggerToast(`Approval request sent to ${activeClient.name}!`);
    setNotificationsList(prev => [
      { id: Date.now(), text: `Approval request sent to ${activeClient.name} for: "${approvalRequestText}"`, read: false },
      ...prev
    ]);

    setIsApprovalOpen(false);
  };

  if (loading) {
    return (
      <div className="view" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading client chat...</p>
      </div>
    );
  }

  if (!hasClient) {
    return (
      <div className="view" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <p>Select an active client from the roster to open communication</p>
      </div>
    );
  }

  // Map alert badge to display status color class
  const getSubStatusColor = (dot) => {
    if (dot === 'green') return 'var(--green)';
    if (dot === 'orange' || dot === 'yellow') return 'var(--yellow)';
    if (dot === 'red') return 'var(--red)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="view" id="view-clients">
      {/* Chat header */}
      <div className="chat-header">
        <div>
          <h2>{activeClient.name}</h2>
          <div className="chat-sub">
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: getSubStatusColor(activeClient.statusDot),
                display: 'inline-block',
              }}
            ></span>{' '}
            {activeClient.alertDesc}
          </div>
        </div>
        <div className="hbtns">
          <button
            className="hbtn"
            onClick={() => window.open('https://calendly.com', '_blank')}
            type="button"
          >
            <i className="ti ti-calendar"></i> Book a call
          </button>
          <button className="hbtn hbtn-ghost" type="button">
            <i className="ti ti-dots"></i>
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="chat-body">
        {(!activeClient.chatLog || activeClient.chatLog.length === 0) ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '11px' }}>
            No chat history with {activeClient.name}. Send a message below to start.
          </div>
        ) : (
          activeClient.chatLog.map((msg) => {
            if (msg.sender === 'agency') {
              return (
                <div key={msg.id} className="you-row">
                  <div className="yoububble">
                    {msg.text}
                    <div className="mtime" style={{ textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={msg.id} className="msg-row">
                  <div className="mavatar">{msg.avatarInitials}</div>
                  <div className="mbubble">
                    <div className="mname">{msg.senderName}</div>
                    {msg.text}
                    <div className="mtime">{msg.time}</div>
                  </div>
                </div>
              );
            }
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Approval banner (if not already pending/ready approval or custom choice) */}
      {activeClient.type === 'active' && activeClient.alertBadge !== 'ready' && (
        <div className="approval-trigger">
          <div className="at-left">
            <i className="ti ti-circle-check"></i> Ready to send final approval to client?
          </div>
          <button className="at-btn" onClick={handleOpenApprovalModal} type="button">
            Send approval request
          </button>
        </div>
      )}

      {/* Chat input form */}
      <form onSubmit={handleSendMessage} className="input-area">
        <input
          className="cinput"
          placeholder={`Type a message to ${activeClient.name}...`}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button className="sbtn" type="submit">
          <i className="ti ti-send"></i>
        </button>
      </form>

      {/* Approval Modal */}
      {isApprovalOpen && (
        <div className="modal-overlay" onClick={() => setIsApprovalOpen(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSendApproval}
          >
            <h3>Send approval request</h3>
            <p>
              Client will see a popup asking them to approve or reject. Price is locked once you send — you can't change it after.
            </p>
            <input
              className="modal-input"
              placeholder="What are you requesting approval for? e.g. Final homepage design"
              value={approvalRequestText}
              onChange={(e) => setApprovalRequestText(e.target.value)}
              required
            />
            <div className="modal-price">
              <div>
                <div className="mp-label">AGREED PRICE</div>
                <div className="mp-price">{activeClient.budget}</div>
                <div className="mp-note">Locked at brief. Cannot be changed.</div>
              </div>
              <div style={{ fontSize: '9px', color: '#334155', textAlign: 'right' }}>
                1% platform fee
                <br />
                applied on payment
              </div>
            </div>
            <div className="modal-btns">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setIsApprovalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="modal-send">
                <i className="ti ti-send"></i> Send to client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;
