import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

export default function Login() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", formData);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === "student") navigate("/student/dashboard");
      else if (role === "mentor") navigate("/mentor/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
        .float-badge { animation: floatUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-white dot-bg p-12 border-r border-gray-100 relative overflow-hidden">
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

        {/* Center content */}
        <div className="left-animate">
          <h2 className="sora text-4xl font-bold text-gray-900 leading-tight mb-4">
            Your next breakthrough <br />
            <span className="text-gray-300">starts with a session</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Join thousands of students learning directly from verified industry
            professionals.
          </p>

          {/* Floating preview cards */}
          <div className="mt-10 space-y-3">
            {[
              {
                name: "Rahul M.",
                skill: "React & Node.js",
                rating: "4.9",
                color: "bg-blue-500",
                delay: "0.1s",
              },
              {
                name: "Priya S.",
                skill: "Machine Learning",
                rating: "4.8",
                color: "bg-violet-500",
                delay: "0.2s",
              },
              {
                name: "Arjun K.",
                skill: "System Design",
                rating: "5.0",
                color: "bg-emerald-500",
                delay: "0.3s",
              },
            ].map((mentor, i) => (
              <div
                key={i}
                className="float-badge flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 max-w-xs"
                style={{ animationDelay: mentor.delay }}
              >
                <div
                  className={`w-9 h-9 rounded-full ${mentor.color} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {mentor.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {mentor.name}
                  </p>
                  <p className="text-xs text-gray-400">{mentor.skill}</p>
                </div>
                <div className="text-xs font-medium text-amber-500">
                  ⭐ {mentor.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="left-animate">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-xs text-blue-600 font-medium">
              500+ verified mentors available right now
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
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
            <h1 className="sora text-2xl font-bold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Sign in to your account to continue
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
                <span className="text-red-400 text-sm">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
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
                    Signing in...
                  </span>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link to="/register">
              <button className="w-full py-3.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Create account
              </button>
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-500">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
