import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

const REASON_LABELS = {
  mentor_no_show: "Mentor Never Joined",
  early_exit: "Mentor Left Early",
  unhelpful_session: "Session Not Helpful",
  technical_issues: "Technical Issues",
  other: "Other",
};

const DECISION_OPTIONS = [
  {
    value: "full_refund",
    label: "Full Refund",
    color: "bg-emerald-500",
    desc: "Refund 100% to student",
  },
  {
    value: "partial_refund",
    label: "Partial Refund",
    color: "bg-amber-500",
    desc: "Refund partially to student",
  },
  {
    value: "dismissed",
    label: "Dismiss",
    color: "bg-gray-500",
    desc: "Release payment to mentor",
  },
];

export default function ManageDisputes() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { logout } = useAuth();

  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("open");
  const [resolving, setResolving] = useState(null); // dispute being resolved
  const [decision, setDecision] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [disputesRes, statsRes] = await Promise.all([
        axios.get(`/api/admin/disputes?status=${activeTab}`),
        axios.get("/api/admin/disputes/stats"),
      ]);
      setDisputes(disputesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId) => {
    if (!decision) {
      alert("Please select a decision");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/disputes/${disputeId}/resolve`, {
        adminDecision: decision,
        adminNote,
      });
      setResolving(null);
      setDecision("");
      setAdminNote("");
      setSuccessMsg("Dispute resolved successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve dispute");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Resolve modal */}
      {resolving && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="sora text-lg font-bold text-gray-900 mb-1">
              Resolve Dispute
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              {resolving.studentId?.name} vs {resolving.mentorId?.name} —{" "}
              {REASON_LABELS[resolving.reason]}
            </p>

            {/* Session evidence */}
            <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Session Evidence
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Topic", value: resolving.sessionId?.topic },
                  {
                    label: "Duration",
                    value: `${resolving.sessionId?.duration} min`,
                  },
                  {
                    label: "Duration vs Booked",
                    value: `${resolving.sessionId?.actualDuration || 0} min used / ${resolving.sessionId?.duration} min booked`,
                  },
                  {
                    label: "Mentor Messages",
                    value: resolving.sessionId?.mentorMessageCount ?? 0,
                  },
                  {
                    label: "Student Messages",
                    value: resolving.sessionId?.studentMessageCount ?? 0,
                  },
                  {
                    label: "Session Flag",
                    value: resolving.sessionId?.flag || "NONE",
                  },
                  { label: "Amount", value: `₹${resolving.sessionId?.amount}` },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-2">
                    <p className="text-gray-400">{item.label}</p>
                    <p className="font-semibold text-gray-800 truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              {resolving.description && (
                <div className="mt-3 bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Student's Description
                  </p>
                  <p className="text-xs text-gray-700">
                    {resolving.description}
                  </p>
                </div>
              )}
            </div>

            {/* Decision */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Your Decision
            </p>
            <div className="space-y-2 mb-4">
              {DECISION_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setDecision(opt.value)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    decision === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl ${opt.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {opt.value === "full_refund"
                      ? "↩"
                      : opt.value === "partial_refund"
                        ? "½"
                        : "✓"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                  <div
                    className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 ${
                      decision === opt.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {decision === opt.value && (
                      <div className="w-full h-full rounded-full scale-50 bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin note */}
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] border border-gray-200 text-sm text-gray-800 placeholder-gray-400 resize-none outline-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResolving(null);
                  setDecision("");
                  setAdminNote("");
                }}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolving._id)}
                disabled={!decision || actionLoading}
                className="flex-1 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-60 transition-all"
              >
                {actionLoading ? "Resolving..." : "Confirm Decision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
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
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
              Admin
            </span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card-animate mb-6">
          <h1 className="sora text-2xl font-bold text-gray-900">
            Dispute Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and resolve student disputes.
          </p>
        </div>

        {successMsg && (
          <div className="card-animate mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">
            <span>✅</span>
            <p className="text-sm font-medium text-emerald-700">{successMsg}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="card-animate grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Open",
                value: stats.open,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Resolved",
                value: stats.resolved,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Refunded",
                value: stats.refunded,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Dismissed",
                value: stats.dismissed,
                color: "text-gray-600",
                bg: "bg-gray-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${stat.bg} rounded-2xl p-4 border border-gray-100`}
              >
                <p className={`sora text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs + list */}
        <div className="card-animate bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["open", "resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/30"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "open" ? "⚠ Open Disputes" : "✅ Resolved"}
                {tab === "open" && stats?.open > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats.open}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">
                {activeTab === "open" ? "🎉" : "📭"}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === "open"
                  ? "No open disputes!"
                  : "No resolved disputes yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-lg">⚠️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="sora font-semibold text-gray-900 text-sm">
                          {dispute.studentId?.name}
                        </p>
                        <span className="text-xs text-gray-400">vs</span>
                        <p className="sora font-semibold text-gray-900 text-sm">
                          {dispute.mentorId?.name}
                        </p>
                        <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                          {REASON_LABELS[dispute.reason]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1 truncate">
                        Session: {dispute.sessionId?.topic}
                      </p>
                      {dispute.description && (
                        <p className="text-xs text-gray-400 italic">
                          "{dispute.description}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                        <span>💰 ₹{dispute.paymentId?.amount}</span>
                        <span>📅 {dispute.sessionId?.scheduledDate}</span>
                        <span>
                          💬 Mentor msgs:{" "}
                          {dispute.sessionId?.mentorMessageCount ?? 0}
                        </span>
                        {dispute.adminDecision && (
                          <span className="text-emerald-600 font-medium">
                            Decision: {dispute.adminDecision.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {activeTab === "open" && (
                      <button
                        onClick={() => setResolving(dispute)}
                        className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                      >
                        Resolve →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
