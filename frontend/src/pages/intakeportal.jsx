import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './intakeportal.css';

const SERVICE_OPTIONS = [
  'Web Design & Development',
  'Branding & Identity',
  'Social Media Management',
  'Content Creation',
  'Video Production',
  'Marketing Strategy',
  'Other',
];

export default function IntakePortal() {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    business_name: '',
    service_needed: '',
    service_other: '',
    description: '',
    budget: '',
    deadline: '',
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.service_needed) {
      setErrorMsg('Fill in your name, email, and the service you need.');
      setStatus('error');
      return;
    }

    if (form.service_needed === 'Other' && !form.service_other.trim()) {
      setErrorMsg('Tell us what service you need.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const serviceValue =
      form.service_needed === 'Other' ? form.service_other.trim() : form.service_needed;

    const { data: insertData, error } = await supabase.from('intake_submissions').insert({
      agency_id: agencyId,
      name: form.name.trim(),
      email: form.email.trim(),
      business_name: form.business_name.trim() || null,
      service_needed: serviceValue,
      description: form.description.trim() || null,
      budget: form.budget.trim() || null,
      deadline: form.deadline || null,
      status: 'pending',
    }).select();

    if (error) {
      console.error('Intake submission error:', error);
      setErrorMsg('Something went wrong sending your request. Try again.');
      setStatus('error');
      return;
    }

    setStatus('success');
    const newIntakeId = insertData?.[0]?.id;
    navigate(`/intake/status?intake=${newIntakeId}`);
  };

  if (status === 'success') {
    return (
      <div className="intake-page">
        <div className="intake-card intake-success">
          <div className="intake-success-icon">✓</div>
          <h1>Request sent</h1>
          <p>
            Thanks, {form.name.split(' ')[0]}. The agency has your details and will reach out by
            email once they've reviewed your request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="intake-page">
      <div className="intake-card">
        <div className="intake-header">
          <span className="intake-logo">
            ATS<span className="intake-logo-accent">YNC</span>
          </span>
          <h1>Tell us about your project</h1>
          <p>Fill this out and the agency will review it before setting up your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="intake-form">
          <div className="intake-field">
            <label htmlFor="name">Your name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>

          <div className="intake-field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@business.com"
              autoComplete="email"
            />
          </div>

          <div className="intake-field">
            <label htmlFor="business_name">Business name</label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Optional"
              autoComplete="organization"
            />
          </div>

          <div className="intake-field">
            <label htmlFor="service_needed">Service needed *</label>
            <select
              id="service_needed"
              name="service_needed"
              value={form.service_needed}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a service
              </option>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {form.service_needed === 'Other' && (
            <div className="intake-field">
              <label htmlFor="service_other">Describe the service *</label>
              <input
                id="service_other"
                name="service_other"
                type="text"
                value={form.service_other}
                onChange={handleChange}
                placeholder="What do you need help with?"
              />
            </div>
          )}

          <div className="intake-field">
            <label htmlFor="description">Tell us about your project</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What are you trying to build, fix, or launch? The more detail, the better."
              maxLength={500}
              rows={4}
            />
            <span className="intake-char-count">{form.description.length}/500</span>
          </div>

          <div className="intake-field">
            <label htmlFor="budget">Budget</label>
            <input
              id="budget"
              name="budget"
              type="text"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. ₦100k–200k, or flexible"
            />
          </div>

          <div className="intake-field">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          {status === 'error' && <div className="intake-error">{errorMsg}</div>}

          <button type="submit" className="intake-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send request'}
          </button>
        </form>
      </div>
    </div>
  );
}
