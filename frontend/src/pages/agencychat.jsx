import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './agencychat.css';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CLIENT_COLORS = ['#38bdf8', '#1D9E75', '#f59e0b', '#ec4899', '#a78bfa'];

const AgencyChat = () => {
  const [agencyId, setAgencyId] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // agency_clients.id
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadState, setLoadState] = useState('loading');
  const chatEndRef = useRef(null);

  // ── Get agency user + clients ──
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) { setLoadState('error'); return; }

      const uid = userData.user.id;
      setAgencyId(uid);

      const { data, error } = await supabase
        .from('agency_clients')
        .select(`
          id,
          client_id,
          business_name,
          projects ( name, status )
        `)
        .eq('agency_id', uid)
        .eq('status', 'active');

      if (error) { setLoadState('error'); return; }
      if (!data || data.length === 0) { setLoadState('empty'); return; }

      const shaped = data.map((row, idx) => {
        const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
        return {
          id: row.id,
          client_id: row.client_id,
          name: row.business_name || 'Client',
          initials: getInitials(row.business_name || 'Client'),
          color: CLIENT_COLORS[idx % CLIENT_COLORS.length],
          projectName: project?.name || 'No project',
          projectStatus: project?.status || 'pending',
          unread: 0,
        };
      });

      setClients(shaped);
      setSelectedId(shaped[0].id);
      setLoadState('ready');
    };

    init();
  }, []);

  // ── Fetch messages + realtime for selected conversation ──
  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agency_client_id', selectedId)
        .order('created_at', { ascending: true });

      if (!error && data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`agency-messages:${selectedId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `agency_client_id=eq.${selectedId}`,
        },
        (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          // clear unread badge if this conversation is active
          setClients(prev =>
            prev.map(c => c.id === selectedId ? { ...c, unread: 0 } : c)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  // ── Realtime for ALL conversations to track unread badges ──
  useEffect(() => {
    if (!agencyId || clients.length === 0) return;

    const channels = clients
      .filter(c => c.id !== selectedId)
      .map(c => {
        return supabase
          .channel(`agency-unread:${c.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `agency_client_id=eq.${c.id}`,
            },
            (payload) => {
              if (payload.new.sender_role === 'client') {
                setClients(prev =>
                  prev.map(cl => cl.id === c.id ? { ...cl, unread: (cl.unread || 0) + 1 } : cl)
                );
              }
            }
          )
          .subscribe();
      });

    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, clients.length, selectedId]);

  // ── Auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedClient = clients.find(c => c.id === selectedId);

  const sendMessage = async () => {
    if (!message.trim() || sending || !agencyId || !selectedId) return;
    const content = message.trim();
    setMessage('');
    setSending(true);

    const optimistic = {
      id: `opt-${Date.now()}`,
      agency_client_id: selectedId,
      sender_id: agencyId,
      sender_role: 'agency',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { error } = await supabase.from('messages').insert({
      agency_client_id: selectedId,
      sender_id: agencyId,
      sender_role: 'agency',
      content,
    });

    if (error) {
      console.error('Send error:', error);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }

    setSending(false);
  };

  if (loadState === 'loading') {
    return <div className="ac-shell"><div className="ac-empty-state">Loading chats...</div></div>;
  }

  if (loadState === 'error') {
    return <div className="ac-shell"><div className="ac-empty-state">Failed to load. Try refreshing.</div></div>;
  }

  if (loadState === 'empty') {
    return (
      <div className="ac-shell">
        <div className="ac-empty-state">
          No active clients yet. Approve a client from the Intake page to start chatting.
        </div>
      </div>
    );
  }

  return (
    <div className="ac-shell">

      {/* ── LEFT: Client list ── */}
      <div className="ac-left">
        <div className="ac-left-header">
          <span className="ac-left-title">Messages</span>
          <span className="ac-left-count">{clients.length}</span>
        </div>
        <div className="ac-client-list">
          {clients.map(c => (
            <div
              key={c.id}
              className={`ac-client-item ${selectedId === c.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedId(c.id);
                setClients(prev => prev.map(cl => cl.id === c.id ? { ...cl, unread: 0 } : cl));
              }}
            >
              <div className="ac-client-avatar" style={{ background: c.color }}>
                {c.initials}
              </div>
              <div className="ac-client-info">
                <div className="ac-client-name">{c.name}</div>
                <div className="ac-client-project">{c.projectName}</div>
              </div>
              {c.unread > 0 && (
                <div className="ac-unread-badge">{c.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Chat ── */}
      <div className="ac-chat">
        {selectedClient && (
          <>
            <div className="ac-chat-header">
              <div className="ac-chat-avatar" style={{ background: selectedClient.color }}>
                {selectedClient.initials}
              </div>
              <div>
                <div className="ac-chat-name">{selectedClient.name}</div>
                <div className="ac-chat-project">{selectedClient.projectName}</div>
              </div>
            </div>

            <div className="ac-chat-feed">
              {messages.length === 0 ? (
                <div className="ac-chat-empty">
                  No messages yet. Send the first message to {selectedClient.name}.
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`ac-msg ${msg.sender_role === 'agency' ? 'mine' : 'theirs'}`}>
                    <div className="ac-msg-bubble">{msg.content}</div>
                    <div className="ac-msg-time">{formatTime(msg.created_at)}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="ac-chat-input-row">
              <input
                className="ac-chat-input"
                placeholder={`Message ${selectedClient.name}...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                className="ac-send-btn"
                onClick={sendMessage}
                disabled={sending || !message.trim()}
              >
                <i className="ti ti-send"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgencyChat;
