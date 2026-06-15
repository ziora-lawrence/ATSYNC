import React, { useState, useEffect } from 'react';
import './nav.css';

const Nav = ({ setShowLogin, setShowWaitlist }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`nav-wrapper ${scrolled ? 'nav-scrolled' : ''}`}>
      <nav className="nav-container">
        {/* Logo */}
        <a href="#hero-section" className="atsync-title" onClick={closeMenu}>
          <svg width="88" height="44" viewBox="165 10 350 350" xmlns="http://www.w3.org/2000/svg" className="atsync-logo" aria-hidden="true">
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            <text x="248" y="210" fontFamily="Arial Black, sans-serif" fontSize="130" fontWeight="900" fill="white">A</text>
            <text x="358" y="210" fontFamily="Arial Black, sans-serif" fontSize="130" fontWeight="900" fill="#00e5ff">S</text>
            <circle cx="256" cy="228" r="6" fill="white" />
            <circle cx="444" cy="228" r="6" fill="#00e5ff" />
            <path d="M256 228 Q350 278 444 228" fill="none" stroke="url(#arcGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <text x="340" y="300" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="rgba(255,255,255,0.55)" letterSpacing="8">ATSYNC</text>
          </svg>
          <span className="nav-logo-text">ATS<span>YNC</span></span>
        </a>

        {/* Desktop links */}
        <ul className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`} role="navigation">
          <li><a href="#how-it-works" onClick={closeMenu}>How It Works</a></li>
          <li><a href="#pricing" onClick={closeMenu}>Pricing</a></li>
          <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
          <li>
            <button
              className="nav-login-btn"
              onClick={() => { setShowLogin(true); closeMenu(); }}
            >
              Login
            </button>
          </li>
          <li className="nav-menu-cta-mobile">
            <button
              className="nav-login-btn nav-waitlist-mobile"
              onClick={() => { setShowWaitlist(true); closeMenu(); }}
            >
              Join Waitlist
            </button>
          </li>
        </ul>

        {/* Right side */}
        <div className="nav-actions">
          <button
            className="nav-cta"
            onClick={() => { setShowWaitlist(true); closeMenu(); }}
          >
            Join Waitlist
          </button>
          <button
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
    </header>
  );
};

export default Nav;