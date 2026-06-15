import React, { useState, useEffect, useRef } from "react";
import "./landingpage.css";
import Nav from "../nav/nav";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* ─────────────────────────────────────────────────────
   BACKGROUND COMPONENTS
   ───────────────────────────────────────────────────── */

const GridBackground = () => (
  <div className="grid-bg" aria-hidden="true" />
);

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.2 + 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,229,255,0.5)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.22 * (1 - d / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" aria-hidden="true" />;
};

const CursorGlow = () => {
  const ref = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.left = `${e.clientX}px`;
        ref.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
};

/* ─────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "Do my clients need to download anything?",
    answer: "No, clients do not need to download any app. Bob integrates seamlessly with their existing platforms.",
  },
  {
    question: "What happens to my existing clients on WhatsApp?",
    answer: "You can easily transition them by sharing your unique ATSYNC portal link, or Bob can handle the handoff.",
  },
  {
    question: "Is Bob actually AI or just automated templates?",
    answer: "Bob is a true AI. He understands context, answers questions dynamically, and adapts to client needs.",
  },
  {
    question: "What if a client refuses to leave WhatsApp?",
    answer: "Bob can be configured to interact via WhatsApp, keeping their experience familiar while you manage it centrally.",
  },
  {
    question: "How long does setup take?",
    answer: "Setup takes less than 5 minutes. Just define your services, pricing, and Bob's tone.",
  },
  {
    question: "What happens if a client wants to change the project brief?",
    answer: "Bob will capture the change request and notify you for approval before updating the project scope.",
  },
  {
    question: "Is my client data safe?",
    answer: "Yes, we use bank-level encryption to ensure all client data and project details remain secure and private.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel your subscription at any time with no hidden fees.",
  },
];

const CheckIcon = () => (
  <svg
    className="check-icon"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────── */

