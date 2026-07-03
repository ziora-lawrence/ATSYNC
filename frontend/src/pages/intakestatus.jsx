import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './intakestatus.css';

export default function IntakeStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intakeId = searchParams.get('intake');

  const [submission, setSubmission] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  const [showSignIn, setShowSignIn] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInState, setSignInState] = useState('idle');
  const [signInError, setSignInError] = useState('');

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
      setSignInEmail(data.email || '');
      setLoadState('ready');
    };

    fetchSubmission();
    const interval = setInterval(fetchSubmission, 30000);
    return () => clearInterval(interval);
  }, [intakeId]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInPassword) {
      setSignInError('Enter your password.');
      setSignInState('error');
      return;
    }

    setSignInState('loading');
    setSignInError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    if (error) {
      setSignInError('Wrong password or account not found.');
      setSignInState('error');
      return;
    }

    const userId = data.user.id;

    if (submission.status === 'approved') {
      const { data: existing } = await supabase
        .from('agency_clients')
        .select('id')
        .eq('agency_id', submission.agency_id)
        .eq('client_id', userId)
        .maybeSingle();

      if (!existing) {
        const { data: linkData } = await supabase
          .from('agency_clients')
          .insert({
            agency_id: submission.agency_id,
            client_id: userId,
            business_name: submission.business_name || submission.name,
            intake_id: submission.id,
          })
          .select()
          .single();

        if (linkData) {
          await supabase.from('projects').insert({
            agency_client_id: linkData.id,
            name: submission.service_needed || 'New Project',
          });
        }
      }

      await supabase
        .from('intake_submissions')
        .update({ client_id: userId })
        .eq('id', submission.id);
    }

    navigate(`/client/${userId}`);
  };

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

        <div className="is-header">
          <span className="is-logo">ATS<span className="is-logo-accent">YNC</span></span>
          <div className={`is-status-pill ${submission.status}`}>
            {isPending && '⏳ Pending review'}
            {isApproved && '✓ Accepted'}
            {isRejected && '✕ Not accepted'}
          </div>
        </div>

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

        <div className={`is-message ${submission.status}`}>
          {isPending && (
            <>
              <div className="is-message-title">Your request is being reviewed</div>
              <div className="is-message-desc">
                The agency will respond via email. Keep an eye on your inbox at <strong>{submission.email}</strong>.
                This page updates every 30 seconds — bookmark it to check back.
              </div>
            </>
          )}
          {isApproved && (
            <>
              <div className="is-message-title">You've been accepted!</div>
              <div className="is-message-desc">
                Set up your account to access your client portal and track your project.
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
              </div>
            </>
          )}
        </div>

        {(isPending || isApproved) && (
          <div className="is-signin-section">
            {!showSignIn ? (
              <div className="is-signin-hint">
                Already have an account?{' '}
                <span className="is-signin-link" onClick={() => setShowSignIn(true)}>
                  Sign in
                </span>
              </div>
            ) : (
              <div className="is-signin-form">
                <div className="is-signin-title">Sign in to your account</div>
                <div className="is-field-inline">
                  <label>Email</label>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="is-field-inline">
                  <label>Password</label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {signInState === 'error' && (
                  <div className="is-signin-error">{signInError}</div>
                )}
                <button
                  className="is-action-btn"
                  onClick={handleSignIn}
                  disabled={signInState === 'loading'}
                >
                  {signInState === 'loading' ? 'Signing in...' : 'Sign in →'}
                </button>
                <div className="is-signin-hint" style={{ marginTop: '10px' }}>
                  <span className="is-signin-link" onClick={() => setShowSignIn(false)}>
                    Cancel
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
