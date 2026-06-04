import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useHomeNavigate from "../../hooks/useHomeNavigate";

export default function AISummaryPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const goHome = useHomeNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
  }, [sessionId]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`/api/ai/summary/${sessionId}`);
      setSummary(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Summary not generated yet — trigger generation
        generateSummary();
      } else {
        setError("Failed to load summary.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`/api/ai/generate/${sessionId}`);
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate summary.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
          <span className="text-3xl animate-bounce">🤖</span>
        </div>
        <p className="text-gray-600 font-medium">
          {generating ? "Generating your AI summary..." : "Loading summary..."}
        </p>
        {generating && (
          <p className="text-gray-400 text-sm max-w-xs text-center">
            Our AI is analyzing your session and creating personalized insights.
            This takes about 10 seconds.
          </p>
        )}
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-5xl">😕</p>
        <p className="text-gray-600 font-medium text-center">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={generateSummary}
            className="bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .action-card { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Navbar */}
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
        <span className="text-sm text-gray-400">/ AI Session Summary</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="card-animate text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="sora text-2xl font-bold text-gray-900 mb-1">
            Your Session Summary
          </h1>
          <p className="text-gray-400 text-sm">
            AI-generated insights from your session on{" "}
            <span className="font-medium text-gray-600">{summary?.topic}</span>
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {new Date(summary?.createdAt).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Summary */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
            <h2 className="sora font-semibold text-gray-900">
              Session Summary
            </h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {summary?.summaryText}
          </p>
        </div>

        {/* Action Items */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-sm">✅</span>
            </div>
            <h2 className="sora font-semibold text-gray-900">
              Your Action Items
            </h2>
          </div>
          <div className="space-y-3">
            {summary?.actionItems?.map((item, i) => (
              <div
                key={i}
                className="action-card flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Resources */}
        <div className="card-animate bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-sm">📚</span>
            </div>
            <h2 className="sora font-semibold text-gray-900">
              Recommended Resources
            </h2>
          </div>
          <div className="space-y-3">
            {summary?.resources?.map((resource, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3"
              >
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs">🔗</span>
                </div>
                <p className="text-sm text-violet-800 leading-relaxed">
                  {resource}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Session meta */}
        <div className="card-animate bg-[#f5f5f7] rounded-2xl px-5 py-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-gray-400">
            <span>⏱ {summary?.duration} minute session</span>
            <span>🎯 Goal: {summary?.learningGoal?.slice(0, 50)}...</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Generated by Gemini AI
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="card-animate flex flex-col gap-3">
          <button
            onClick={() => navigate("/student/browse")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl text-sm transition-all"
          >
            Book Another Session →
          </button>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-2xl text-sm transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
