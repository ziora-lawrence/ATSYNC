import React, { useState, useEffect, useRef } from "react";
import "./landingpage.css";
import Nav from "../nav/nav";
import { useNavigate } from "react-router-dom";

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const particles = [];
    const numParticles = 60;
    const maxDistance = 150;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${1 - distance / maxDistance})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = window.requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
};

const faqs = [
  {
    question: "Do my clients need to download anything?",
    answer:
      "No, clients do not need to download any app. Bob integrates seamlessly with their existing platforms.",
  },
  {
    question: "What happens to my existing clients on WhatsApp?",
    answer:
      "You can easily transition them by sharing your unique ATSYNC portal link, or Bob can handle the handoff.",
  },
  {
    question: "Is Bob actually AI or just automated templates?",
    answer:
      "Bob is a true AI. He understands context, answers questions dynamically, and adapts to client needs.",
  },
  {
    question: "What if a client refuses to leave WhatsApp?",
    answer:
      "Bob can be configured to interact via WhatsApp, keeping their experience familiar while you manage it centrally.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Setup takes less than 5 minutes. Just define your services, pricing, and Bob's tone.",
  },
  {
    question: "What happens if a client wants to change the project brief?",
    answer:
      "Bob will capture the change request and notify you for approval before updating the project scope.",
  },
  {
    question: "Is my client data safe?",
    answer:
      "Yes, we use bank-level encryption to ensure all client data and project details remain secure and private.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time with no hidden fees.",
  },
];

