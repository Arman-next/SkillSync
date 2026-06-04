import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";
import ChatThread from "../../components/ChatThread";

const isSessionActive = (scheduledDate, scheduledTime, duration) => {
  const now = new Date();
  const sessionStart = new Date(`${scheduledDate}T${scheduledTime}:00`);
  const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 1000);
  const earlyJoin = new Date(sessionStart.getTime() - 10 * 60 * 1000);
  return now >= earlyJoin && now <= sessionEnd;
};

const getTimeUntil = (scheduledDate, scheduledTime) => {
  const now = new Date();
  const sessionStart = new Date(`${scheduledDate}T${scheduledTime}:00`);
  const diff = sessionStart - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} minutes`;
};

export default function SessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [videoRoomUrl, setVideoRoomUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [videoJoined, setVideoJoined] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [error, setError] = useState("");
  const [timeUntil, setTimeUntil] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/${sessionId}`);
        setSession(res.data);
        setActive(
          isSessionActive(
            res.data.scheduledDate,
            res.data.scheduledTime,
            res.data.duration,
          ),
        );
        setTimeUntil(
          getTimeUntil(res.data.scheduledDate, res.data.scheduledTime),
        );
      } catch {
        setError("Session not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setActive(
        isSessionActive(
          session.scheduledDate,
          session.scheduledTime,
          session.duration,
        ),
      );
      setTimeUntil(getTimeUntil(session.scheduledDate, session.scheduledTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [session]);

  const handleJoinVideo = () => {
    setVideoRoomUrl(`https://meet.jit.si/skillsync-${sessionId}`);
    setVideoJoined(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-white/60">{error}</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const mentorName = session?.mentorId?.name;
  const canUseChat = ["confirmed", "completed"].includes(session?.status);

  return (
    <div className="min-h-screen bg-[#111827] font-sans flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .btn-join { background: #1a73e8; transition: all 0.2s ease; }
        .btn-join:hover:not(:disabled) { background: #1557b0; transform: translateY(-1px); }
        .btn-join:disabled { opacity: 0.6; cursor: not-allowed; }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .card-animate { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* Navbar */}
      <nav className="bg-[#1f2937] border-b border-white/10 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-all text-sm"
          >
            ←
          </button>
          <button
            onClick={goHome}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${i === 0 ? "bg-blue-200" : "bg-white"}`}
                  />
                ))}
              </div>
            </div>
            <span className="sora text-sm font-semibold text-white">
              SkillSync
            </span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {canUseChat && (
            <button
              onClick={() => setShowChat(!showChat)}
              aria-pressed={showChat}
              className="text-xs text-white/50 hover:text-white/80 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              {showChat ? "Hide Chat" : "Show Chat"}
            </button>
          )}
          {session?.status === "confirmed" && (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs text-emerald-400 font-medium">
                Confirmed
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video side */}
        <div
          className={`flex flex-col items-center justify-center p-4 transition-all duration-300 ${
            videoJoined && showChat ? "flex-1" : "flex-1"
          }`}
        >
          {videoJoined && videoRoomUrl ? (
            <div className="w-full h-full flex flex-col card-animate">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold sora text-sm">
                    {session?.topic}
                  </p>
                  <p className="text-white/40 text-xs">
                    with {mentorName} · {session?.duration} min
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
                  <span className="text-xs text-red-400 font-medium">Live</span>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden border border-white/10">
                <iframe
                  src={videoRoomUrl}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="SkillSync Video Session"
                />
              </div>
            </div>
          ) : (
            /* Lobby */
            <div className="w-full max-w-md card-animate">
              <div className="bg-[#1f2937] border border-white/10 rounded-3xl p-6 mb-4">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
                  Session Details
                </p>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg sora">
                    {mentorName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold sora">
                      {mentorName}
                    </p>
                    <p className="text-white/40 text-xs">Your Mentor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Topic", value: session?.topic, icon: "📚" },
                    {
                      label: "Date",
                      value: session?.scheduledDate,
                      icon: "📅",
                    },
                    {
                      label: "Time",
                      value: `${session?.scheduledTime} IST`,
                      icon: "🕐",
                    },
                    {
                      label: "Duration",
                      value: `${session?.duration} min`,
                      icon: "⏱",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                    >
                      <span>{item.icon}</span>
                      <div className="flex-1 flex justify-between">
                        <span className="text-white/40 text-xs">
                          {item.label}
                        </span>
                        <span className="text-white text-sm">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!active && timeUntil && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 mb-4 text-center">
                  <p className="text-amber-400 font-semibold text-sm mb-1">
                    Session starts in {timeUntil}
                  </p>
                  <p className="text-amber-400/60 text-xs">
                    Join button activates 10 minutes before
                  </p>
                </div>
              )}

              <button
                onClick={handleJoinVideo}
                disabled={!active}
                className="btn-join w-full text-white font-semibold py-4 rounded-2xl text-base mb-3"
              >
                {active
                  ? "🎥 Join Video Session"
                  : `🔒 Opens ${timeUntil ? `in ${timeUntil}` : "at session time"}`}
              </button>

              {/* Chat available even before video */}
              <p className="text-white/30 text-xs text-center">
                💬 You can use the chat panel on the right while waiting
              </p>
            </div>
          )}
        </div>

        {/* Chat panel — always visible on this page */}
        {canUseChat && showChat && (
          <div className="w-80 shrink-0 p-4 border-l border-white/10 transition-all duration-300">
            <ChatThread sessionId={sessionId} sessionStatus={session?.status} />
          </div>
        )}
      </div>
    </div>
  );
}
