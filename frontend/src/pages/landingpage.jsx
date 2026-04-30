import React, { useState } from 'react'
import './landingpage.css'
import Nav from '../nav/nav'
import { useNavigate } from 'react-router-dom'

const faqs = [
  { question: "Do my clients need to download anything?", answer: "No, clients do not need to download any app. Bob integrates seamlessly with their existing platforms." },
  { question: "What happens to my existing clients on WhatsApp?", answer: "You can easily transition them by sharing your unique ATSYNC portal link, or Bob can handle the handoff." },
  { question: "Is Bob actually AI or just automated templates?", answer: "Bob is a true AI. He understands context, answers questions dynamically, and adapts to client needs." },
  { question: "What if a client refuses to leave WhatsApp?", answer: "Bob can be configured to interact via WhatsApp, keeping their experience familiar while you manage it centrally." },
  { question: "How long does setup take?", answer: "Setup takes less than 5 minutes. Just define your services, pricing, and Bob's tone." },
  { question: "What happens if a client wants to change the project brief?", answer: "Bob will capture the change request and notify you for approval before updating the project scope." },
  { question: "Is my client data safe?", answer: "Yes, we use bank-level encryption to ensure all client data and project details remain secure and private." },
  { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time with no hidden fees." }
];

const Landingpage = () => {
    const [openFaq, setOpenFaq] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [showWaitlist, setShowWaitlist] = useState(false)
    const [agencyName, setagencyName] = useState("")
    const [agencyEmail, setagencyEmail] = useState("")
    const [agencyPass, setagencyPass] = useState("")
    const [agencyConPass, setagencyConPass] = useState("")
    const [error, seterror] = useState("")

    const navigate = useNavigate() 

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
      navigate('/agent-onboard');
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
                <h2>Focus on creating.<br/>Leave The Rest To BOB.</h2>
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
                        <p>Keep clients in the loop without lifting a finger. BOB translates your progress into professional client briefs.</p>
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

        <section className='faq-section' id='faq'>
            <div className='faq-header'>
                <span className='subtitle'>F A Q</span>
                <h2>Got questions?</h2>
                <p>Everything you need to know about ATSYNC and Bob.</p>
            </div>
            
            <div className='faq-list'>
                {faqs.map((faq, index) => (
                    <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                        <div className='faq-question'>
                            <span>{faq.question}</span>
                            <div className='faq-toggle'>{openFaq === index ? '-' : '+'}</div>
                        </div>
                        {openFaq === index && (
                            <div className='faq-answer'>
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className='faq-contact'>
                <h3>Still have questions?</h3>
                <p>Talk to us directly. We respond within 24 hours.</p>
                <button className='contact-btn'>Contact Us</button>
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

        <footer className='site-footer'>
            <div className='footer-content'>
                <div className='footer-brand'>
                    <div className='footer-logo'>
                        <span className='logo-white'>ATS</span><span className='logo-blue'>YNC</span>
                    </div>
                    <p className='footer-description'>
                        The AI client management platform for<br />
                        African agencies. Focus on creating. Leave<br />
                        the rest to Bob.
                    </p>
                    <div className='social-icons'>
                        <a href='#' className='social-link'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href='#' className='social-link'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                        </a>
                        <a href='#' className='social-link'>
                            <svg width="18" height="18" viewBox="0 2 24 24" fill="currentColor" stroke="none"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path></svg>
                        </a>
                        <a href='#' className='social-link'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </a>
                    </div>
                </div>

                <div className='footer-links'>
                    <div className='link-column'>
                        <h4>PRODUCT</h4>
                        <ul>
                            <li><a href='#how-it-works'>How It Works</a></li>
                            <li><a href='#pricing'>Pricing</a></li>
                            <li><a href='#faq'>FAQ</a></li>
                            <li><a href='#' onClick={(e) => { e.preventDefault(); setShowWaitlist(true); }}>Join Waitlist</a></li>
                            <li><a href='#' onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Login</a></li>
                        </ul>
                    </div>
                    <div className='link-column'>
                        <h4>COMPANY</h4>
                        <ul>
                            <li><a href='#'>Contact Us</a></li>
                            <li><a href='#'>Privacy Policy</a></li>
                            <li><a href='#'>Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='footer-bottom'>
                <p>&copy; 2025 ATSYNC. All rights reserved.</p>
                <p>Built with purpose in <span className='cyan-text'>Ibadan, Nigeria <span className='ng-badge'>NG</span></span></p>
            </div>
        </footer>
    </div>
  )
}

export default Landingpage