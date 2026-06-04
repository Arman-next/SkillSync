import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes", note: "Quick focused session" },
  { value: 60, label: "1 hour", note: "Most popular" },
  { value: 90, label: "1.5 hours", note: "Deep dive session" },
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Get date 30 days from now
const getMaxDateString = () => {
  const max = new Date();
  max.setDate(max.getDate() + 30);
  return max.toISOString().split("T")[0];
};

// Format date nicely: "Monday, 25 Dec 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function BookSession() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [mentorLoading, setMentorLoading] = useState(true);

  const [formData, setFormData] = useState({
    topic: "",
    learningGoal: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: details, 2: confirm

  // Fetch mentor info
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await axios.get(`/api/mentor/public/${mentorId}`);
        setMentor(res.data);
      } catch {
        navigate("/student/browse");
      } finally {
        setMentorLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Calculate total amount
  const calculateAmount = () => {
    if (!mentor) return 0;
    return Math.round((mentor.hourlyRate / 60) * formData.duration);
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (
      !formData.topic ||
      !formData.learningGoal ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      setError("Please fill all fields before proceeding.");
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/sessions/book", {
        mentorId,
        ...formData,
        duration: Number(formData.duration),
      });

      // Navigate to payment page with session ID
      navigate(`/student/payment/${res.data.session._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (mentorLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const avatarColor =
    AVATAR_COLORS[mentor?.userId?.name?.length % AVATAR_COLORS.length] ||
    "bg-blue-500";
  const totalAmount = calculateAmount();

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .input-field { transition: all 0.2s ease; border: 1.5px solid #e5e7eb; }
        .input-field:focus { border-color: #1a73e8; box-shadow: 0 0 0 4px rgba(26,115,232,0.08); outline: none; }
        .btn-primary { background: #1a73e8; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { background: #1557b0; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26,115,232,0.3); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .time-slot { transition: all 0.15s ease; border: 1.5px solid #e5e7eb; }
        .time-slot:hover { border-color: #1a73e8; background: #eff6ff; }
        .time-slot.selected { border-color: #1a73e8; background: #1a73e8; color: white; }
        .duration-card { transition: all 0.15s ease; border: 1.5px solid #e5e7eb; cursor: pointer; }
        .duration-card:hover { border-color: #1a73e8; }
        .duration-card.selected { border-color: #1a73e8; background: #eff6ff; }
        .step-fade { animation: stepFade 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes stepFade {
          from { opacity: 0; transform: translateX(15px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() =>
            step === 2 ? setStep(1) : navigate(`/student/mentor/${mentorId}`)
          }
          className="w-8 h-8 rounded-xl bg-[#f5f5f7] border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
        >
          ←
        </button>
        <button
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full ${i === 0 ? "bg-blue-200" : "bg-white"}`}
                />
              ))}
            </div>
          </div>
          <span className="sora text-base font-semibold text-gray-900">
            SkillSync
          </span>
        </button>
        <span className="text-sm text-gray-400 ml-2">/ Book Session</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress bar */}
        <div className="card-animate flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-blue-500" />
          <div
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}
          />
          <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* Mentor summary card — always visible */}
        <div className="card-animate bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-lg sora flex-shrink-0`}
          >
            {mentor?.userId?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="sora font-semibold text-gray-900 text-sm">
              {mentor?.userId?.name}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {mentor?.skills?.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="sora font-bold text-gray-900">
              ₹{mentor?.hourlyRate}
            </p>
            <p className="text-xs text-gray-400">/hr</p>
          </div>
        </div>

        {/* STEP 1 — Booking Form */}
        {step === 1 && (
          <form
            onSubmit={handleProceedToConfirm}
            className="step-fade space-y-5"
          >
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <span className="text-red-400">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Topic */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                What do you want to learn?{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g. React hooks, System Design basics, Python for ML..."
                required
                className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
              />
            </div>

            {/* Learning Goal */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Learning Goal <span className="text-red-400">*</span>
              </label>
              <textarea
                name="learningGoal"
                value={formData.learningGoal}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what you want to achieve from this session. The more specific, the better your AI summary will be."
                required
                className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 This is used by our AI to generate your post-session summary
              </p>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Session Duration <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DURATION_OPTIONS.map((opt) => {
                  const price = Math.round(
                    (mentor?.hourlyRate / 60) * opt.value,
                  );
                  return (
                    <div
                      key={opt.value}
                      onClick={() =>
                        setFormData({ ...formData, duration: opt.value })
                      }
                      className={`duration-card rounded-2xl p-4 text-center ${formData.duration === opt.value ? "selected" : "bg-[#f5f5f7]"}`}
                    >
                      <p
                        className={`sora font-bold text-sm ${formData.duration === opt.value ? "text-blue-700" : "text-gray-900"}`}
                      >
                        {opt.label}
                      </p>
                      <p
                        className={`text-xs mt-1 ${formData.duration === opt.value ? "text-blue-500" : "text-gray-400"}`}
                      >
                        {opt.note}
                      </p>
                      <p
                        className={`sora font-semibold text-sm mt-2 ${formData.duration === opt.value ? "text-blue-700" : "text-gray-600"}`}
                      >
                        ₹{price}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Select Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={getTodayString()}
                max={getMaxDateString()}
                required
                className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm"
              />
              {formData.scheduledDate && (
                <p className="text-xs text-blue-500 mt-2">
                  📅 {formatDate(formData.scheduledDate)}
                </p>
              )}
            </div>

            {/* Time slots */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Select Time <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, scheduledTime: time })
                    }
                    className={`time-slot py-2.5 rounded-xl text-sm font-medium ${formData.scheduledTime === time ? "selected" : "bg-[#f5f5f7] text-gray-600"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                All times are in IST (Indian Standard Time)
              </p>
            </div>

            {/* Total */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Amount
                </p>
                <p className="text-xs text-blue-400">
                  ₹{mentor?.hourlyRate}/hr × {formData.duration} min
                </p>
              </div>
              <p className="sora text-2xl font-bold text-blue-700">
                ₹{totalAmount}
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-white font-semibold py-4 rounded-2xl text-sm"
            >
              Review Booking →
            </button>
          </form>
        )}

        {/* STEP 2 — Confirm */}
        {step === 2 && (
          <div className="step-fade space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="sora font-bold text-gray-900 text-lg mb-5">
                Confirm your booking
              </h2>

              <div className="space-y-4">
                {[
                  { label: "Mentor", value: mentor?.userId?.name },
                  { label: "Topic", value: formData.topic },
                  { label: "Learning Goal", value: formData.learningGoal },
                  { label: "Date", value: formatDate(formData.scheduledDate) },
                  { label: "Time", value: `${formData.scheduledTime} IST` },
                  { label: "Duration", value: `${formData.duration} minutes` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0 w-28">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-800 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-5 bg-blue-50 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    Total to Pay
                  </p>
                  <p className="text-xs text-blue-400">Secured by Razorpay</p>
                </div>
                <p className="sora text-2xl font-bold text-blue-700">
                  ₹{totalAmount}
                </p>
              </div>
            </div>

            {/* Protection note */}
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <span className="text-emerald-500 mt-0.5">🛡️</span>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Your payment is held securely. If the mentor doesn't show up or
                the session is unsatisfactory, you can raise a dispute within 24
                hours and get a full refund.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <span className="text-red-400">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="btn-primary w-full text-white font-semibold py-4 rounded-2xl text-sm"
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
                  Confirming...
                </span>
              ) : (
                "Confirm & Proceed to Payment →"
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Edit booking details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
