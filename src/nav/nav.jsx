import React, { useState } from 'react'
import './nav.css'

const Nav = ({ setShowLogin, setShowWaitlist }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
        <div className='nav-container'>
            <a href='#hero-section' className='atsync-title'>
                <svg width="90" height="50" viewBox="165 10 350 350" xmlns="http://www.w3.org/2000/svg" className="atsync-logo">
                  <defs>
                    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="white"/>
                      <stop offset="100%" stopColor="#00e5ff"/>
                    </linearGradient>
                  </defs>
                  <text x="248" y="210" fontFamily="Arial Black, sans-serif" fontSize="130" fontWeight="900" fill="white">A</text>
                  <text x="358" y="210" fontFamily="Arial Black, sans-serif" fontSize="130" fontWeight="900" fill="#00e5ff">S</text>
                  <circle cx="256" cy="228" r="6" fill="white"/>
                  <circle cx="444" cy="228" r="6" fill="#00e5ff"/>
                  <path d="M256 228 Q350 278 444 228" fill="none" stroke="url(#arcGrad)" strokeWidth="2.5" strokeLinecap="round"/>
                  <text x="340" y="300" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="rgba(255,255,255,0.6)" letterSpacing="8">ATSYNC</text>
                </svg>
                <h1>ATSYNC</h1>
            </a>
            
            <div className='nav-right'>
                <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <li><a href='#how-it-works' onClick={() => setIsMobileMenuOpen(false)}>How It Works</a></li>
                    <li><a href='#faq' onClick={() => setIsMobileMenuOpen(false)}>FAQ</a></li>
                    <li><a href='#pricing' onClick={() => setIsMobileMenuOpen(false)}>Pricing</a></li>
                    <li className='login-btn' onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }}>Login</li>
                </ul>
                <button className='get-started' onClick={() => setShowWaitlist(true)}>
                    Join Waitlist    
                </button>
                <button className='hamburger-btn' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>
        </div>
    </div>
  )
}

export default Nav