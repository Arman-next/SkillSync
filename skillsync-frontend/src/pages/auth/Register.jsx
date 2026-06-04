import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

export default function Register() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // step 1: role select, step 2: fill form
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });
      login(res.data.user, res.data.token);
      if (role === "student") navigate("/student/dashboard");
      else if (role === "mentor") navigate("/mentor/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: "student",
      icon: "🎓",
      title: "I'm a Student",
      desc: "Find verified mentors, book sessions, and accelerate your learning.",
      color: "border-blue-200 bg-blue-50 hover:border-blue-400",
      selectedColor: "border-blue-500 bg-blue-50 ring-4 ring-blue-100",
      badge: "Most popular",
      badgeColor: "bg-blue-500",
    },
    {
      role: "mentor",
      icon: "🧑‍💻",
      title: "I'm a Mentor",
      desc: "Share your expertise, earn per session, and help others grow.",
      color: "border-violet-200 bg-violet-50 hover:border-violet-400",
      selectedColor: "border-violet-500 bg-violet-50 ring-4 ring-violet-100",
      badge: "Earn money",
      badgeColor: "bg-violet-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .dot-bg {
          background-image: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .input-field {
          transition: all 0.2s ease;
          border: 1.5px solid #e5e7eb;
        }
        .input-field:focus {
          border-color: #1a73e8;
          box-shadow: 0 0 0 4px rgba(26,115,232,0.08);
          outline: none;
        }
        .btn-primary {
          background: #1a73e8;
          transition: all 0.2s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1557b0;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26,115,232,0.3);
        }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .card-animate { animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .left-animate { animation: slideRight 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .role-card {
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid;
        }
        .role-card:hover { transform: translateY(-3px); }
        .step-fade { animation: stepFade 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes stepFade {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .password-strength { transition: width 0.3s ease; }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-white dot-bg p-12 border-r border-gray-100">
        {/* Logo */}
        <button
          onClick={goHome}
          className="left-animate flex items-center gap-2 cursor-pointer"
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
          <span className="sora text-lg font-semibold text-gray-900">
            SkillSync
          </span>
        </button>

        <div className="left-animate">
          <h2 className="sora text-4xl font-bold text-gray-900 leading-tight mb-4">
            Join the smartest <br />
            <span className="text-gray-300">learning community</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
            Whether you want to learn or teach, SkillSync is the platform built
            for real results.
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {[
              { icon: "✅", text: "100% verified mentor profiles" },
              { icon: "🤖", text: "AI-powered session summaries" },
              { icon: "🛡️", text: "Money-back guarantee on sessions" },
              { icon: "📅", text: "Flexible scheduling, any timezone" },
              { icon: "🎥", text: "Built-in HD video sessions" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="left-animate">
          <div className="bg-[#f5f5f7] rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-3 font-medium">
              Trusted by students from
            </p>
            <div className="flex gap-2 flex-wrap">
              {["IIT", "NIT", "BITS", "VIT", "Kalyani Univ"].map((uni) => (
                <span
                  key={uni}
                  className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1 text-gray-600 font-medium"
                >
                  {uni}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card-animate w-full max-w-md">
          {/* Mobile logo */}
          <button
            onClick={goHome}
            className="lg:hidden flex items-center gap-2 mb-8 justify-center cursor-pointer mx-auto"
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
            <span className="sora text-lg font-semibold text-gray-900">
              SkillSync
            </span>
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-blue-500" : "bg-gray-100"}`}
              />
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-blue-500" : "bg-gray-100"}`}
              />
            </div>

            {/* STEP 1 — Role Selection */}
            {step === 1 && (
              <div className="step-fade">
                <h1 className="sora text-2xl font-bold text-gray-900 mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  First, tell us who you are
                </p>

                <div className="space-y-3">
                  {roleCards.map((card) => (
                    <div
                      key={card.role}
                      onClick={() => handleRoleSelect(card.role)}
                      className={`role-card rounded-2xl p-5 relative ${role === card.role ? card.selectedColor : card.color}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{card.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 sora">
                              {card.title}
                            </h3>
                            <span
                              className={`text-xs text-white px-2 py-0.5 rounded-full ${card.badgeColor}`}
                            >
                              {card.badge}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{card.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${role === card.role ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                        >
                          {role === card.role && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Fill Form */}
            {step === 2 && (
              <div className="step-fade">
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={() => setStep(1)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="sora text-xl font-bold text-gray-900">
                      {role === "student" ? "Student" : "Mentor"} Registration
                    </h1>
                    <p className="text-xs text-gray-400">
                      Fill in your details below
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
                    <span className="text-red-400 text-sm">⚠</span>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Arman Khan"
                      required
                      className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        required
                        className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`password-strength h-1 rounded-full ${
                              formData.password.length < 6
                                ? "bg-red-400 w-1/3"
                                : formData.password.length < 10
                                  ? "bg-amber-400 w-2/3"
                                  : "bg-emerald-400 w-full"
                            }`}
                          />
                        </div>
                        <p className="text-xs mt-1 text-gray-400">
                          {formData.password.length < 6
                            ? "Weak"
                            : formData.password.length < 10
                              ? "Good"
                              : "Strong"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      required
                      className={`input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400 ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  {/* Mentor note */}
                  {role === "mentor" && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl p-3">
                      <span className="text-amber-500 text-sm mt-0.5">ℹ</span>
                      <p className="text-xs text-amber-700">
                        After registering, you'll need to complete your profile
                        with your portfolio/LinkedIn link. Admin will review and
                        verify your account before it goes live.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (formData.confirmPassword &&
                        formData.password !== formData.confirmPassword)
                    }
                    className="btn-primary w-full text-white font-semibold py-3.5 rounded-2xl text-sm mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      `Create ${role} account →`
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Sign in link */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link to="/login">
              <button className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Sign in instead
              </button>
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By registering, you agree to our{" "}
            <a href="#" className="text-blue-500">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
