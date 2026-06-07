import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import StarRating from "../../components/StarRating";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

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

export default function MentorDashboard() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes] = await Promise.all([
          axios.get("/api/mentor/profile"),
          axios.get("/api/sessions/mentor"),
        ]);
        setProfile(profileRes.data);
        setSessions(sessionsRes.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmedSessions = sessions.filter((s) => s.status === "confirmed");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const releasedSessions = sessions.filter(
    (s) => s.paymentStatus === "released",
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .session-row { transition: all 0.2s ease; }
        .session-row:hover { background: #f9fafb; }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/mentor/profile/edit")}
            className="text-sm text-blue-500 font-medium"
          >
            Edit Profile
          </button>
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700"
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

        {/* Verification status */}
        {profile && (
          <div
            className={`card-animate flex items-center gap-3 rounded-2xl px-5 py-4 border mb-5 ${
              profile.isVerified
                ? "bg-emerald-50 border-emerald-100"
                : "bg-amber-50 border-amber-100"
            }`}
          >
            <span className="text-xl">{profile.isVerified ? "✅" : "⏳"}</span>
            <p
              className={`text-sm font-semibold ${profile.isVerified ? "text-emerald-700" : "text-amber-700"}`}
            >
              {profile.isVerified
                ? "Profile Verified — You're live on SkillSync!"
                : "Pending Admin Verification"}
            </p>
          </div>
        )}

        {!profile && (
          <div className="card-animate bg-white rounded-3xl p-8 text-center border border-dashed border-gray-200 mb-5">
            <p className="text-4xl mb-3">🧑‍💻</p>
            <p className="sora font-bold text-gray-900 mb-4">
              Complete your profile to get started
            </p>
            <button
              onClick={() => navigate("/mentor/profile/edit")}
              className="bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-medium"
            >
              Complete Profile →
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="card-animate grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            {
              icon: "📅",
              label: "Upcoming",
              value: confirmedSessions.length,
              color: "text-blue-600",
            },
            {
              icon: "✅",
              label: "Completed",
              value: completedSessions.length,
              color: "text-emerald-600",
            },
            {
              icon: "📚",
              label: "Total",
              value: sessions.length,
              color: "text-gray-700",
            },
            {
              icon: "💰",
              label: "Earned",
              value: `₹${releasedSessions.reduce((sum, s) => sum + (s.paymentAmount || s.amount || 0), 0)}`,
              color: "text-violet-600",
            },
            {
              icon: "5.0",
              label: `${profile?.ratingCount || 0} rating${(profile?.ratingCount || 0) === 1 ? "" : "s"}`,
              value:
                (profile?.ratingCount || 0) > 0
                  ? Number(profile.averageRating || 0).toFixed(1)
                  : "New",
              color: "text-amber-600",
              rating: true,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className={`sora text-xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              {stat.rating && (
                <div className="mt-1">
                  <StarRating
                    value={profile?.averageRating}
                    count={profile?.ratingCount}
                    showCount={false}
                  />
                </div>
              )}
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div className="card-animate bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h2 className="sora font-semibold text-gray-900">Your Sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-400 text-sm">
                No sessions yet. Students will book once your profile is
                verified.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sessions.map((session) => {
                const statusCfg =
                  STATUS_CONFIG[session.status] || STATUS_CONFIG.cancelled;
                const studentName = session.studentId?.name || "Student";

                return (
                  <div
                    key={session._id}
                    className="session-row px-6 py-4 flex items-start gap-4"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm sora shrink-0">
                      {studentName[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="sora font-semibold text-gray-900 text-sm">
                          {studentName}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {session.topic}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span>📅 {session.scheduledDate}</span>
                        <span>🕐 {session.scheduledTime}</span>
                        <span>⏱ {session.duration} min</span>
                        <span className="text-violet-500 font-medium">
                          ₹{session.amount}
                        </span>
                        {session.paymentStatus && (
                          <span
                            className={`font-medium ${
                              session.paymentStatus === "released"
                                ? "text-emerald-500"
                                : session.paymentStatus === "refunded"
                                  ? "text-red-500"
                                  : session.paymentStatus === "disputed"
                                    ? "text-amber-500"
                                    : "text-gray-400"
                            }`}
                          >
                            Payment: {session.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Join button for confirmed sessions */}
                    {session.status === "confirmed" && (
                      <button
                        onClick={() =>
                          navigate(`/mentor/session/${session._id}`)
                        }
                        className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                      >
                        Join →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
