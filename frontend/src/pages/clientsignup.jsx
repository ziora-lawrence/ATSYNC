import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './clientsignup.css';

export default function ClientSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intakeId = searchParams.get('intake');

  const [intake, setIntake] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | invalid | error

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!intakeId) {
      setLoadState('invalid');
      return;
    }

    const fetchIntake = async () => {
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('id', intakeId)
        .single();

      if (error || !data) {
        console.error('Error fetching intake:', error);
        setLoadState('invalid');
        return;
      }

      if (data.status !== 'approved') {
        setLoadState('invalid');
        return;
      }

      setIntake(data);
      setEmail(data.email || '');
      setLoadState('ready');
    };

    fetchIntake();
  }, [intakeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setErrorMsg('Fill in all fields.');
      setSubmitState('error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setSubmitState('error');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg('');

    // 1. Create the auth account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      setErrorMsg(signUpError.message || 'Could not create account.');
      setSubmitState('error');
      return;
    }

    const newUserId = signUpData?.user?.id;

    if (!newUserId) {
      // Email confirmation required before session exists
      setErrorMsg(
        'Account created — check your email to confirm, then come back to this link to finish setup.'
      );
      setSubmitState('error');
      return;
    }

    // 2. Link client to agency via agency_clients
    const { data: linkData, error: linkError } = await supabase
      .from('agency_clients')
      .insert({
        agency_id: intake.agency_id,
        client_id: newUserId,
        business_name: intake.business_name || intake.name,
        intake_id: intake.id,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error linking agency_clients:', linkError);
      setErrorMsg('Account created, but linking to agency failed. Contact support.');
      setSubmitState('error');
      return;
    }

    // 3. Create a default project for this relationship
    const { error: projectError } = await supabase.from('projects').insert({
      agency_client_id: linkData.id,
      name: intake.service_needed || 'New Project',
    });

    if (projectError) {
      console.error('Error creating default project:', projectError);
      // Non-fatal - client account + agency link still work, project can be created later
    }

    // 4. Backfill client_id on the original intake row
    const { error: backfillError } = await supabase
      .from('intake_submissions')
      .update({ client_id: newUserId })
      .eq('id', intake.id);

    if (backfillError) {
      console.error('Error backfilling client_id on intake:', backfillError);
      // Non-fatal - settings page may just not show this submission in intake history
    }

    // 5. Redirect to client portal
    navigate(`/client/${newUserId}`);
  };

  if (loadState === 'loading') {
    return (
      <div className="csignup-page">
        <div className="csignup-card csignup-center">
          <p>Loading your invite...</p>
        </div>
      </div>
    );
  }

  if (loadState === 'invalid') {
    return (
      <div className="csignup-page">
        <div className="csignup-card csignup-center">
          <h1>Invite not valid</h1>
          <p>
            This signup link is missing, invalid, or hasn't been approved yet. Contact the agency
            that sent you this link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="csignup-page">
      <div className="csignup-card">
        <div className="csignup-header">
          <span className="csignup-logo">
            ATS<span className="csignup-logo-accent">YNC</span>
          </span>
          <h1>Set up your account</h1>
          <p>
            You're creating an account for <strong>{intake.business_name || intake.name}</strong>.
            Set a password to access your client portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="csignup-form">
          <div className="csignup-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="csignup-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="csignup-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {submitState === 'error' && <div className="csignup-error">{errorMsg}</div>}

          <button type="submit" className="csignup-submit" disabled={submitState === 'submitting'}>
            {submitState === 'submitting' ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
