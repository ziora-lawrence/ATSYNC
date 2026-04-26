import React, { useState } from 'react'
import './landingpage.css'
import Nav from '../nav/nav'

const Landingpage = () => {
    const [showLogin, setShowLogin] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [showWaitlist, setShowWaitlist] = useState(false)
    const [agencyName, setagencyName] = useState("")
    const [agencyEmail, setagencyEmail] = useState("")
    const [agencyPass, setagencyPass] = useState("")
    const [agencyConPass, setagencyConPass] = useState("")
    const [error, seterror] = useState("")

    const handleSubmit = () => {
      if (!isLogin) {
        if (!agencyName.trim()) return seterror("Agency name cannot be empty");
        if (!agencyEmail.trim()) return seterror("Email cannot be empty");
        if (!agencyPass.trim()) return seterror("Password cannot be empty");
        if (!agencyConPass.trim()) return seterror("Confirm Password cannot be empty");
        if (agencyPass !== agencyConPass) return seterror("Passwords must match");
        
        const userData = {
            agencyName: agencyName.trim(),
            email: agencyEmail.trim(),
            password: agencyPass.trim()
        };
        localStorage.setItem('atsync_user', JSON.stringify(userData));
        seterror("");
        alert("Account created successfully! You can now log in.");
        setIsLogin(true);
        setagencyPass("");
        setagencyConPass("");
      } else {
        if (!agencyEmail.trim()) return seterror("Email cannot be empty");
        if (!agencyPass.trim()) return seterror("Password cannot be empty");

        const storedUserJSON = localStorage.getItem('atsync_user');
        if (storedUserJSON) {
            const storedUser = JSON.parse(storedUserJSON);
            if (storedUser.email === agencyEmail.trim() && storedUser.password === agencyPass.trim()) {
                seterror("");
                alert(`Welcome back, ${storedUser.agencyName}!`);
                setShowLogin(false);
            } else {
                seterror("Invalid email or password");
            }
        } else {
            seterror("No account found. Please create an account.");
        }
      }
    };

  return (
    <div className='landing-page'>

      <Nav setShowLogin={setShowLogin} setShowWaitlist={setShowWaitlist} />

      {showLogin && (
        <div className='modal-overlay' onClick={() => setShowLogin(false)}>
          <div className='modal-box' onClick={(e) => e.stopPropagation()}>
            
            <button className='modal-close' onClick={() => setShowLogin(false)}>✕</button>
            
            <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p className='modal-subtitle'>
              {isLogin ? 'Log in to your ATSYNC dashboard' : 'Start managing clients the smart way'}
            </p>

            {!isLogin && (
              <input value={agencyName} onChange={(e) => setagencyName(e.target.value)} type='text' placeholder='Agency Name' className='modal-input' />
            )}
            <input value={agencyEmail} onChange={(e) => setagencyEmail(e.target.value)} type='email' placeholder='Email' className='modal-input' />
            <input value={agencyPass} onChange={(e) => setagencyPass(e.target.value)} type='password' placeholder='Password' className='modal-input' />
            {!isLogin && (
              <input value={agencyConPass} onChange={(e) => setagencyConPass(e.target.value)} type='password' placeholder='Confirm Password' className='modal-input' />
            )}

            {error && <p className="error-message" style={{color: 'red', fontSize: '14px', marginBottom: '10px'}}>{error}</p>}

            <button className='modal-submit' onClick={handleSubmit}>
              {isLogin ? 'Login' : 'Create Account'}
            </button>

            <p className='modal-toggle'>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign up' : 'Login'}
              </span>
            </p>

          </div>
        </div>
      )}

      {showWaitlist && (
        <div className='modal-overlay' onClick={() => setShowWaitlist(false)}>
          <div className='modal-box' onClick={(e) => e.stopPropagation()}>
            
            <button className='modal-close' onClick={() => setShowWaitlist(false)}>✕</button>
            
            <h2>Join the Waitlist</h2>
            <p className='modal-subtitle'>
              Get early access to ATSYNC before anyone else.
            </p>

            <input type='email' placeholder='Enter your email address' className='modal-input' />

            <button className='modal-submit'>
              Join Waitlist
            </button>

          </div>
        </div>
      )}

        <section className='hero' id='hero-section'>
            <div className='hero-text'>
                <h1>
                    Stop Managing Clients<br/>
                    On Whatsapp
                </h1>
                <p>
                   ATSYNC gives your agency an AI that onboards clients, sends updates, and handles follow-ups automatically.
                </p>
                <div className='hero-buttons'>
                    <button className='get-early-access' onClick={() => setShowWaitlist(true)}>Join Waitlist</button>
                    <a href='#how-it-works'><button className='watch-demo'>See How It Works</button></a>
                </div>
            </div>
        </section>

        <section className='features-section' id='how-it-works'>
            <div className='features-header'>
                <span className='subtitle'>INTELLIGENT WORKFLOWS</span>
                <h2>Focus on creating.<br/>Let AI handle the clients.</h2>
            </div>
            
            <div className='features-grid'>
                <div className='features-top-row'>
                    <div className='feature-card'>
                        <div className='feature-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/><path d="M6 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/></svg>
                        </div>
                        <h3>AI Client Onboarding</h3>
                        <p>Automate the paperwork and start projects faster. Dynamic questionnaires adapt to client responses in real-time.</p>
                    </div>
                    
                    <div className='feature-card highlight-card'>
                        <div className='feature-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                        </div>
                        <h3>Automated Updates</h3>
                        <p>Keep clients in the loop without lifting a finger. AI translates your progress into professional client briefs.</p>
                    </div>
                </div>

                <div className='feature-card wide-card'>
                    <div className='wide-card-content'>
                        <div className='feature-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <h3>One Click Approvals</h3>
                        <p>Get feedback and sign-offs in seconds. Eliminate endless email threads with direct, trackable approval links.</p>
                    </div>
                    <div className='wide-card-graphic'>
                        <div className='mock-ui-window'>
                            <div className='mock-ui-line short'></div>
                            <div className='mock-ui-line long'></div>
                            <div className='mock-ui-line medium'></div>
                            <div className='mock-ui-link'>Approve Concept</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className='pricing-section' id='pricing'>
            <div className='pricing-header'>
                <span className='subtitle'>PRICING</span>
                <h2>Scale your operations.</h2>
            </div>
            
            <div className='pricing-grid'>
                {/* Starter Card */}
                <div className='pricing-card'>
                    <div className='pricing-info'>
                        <h3>Starter</h3>
                        <p>For small freelancers.</p>
                    </div>
                    <div className='pricing-price'>
                        Free
                    </div>
                    <ul className='pricing-features'>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Basic Client CRM</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Manual Onboarding</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 3 Projects/month</li>
                    </ul>
                    <button className='pricing-btn' onClick={() => setShowLogin(true)}>Get Started</button>
                </div>

                {/* Pro Card */}
                <div className='pricing-card pro'>
                    <div className='popular-badge'>POPULAR</div>
                    <div className='pricing-info'>
                        <h3>Pro</h3>
                        <p>For growing agencies.</p>
                    </div>
                    <div className='pricing-price'>
                        $29<span>/mo</span>
                    </div>
                    <ul className='pricing-features'>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> AI Client Onboarding</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Automated Updates</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited Projects</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom Branding</li>
                    </ul>
                    <button className='pricing-btn'>Not Available Yet</button>
                </div>

                {/* Enterprise Card */}
                <div className='pricing-card'>
                    <div className='pricing-info'>
                        <h3>Enterprise</h3>
                        <p>For large creative studios.</p>
                    </div>
                    <div className='pricing-price'>
                        Custom
                    </div>
                    <ul className='pricing-features'>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Everything in Pro</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Dedicated Account Manager</li>
                        <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom API Integrations</li>
                    </ul>
                    <button className='pricing-btn'>Coming Soon</button>
                </div>
            </div>
        </section>
    </div>
  )
}

export default Landingpage