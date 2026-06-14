import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './intakestatus.css';

export default function IntakeStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intakeId = searchParams.get('intake');

  const [submission, setSubmission] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | invalid

  useEffect(() => {
    if (!intakeId) {
      setLoadState('invalid');
      return;
    }

    const fetchSubmission = async () => {
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('id', intakeId)
        .single();

      if (error || !data) {
        setLoadState('invalid');
        return;
      }

      setSubmission(data);
      setLoadState('ready');
    };

    fetchSubmission();

    // Poll every 30s so status updates without manual refresh
    const interval = setInterval(fetchSubmission, 30000);
    return () => clearInterval(interval);
  }, [intakeId]);

  if (loadState === 'loading') {
    return (
      <div className="is-page">
        <div className="is-card is-center">
          <p>Loading your submission...</p>
        </div>
      </div>
    );
  }

  if (loadState === 'invalid') {
    return (
      <div className="is-page">
        <div className="is-card is-center">
          <h1>Submission not found</h1>
          <p>This link is invalid or has expired. Contact the agency that sent it to you.</p>
        </div>
      </div>
    );
  }

  const isPending = submission.status === 'pending';
  const isApproved = submission.status === 'approved';
  const isRejected = submission.status === 'rejected';

  return (
    <div className="is-page">
      <div className="is-card">

        {/* Header */}
        <div className="is-header">
          <span className="is-logo">ATS<span className="is-logo-accent">YNC</span></span>
          <div className={`is-status-pill ${submission.status}`}>
            {isPending && '⏳ Pending review'}
            {isApproved && '✓ Accepted'}
            {isRejected && '✕ Not accepted'}
          </div>
        </div>

        {/* Submission summary */}
        <div className="is-summary">
          <div className="is-summary-name">{submission.business_name || submission.name}</div>
          <div className="is-summary-email">{submission.email}</div>
        </div>

        <div className="is-fields">
          <div className="is-field">
            <div className="is-field-label">Service requested</div>
            <div className="is-field-value">{submission.service_needed}</div>
          </div>
          {submission.description && (
            <div className="is-field">
              <div className="is-field-label">Project description</div>
              <div className="is-field-value">{submission.description}</div>
            </div>
          )}
          {submission.budget && (
            <div className="is-field">
              <div className="is-field-label">Budget</div>
              <div className="is-field-value">{submission.budget}</div>
            </div>
          )}
          {submission.deadline && (
            <div className="is-field">
              <div className="is-field-label">Deadline</div>
              <div className="is-field-value">{new Date(submission.deadline).toLocaleDateString()}</div>
            </div>
          )}
          <div className="is-field">
            <div className="is-field-label">Submitted</div>
            <div className="is-field-value">{new Date(submission.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Status message */}
        <div className={`is-message ${submission.status}`}>
          {isPending && (
            <>
              <div className="is-message-title">Your request is being reviewed</div>
              <div className="is-message-desc">
                The agency will respond via email. Keep an eye on your inbox at <strong>{submission.email}</strong>.
                This page updates automatically — you can bookmark it to check your status.
              </div>
            </>
          )}
          {isApproved && (
            <>
              <div className="is-message-title">You've been accepted!</div>
              <div className="is-message-desc">
                Check your inbox at <strong>{submission.email}</strong> for an email from ATSYNC
                with a link to set up your client account and access your project dashboard.
              </div>
              <button
                className="is-action-btn"
                onClick={() => navigate(`/client/signup?intake=${intakeId}`)}
              >
                Set up your account →
              </button>
            </>
          )}
          {isRejected && (
            <>
              <div className="is-message-title">Your request wasn't accepted</div>
              <div className="is-message-desc">
                Unfortunately the agency couldn't take on your project at this time.
                You can reach out to them directly or try another agency.
              </div>
            </>
          )}
        </div>

        {/* Already have account */}
        {(isPending || isApproved) && (
          <div className="is-signin-hint">
            Already have an account?{' '}
            <span className="is-signin-link" onClick={() => navigate('/agent-onboard')}>
              Sign in
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
