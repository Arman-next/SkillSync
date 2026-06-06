import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

export default function PaymentPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/${sessionId}`);
        // Redirect if already paid
        if (res.data.status !== "pending_payment") {
          navigate("/student/dashboard");
          return;
        }
        setSession(res.data);
      } catch (err) {
        setError("Session not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      // Step 1 — Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError(
          "Failed to load payment gateway. Check your internet connection.",
        );
        setPaymentLoading(false);
        return;
      }

      // Step 2 — Create order on backend
      const orderRes = await axios.post("/api/payment/create-order", {
        sessionId,
      });
      const { orderId, amount, currency } = orderRes.data;

      // Step 3 — Open Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "SkillSync",
        description: `Session: ${session?.topic}`,
        order_id: orderId,

        // Step 4 — On successful payment, verify on backend
        handler: async function (response) {
          try {
            await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              sessionId,
            });

            // Payment verified — show success state
            setSuccess(true);

            // Redirect to dashboard after 2.5 seconds
            setTimeout(() => {
              navigate("/student/dashboard");
            }, 2500);
          } catch (err) {
            setError(
              "Payment was deducted but verification failed. Please contact support.",
            );
          }
        },

        // Prefill student info
        prefill: {
          name: user?.name,
          email: user?.email,
        },

        theme: {
          color: "#1a73e8",
        },

        // On popup close without payment
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure inside popup
      rzp.on("payment.failed", function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment initiation failed. Please try again.",
      );
      setPaymentLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Payment Successful!
          </h2>
          <p className="text-sm text-gray-400 mb-1">
            Your session is now confirmed.
          </p>
          <p className="text-xs text-gray-300">Redirecting to dashboard...</p>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-1 bg-emerald-400 rounded-full"
              style={{ animation: "progressBar 2.5s linear forwards" }}
            />
          </div>
          <style>{`
            @keyframes progressBar {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ── Main payment page ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-pay { background: #1a73e8; transition: all 0.2s ease; }
        .btn-pay:hover:not(:disabled) {
          background: #1557b0;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(26,115,232,0.35);
        }
        .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate("/student/dashboard")}
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
        <span className="text-sm text-gray-400">/ Complete Payment</span>
      </nav>

      <div className="max-w-md mx-auto px-4 py-10">
        {/* Header */}
        <div className="card-animate mb-6 text-center">
          <h1 className="sora text-2xl font-bold text-gray-900">
            Complete Payment
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Confirm your booking by paying securely below
          </p>
        </div>

        {/* Session summary card */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Session Summary
          </p>
          <div className="space-y-3">
            {[
              { label: "Mentor", value: session?.mentorId?.name },
              { label: "Topic", value: session?.topic },
              { label: "Date", value: session?.scheduledDate },
              { label: "Time", value: `${session?.scheduledTime} IST` },
              { label: "Duration", value: `${session?.duration} minutes` },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">
                  {item.label}
                </span>
                <span className="text-sm text-gray-800 text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amount card */}
        <div className="card-animate bg-blue-500 rounded-3xl p-6 mb-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Total Amount
              </p>
              <p className="sora text-4xl font-bold">₹{session?.amount}</p>
              <p className="text-blue-200 text-xs mt-1">One-time session fee</p>
            </div>
            <div className="text-5xl opacity-20">💳</div>
          </div>
        </div>

        {/* Protection note */}
        <div className="card-animate flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-5">
          <span className="text-emerald-500 mt-0.5 flex-shrink-0">🛡️</span>
          <div>
            <p className="text-xs font-semibold text-emerald-700 mb-0.5">
              SkillSync Session Protection
            </p>
            <p className="text-xs text-emerald-600 leading-relaxed">
              Payment is held securely. If the mentor doesn't show up or the
              session is unsatisfactory, raise a dispute within 24 hours for a
              full refund.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card-animate flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-5">
            <span className="text-red-400 flex-shrink-0">⚠</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={paymentLoading}
          className="card-animate btn-pay w-full text-white font-semibold py-4 rounded-2xl text-base"
        >
          {paymentLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Opening payment...
            </span>
          ) : (
            `Pay ₹${session?.amount} Securely →`
          )}
        </button>

        {/* Razorpay trust badge */}
        <p className="text-center text-xs text-gray-300 mt-4">
          Secured by{" "}
          <span className="font-semibold text-gray-400">Razorpay</span> · UPI,
          Cards, NetBanking accepted
        </p>

        {/* Test mode notice */}
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-center">
          <p className="text-xs text-amber-600 font-medium">
            🧪 Test Mode Active
          </p>
          <p className="text-xs text-amber-500 mt-0.5">
            Use card:{" "}
            <span className="font-mono font-semibold">5267 3181 8797 5449</span>{" "}
            · Any future expiry · CVV: 123 · OTP: 1234
          </p>
        </div>
      </div>
    </div>
  );
}