const Landingpage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [agencyName, setagencyName] = useState("");
  const [agencyEmail, setagencyEmail] = useState("");
  const [agencyPass, setagencyPass] = useState("");
  const [agencyConPass, setagencyConPass] = useState("");
  const [error, seterror] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);

  const [stats, setStats] = useState({ agencies: 0, speed: 0, chaos: 0 });
  const statsRef = useRef(null);
  const statsAnimated = useRef(false);
  const [headline, setHeadline] = useState("");
  const fullHeadline = "Stop Managing Clients On WhatsApp";

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    const animatedElements = document.querySelectorAll(
      ".animate-on-scroll, .section-divider",
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Intersection Observer for Stats
  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        callback(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated.current) {
          statsAnimated.current = true;
          animateValue(0, 500, 2000, (val) =>
            setStats((s) => ({ ...s, agencies: val })),
          );
          animateValue(0, 3, 2000, (val) =>
            setStats((s) => ({ ...s, speed: val })),
          );
          animateValue(0, 100, 2000, (val) =>
            setStats((s) => ({ ...s, chaos: val })),
          );
        }
      },
      { threshold: 0.5 },
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setHeadline("");
    const timer = setInterval(() => {
      if (i < fullHeadline.length) {
        setHeadline(fullHeadline.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!isLogin) {
      if (!agencyName.trim()) return seterror("Agency name cannot be empty");
      if (!agencyEmail.trim()) return seterror("Email cannot be empty");
      if (!agencyPass.trim()) return seterror("Password cannot be empty");
      if (!agencyConPass.trim())
        return seterror("Confirm Password cannot be empty");
      if (agencyPass !== agencyConPass) return seterror("Passwords must match");

      const userData = {
        agencyName: agencyName.trim(),
        email: agencyEmail.trim(),
        password: agencyPass.trim(),
      };
      localStorage.setItem("atsync_user", JSON.stringify(userData));
      seterror("");
      setIsLogin(true);
      setagencyPass("");
      setagencyConPass("");
      return seterror(
        "you cannot log in now but your email and pass have been saved for next time",
      );
    } else {
      if (!agencyEmail.trim()) return seterror("Email cannot be empty");
      if (!agencyPass.trim()) return seterror("Password cannot be empty");

      /*const storedUserJSON = localStorage.getItem("atsync_user");
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        if (
          storedUser.email === agencyEmail.trim() &&
          storedUser.password === agencyPass.trim()
        ) {
          seterror("");
          alert(`Welcome back, ${storedUser.agencyName}!`);
          setShowLogin(false);
        } else {
          seterror("Invalid email or password");
        }
      } else {
        seterror("No account found. Please create an account.");
      }*/
      if (
        agencyEmail !== "danieliwuji28@gmail.com" ||
        agencyPass !== "ziora13*"
      ) {
        return seterror("sorry you cannot log in at this time");
      } else {
        seterror("");
        setShowLogin(false);
        window.scrollTo(0, 0);
        navigate("/agent-onboard");
      }
    }
  };

  return (
    <div className="landing-page">
      <ParticleBackground />
      <Nav setShowLogin={setShowLogin} setShowWaitlist={setShowWaitlist} />

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogin(false)}>
              ✕
            </button>

            <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
            <p className="modal-subtitle">
              {isLogin
                ? "Log in to your ATSYNC dashboard"
                : "Start managing clients the smart way"}
            </p>

            {!isLogin && (
              <input
                value={agencyName}
                onChange={(e) => setagencyName(e.target.value)}
                type="text"
                placeholder="Agency Name"
                className="modal-input"
              />
            )}
            <input
              value={agencyEmail}
              onChange={(e) => setagencyEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="modal-input"
            />
            <div className="password-input-container">
              <input
                value={agencyPass}
                onChange={(e) => setagencyPass(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="modal-input"
              />
              <span 
                className="eye-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {!isLogin && (
              <div className="password-input-container">
                <input
                  value={agencyConPass}
                  onChange={(e) => setagencyConPass(e.target.value)}
                  type={showConPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="modal-input"
                />
                <span 
                  className="eye-icon" 
                  onClick={() => setShowConPassword(!showConPassword)}
                >
                  {showConPassword ? "🙈" : "👁️"}
                </span>
              </div>
            )}

            {error && (
              <p
                className="error-message"
                style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}
              >
                {error}
              </p>
            )}

            <button className="modal-submit" onClick={handleSubmit}>
              {isLogin ? "Login" : "Create Account"}
            </button>

            <p className="modal-toggle">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign up" : "Login"}
              </span>
            </p>
          </div>
        </div>
      )}

      {showWaitlist && (
        <div className="modal-overlay" onClick={() => setShowWaitlist(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowWaitlist(false)}
            >
              ✕
            </button>

            <h2>Join the Waitlist</h2>
            <p className="modal-subtitle">
              Get early access to ATSYNC before anyone else.
            </p>

            <input
              type="email"
              placeholder="Enter your email address"
              className="modal-input"
            />

            <button className="modal-submit">Join Waitlist</button>
          </div>
        </div>
      )}

      <section className="hero" id="hero-section">
        <div className="hero-text">
          <h1>
            {headline}
            <span className="typewriter-cursor"></span>
          </h1>
          <p>
            ATSYNC gives your agency an AI that onboards clients, sends updates,
            and handles follow-ups automatically.
          </p>
          <div className="hero-buttons">
            <button
              className="get-early-access"
              onClick={() => setShowWaitlist(true)}
            >
              Join Waitlist
            </button>
            <a href="#how-it-works">
              <button className="watch-demo">See How It Works</button>
            </a>
          </div>
        </div>
      </section>

      <hr className="section-divider animate-on-scroll" />
      <section className="stats-bar" ref={statsRef}>
        <div className="stat-item">
          <h3>{stats.agencies}+</h3>
          <p>Agencies on the waitlist</p>
        </div>
        <div className="stat-item">
          <h3>{stats.speed}x</h3>
          <p>Faster client onboarding</p>
        </div>
        <div className="stat-item">
          <h3>{stats.chaos}%</h3>
          <p>WhatsApp chaos eliminated</p>
        </div>
      </section>

      <hr className="section-divider animate-on-scroll" />
      <section className="features-section" id="how-it-works">
        <div className="features-header">
          <span className="subtitle">HOW IT WORKS</span>
          <h2>
            Three simple steps.
            <br />
            Zero WhatsApp chaos.
          </h2>
        </div>

        <div className="features-grid">
          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="feature-card levitate delay-1">
              <div
                className="feature-icon"
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#00e5ff",
                }}
              >
                1
              </div>
              <h3>Set up your agency profile</h3>
              <p>
                Tell Bob about your services, pricing, and tone of voice. Setup
                takes less than 5 minutes.
              </p>
            </div>
          </div>

          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.3s" }}
          >
            <div className="feature-card highlight-card levitate delay-2">
              <div
                className="feature-icon"
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#00e5ff",
                }}
              >
                2
              </div>
              <h3>Share your client intake link</h3>
              <p>
                Send your unique ATSYNC portal link to new leads instead of
                chatting on WhatsApp.
              </p>
            </div>
          </div>

          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.5s" }}
          >
            <div className="feature-card levitate delay-3">
              <div
                className="feature-icon"
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#00e5ff",
                }}
              >
                3
              </div>
              <h3>Bob handles the rest</h3>
              <p>
                Bob collects project briefs, answers questions, and sets up your
                dashboard automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider animate-on-scroll" />
      <section className="faq-section" id="faq">
        <div className="faq-header">
          <span className="subtitle">F A Q</span>
          <h2>Got questions?</h2>
          <p>Everything you need to know about ATSYNC and Bob.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${openFaq === index ? "open" : ""}`}
              key={index}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <div className="faq-toggle">
                  {openFaq === index ? "-" : "+"}
                </div>
              </div>
              {openFaq === index && (
                <div className="faq-answer">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>Talk to us directly. We respond within 24 hours.</p>
          <button className="contact-btn">Contact Us</button>
        </div>
      </section>

      <hr className="section-divider animate-on-scroll" />
      <section className="pricing-section" id="pricing">
        <div className="pricing-header">
          <span className="subtitle">PRICING</span>
          <h2>Scale your operations.</h2>
        </div>

        <div className="pricing-grid">
          {/* Starter Card */}
          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.1s", display: "flex", height: "100%" }}
          >
            <div
              className="pricing-card levitate delay-1"
              style={{ width: "100%" }}
            >
              <div className="pricing-info">
                <h3>Starter</h3>
                <p>For small freelancers.</p>
              </div>
              <div className="pricing-price">Free</div>
              <ul className="pricing-features">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Basic Client CRM
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Manual Onboarding
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  3 Projects/month
                </li>
              </ul>
              <button
                className="pricing-btn"
                onClick={() => setShowLogin(true)}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Pro Card */}
          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.3s", display: "flex", height: "100%" }}
          >
            <div
              className="pricing-card pro levitate delay-2"
              style={{ width: "100%" }}
            >
              <div className="popular-badge">POPULAR</div>
              <div className="pricing-info">
                <h3>Pro</h3>
                <p>For growing agencies.</p>
              </div>
              <div className="pricing-price">
                $29<span>/mo</span>
              </div>
              <ul className="pricing-features">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  AI Client Onboarding
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Automated Updates
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Unlimited Projects
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Custom Branding
                </li>
              </ul>
              <button className="pricing-btn">Not Available Yet</button>
            </div>
          </div>

          {/* Enterprise Card */}
          <div
            className="animate-on-scroll"
            style={{ transitionDelay: "0.5s", display: "flex", height: "100%" }}
          >
            <div
              className="pricing-card levitate delay-3"
              style={{ width: "100%" }}
            >
              <div className="pricing-info">
                <h3>Enterprise</h3>
                <p>For large creative studios.</p>
              </div>
              <div className="pricing-price">Custom</div>
              <ul className="pricing-features">
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Everything in Pro
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Dedicated Account Manager
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>{" "}
                  Custom API Integrations
                </li>
              </ul>
              <button className="pricing-btn">Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-white">ATS</span>
              <span className="logo-blue">YNC</span>
            </div>
            <p className="footer-description">
              The AI client management platform for
              <br />
              African agencies. Focus on creating. Leave
              <br />
              the rest to Bob.
            </p>
            <div className="social-icons">
              <a href="#" className="social-link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 2 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
                </svg>
              </a>
              <a href="#" className="social-link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-column">
              <h4>PRODUCT</h4>
              <ul>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowWaitlist(true);
                    }}
                  >
                    Join Waitlist
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLogin(true);
                    }}
                  >
                    Login
                  </a>
                </li>
              </ul>
            </div>
            <div className="link-column">
              <h4>COMPANY</h4>
              <ul>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 ATSYNC. All rights reserved.</p>
          <p>
            Built with purpose in{" "}
            <span className="cyan-text">
              Ibadan, Nigeria <span className="ng-badge">NG</span>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
