import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";
import DisputeForm from "../../components/DisputeForm";

const STATUS_CONFIG = {
  pending_payment: {
    label: "Awaiting Payment",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-400 border-gray-200",
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-50 text-red-500 border-red-100",
  },
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

// Check if session is within 24hr dispute window.
// For completed sessions, the window starts when the mentor ended the session.
const isDisputeWindowOpen = (session) => {
  const windowStart =
    session.status === "completed"
      ? new Date(session.updatedAt)
      : new Date(
          new Date(
            `${session.scheduledDate}T${session.scheduledTime}:00`,
          ).getTime() +
            session.duration * 60 * 1000,
        );

  const hoursSinceWindowStart = (new Date() - windowStart) / (1000 * 60 * 60);
  return hoursSinceWindowStart <= 24 && hoursSinceWindowStart >= 0;
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user, logout } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sessions");
  const [disputeSession, setDisputeSession] = useState(null); // session being disputed
  const [disputeSuccess, setDisputeSuccess] = useState(""); // success message
  const [disputedSessionIds, setDisputedSessionIds] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, summariesRes, disputesRes] = await Promise.all([
        axios.get("/api/sessions/student"),
        axios.get("/api/ai/summaries"),
        axios.get("/api/disputes/my/list"), // already exists
      ]);
      setSessions(sessionsRes.data);
      setSummaries(summariesRes.data);

      // Build a set of sessionIds that already have disputes
      const disputedIds = new Set(
        disputesRes.data.map((d) => d.sessionId?._id || d.sessionId),
      );
      setDisputedSessionIds(disputedIds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSuccess = () => {
    setDisputeSession(null);
    setDisputeSuccess(
      "Dispute raised successfully. Admin will review within 24 hours.",
    );
    fetchData(); // refresh sessions
    setTimeout(() => setDisputeSuccess(""), 5000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const upcomingSessions = sessions.filter((s) => s.status === "confirmed");
  const pendingSessions = sessions.filter(
    (s) => s.status === "pending_payment",
  );
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .session-card { transition: all 0.2s ease; }
        .session-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.07); }
        .btn-primary { background: #1a73e8; transition: all 0.2s ease; }
        .btn-primary:hover { background: #1557b0; }
      `}</style>

      {/* Dispute form modal */}
      {disputeSession && (
        <DisputeForm
          sessionId={disputeSession._id}
          sessionTopic={disputeSession.topic}
          onClose={() => setDisputeSession(null)}
          onSuccess={handleDisputeSuccess}
        />
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/student/browse")}
            className="btn-primary text-white text-xs font-medium px-4 py-2 rounded-xl cursor-pointer"
          >
            + Find Mentor
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 hidden md:block">
              {user?.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="card-animate mb-6">
          <h1 className="sora text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
        </div>

        {/* Dispute success banner */}
        {disputeSuccess && (
          <div className="card-animate mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-emerald-700">
              {disputeSuccess}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="card-animate grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              icon: "📅",
              label: "Upcoming",
              value: upcomingSessions.length,
              color: "text-blue-600",
            },
            {
              icon: "⏳",
              label: "Unpaid",
              value: pendingSessions.length,
              color: "text-amber-600",
            },
            {
              icon: "✅",
              label: "Completed",
              value: completedSessions.length,
              color: "text-emerald-600",
            },
            {
              icon: "🤖",
              label: "AI Summaries",
              value: summaries.length,
              color: "text-violet-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className={`sora text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending payment alert */}
        {pendingSessions.length > 0 && (
          <div className="card-animate mb-5 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <span className="text-xl">💳</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700">
                {pendingSessions.length} session
                {pendingSessions.length > 1 ? "s" : ""} awaiting payment
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/student/payment/${pendingSessions[0]._id}`)
              }
              className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-xl transition-all"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="card-animate bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-50">
            {[
              { key: "sessions", label: "Sessions", count: sessions.length },
              {
                key: "summaries",
                label: "🤖 AI Summaries",
                count: summaries.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/30"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Sessions tab */}
              {activeTab === "sessions" &&
                (sessions.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-medium text-gray-700 mb-1">
                      No sessions yet
                    </p>
                    <button
                      onClick={() => navigate("/student/browse")}
                      className="btn-primary text-white text-sm font-medium px-6 py-3 rounded-2xl mt-4 cursor-pointer"
                    >
                      Browse Mentors →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sessions.map((session, i) => {
                      const statusCfg =
                        STATUS_CONFIG[session.status] ||
                        STATUS_CONFIG.cancelled;
                      const avatarColor =
                        AVATAR_COLORS[i % AVATAR_COLORS.length];
                      const mentorName = session.mentorId?.name || "Mentor";
                      const canDispute =
                        ["completed", "confirmed"].includes(session.status) &&
                        isDisputeWindowOpen(session) &&
                        !disputedSessionIds.has(session._id);

                      return (
                        <div
                          key={session._id}
                          className="session-card px-6 py-4 flex items-start gap-4"
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-sm sora shrink-0`}
                          >
                            {mentorName[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="sora font-semibold text-gray-900 text-sm">
                                {mentorName}
                              </p>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}
                              >
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 truncate">
                              {session.topic}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                              <span>📅 {session.scheduledDate}</span>
                              <span>🕐 {session.scheduledTime}</span>
                              <span>⏱ {session.duration} min</span>
                            </div>
                            {/* Dispute window notice */}
                            {canDispute && (
                              <p className="text-xs text-amber-500 mt-1">
                                ⏰ Dispute window open — closes 24hrs after
                                session ended
                              </p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="sora font-bold text-gray-900 text-sm">
                              ₹{session.amount}
                            </p>

                            {session.status === "pending_payment" && (
                              <button
                                onClick={() =>
                                  navigate(`/student/payment/${session._id}`)
                                }
                                className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-xl font-medium cursor-pointer"
                              >
                                Pay Now
                              </button>
                            )}
                            {session.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  navigate(`/student/session/${session._id}`)
                                }
                                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-xl font-medium cursor-pointer"
                              >
                                Join →
                              </button>
                            )}
                            {session.status === "completed" && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(`/student/summary/${session._id}`)
                                  }
                                  className="text-xs bg-violet-500 hover:bg-violet-600 text-white px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer"
                                >
                                  🤖 AI Summary
                                </button>
                              </>
                            )}
                            {canDispute && (
                              <button
                                onClick={() => setDisputeSession(session)}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer"
                              >
                                ⚠ Report
                              </button>
                            )}
                            {session.status === "disputed" && (
                              <span className="text-xs text-red-500 font-medium">
                                Under Review
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {/* AI Summaries tab */}
              {activeTab === "summaries" &&
                (summaries.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <p className="text-4xl mb-3">🤖</p>
                    <p className="font-medium text-gray-700 mb-1">
                      No AI summaries yet
                    </p>
                    <p className="text-sm text-gray-400">
                      Summaries are generated after sessions are completed
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {summaries.map((summary) => (
                      <div
                        key={summary._id}
                        className="session-card px-6 py-4 cursor-pointer"
                        onClick={() =>
                          navigate(`/student/summary/${summary.sessionId?._id}`)
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-lg">🤖</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="sora font-semibold text-gray-900 text-sm mb-0.5">
                              {summary.sessionId?.topic || summary.topic}
                            </p>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {summary.summaryText}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {summary.actionItems
                                ?.slice(0, 2)
                                .map((item, j) => (
                                  <span
                                    key={j}
                                    className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg"
                                  >
                                    ✅ {item.slice(0, 40)}...
                                  </span>
                                ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-300 shrink-0">
                            {new Date(summary.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
