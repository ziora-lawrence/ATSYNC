import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://atsync-backend.onrender.com';

// ── Format helpers ───────────────────────────────────────────────────────────
const fmtAmount = (n, currency = 'NGN') => {
  if (!n) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency, minimumFractionDigits: 0
  }).format(n);
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const statusMeta = (status) => {
  switch (status) {
    case 'paid':    return { label: 'Paid',    cls: 'st-paid' };
    case 'failed':  return { label: 'Failed',  cls: 'st-flag' };
    default:        return { label: 'Pending', cls: 'st-pend' };
  }
};

// ── Pay Now button / Paystack redirect ───────────────────────────────────────
const PayButton = ({ payment, onDone, triggerToast }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Get client email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      const agencyUser = JSON.parse(localStorage.getItem('atsync_user') || '{}');
      const email = user?.email || agencyUser?.email || '';

      const res = await fetch(`${BACKEND_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_client_id: payment.agency_client_id,
          approval_id: payment.approval_id,
          amount: payment.amount,
          currency: payment.currency || 'NGN',
          description: payment.description,
          email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        triggerToast(json.error || 'Payment initiation failed.');
        return;
      }
      // Redirect to Paystack checkout
      window.location.href = json.authorization_url;
    } catch (err) {
      triggerToast('Network error — could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="db p" onClick={handlePay} disabled={loading}>
      {loading ? 'Redirecting...' : 'Pay Now'}
    </button>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Payments = () => {
  const { triggerToast } = useOutletContext();
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // ── Real data ──
  const [payments, setPayments] = useState([]);
  const [loadState, setLoadState] = useState('loading');

  // ── Derived metrics ──
  const paidPayments   = payments.filter(p => p.status === 'paid');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const collectedTotal  = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
  const pendingTotal    = pendingPayments.reduce((s, p) => s + Number(p.amount), 0);

  const fetchPayments = useCallback(async () => {
    const agencyUser = JSON.parse(localStorage.getItem('atsync_user') || '{}');
    const agencyId = agencyUser?.agencyId;
    if (!agencyId) { setLoadState('empty'); return; }

    // Fetch all payments for this agency's clients, joined with approval title
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        agency_clients!inner ( agency_id, business_name, client_id ),
        approvals ( title, type )
      `)
      .eq('agency_clients.agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load payments:', error);
      setLoadState('error');
      return;
    }
    setPayments(data || []);
    setLoadState('ready');
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Realtime: refresh when any payment changes
  useEffect(() => {
    const channel = supabase
      .channel('payments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchPayments)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPayments]);

  // ── Filter options ──
  const filters = ['All', 'Pending', 'Paid', 'Failed'];
  const filteredPayments =
    activeFilter === 'All'
      ? payments
      : payments.filter(p =>
          p.status.toLowerCase() === activeFilter.toLowerCase()
        );

  // ── Render states ──
  if (loadState === 'loading') {
    return (
      <div className="view" id="view-payments">
        <div style={{ padding: '40px', color: 'var(--text-sec)', fontSize: '13px' }}>
          Loading payments...
        </div>
      </div>
    );
  }

  return (
    <div className="view" id="view-payments">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="mc accent">
          <div className="mc-label">Collected</div>
          <div className="mc-val">{fmtAmount(collectedTotal)}</div>
          <div className="mc-sub">{paidPayments.length} payment{paidPayments.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="mc">
          <div className="mc-label">Pending payment</div>
          <div className="mc-val">{fmtAmount(pendingTotal)}</div>
          <div className="mc-sub warn">{pendingPayments.length} awaiting</div>
        </div>
        <div className="mc">
          <div className="mc-label">Total records</div>
          <div className="mc-val">{payments.length}</div>
          <div className="mc-sub">all time</div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="filter-strip">
        {filters.map((filter) => (
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
        {filteredPayments.length === 0 ? (
          <div style={{
            padding: '40px', textAlign: 'center',
            color: 'var(--text-sec)', fontSize: '13px',
            border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px'
          }}>
            {loadState === 'empty'
              ? 'No agency account found. Log in as an agency to see payments.'
              : 'No payments match this filter.'}
          </div>
        ) : (
          filteredPayments.map((item) => {
            const isExpanded = expandedId === item.id;
            const meta = statusMeta(item.status);
            const clientName = item.agency_clients?.business_name || '—';
            const approvalTitle = item.approvals?.title || '—';
            const canPay = item.status === 'pending' && item.approval_id;

            return (
              <div key={item.id} className={`le ${isExpanded ? 'expanded' : ''}`}>
                <div className="le-sum" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <span className="tbadge bd">Payment</span>
                  <div className="le-info">
                    <div className="le-client">{clientName}</div>
                    <div className="le-desc">{approvalTitle}</div>
                    <div className="le-time">{fmtDate(item.created_at)}</div>
                  </div>
                  <div className="le-right">
                    <div className="le-amt">{fmtAmount(item.amount, item.currency)}</div>
                    <div className={`le-status ${meta.cls}`}>⬤ {meta.label}</div>
                  </div>
                  <i className="ti ti-chevron-down le-chev"></i>
                </div>

                {isExpanded && (
                  <div className="le-drawer">
                    <div className="drawer-grid">
                      <div>
                        Reference
                        <span>{item.paystack_reference || '—'}</span>
                      </div>
                      <div>
                        Client
                        <span>{clientName}</span>
                      </div>
                      <div>
                        Description
                        <span>{item.description || '—'}</span>
                      </div>
                      <div>
                        {item.status === 'paid' ? 'Paid at' : 'Created at'}
                        <span>{fmtDate(item.status === 'paid' ? item.paid_at : item.created_at)}</span>
                      </div>
                    </div>

                    <div className="drawer-acts">
                      {item.status === 'paid' && (
                        <button className="db" onClick={() => triggerToast('Receipt download coming soon.')}>
                          Download receipt
                        </button>
                      )}
                      {item.status === 'failed' && (
                        <button
                          className="db p"
                          onClick={() => triggerToast('Retry payment coming soon.')}
                        >
                          Retry payment
                        </button>
                      )}
                      {canPay && (
                        <PayButton
                          payment={item}
                          triggerToast={triggerToast}
                          onDone={fetchPayments}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Payments;
