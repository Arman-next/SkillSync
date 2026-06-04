import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "MongoDB",
  "Python",
  "Machine Learning",
  "System Design",
  "Java",
  "Spring Boot",
  "Data Structures",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Docker",
  "AWS",
  "SQL",
  "PostgreSQL",
  "Django",
  "Flutter",
  "Android",
  "iOS",
];

export default function EditProfile() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    portfolioURL: "",
    linkedInURL: "",
    hourlyRate: "",
    experience: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExisting, setIsExisting] = useState(false); // true = update, false = create

  // Fetch existing profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/mentor/profile");
        const p = res.data;
        setFormData({
          bio: p.bio || "",
          skills: p.skills || [],
          portfolioURL: p.portfolioURL || "",
          linkedInURL: p.linkedInURL || "",
          hourlyRate: p.hourlyRate || "",
          experience: p.experience || "",
        });
        setIsExisting(true);
      } catch (err) {
        // 404 means no profile yet — that's fine
        setIsExisting(false);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  // Skill input with suggestions
  const handleSkillInput = (e) => {
    const val = e.target.value;
    setSkillInput(val);
    if (val.trim()) {
      setFilteredSuggestions(
        SKILL_SUGGESTIONS.filter(
          (s) =>
            s.toLowerCase().includes(val.toLowerCase()) &&
            !formData.skills.includes(s),
        ),
      );
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || formData.skills.includes(trimmed)) return;
    setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    setSkillInput("");
    setFilteredSuggestions([]);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isExisting) {
        await axios.put("/api/mentor/profile", formData);
        setSuccess(
          "Profile updated successfully! Waiting for admin verification.",
        );
      } else {
        await axios.post("/api/mentor/profile", formData);
        setSuccess(
          "Profile created successfully! Waiting for admin verification.",
        );
        setIsExisting(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
        .input-field {
          transition: all 0.2s ease;
          border: 1.5px solid #e5e7eb;
        }
        .input-field:focus {
          border-color: #1a73e8;
          box-shadow: 0 0 0 4px rgba(26,115,232,0.08);
          outline: none;
        }
        .btn-primary { background: #1a73e8; transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) {
          background: #1557b0;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26,115,232,0.3);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skill-tag { animation: popIn 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">{user?.name}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="card-animate mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/mentor/dashboard")}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all"
            >
              ←
            </button>
            <h1 className="sora text-2xl font-bold text-gray-900">
              {isExisting ? "Edit Your Profile" : "Complete Your Profile"}
            </h1>
          </div>
          <p className="text-sm text-gray-400 ml-11">
            {isExisting
              ? "Update your details. Admin will re-review if you make major changes."
              : "Fill in your details to get verified by our admin team."}
          </p>
        </div>

        {/* Verification status banner */}
        {isExisting && (
          <div className="card-animate mb-6 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <span className="text-amber-500 text-lg">⏳</span>
            <div>
              <p className="text-sm font-medium text-amber-700">
                Pending Admin Verification
              </p>
              <p className="text-xs text-amber-500">
                Our team will review your profile shortly.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="card-animate bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6"
        >
          {/* Success / Error */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <span className="text-emerald-500">✅</span>
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <span className="text-red-400">⚠</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bio <span className="text-red-400">*</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell students about your background, what you teach, and your teaching style..."
              required
              className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formData.bio.length} / 500
            </p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Skills <span className="text-red-400">*</span>
            </label>

            {/* Skill tags */}
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="skill-tag inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-3 py-1.5 rounded-xl"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 font-bold text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill input */}
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={handleSkillInput}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter (e.g. React)"
                className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg z-10 overflow-hidden">
                  {filteredSuggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Press Enter or comma to add. Click × to remove.
            </p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Years of Experience
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm"
            >
              <option value="">Select experience</option>
              <option value="0-1 years">0–1 years (Fresher)</option>
              <option value="1-2 years">1–2 years</option>
              <option value="2-4 years">2–4 years</option>
              <option value="4-6 years">4–6 years</option>
              <option value="6+ years">6+ years</option>
            </select>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Session Rate (₹ per hour) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                ₹
              </span>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="500"
                min="100"
                max="10000"
                required
                className="input-field w-full pl-8 pr-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Recommended: ₹300–₹1500 for best bookings
            </p>
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Portfolio / GitHub URL
            </label>
            <input
              type="url"
              name="portfolioURL"
              value={formData.portfolioURL}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
              className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedInURL"
              value={formData.linkedInURL}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className="input-field w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] text-gray-900 text-sm placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              At least one of Portfolio or LinkedIn is required
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-white font-semibold py-3.5 rounded-2xl text-sm"
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
                {isExisting ? "Updating..." : "Creating profile..."}
              </span>
            ) : isExisting ? (
              "Update Profile →"
            ) : (
              "Submit for Verification →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
