import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './agentonboard.css';

const AgentOnboard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedServices, setSelectedServices] = useState(['Web Design', 'Social Media']);
    const [selectedTone, setSelectedTone] = useState('Formal');
    
    const [formData, setFormData] = useState({
        agencyName: '',
        cityCountry: '',
        description: '',
        teamSize: '',
        yearsOperating: '',
        popularService: '',
        notOfferedServices: '',
        minBudget: '',
        depositRequired: '',
        turnaroundTime: '',
        maxProjects: '',
        responseTime: '',
        process: '',
        neverSay: '',
        delayReasons: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep(prev => prev + 1);
        } else {
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigate('/');
        }
    };

    const toggleService = (service) => {
        if (service === '+ Add custom') return;
        setSelectedServices(prev => 
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const servicesList = [
        'Web Design', 'Branding', 'Social Media', 'Video Production',
        'Photography', 'Copywriting', 'Paid Ads', 'SEO',
        'App Development', 'UI/UX Design', '+ Add custom'
    ];

    const tonesList = [
        { id: 'Formal', icon: '🎩', label: 'Formal' },
        { id: 'Professional but friendly', icon: '🤝', label: 'Professional but friendly' },
        { id: 'Casual & relaxed', icon: '😎', label: 'Casual & relaxed' }
    ];

    const renderSummaryItem = (label, value) => {
        const isEmpty = !value || (Array.isArray(value) && value.length === 0);
        return (
            <div className="summary-item">
                <div className="summary-label">{label}</div>
                {isEmpty ? (
                    <div className="summary-value summary-empty">Not provided</div>
                ) : (
                    <div className="summary-value">{Array.isArray(value) ? value.join(', ') : value}</div>
                )}
            </div>
        );
    };

    return (
        <div className="onboard-container">
            {/* Header */}
            <header className="onboard-header">
                <div className="logo">
                    <span className="logo-white">ATS</span><span className="logo-blue">YNC</span>
                </div>
                <div className="progress-container">
                    <div className="progress-bar">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                            <div 
                                key={step} 
                                className={`progress-step ${step < currentStep ? 'completed' : step === currentStep ? 'active' : ''}`}
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="step-text">Step {currentStep} of 6</div>
            </header>

            {/* Main Content */}
            <main className="onboard-main">
                <div className="progress-line-container">
                    <div className="progress-line" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
                </div>
                
                <div className="section-title">AGENCY SETUP</div>
                <h1 className="page-heading">Tell us about your agency</h1>
                <p className="page-subheading">Bob uses this to represent you accurately. Take your time — this shapes how he communicates with your clients.</p>

                {/* STEP 1: BASIC IDENTITY */}
                {currentStep === 1 && (
                    <section className="form-section">
                        <h2 className="section-heading">BASIC IDENTITY</h2>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Agency name <span className="required">*</span></label>
                                <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange} placeholder="e.g. Pixel Studio" />
                            </div>
                            <div className="form-group">
                                <label>City &amp; country <span className="required">*</span></label>
                                <input type="text" name="cityCountry" value={formData.cityCountry} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>One-line description <span className="required">*</span></label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="e.g. We build bold brands for African businesses" />
                        </div>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Team size</label>
                                <div className="select-wrapper">
                                    <select name="teamSize" value={formData.teamSize} onChange={handleChange}>
                                        <option value="" disabled hidden>Select size</option>
                                        <option value="1">1 (Solo)</option>
                                        <option value="2-5">2-5</option>
                                        <option value="6-10">6-10</option>
                                        <option value="11+">11+</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Years operating</label>
                                <div className="select-wrapper">
                                    <select name="yearsOperating" value={formData.yearsOperating} onChange={handleChange}>
                                        <option value="" disabled hidden>Select range</option>
                                        <option value="0-1">0-1 years</option>
                                        <option value="2-5">2-5 years</option>
                                        <option value="6-10">6-10 years</option>
                                        <option value="11+">11+ years</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* STEP 2: SERVICES */}
                {currentStep === 2 && (
                    <section className="form-section">
                        <h2 className="section-heading">SERVICES</h2>
                        <div className="form-group">
                            <label>What services do you offer? <span className="required">*</span></label>
                            <div className="pills-container">
                                {servicesList.map(service => (
                                    <button 
                                        key={service}
                                        className={`pill ${selectedServices.includes(service) ? 'active' : ''} ${service === '+ Add custom' ? 'add-custom' : ''}`}
                                        onClick={() => toggleService(service)}
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Your most popular service <span className="required">*</span></label>
                            <input type="text" name="popularService" value={formData.popularService} onChange={handleChange} placeholder="e.g. Brand identity packages" />
                        </div>
                        <div className="form-group">
                            <label>Services you do NOT offer</label>
                            <input type="text" name="notOfferedServices" value={formData.notOfferedServices} onChange={handleChange} placeholder="e.g. Print design, photography" />
                            <span className="help-text">Bob will never promise what you can't deliver</span>
                        </div>
                    </section>
                )}

                {/* STEP 3: PRICING & TIMELINES */}
                {currentStep === 3 && (
                    <section className="form-section">
                        <h2 className="section-heading">PRICING &amp; TIMELINES</h2>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Minimum project budget <span className="required">*</span></label>
                                <input type="text" name="minBudget" value={formData.minBudget} onChange={handleChange} placeholder="e.g. ₦150,000 or $200" />
                            </div>
                            <div className="form-group">
                                <label>Deposit required?</label>
                                <div className="select-wrapper">
                                    <select name="depositRequired" value={formData.depositRequired} onChange={handleChange}>
                                        <option value="" disabled hidden>Select</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-row two-col">
                            <div className="form-group">
                                <label>Avg turnaround time</label>
                                <input type="text" name="turnaroundTime" value={formData.turnaroundTime} onChange={handleChange} placeholder="e.g. 2 weeks for branding" />
                            </div>
                            <div className="form-group">
                                <label>Max active projects</label>
                                <input type="text" name="maxProjects" value={formData.maxProjects} onChange={handleChange} placeholder="e.g. 10 at a time" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Typical response time to clients</label>
                            <div className="select-wrapper">
                                <select name="responseTime" value={formData.responseTime} onChange={handleChange}>
                                    <option value="" disabled hidden>Select</option>
                                    <option value="1-2">1-2 hours</option>
                                    <option value="24">Within 24 hours</option>
                                </select>
                            </div>
                        </div>
                    </section>
                )}

                {/* STEP 4: PROCESS */}
                {currentStep === 4 && (
                    <section className="form-section">
                        <h2 className="section-heading">PROCESS</h2>
                        <div className="form-group">
                            <label>Describe your typical client onboarding process</label>
                            <textarea name="process" value={formData.process} onChange={handleChange} placeholder="e.g. Discovery call -> Proposal -> Contract -> Deposit -> Kickoff"></textarea>
                        </div>
                    </section>
                )}

                {/* STEP 5: BOB'S TONE */}
                {currentStep === 5 && (
                    <section className="form-section">
                        <h2 className="section-heading">BOB'S TONE</h2>
                        <div className="form-group">
                            <label>How should Bob communicate with your clients? <span className="required">*</span></label>
                            <div className="tone-cards">
                                {tonesList.map(tone => (
                                    <div 
                                        key={tone.id}
                                        className={`tone-card ${selectedTone === tone.id ? 'active' : ''}`}
                                        onClick={() => setSelectedTone(tone.id)}
                                    >
                                        <span className="tone-icon">{tone.icon}</span>
                                        <span className="tone-label">{tone.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Anything Bob should NEVER say?</label>
                            <textarea name="neverSay" value={formData.neverSay} onChange={handleChange} placeholder="e.g. Never mention competitor agencies. Never discuss our pricing publicly before we've had a discovery call."></textarea>
                        </div>
                        <div className="form-group">
                            <label>Common reasons your projects get delayed</label>
                            <textarea name="delayReasons" value={formData.delayReasons} onChange={handleChange} placeholder="e.g. Waiting on client assets, revision rounds taking longer than expected, public holidays..."></textarea>
                            <span className="help-text">Bob uses this to explain delays to clients before they even ask</span>
                        </div>
                    </section>
                )}

                {/* STEP 6: REVIEW AND SUBMIT */}
                {currentStep === 6 && (
                    <section className="form-section">
                        <h2 className="section-heading">REVIEW AND SUBMIT</h2>
                        <p style={{marginBottom: '32px', color: '#aaa', fontSize: '14px', lineHeight: '1.5'}}>You are almost done! Review your information below. If everything looks good, click submit.</p>
                        
                        <div className="summary-group">
                            <h3 className="section-heading" style={{ fontSize: '10px', marginBottom: '16px', border: 'none', padding: 0 }}>BASIC IDENTITY</h3>
                            {renderSummaryItem('Agency name', formData.agencyName)}
                            {renderSummaryItem('City & country', formData.cityCountry)}
                            {renderSummaryItem('One-line description', formData.description)}
                            {renderSummaryItem('Team size', formData.teamSize)}
                            {renderSummaryItem('Years operating', formData.yearsOperating)}
                        </div>

                        <div className="summary-group">
                            <h3 className="section-heading" style={{ fontSize: '10px', marginBottom: '16px', border: 'none', padding: 0 }}>SERVICES</h3>
                            {renderSummaryItem('Services offered', selectedServices)}
                            {renderSummaryItem('Most popular service', formData.popularService)}
                            {renderSummaryItem('Services NOT offered', formData.notOfferedServices)}
                        </div>

                        <div className="summary-group">
                            <h3 className="section-heading" style={{ fontSize: '10px', marginBottom: '16px', border: 'none', padding: 0 }}>PRICING & TIMELINES</h3>
                            {renderSummaryItem('Minimum project budget', formData.minBudget)}
                            {renderSummaryItem('Deposit required', formData.depositRequired)}
                            {renderSummaryItem('Avg turnaround time', formData.turnaroundTime)}
                            {renderSummaryItem('Max active projects', formData.maxProjects)}
                            {renderSummaryItem('Typical response time', formData.responseTime)}
                        </div>

                        <div className="summary-group">
                            <h3 className="section-heading" style={{ fontSize: '10px', marginBottom: '16px', border: 'none', padding: 0 }}>PROCESS</h3>
                            {renderSummaryItem('Typical client onboarding process', formData.process)}
                        </div>

                        <div className="summary-group" style={{ marginBottom: 0 }}>
                            <h3 className="section-heading" style={{ fontSize: '10px', marginBottom: '16px', border: 'none', padding: 0 }}>BOB'S TONE</h3>
                            {renderSummaryItem('Communication tone', selectedTone)}
                            {renderSummaryItem('Never say', formData.neverSay)}
                            {renderSummaryItem('Common delay reasons', formData.delayReasons)}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="onboard-footer">
                <button className="btn-back" onClick={handleBack}>Back</button>
                <span className="auto-save">Progress auto-saved</span>
                <button className="btn-continue" onClick={handleNext}>{currentStep === 6 ? 'Submit' : 'Continue'}</button>
            </footer>
        </div>
    );
};

export default AgentOnboard;

