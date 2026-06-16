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
    question: "How do my clients access their portal?",
    answer: "Share your unique ATSYNC intake link with a client. They fill a short form, you approve them with one click, and they automatically receive an invite email with a link to set up their account. That's it — no manual setup on your end.",
  },
  {
    question: "Do clients need to create an account?",
    answer: "Yes, but it's seamless. After you approve their intake submission, ATSYNC sends them a magic link via email. They click it, set a password, and they're inside their personal client portal instantly.",
  },
  {
    question: "Can I manage multiple clients at once?",
    answer: "Absolutely. Your agency dashboard shows all your clients in one place — their project phase, progress, revision count, and a direct chat channel with each of them. Switch between clients in one click.",
  },
  {
    question: "What happens after I approve a client?",
    answer: "Two things happen automatically: the intake submission is marked approved in your dashboard, and an invite email is sent to the client with a link to create their account. Once they sign up, they land directly in their client portal showing your agency and their project.",
  },
  {
    question: "Can my clients see each other?",
    answer: "Never. Every client only ever sees their own portal — their project, their files, and their chat with your agency. Full data isolation between clients.",
  },
  {
    question: "What is ATSYNC actually replacing?",
    answer: "The WhatsApp group, the Google Sheet tracker, the random email threads, the forgotten follow-ups, and the voice note updates. ATSYNC gives your clients one clean portal and gives you one clean dashboard instead of all of that.",
  },
  {
    question: "How does the chat work?",
    answer: "Each client has a dedicated message thread with your agency. Messages are real-time — both sides see new messages instantly without refreshing. The agency sees all client chats in one place; each client only sees their own.",
  },
  {
    question: "Is there a limit on clients for the free plan?",
    answer: "The free Starter plan supports up to 3 active projects. Need more? The Pro plan (coming soon) removes all limits.",
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
  const fullHeadline = "Stop Managing Clients on WhatsApp.";

  const navigate = useNavigate();

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleSubmit = async () => {
    seterror("");
    setIsAuthLoading(true);

    if (!isLogin) {
      // ── REGISTER (agency only) ──
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
          options: { data: { agency_name: agencyName.trim() } },
        });

        if (signUpError) {
          seterror(signUpError.message || "Registration failed");
        } else {
          setIsLogin(true);
          setagencyPass("");
          setagencyConPass("");
          seterror("✅ Account created! Check your email to verify before logging in.");
        }
      } catch {
        seterror("Network error. Please try again later.");
      }

    } else {
      // ── LOGIN ──
      if (!agencyEmail.trim()) { seterror("Email cannot be empty"); setIsAuthLoading(false); return; }
      if (!agencyPass.trim()) { seterror("Password cannot be empty"); setIsAuthLoading(false); return; }

      // Only staff need to provide an agency ID
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
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", data.user.id)
              .single();

            navigate(profile ? "/dashboard" : "/agent-onboard");

          } else if (loginRole === "staff") {
            navigate(`/workspace/${agencyId.trim()}`);

          } else if (loginRole === "client") {
            // Look up agency_clients to find their portal — no Agency ID needed
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

  if (!sessionChecked) return null;

  return (
    <div className="landing-page">
      <CursorGlow />
      <GridBackground />
      <ParticleBackground />
      <Nav setShowLogin={setShowLogin} setShowWaitlist={setShowWaitlist} />

      {/* ════════════════════ MODALS ════════════════════ */}

      {showLogin && (
        <div
          className="modal-overlay"
          onClick={() => { setShowLogin(false); setIsForgotMode(false); setForgotEmailSent(false); seterror(""); }}
        >
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowLogin(false); setIsForgotMode(false); setForgotEmailSent(false); seterror(""); }}>✕</button>

            {isForgotMode ? (
              forgotEmailSent ? (
                <div className="waitlist-success">
                  <div className="success-icon">✉️</div>
                  <h2>Reset Link Sent!</h2>
                  <p className="modal-subtitle">We've sent a password reset link to your email. Please check your inbox (and spam folder).</p>
                  <button className="modal-submit" onClick={() => { setIsForgotMode(false); setForgotEmailSent(false); seterror(""); }}>Back to Login</button>
                </div>
              ) : (
                <>
                  <h2>Reset Password</h2>
                  <p className="modal-subtitle">Enter your email to receive a password reset link.</p>
                  <input value={agencyEmail} onChange={(e) => setagencyEmail(e.target.value)} type="email" placeholder="Email" className="modal-input" />
                  {error && <p className="error-message">{error}</p>}
                  <button className="modal-submit" onClick={handleForgotSubmit} disabled={isForgotLoading}>
                    {isForgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <p className="modal-toggle">Remembered your password? <span onClick={() => { setIsForgotMode(false); seterror(""); }}>Login</span></p>
                </>
              )
            ) : (
              <>
                <div className="modal-logo-mark">
                  <span className="mlm-white">ATS</span><span className="mlm-cyan">YNC</span>
                </div>

                <h2>{isLogin ? "Welcome Back" : "Create Agency Account"}</h2>
                <p className="modal-subtitle">
                  {isLogin ? "Sign in to your ATSYNC workspace" : "Start managing clients the smart way"}
                </p>

                {/* Role selector — login only */}
                {isLogin && (
                  <div className="role-tabs">
                    {[
                      { id: "agency", label: "Agency" },
                      { id: "staff", label: "Team Member" },
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

                {/* Agency name — signup only */}
                {!isLogin && (
                  <input value={agencyName} onChange={(e) => setagencyName(e.target.value)} type="text" placeholder="Agency Name" className="modal-input" />
                )}

                <input value={agencyEmail} onChange={(e) => setagencyEmail(e.target.value)} type="email" placeholder="Email Address" className="modal-input" />

                <div className="password-input-container">
                  <input value={agencyPass} onChange={(e) => setagencyPass(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="modal-input" />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</span>
                </div>

                {!isLogin && (
                  <div className="password-input-container">
                    <input value={agencyConPass} onChange={(e) => setagencyConPass(e.target.value)} type={showConPassword ? "text" : "password"} placeholder="Confirm Password" className="modal-input" />
                    <span className="eye-icon" onClick={() => setShowConPassword(!showConPassword)}>{showConPassword ? "🙈" : "👁️"}</span>
                  </div>
                )}

                {/* Agency ID — staff login only */}
                {isLogin && loginRole === "staff" && (
                  <div className="agency-id-field">
                    <div className="agency-id-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Agency ID
                    </div>
                    <input value={agencyId} onChange={(e) => setAgencyId(e.target.value)} type="text" placeholder="Enter your agency's ID" className="modal-input agency-id-input" />
                  </div>
                )}

                {/* Client hint */}
                {isLogin && loginRole === "client" && (
                  <p className="modal-client-hint">
                    <i className="ti ti-info-circle"></i> Sign in with the email your agency invited you with.
                  </p>
                )}

                {isLogin && (
                  <div className="forgot-password-link-container">
                    <span className="forgot-link" onClick={() => { setIsForgotMode(true); seterror(""); }}>Forgot Password?</span>
                  </div>
                )}

                {error && (
                  <p className={`error-message ${error.startsWith("✅") ? "success-message" : ""}`}>{error}</p>
                )}

                <button className="modal-submit" onClick={handleSubmit} disabled={isAuthLoading}>
                  {isAuthLoading
                    ? "Please wait..."
                    : isLogin
                      ? `Sign In as ${loginRole === "agency" ? "Agency" : loginRole === "staff" ? "Team Member" : "Client"}`
                      : "Create Agency Account"}
                </button>

                {/* Only show signup toggle for agency — clients are invited, not self-serve */}
                {(isLogin || !isLogin) && (
                  <p className="modal-toggle">
                    {isLogin ? "Are you an agency? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); seterror(""); setLoginRole("agency"); }}>
                      {isLogin ? "Create an account" : "Login"}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="modal-overlay" onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}>
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}>✕</button>
            {isWaitlistJoined ? (
              <div className="waitlist-success">
                <div className="success-icon">✨</div>
                <h2>Thanks for joining!</h2>
                <p className="modal-subtitle">We'll notify you as soon as ATSYNC is ready for you.</p>
                <button className="modal-submit" onClick={() => { setShowWaitlist(false); setIsWaitlistJoined(false); }}>Close</button>
              </div>
            ) : (
              <>
                <h2>Join the Waitlist</h2>
                <p className="modal-subtitle">Get early access to ATSYNC before anyone else.</p>
                <input type="email" placeholder="Enter your email address" className="modal-input" value={wait} onChange={(e) => setWait(e.target.value)} />
                {error && <p className="error-message">{error}</p>}
                <button className="modal-submit" onClick={handleWaitlistSubmit} disabled={isWaitlistLoading}>
                  {isWaitlistLoading ? "Joining..." : "Join Waitlist"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-box modal-glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowContactModal(false)}>✕</button>
            <h2>Contact Us</h2>
            <p className="modal-subtitle">Reach out to us if you have additional questions</p>
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
            Built for African Agencies
          </div>
          <h1 className="hero-headline">
            {headline}
            <span className="typewriter-cursor" aria-hidden="true" />
          </h1>
          <p className="hero-subtext">
            One link replaces your entire client WhatsApp chaos. Share your intake link,
            approve clients in one click, and manage everything from a single dashboard.
          </p>
          <div className="hero-ctas">
            <button className="cta-primary" onClick={() => setShowLogin(true)}>
              <span>Get Started Free</span>
            </button>
            <a href="#how-it-works" className="cta-secondary">
              See How It Works <ArrowIcon />
            </a>
          </div>
          <div className="hero-meta">
            <span>No credit card required</span>
            <span className="meta-dot" aria-hidden="true">·</span>
            <span>Setup in under 10 minutes</span>
            <span className="meta-dot" aria-hidden="true">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="stats-section">
        <div className="stats-inner animate-on-scroll" ref={statsRef}>
          <div className="stat-card">
            <div className="stat-num">{stats.agencies}<span>+</span></div>
            <div className="stat-label">Agencies on the waitlist</div>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-card">
            <div className="stat-num">{stats.speed}<span>x</span></div>
            <div className="stat-label">Faster client onboarding</div>
          </div>
          <div className="stat-divider" aria-hidden="true" />
          <div className="stat-card">
            <div className="stat-num">{stats.chaos}<span>%</span></div>
            <div className="stat-label">WhatsApp chaos eliminated</div>
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section className="features-section" id="how-it-works">
        <div className="features-inner">
          <div className="features-left animate-on-scroll">
            <span className="section-label">HOW IT WORKS</span>
            <h2>Up and running<br /><span className="gradient-text">in three steps.</span></h2>
            <p className="features-desc">
              No complicated setup. No developer needed. You can onboard your first client in under 10 minutes.
            </p>
          </div>
          <div className="features-right">
            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.1s" }}>
              <div className="step-num" aria-hidden="true">01</div>
              <div className="step-content">
                <h3>Create your agency account</h3>
                <p>Sign up, complete your agency profile, and your personalised intake link is ready instantly — no setup calls, no waiting.</p>
              </div>
            </div>
            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.25s" }}>
              <div className="step-num" aria-hidden="true">02</div>
              <div className="step-content">
                <h3>Share your intake link</h3>
                <p>Send one link to a new client. They fill a short form with their project details, budget, and deadline — no WhatsApp back-and-forth required.</p>
              </div>
            </div>
            <div className="step-card animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="step-num" aria-hidden="true">03</div>
              <div className="step-content">
                <h3>Approve and they're in</h3>
                <p>Review the submission, click Approve, and ATSYNC automatically sends your client an invite. They land in a clean portal showing their project, progress, and a direct line to you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURES SHOWCASE ════════════════════ */}
      <section className="showcase-section" id="features">
        <div className="showcase-inner">
          <div className="showcase-header animate-on-scroll">
            <span className="section-label">WHAT YOU GET</span>
            <h2>Everything your agency needs.<br /><span className="gradient-text">Nothing you don't.</span></h2>
            <p className="showcase-sub">Built specifically for African creative agencies managing client relationships.</p>
          </div>
          <div className="showcase-grid">
            {[
              { icon: "⚡", title: "Instant client portals", desc: "Every approved client gets their own portal showing their project phase, progress bar, revision count, and invoice status — updated in real time." },
              { icon: "💬", title: "Real-time messaging", desc: "A dedicated chat channel between you and each client. No group chats, no crossed wires. Messages arrive instantly on both sides." },
              { icon: "📋", title: "Intake management", desc: "New leads fill your intake form and land in a submissions queue. Approve with one click and the invite goes out automatically." },
              { icon: "✅", title: "Approval flows", desc: "Send deliverables for client sign-off directly from the dashboard. Clients approve or request changes in one tap — all tracked with a paper trail." },
              { icon: "🔁", title: "Revision tracking", desc: "Set revision limits per project. ATSYNC tracks how many have been used and flags scope creep so you never work for free again." },
              { icon: "🔒", title: "Full data isolation", desc: "Each client only ever sees their own portal. No client can see another's project, messages, or data — complete privacy by default." },
            ].map((card, i) => (
              <div key={i} className="showcase-card animate-on-scroll" style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className="showcase-icon">{card.icon}</div>
                <div className="showcase-card-title">{card.title}</div>
                <div className="showcase-card-desc">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ PRICING ════════════════════ */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-header animate-on-scroll">
            <span className="section-label">PRICING</span>
            <h2>Scale your <span className="gradient-text">operations.</span></h2>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card animate-on-scroll" style={{ transitionDelay: "0.1s" }}>
              <div className="plan-name">Starter</div>
              <div className="plan-desc">For small freelancers.</div>
              <div className="plan-price">Free</div>
              <ul className="plan-features">
                <li><CheckIcon />Client portal access</li>
                <li><CheckIcon />Real-time messaging</li>
                <li><CheckIcon />Up to 3 active clients</li>
              </ul>
              <button className="plan-btn" onClick={() => setShowLogin(true)}>Get Started</button>
            </div>
            <div className="pricing-card pricing-card--pro animate-on-scroll" style={{ transitionDelay: "0.25s" }}>
              <div className="popular-badge">POPULAR</div>
              <div className="plan-name">Pro</div>
              <div className="plan-desc">For growing agencies.</div>
              <div className="plan-price">$29<span>/mo</span></div>
              <ul className="plan-features">
                <li><CheckIcon />Unlimited clients</li>
                <li><CheckIcon />AI onboarding (Bob)</li>
                <li><CheckIcon />Approval flows</li>
                <li><CheckIcon />Custom branding</li>
              </ul>
              <button className="plan-btn plan-btn--pro">Coming Soon</button>
            </div>
            <div className="pricing-card animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="plan-name">Enterprise</div>
              <div className="plan-desc">For large creative studios.</div>
              <div className="plan-price">Custom</div>
              <ul className="plan-features">
                <li><CheckIcon />Everything in Pro</li>
                <li><CheckIcon />Dedicated account manager</li>
                <li><CheckIcon />Custom integrations</li>
              </ul>
              <button className="plan-btn">Contact Us</button>
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
            <p>Everything you need to know about ATSYNC.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <div className="faq-toggle" aria-hidden="true">{openFaq === index ? "−" : "+"}</div>
                </div>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>
          <div className="faq-cta animate-on-scroll">
            <h3>Still have questions?</h3>
            <p>Talk to us directly. We respond within 24 hours.</p>
            <button className="contact-btn" onClick={() => setShowContactModal(true)}>Contact Us</button>
          </div>
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ════════════════════ */}
      <section className="final-cta-section">
        <div className="final-cta-inner animate-on-scroll">
          <div className="final-cta-badge">Free to start · No credit card required</div>
          <h2 className="final-cta-headline">
            Ready to stop managing<br />
            <span className="gradient-text">clients on WhatsApp?</span>
          </h2>
          <p className="final-cta-sub">
            Create your agency account in under 2 minutes and share your first intake link today.
          </p>
          <div className="final-cta-btns">
            <button className="cta-primary" onClick={() => setShowLogin(true)}><span>Create free account</span></button>
            <button className="cta-secondary" onClick={() => setShowWaitlist(true)}>Join waitlist instead</button>
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
                The client management platform for African creative agencies. One link. One dashboard. Zero WhatsApp chaos.
              </p>
              <div className="social-icons">
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="#" className="social-link" aria-label="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                </a>
                <a href="#" className="social-link" aria-label="X (Twitter)">
                  <svg width="18" height="18" viewBox="0 2 24 24" fill="currentColor" stroke="none"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
              </div>
            </div>
            <div className="footer-links">
              <div className="link-column">
                <h4>PRODUCT</h4>
                <ul>
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setShowLogin(true); }}>Login</a></li>
                </ul>
              </div>
              <div className="link-column">
                <h4>COMPANY</h4>
                <ul>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setShowContactModal(true); }}>Contact Us</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 ATSYNC. All rights reserved.</p>
            <p>Built with purpose in <span className="cyan-text">Ibadan, Nigeria <span className="ng-badge">NG</span></span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
