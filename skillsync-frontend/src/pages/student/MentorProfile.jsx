import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useHomeNavigate from "../../hooks/useHomeNavigate";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export default function MentorProfile() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const goHome = useHomeNavigate();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await axios.get(`/api/mentor/public/${mentorId}`);
        setMentor(res.data);
      } catch (err) {
        setError("Mentor not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-gray-600 font-medium">{error}</p>
        <button
          onClick={() => navigate("/student/browse")}
          className="bg-blue-500 text-white text-sm font-medium px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all"
        >
          ← Back to Browse
        </button>
      </div>
    );
  }

  const avatarColor =
    AVATAR_COLORS[mentor.userId?.name?.length % AVATAR_COLORS.length] ||
    "bg-blue-500";

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
        .btn-primary { background: #1a73e8; transition: all 0.2s ease; }
        .btn-primary:hover { background: #1557b0; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26,115,232,0.3); }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate("/student/browse")}
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
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Profile hero card */}
        <div className="card-animate bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-5">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div
              className={`w-20 h-20 rounded-3xl ${avatarColor} flex items-center justify-center text-white font-bold text-3xl sora flex-shrink-0`}
            >
              {mentor.userId?.name?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="sora text-2xl font-bold text-gray-900">
                    {mentor.userId?.name}
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {mentor.userId?.email}
                  </p>
                  {mentor.experience && (
                    <span className="inline-block mt-2 text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                      {mentor.experience} experience
                    </span>
                  )}
                </div>

                {/* Pricing + Book button */}
                <div className="flex flex-col items-start md:items-end gap-3">
                  <div className="text-right">
                    <p className="sora text-3xl font-bold text-gray-900">
                      ₹{mentor.hourlyRate}
                    </p>
                    <p className="text-xs text-gray-400">per hour</p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/student/book/${mentor.userId?._id}`)
                    }
                    className="btn-primary text-white font-semibold px-8 py-3 rounded-2xl text-sm w-full md:w-auto"
                  >
                    Book a Session →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="sora font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{mentor.bio}</p>
        </div>

        {/* Skills */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="sora font-semibold text-gray-900 mb-4">
            Skills & Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {mentor.skills?.map((skill) => (
              <span
                key={skill}
                className="text-sm bg-blue-50 text-blue-700 border border-blue-100 font-medium px-4 py-1.5 rounded-xl"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        {(mentor.linkedInURL || mentor.portfolioURL) && (
          <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5">
            <h2 className="sora font-semibold text-gray-900 mb-4">Links</h2>
            <div className="flex flex-col gap-3">
              {mentor.linkedInURL && (
                <a
                  href={mentor.linkedInURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                    in
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      LinkedIn Profile
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      {mentor.linkedInURL}
                    </p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">
                    ↗
                  </span>
                </a>
              )}
              {mentor.portfolioURL && (
                <a
                  href={mentor.portfolioURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                    🔗
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Portfolio / GitHub
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      {mentor.portfolioURL}
                    </p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">
                    ↗
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Verified badge */}
        <div className="card-animate flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 mb-8">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              Verified Mentor
            </p>
            <p className="text-xs text-emerald-500">
              This mentor's profile and credentials have been reviewed by the
              SkillSync team.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="card-animate bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <h3 className="sora text-xl font-bold text-gray-900 mb-2">
            Ready to learn from {mentor.userId?.name?.split(" ")[0]}?
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Book a session at ₹{mentor.hourlyRate}/hr. Pay securely and get
            started today.
          </p>
          <button
            onClick={() => navigate(`/student/book/${mentor.userId?._id}`)}
            className="btn-primary text-white font-semibold px-10 py-4 rounded-2xl text-sm"
          >
            Book a Session →
          </button>
        </div>
      </div>
    </div>
  );
}
