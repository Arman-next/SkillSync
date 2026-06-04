import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user, logout } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "verified"
  const [actionLoading, setActionLoading] = useState(null); // track which button is loading

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mentorRes, statsRes] = await Promise.all([
        axios.get(`/api/admin/mentors?status=${activeTab}`),
        axios.get("/api/admin/stats"),
      ]);
      setMentors(mentorRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (mentorId) => {
    setActionLoading(mentorId);
    try {
      await axios.put(`/api/admin/mentors/${mentorId}/verify`);
      setMentors((prev) => prev.filter((m) => m._id !== mentorId));
      setStats((prev) => ({
        ...prev,
        pendingMentors: prev.pendingMentors - 1,
        verifiedMentors: prev.verifiedMentors + 1,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Error verifying mentor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (mentorId) => {
    setActionLoading(mentorId + "_reject");
    try {
      await axios.put(`/api/admin/mentors/${mentorId}/reject`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting mentor");
    } finally {
      setActionLoading(null);
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-lift { transition: transform 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); }
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
          <span className="ml-2 text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
            Admin
          </span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
            A
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="card-animate mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="sora text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage mentor verifications and platform activity.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/disputes")}
            className="w-full sm:w-auto shrink-0 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-5 py-3 rounded-2xl transition-all cursor-pointer"
          >
            Manage Disputes{" "}
            {stats?.pendingDisputes > 0 && `(${stats.pendingDisputes})`}
          </button>
        </div>

        <button onClick={() => navigate("/admin/disputes")} className="hidden">
          ⚠ Manage Disputes{" "}
          {stats?.pendingDisputes > 0 && `(${stats.pendingDisputes})`}
        </button>

        {/* Stats row */}
        {stats && (
          <div className="card-animate grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Mentors",
                value: stats.totalMentors,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Total Students",
                value: stats.totalStudents,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Pending Review",
                value: stats.pendingMentors,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Verified Mentors",
                value: stats.verifiedMentors,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`hover-lift rounded-2xl p-5 border border-gray-100 ${stat.bg}`}
              >
                <p className={`sora text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mentor management */}
        <div className="card-animate bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {["pending", "verified"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "pending"
                  ? "⏳ Pending Review"
                  : "✅ Verified Mentors"}
                {tab === "pending" && stats?.pendingMentors > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats.pendingMentors}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">
                  {activeTab === "pending" ? "🎉" : "📭"}
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === "pending"
                    ? "No pending mentors to review!"
                    : "No verified mentors yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold flex-shrink-0">
                      {mentor.userId?.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 sora text-sm">
                          {mentor.userId?.name}
                        </p>
                        {mentor.isVerified && (
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {mentor.userId?.email}
                      </p>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {mentor.bio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2 text-xs">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                          Disputes: {mentor.disputeCount || 0}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg ${
                            (mentor.disputeRefundCount || 0) >= 3
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          Refunds: {mentor.disputeRefundCount || 0}
                        </span>
                        {(mentor.disputeRefundCount || 0) >= 3 && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-medium">
                            Needs review
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {mentor.skills?.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg"
                          >
                            {skill}
                          </span>
                        ))}
                        {mentor.skills?.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{mentor.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Links */}
                      <div className="flex gap-3 text-xs">
                        {mentor.linkedInURL && (
                          <a
                            href={mentor.linkedInURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {mentor.portfolioURL && (
                          <a
                            href={mentor.portfolioURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Portfolio ↗
                          </a>
                        )}
                        <span className="text-gray-400">
                          ₹{mentor.hourlyRate}/hr · {mentor.experience}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {activeTab === "pending" && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleVerify(mentor._id)}
                          disabled={actionLoading === mentor._id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                        >
                          {actionLoading === mentor._id ? "..." : "✅ Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(mentor._id)}
                          disabled={actionLoading === mentor._id + "_reject"}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                        >
                          {actionLoading === mentor._id + "_reject"
                            ? "..."
                            : "❌ Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
