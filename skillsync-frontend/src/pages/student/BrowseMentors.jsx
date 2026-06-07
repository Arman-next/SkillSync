import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import StarRating from "../../components/StarRating";
import useAuth from "../../hooks/useAuth";
import useHomeNavigate from "../../hooks/useHomeNavigate";

const SKILL_OPTIONS = [
  "All Skills",
  "React",
  "Node.js",
  "Python",
  "Machine Learning",
  "System Design",
  "Java",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Docker",
  "AWS",
  "SQL",
  "Django",
  "Flutter",
  "Android",
  "Data Structures",
  "Spring Boot",
  "GraphQL",
  "PostgreSQL",
];

const PRICE_RANGES = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under ₹500", min: "", max: "499" },
  { label: "₹500 – ₹800", min: "500", max: "800" },
  { label: "₹800 – ₹1200", min: "800", max: "1200" },
  { label: "Above ₹1200", min: "1200", max: "" },
];

const EXPERIENCE_COLORS = {
  "0-1 years": "bg-gray-100 text-gray-600",
  "1-2 years": "bg-blue-50 text-blue-600",
  "2-4 years": "bg-violet-50 text-violet-600",
  "4-6 years": "bg-amber-50 text-amber-600",
  "6+ years": "bg-emerald-50 text-emerald-600",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
];

export default function BrowseMentors() {
  const navigate = useNavigate();
  const goHome = useHomeNavigate();
  const { user, logout } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch whenever filters change
  useEffect(() => {
    fetchMentors();
  }, [debouncedSearch, selectedSkill, selectedPrice]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedSkill !== "All Skills") params.append("skill", selectedSkill);
      if (selectedPrice.min) params.append("minPrice", selectedPrice.min);
      if (selectedPrice.max) params.append("maxPrice", selectedPrice.max);

      const res = await axios.get(`/api/mentor/browse?${params.toString()}`);
      setMentors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSkill("All Skills");
    setSelectedPrice(PRICE_RANGES[0]);
  };

  const isFiltered =
    search ||
    selectedSkill !== "All Skills" ||
    selectedPrice.label !== "Any Price";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .sora { font-family: 'Sora', sans-serif; }
        .input-field { transition: all 0.2s ease; border: 1.5px solid #e5e7eb; }
        .input-field:focus { border-color: #1a73e8; box-shadow: 0 0 0 4px rgba(26,115,232,0.08); outline: none; }
        .card-animate { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mentor-card {
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mentor-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .skill-pill {
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .skill-pill:hover { transform: scale(1.04); }
        .skill-pill.active { background: #1a73e8; color: white; border-color: #1a73e8; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .search-bar:focus-within { box-shadow: 0 0 0 4px rgba(26,115,232,0.08); border-color: #1a73e8; }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
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
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors hidden md:block"
          >
            Dashboard
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
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="card-animate mb-8">
          <h1 className="sora text-3xl md:text-4xl font-bold text-gray-900">
            Find your mentor
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {mentors.length} verified mentor{mentors.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>

        {/* Search bar */}
        <div className="card-animate mb-5">
          <div className="search-bar flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 transition-all">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or keyword..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-300 hover:text-gray-500 text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Skill filter pills */}
        <div className="card-animate mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SKILL_OPTIONS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`skill-pill flex-shrink-0 text-xs font-medium px-4 py-2 rounded-xl border transition-all ${
                  selectedSkill === skill
                    ? "active"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Price filter + clear */}
        <div className="card-animate mb-8 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Price:
          </span>
          <div className="flex gap-2 flex-wrap">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => setSelectedPrice(range)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                  selectedPrice.label === range.label
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-600 font-medium ml-2 transition-colors"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton w-12 h-12 rounded-2xl" />
                  <div className="flex-1">
                    <div className="skeleton h-4 rounded-lg mb-2 w-3/4" />
                    <div className="skeleton h-3 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-3 rounded-lg mb-2" />
                <div className="skeleton h-3 rounded-lg mb-2 w-4/5" />
                <div className="skeleton h-3 rounded-lg w-3/5 mb-4" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-xl" />
                  <div className="skeleton h-6 w-20 rounded-xl" />
                  <div className="skeleton h-6 w-14 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && mentors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="sora text-xl font-bold text-gray-900 mb-2">
              No mentors found
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Try different filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-2xl transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Mentor cards grid */}
        {!loading && mentors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((mentor, index) => {
              const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const initial = mentor.userId?.name?.[0]?.toUpperCase();
              const expColor =
                EXPERIENCE_COLORS[mentor.experience] ||
                "bg-gray-100 text-gray-600";

              return (
                <div
                  key={mentor._id}
                  className="mentor-card bg-white rounded-3xl p-6 border border-gray-100 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() =>
                    navigate(`/student/mentor/${mentor.userId?._id}`)
                  }
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-lg sora flex-shrink-0`}
                      >
                        {initial}
                      </div>
                      <div>
                        <h3 className="sora font-semibold text-gray-900 text-sm leading-tight">
                          {mentor.userId?.name}
                        </h3>
                        {mentor.experience && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-lg mt-1 inline-block ${expColor}`}
                          >
                            {mentor.experience}
                          </span>
                        )}
                        <div className="mt-1">
                          <StarRating
                            value={mentor.averageRating}
                            count={mentor.ratingCount}
                            showCount
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="sora text-base font-bold text-gray-900">
                        ₹{mentor.hourlyRate}
                      </p>
                      <p className="text-xs text-gray-400">/hr</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {mentor.skills?.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-[#f5f5f7] text-gray-600 border border-gray-100 px-2.5 py-1 rounded-xl font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.skills?.length > 3 && (
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{mentor.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {mentor.linkedInURL && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(mentor.linkedInURL, "_blank");
                          }}
                          className="hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          LinkedIn ↗
                        </span>
                      )}
                      {mentor.portfolioURL && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(mentor.portfolioURL, "_blank");
                          }}
                          className="hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          Portfolio ↗
                        </span>
                      )}
                    </div>
                    <button className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                      View profile →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