const Landingpage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [agencyName, setagencyName] = useState("");
  const [agencyEmail, setagencyEmail] = useState("");
  const [agencyPass, setagencyPass] = useState("");
  const [agencyConPass, setagencyConPass] = useState("");
  const [error, seterror] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const [wait, setWait] = useState("");
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Role-based login state ──
  const [loginRole, setLoginRole] = useState("agency");
  const [agencyId, setAgencyId] = useState("");

  const [stats, setStats] = useState({ agencies: 0, speed: 0, chaos: 0 });
  const statsRef = useRef(null);
  const statsAnimated = useRef(false);
  const [headline, setHeadline] = useState("");
  const fullHeadline = "Focus on Creating Leave the rest to Bob";

  const navigate = useNavigate();

  // ── Session persistence check on load ──
  // If user is already logged in, send them straight to dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      } else {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, [navigate]);

  // ── Listen for auth state changes (handles tab switching, token refresh etc) ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Scroll entrance animations ──
  useEffect(() => {
    if (!sessionChecked) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    const els = document.querySelectorAll(".animate-on-scroll");
    els.forEach((el) => observer.observe(el));
    return () => els.forEach((el) => observer.unobserve(el));
  }, [sessionChecked]);

  // ── Stats counter animation ──
  useEffect(() => {
    if (!sessionChecked) return;
    const animateValue = (start, end, duration, cb) => {
      let startTs = null;
      const step = (ts) => {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / duration, 1);
        cb(Math.floor(progress * (end - start) + start));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated.current) {
          statsAnimated.current = true;
          animateValue(0, 10, 2200, (v) => setStats((s) => ({ ...s, agencies: v })));
          animateValue(0, 3, 2200, (v) => setStats((s) => ({ ...s, speed: v })));
          animateValue(0, 100, 2200, (v) => setStats((s) => ({ ...s, chaos: v })));
        }
      },
      { threshold: 0.1 }
    );

    const el = statsRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [sessionChecked]);

  // ── Typewriter effect ──
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullHeadline.length) {
        setHeadline(fullHeadline.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 62);
    return () => clearInterval(timer);
  }, []);

  // ── Auth Handlers (all Supabase) ──

  const handleSubmit = async () => {
    seterror("");
    setIsAuthLoading(true);

    if (!isLogin) {
      // ── REGISTER ──
      if (!agencyName.trim()) { seterror("Agency name cannot be empty"); setIsAuthLoading(false); return; }
      if (!agencyEmail.trim()) { seterror("Email cannot be empty"); setIsAuthLoading(false); return; }
      if (!agencyPass.trim()) { seterror("Password cannot be empty"); setIsAuthLoading(false); return; }
      if (!agencyConPass.trim()) { seterror("Confirm Password cannot be empty"); setIsAuthLoading(false); return; }
      if (agencyPass !== agencyConPass) { seterror("Passwords must match"); setIsAuthLoading(false); return; }
      if (agencyPass.length < 6) { seterror("Password must be at least 6 characters"); setIsAuthLoading(false); return; }

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: agencyEmail.trim(),
          password: agencyPass.trim(),
          options: {
            data: { agency_name: agencyName.trim() },
          },
        });

        if (signUpError) {
          seterror(signUpError.message || "Registration failed");
        } else {
          seterror("");
          setIsLogin(true);
          setagencyPass("");
          setagencyConPass("");
          // Show success message inline instead of alert
          seterror("✅ Account created! Check your email to verify before logging in.");
        }
      } catch {
        seterror("Network error. Please try again later.");
      }

    } else {
      // ── LOGIN ──
      if (!agencyEmail.trim()) { seterror("Email cannot be empty"); setIsAuthLoading(false); return; }
      if (!agencyPass.trim()) { seterror("Password cannot be empty"); setIsAuthLoading(false); return; }

      // Staff must provide an agency ID (clients don't — we look it up)
      if (loginRole === "staff" && !agencyId.trim()) {
        seterror("Please enter your Agency ID");
        setIsAuthLoading(false);
        return;
      }

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: agencyEmail.trim(),
          password: agencyPass.trim(),
        });

        if (signInError) {
          seterror(signInError.message || "Invalid credentials");
        } else if (data.session) {
          seterror("");
          setShowLogin(false);
          window.scrollTo(0, 0);

          if (loginRole === "agency") {
            // Check if agency owner has completed onboarding
            const { data: profile } = await supabase
              .from("agent_profiles")
              .select("user_id")
              .eq("user_id", data.user.id)
              .single();

            if (profile) {
              navigate("/dashboard");
            } else {
              navigate("/agent-onboard");
            }
          } else if (loginRole === "staff") {
            // Verify staff belongs to the agency and navigate to workspace
            navigate(`/workspace/${agencyId.trim()}`);
          } else if (loginRole === "client") {
            // Look up their agency_clients record — no Agency ID needed
            const { data: acData, error: acError } = await supabase
              .from("agency_clients")
              .select("id")
              .eq("client_id", data.user.id)
              .limit(1)
              .single();

            if (acError || !acData) {
              seterror("No agency found for this account. Contact your agency.");
              setIsAuthLoading(false);
              return;
            }

            navigate(`/client/${acData.id}`);
          }
        }
      } catch {
        seterror("Network error. Please try again later.");
      }
    }

    setIsAuthLoading(false);
  };

  // ── FORGOT PASSWORD ──
  const handleForgotSubmit = async () => {
    if (!agencyEmail.trim()) return seterror("Email cannot be empty");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(agencyEmail)) return seterror("Please enter a valid email address");

    setIsForgotLoading(true);
    seterror("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        agencyEmail.trim(),
        { redirectTo: `${window.location.origin}/reset` }
      );

      if (resetError) {
        seterror(resetError.message || "Failed to send reset link");
      } else {
        setForgotEmailSent(true);
      }
    } catch {
      seterror("Network error. Please try again later.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // ── WAITLIST ──
  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!wait.trim()) return seterror("Email cannot be empty");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(wait)) return seterror("Please enter a valid email address");

    setIsWaitlistLoading(true);
    seterror("");

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ email: wait.trim(), status: "waiting" }]);

      if (error) {
        if (error.code === "23505") {
          seterror("You're already on the waitlist!");
        } else {
          seterror(error.message || "Something went wrong. Please try again.");
        }
      } else {
        setIsWaitlistJoined(true);
        setWait("");
      }
    } catch {
      seterror("Network error. Please check your connection.");
    } finally {
      setIsWaitlistLoading(false);
    }
  };

  // Don't render landing page until we've confirmed no active session
  // (prevents flash of landing page before redirect)
  if (!sessionChecked) return null;

  /* ─── RENDER ─── */
  return (
    <div className="landing-page">
      <CursorGlow />
      <GridBackground />
      <ParticleBackground />
      <Nav setShowLogin={setShowLogin} setShowWaitlist={setShowWaitlist} />

      {/* ════════════════════ MODALS ════════════════════ */}

      {/* ── Login / Signup / Forgot Modal ── */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowLogin(false);
            setIsForgotMode(false);
            setForgotEmailSent(false);
            seterror("");
          }}
        >
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setShowLogin(false);
                setIsForgotMode(false);
                setForgotEmailSent(false);
                seterror("");
              }}
            >
              ✕
            </button>

            {isForgotMode ? (
              forgotEmailSent ? (
                <div className="waitlist-success">
                  <div className="success-icon">✉️</div>
                  <h2>Reset Link Sent!</h2>
                  <p className="modal-subtitle">
                    We've sent a password reset link to your email. Please check
                    your inbox (and spam folder).
                  </p>
                  <button
                    className="modal-submit"
                    onClick={() => {
                      setIsForgotMode(false);
                      setForgotEmailSent(false);
                      seterror("");
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <h2>Reset Password</h2>
                  <p className="modal-subtitle">
                    Enter your email to receive a password reset link.
                  </p>
                  <input
                    value={agencyEmail}
                    onChange={(e) => setagencyEmail(e.target.value)}
                    type="email"
                    placeholder="Email"
                    className="modal-input"
                  />
                  {error && <p className="error-message">{error}</p>}
                  <button
                    className="modal-submit"
                    onClick={handleForgotSubmit}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <p className="modal-toggle">
                    Remembered your password?{" "}
                    <span onClick={() => { setIsForgotMode(false); seterror(""); }}>
                      Login
                    </span>
                  </p>
                </>
              )
            ) : (
              <>
                {/* ── Glass logo mark ── */}
                <div className="modal-logo-mark">
                  <span className="mlm-white">ATS</span><span className="mlm-cyan">YNC</span>
                </div>

                <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>
                <p className="modal-subtitle">
                  {isLogin
                    ? "Sign in to your ATSYNC workspace"
                    : "Start managing clients the smart way"}
                </p>

                {/* ── Role selector (login only) ── */}
                {isLogin && (
                  <div className="role-tabs">
                    {[
                      { id: "agency", label: "Agency" },
                      { id: "staff",  label: "Team Member" },
                      { id: "client", label: "Client" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`role-tab ${loginRole === r.id ? "role-tab--active" : ""}`}
                        onClick={() => { setLoginRole(r.id); seterror(""); setAgencyId(""); }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}

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
                  placeholder="Email Address"
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
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
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
                    <span className="eye-icon" onClick={() => setShowConPassword(!showConPassword)}>
                      {showConPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                )}

                {/* ── Agency ID for staff and clients ── */}
                {isLogin && loginRole === "staff" && (
                  <div className="agency-id-field">
                    <div className="agency-id-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Agency ID
                    </div>
                    <input
                      value={agencyId}
                      onChange={(e) => setAgencyId(e.target.value)}
                      type="text"
                      placeholder={loginRole === "staff" ? "Enter your agency's ID" : "Enter the agency ID"}
                      className="modal-input agency-id-input"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="forgot-password-link-container">
                    <span
                      className="forgot-link"
                      onClick={() => { setIsForgotMode(true); seterror(""); }}
                    >
                      Forgot Password?
                    </span>
                  </div>
                )}

                {error && (
                  <p className={`error-message ${error.startsWith("✅") ? "success-message" : ""}`}>
                    {error}
                  </p>
                )}

                <button className="modal-submit" onClick={handleSubmit} disabled={isAuthLoading}>
                  {isAuthLoading ? "Please wait..." : isLogin ? `Sign In as ${loginRole === "agency" ? "Agency" : loginRole === "staff" ? "Team Member" : "Client"}` : "Create Account"}
                </button>

                <p className="modal-toggle">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span onClick={() => { setIsLogin(!isLogin); seterror(""); }}>
                    {isLogin ? "Sign up" : "Login"}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Waitlist Modal ── */}
      {showWaitlist && (
        <div
          className="modal-overlay"
          onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}
        >
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}
            >
              ✕
            </button>

            {isWaitlistJoined ? (
              <div className="waitlist-success">
                <div className="success-icon">✨</div>
                <h2>Thanks for joining!</h2>
                <p className="modal-subtitle">
                  We'll notify you as soon as ATSYNC is ready for you.
                </p>
                <button
                  className="modal-submit"
                  onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2>Join the Waitlist</h2>
                <p className="modal-subtitle">
                  Get early access to ATSYNC before anyone else.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="modal-input"
                  value={wait}
                  onChange={(e) => setWait(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button
                  className="modal-submit"
                  onClick={handleWaitlistSubmit}
                  disabled={isWaitlistLoading}
                >
                  {isWaitlistLoading ? "Joining..." : "Join Waitlist"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Contact Modal ── */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowContactModal(false)}>
              ✕
            </button>
            <h2>Contact Us</h2>
            <p className="modal-subtitle">
              Reach out to us if you have additional questions
            </p>
            <div className="contact-buttons-container">
              <a href="https://wa.me/2348085742261" target="_blank" rel="noreferrer">
                <button className="modal-submit whatsapp-glow-btn">WhatsApp Me</button>
              </a>
              <a href="mailto:atlassync1@gmail.com">
                <button className="modal-submit email-glow-btn">Email</button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="hero" id="hero-section">
        <div className="hero-inner">
          <div className="hero-badge animate-badge">
            <span className="badge-dot" aria-hidden="true" />
            Powered by AI
          </div>

          <h1 className="hero-headline">
            {headline}
            <span className="typewriter-cursor" aria-hidden="true" />
          </h1>

          <p className="hero-subtext">
            ATSYNC gives your agency an AI that onboards clients, sends updates,
            and handles follow-ups automatically.
          </p>

          <div className="hero-ctas">
            <button className="cta-primary" onClick={() => setShowWaitlist(true)}>
              <span>Join Waitlist</span>
            </button>
            <a href="#how-it-works" className="cta-secondary">
              See How It Works
              <ArrowIcon />
            </a>
          </div>

          <div className="hero-meta">
            <span>Trusted by 500+ agencies</span>
            <span className="meta-dot" aria-hidden="true">·</span>
            <span>No credit card required</span>
            <span className="meta-dot" aria-hidden="true">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="stats-section">
        <div className="stats-inner animate-on-scroll" ref={statsRef}>
          <div className="stat-card">
            <div className="stat-num">
              {stats.agencies}<span>+</span>
            </div>
            <div className="stat-label">Agencies on the waitlist</div>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-card">
            <div className="stat-num">
              {stats.speed}<span>x</span>
            </div>
            <div className="stat-label">Faster client onboarding</div>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-card">
            <div className="stat-num">
              {stats.chaos}<span>%</span>
            </div>
            <div className="stat-label">WhatsApp chaos eliminated</div>
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section className="features-section" id="how-it-works">
        <div className="features-inner">
          <div className="features-left animate-on-scroll">
            <span className="section-label">HOW IT WORKS</span>
            <h2>
              Three simple steps.
              <br />
              <span className="gradient-text">Zero WhatsApp chaos.</span>
            </h2>
            <p className="features-desc">
              Bob, your AI, does the heavy lifting so you can focus on what you
              do best — creating great work.
            </p>
          </div>

          <div className="features-right">
            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.1s" }}>
              <div className="step-num" aria-hidden="true">01</div>
              <div className="step-content">
                <h3>Set up your agency profile</h3>
                <p>
                  Tell Bob about your services, pricing, and tone of voice. Setup
                  takes less than 5 minutes.
                </p>
              </div>
            </div>

            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.25s" }}>
              <div className="step-num" aria-hidden="true">02</div>
              <div className="step-content">
                <h3>Share your client intake link</h3>
                <p>
                  Send your unique ATSYNC portal link to new leads instead of
                  chatting on WhatsApp.
                </p>
              </div>
            </div>

            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="step-num" aria-hidden="true">03</div>
              <div className="step-content">
                <h3>Bob handles the rest</h3>
                <p>
                  Bob collects project briefs, answers questions, and sets up
                  your dashboard automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ PRICING ════════════════════ */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-header animate-on-scroll">
            <span className="section-label">PRICING</span>
            <h2>
              Scale your <span className="gradient-text">operations.</span>
            </h2>
          </div>

          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card animate-on-scroll" style={{ transitionDelay: "0.1s" }}>
              <div className="plan-name">Starter</div>
              <div className="plan-desc">For small freelancers.</div>
              <div className="plan-price">Free</div>
              <ul className="plan-features">
                <li><CheckIcon />Basic Client CRM</li>
                <li><CheckIcon />Manual Onboarding</li>
                <li><CheckIcon />3 Projects/month</li>
              </ul>
              <button className="plan-btn" onClick={() => setShowLogin(true)}>
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-card--pro animate-on-scroll" style={{ transitionDelay: "0.25s" }}>
              <div className="popular-badge">POPULAR</div>
              <div className="plan-name">Pro</div>
              <div className="plan-desc">For growing agencies.</div>
              <div className="plan-price">
                $29<span>/mo</span>
              </div>
              <ul className="plan-features">
                <li><CheckIcon />AI Client Onboarding</li>
                <li><CheckIcon />Automated Updates</li>
                <li><CheckIcon />Unlimited Projects</li>
                <li><CheckIcon />Custom Branding</li>
              </ul>
              <button className="plan-btn plan-btn--pro">Not Available Yet</button>
            </div>

            {/* Enterprise */}
            <div className="pricing-card animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="plan-name">Enterprise</div>
              <div className="plan-desc">For large creative studios.</div>
              <div className="plan-price">Custom</div>
              <ul className="plan-features">
                <li><CheckIcon />Everything in Pro</li>
                <li><CheckIcon />Dedicated Account Manager</li>
                <li><CheckIcon />Custom API Integrations</li>
              </ul>
              <button className="plan-btn">Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FAQ ════════════════════ */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="faq-header animate-on-scroll">
            <span className="section-label">F A Q</span>
            <h2>Got questions?</h2>
            <p>Everything you need to know about ATSYNC and Bob.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <div className="faq-toggle" aria-hidden="true">
                    {openFaq === index ? "−" : "+"}
                  </div>
                </div>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>

          <div className="faq-cta animate-on-scroll">
            <h3>Still have questions?</h3>
            <p>Talk to us directly. We respond within 24 hours.</p>
            <button className="contact-btn" onClick={() => setShowContactModal(true)}>
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-white">ATS</span>
                <span className="logo-blue">YNC</span>
              </div>
              <p className="footer-description">
                The AI client management platform for African agencies. Focus on
                creating. Leave the rest to Bob.
              </p>
              <div className="social-icons">
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="X (Twitter)">
                  <svg width="18" height="18" viewBox="0 2 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="link-column">
                <h4>PRODUCT</h4>
                <ul>
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setShowWaitlist(true); }}
                    >
                      Join Waitlist
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setShowLogin(true); }}
                    >
                      Login
                    </a>
                  </li>
                </ul>
              </div>
              <div className="link-column">
                <h4>COMPANY</h4>
                <ul>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 ATSYNC. All rights reserved.</p>
            <p>
              Built with purpose in{" "}
              <span className="cyan-text">
                Ibadan, Nigeria <span className="ng-badge">NG</span>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
