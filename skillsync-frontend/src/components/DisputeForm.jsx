import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const DISPUTE_REASONS = [
  { value: "mentor_no_show", label: "Mentor never joined", icon: "👻" },
  { value: "early_exit", label: "Mentor left too early", icon: "🏃" },
  { value: "unhelpful_session", label: "Session was not helpful", icon: "😕" },
  { value: "technical_issues", label: "Technical problems", icon: "🔧" },
  { value: "other", label: "Other reason", icon: "📝" },
];

export default function DisputeForm({
  sessionId,
  sessionTopic,
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await axios.post(`/api/disputes/${sessionId}`, { reason, description });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to raise dispute. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
          * { font-family: 'DM Sans', sans-serif; }
          .sora { font-family: 'Sora', sans-serif; }
          .reason-card { transition: all 0.15s ease; border: 1.5px solid #e5e7eb; cursor: pointer; }
          .reason-card:hover { border-color: #1a73e8; background: #eff6ff; }
          .reason-card.selected { border-color: #1a73e8; background: #eff6ff; }
          .btn-danger { background: #ef4444; transition: all 0.2s ease; }
          .btn-danger:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }
          .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="sora text-lg font-bold text-gray-900">
              Report Session
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
              {sessionTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all"
          >
            ×
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-3 mb-5">
          <span className="text-amber-500 flex-shrink-0">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Disputes are reviewed by our admin team within 24 hours. False
            disputes may result in account suspension.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reason selection */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Select a reason <span className="text-red-400">*</span>
          </p>
          <div className="space-y-2 mb-4">
            {DISPUTE_REASONS.map((r) => (
              <div
                key={r.value}
                onClick={() => {
                  setReason(r.value);
                  setError("");
                }}
                className={`reason-card rounded-2xl px-4 py-3 flex items-center gap-3 ${reason === r.value ? "selected" : ""}`}
              >
                <span className="text-lg">{r.icon}</span>
                <span
                  className={`text-sm font-medium ${reason === r.value ? "text-blue-700" : "text-gray-700"}`}
                >
                  {r.label}
                </span>
                <div
                  className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${reason === r.value ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                >
                  {reason === r.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what happened during the session..."
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-gray-200 text-gray-900 text-sm placeholder-gray-400 resize-none outline-none focus:border-blue-400 transition-all"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {description.length}/500
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2 mb-4">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="btn-danger flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
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
                  Submitting...
                </span>
              ) : (
                "Submit Dispute"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
