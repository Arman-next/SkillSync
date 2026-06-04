import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useHomeNavigate from "../hooks/useHomeNavigate";

const floatingCards = [
  {
    id: 1,
    style: "top-[12%] left-[4%]",
    content: (
      <div className="bg-yellow-100 rounded-2xl p-4 w-52 shadow-lg rotate-3deg">
        <div className="w-3 h-3 rounded-full bg-red-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 leading-snug">
          Find expert mentors, <br /> grow your skills faster <br /> than ever
          before.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    style: "top-[11%] right-[3%]",
    content: (
      <div className="bg-white rounded-2xl p-4 w-56 shadow-xl border border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Next Session
        </p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            R
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              React Deep Dive
            </p>
            <p className="text-xs text-gray-400">Today · 3:00 PM</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-gray-100">
          <div className="h-1.5 w-2/3 rounded-full bg-blue-500" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    style: "bottom-[24%] left-[3%]",
    content: (
      <div className="bg-white rounded-2xl p-4 w-60 shadow-xl border border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Top Mentors
        </p>
        {["Python & ML", "React & Node", "System Design"].map((skill, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${["bg-violet-500", "bg-blue-500", "bg-emerald-500"][i]}`}
            >
              {["A", "B", "C"][i]}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {skill}
                </span>
                <span className="text-xs text-gray-400">
                  ⭐ {[4.9, 4.8, 4.7][i]}
                </span>
              </div>
              <div className="h-1 mt-1 rounded-full bg-gray-100">
                <div
                  className={`h-1 rounded-full ${["bg-violet-400", "bg-blue-400", "bg-emerald-400"][i]}`}
                  style={{ width: `${[92, 85, 78][i]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    style: "bottom-[24%] right-[3%]",
    content: (
      <div className="bg-white rounded-2xl p-4 w-52 shadow-xl border border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          AI Summary
        </p>
        <div className="space-y-1.5">
          {[
            "Understood hooks deeply",
            "Practice useEffect daily",
            "Review React docs",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <p className="text-xs text-gray-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const stats = [
  { value: "500+", label: "Verified Mentors" },
  { value: "10K+", label: "Sessions Completed" },
  { value: "4.9★", label: "Average Rating" },
  { value: "98%", label: "Student Satisfaction" },
];

const features = [
  {
    icon: "🎯",
    title: "Verified Mentors",
    desc: "Every mentor is reviewed by our admin team. Portfolio and LinkedIn verified before approval.",
  },
  {
    icon: "🤖",
    title: "AI Session Summaries",
    desc: "After every session, our AI generates a personalized summary with action items just for you.",
  },
  {
    icon: "🛡️",
    title: "Session Protection",
    desc: "Pay safely. If your mentor doesn't show up, our dispute system ensures you get a full refund.",
  },
  {
    icon: "🎥",
    title: "Built-in Video Calls",
    desc: "No third-party apps needed. Join your session directly from your dashboard with one click.",
  },
  {
    icon: "📅",
    title: "Easy Scheduling",
    desc: "Book sessions at your preferred time. Get reminders before every session automatically.",
  },
  {
    icon: "💬",
    title: "Session Messaging",
    desc: "Chat with your mentor before and after the session. Keep all communication in one place.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const heroRef = useRef(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const cards = document.querySelectorAll(".float-card");
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.15}s`;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .hero-title { font-family: 'Sora', sans-serif; }
        .float-card { animation: floatUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hero-text { animation: fadeSlide 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dot-bg {
          background-image: radial-gradient(circle, #c8c8c8 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .btn-primary {
          background: #1a73e8;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #1557b0;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26,115,232,0.35);
        }
        .btn-secondary {
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: #f0f0f0;
          transform: translateY(-1px);
        }
        .stat-card { animation: fadeSlide 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .feature-card { transition: all 0.25s ease; }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.08); }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-blue-200" : "bg-white"}`}
                />
              ))}
            </div>
          </div>
          <span
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "'Sora',sans-serif" }}
          >
            SkillSync
          </span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", action: () => scrollToSection("features") },
            {
              label: "How it works",
              action: () => scrollToSection("how-it-works"),
            },
            { label: "Pricing", action: () => scrollToSection("pricing") },
            {
              label: "For Mentors",
              action: () => navigate("/register?role=mentor"),
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="btn-secondary text-sm font-medium text-gray-700 px-4 py-2 rounded-xl cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn-primary text-sm font-medium text-white px-5 py-2 rounded-xl cursor-pointer"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen dot-bg flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden"
      >
        {/* Floating cards */}
        {floatingCards.map((card) => (
          <div
            key={card.id}
            className={`float-card absolute hidden lg:block ${card.style}`}
          >
            {card.content}
          </div>
        ))}

        {/* Logo mark */}
        <div className="float-card w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === 0 ? "bg-blue-200" : "bg-white"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="hero-text text-center px-4 max-w-3xl">
          <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            Learn from the best,
          </h1>
          <h1 className="hero-title text-5xl md:text-7xl font-bold text-gray-300 leading-tight tracking-tight">
            one session at a time
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Book one-on-one sessions with verified mentors. Pay safely, learn
            deeply, and get AI-powered insights after every session.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="btn-primary text-white font-semibold px-8 py-3.5 rounded-2xl text-base"
            >
              Find a mentor →
            </button>
            <button
              onClick={() => navigate("/register?role=mentor")}
              className="btn-secondary bg-white text-gray-700 font-medium px-8 py-3.5 rounded-2xl text-base border border-gray-200"
            >
              Become a mentor
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero-text mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 px-4 w-full max-w-3xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-card bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover-lift"
            >
              <p
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">
              Why SkillSync
            </p>
            <h2 className="hero-title text-4xl md:text-5xl font-bold text-gray-900">
              Everything you need to <br />
              <span className="text-gray-300">grow faster</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card bg-[#f5f5f7] rounded-2xl p-6 border border-gray-100"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3
                  className="font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: "'Sora',sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-24 py-24 px-4 bg-[#f5f5f7] dot-bg"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="hero-title text-4xl md:text-5xl font-bold text-gray-900 mb-16">
            Up and running <br />
            <span className="text-gray-300">in minutes</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up as a student or mentor in under 2 minutes.",
              },
              {
                step: "02",
                title: "Find & book",
                desc: "Browse verified mentors, pick a time, and pay securely.",
              },
              {
                step: "03",
                title: "Learn & grow",
                desc: "Join your session and get an AI summary of everything you learned.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift text-left"
              >
                <p
                  className="text-5xl font-bold text-gray-100 mb-4"
                  style={{ fontFamily: "'Sora',sans-serif" }}
                >
                  {item.step}
                </p>
                <h3
                  className="font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: "'Sora',sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="hero-title text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pay only for the <br />
            <span className="text-gray-300">sessions you book</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-10">
            Mentors set their hourly rate. SkillSync holds payment during the
            dispute window and releases it only when the session is clear.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {[
              {
                title: "No subscription",
                desc: "Students pay per session based on the mentor's rate and selected duration.",
              },
              {
                title: "Protected payments",
                desc: "Payments stay captured while the 24-hour dispute window is open.",
              },
              {
                title: "Mentor earnings",
                desc: "Mentors earn after completed sessions are released without refund disputes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="hover-lift rounded-2xl border border-gray-100 bg-[#f5f5f7] p-6"
              >
                <h3
                  className="font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: "'Sora',sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#f5f5f7] dot-bg rounded-3xl p-12 border border-gray-100">
            <h2 className="hero-title text-4xl font-bold text-gray-900 mb-4">
              Ready to grow?
            </h2>
            <p className="text-gray-500 mb-8">
              Join thousands of students already learning with SkillSync.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary text-white font-semibold px-10 py-4 rounded-2xl text-base"
            >
              Get started for free →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-white pt-14 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                SkillSync
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed">
                Connecting students with experienced mentors through one-on-one
                learning sessions, project guidance, interview preparation and
                career growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Find Mentors</li>
                <li>Book Sessions</li>
                <li>AI Session Summary</li>
                <li>Secure Payments</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li
                  className="cursor-pointer hover:text-white"
                  onClick={() => scrollToSection("features")}
                >
                  Features
                </li>

                <li
                  className="cursor-pointer hover:text-white"
                  onClick={() => scrollToSection("pricing")}
                >
                  Pricing
                </li>

                <li
                  className="cursor-pointer hover:text-white"
                  onClick={() => navigate("/login")}
                >
                  Login
                </li>

                <li
                  className="cursor-pointer hover:text-white"
                  onClick={() => navigate("/register")}
                >
                  Register
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>

              <div className="space-y-2 text-slate-400 text-sm">
                <p>Admin Email</p>
                <p className="text-white">admin@gmail.com</p>

                <p className="mt-4">Final Year MCA Project</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 SkillSync. All rights reserved.
            </p>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="text-sm text-slate-300 hover:text-white"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
