"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  Calendar,
  X,
  Search,
  Star,
  CheckCircle,
  Loader2,
  Building2,
  ChevronDown,
  Check,
  Filter,
} from "lucide-react";

interface Tutor {
  _id: string;
  username: string;
  email: string;
  timezone: string;
  societies?: { _id: string; name: string; city: string }[];
}

interface Society {
  _id: string;
  name: string;
  city: string;
  isPopular: boolean;
  tutors: string[];
}

const TutorManagementPage = () => {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [tutorSearch, setTutorSearch] = useState("");

  // Inline society assignment state
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  const [selectedSocietyIds, setSelectedSocietyIds] = useState<string[]>([]);
  const [societySearch, setSocietySearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch("/Api/salesHead/allTutorsInfo");
        const data = await res.json();
        if (data.success && data.tutors) setTutors(data.tutors);
      } catch (err) {
        console.error("Error fetching tutors:", err);
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchTutors();
  }, []);

  // Fetch societies
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch("/Api/salesHead/society");
        const data = await res.json();
        if (data.success && data.societies) setSocieties(data.societies);
      } catch (err) {
        console.error("Error fetching societies:", err);
      } finally {
        setLoadingSocieties(false);
      }
    };
    fetchSocieties();
  }, []);

  const filteredTutors = tutors.filter(
    (t) =>
      t.username.toLowerCase().includes(tutorSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(tutorSearch.toLowerCase())
  );

  // Get unique cities for the city filter
  const uniqueCities = [...new Set(societies.map((s) => s.city))].sort();

  // Filtered societies for the assignment panel
  const filteredSocieties = societies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(societySearch.toLowerCase()) ||
      s.city.toLowerCase().includes(societySearch.toLowerCase());
    const matchesCity = !cityFilter || s.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleAssignSocietyClick = (tutor: Tutor) => {
    if (expandedTutorId === tutor._id) {
      // Collapse if already expanded
      setExpandedTutorId(null);
      setSelectedSocietyIds([]);
      setSocietySearch("");
      setCityFilter("");
      return;
    }

    // Expand and pre-select the tutor's existing societies
    setExpandedTutorId(tutor._id);
    setSelectedSocietyIds(tutor.societies?.map((s) => s._id) || []);
    setSocietySearch("");
    setCityFilter("");
  };

  const toggleSociety = (id: string) => {
    setSelectedSocietyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveSocieties = async () => {
    if (!expandedTutorId) return;
    setSaving(true);
    try {
      const res = await fetch("/Api/salesHead/assignSocieties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId: expandedTutorId, societyIds: selectedSocietyIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign societies");

      alert("Societies assigned successfully!");

      // Refresh tutors
      const tutorsRes = await fetch("/Api/salesHead/allTutorsInfo");
      const tutorsData = await tutorsRes.json();
      if (tutorsData.success && tutorsData.tutors) setTutors(tutorsData.tutors);

      // Collapse
      setExpandedTutorId(null);
      setSelectedSocietyIds([]);
    } catch (err: any) {
      alert(err.message || "Failed to assign societies");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              Tutor Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Assign societies and demo slots to tutors
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={async () => {
                router.push("/salesHead/dashboard");
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={async () => {
                await fetch("/Api/users/logout", { method: "POST" });
                router.push("/login");
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tutor List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loadingTutors ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No tutors found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table header — hidden on mobile */}
              <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Tutor</div>
                <div className="col-span-2">Timezone</div>
                <div className="col-span-2">Societies</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {filteredTutors.map((tutor, idx) => {
                const isExpanded = expandedTutorId === tutor._id;
                const tutorSocieties = tutor.societies || [];

                return (
                  <div key={tutor._id}>
                    {/* Tutor row */}
                    <div className={`px-3 sm:px-5 py-3 sm:py-4 transition-colors ${isExpanded ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                      {/* Mobile layout */}
                      <div className="sm:hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-purple-700">
                                {tutor.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{tutor.username}</p>
                              <p className="text-xs text-gray-400 truncate">{tutor.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {tutor.timezone || "UTC"}
                          </span>
                        </div>

                        {/* Societies badges — mobile */}
                        {tutorSocieties.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-10">
                            {tutorSocieties.slice(0, 3).map((s) => (
                              <span key={s._id} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                {s.name}
                              </span>
                            ))}
                            {tutorSocieties.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{tutorSocieties.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Action buttons — mobile */}
                        <div className="flex gap-2 pl-10">
                          <button
                            onClick={() => router.push(`/salesHead/demoSlotAllocation?tutorId=${tutor._id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            <Calendar className="w-3 h-3" />
                            Slots
                          </button>
                          <button
                            onClick={() => handleAssignSocietyClick(tutor)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isExpanded
                              ? "bg-purple-700 text-white"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                              }`}
                          >
                            <Building2 className="w-3 h-3" />
                            {isExpanded ? "Close" : "Society"}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:grid grid-cols-12 items-center">
                        <div className="col-span-1 text-sm text-gray-400 font-mono">
                          {idx + 1}
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-purple-700">
                              {tutor.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{tutor.username}</p>
                            <p className="text-xs text-gray-400 truncate">{tutor.email}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {tutor.timezone || "UTC"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {tutorSocieties.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">None</span>
                            ) : (
                              <>
                                {tutorSocieties.slice(0, 2).map((s) => (
                                  <span key={s._id} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                    {s.name}
                                  </span>
                                ))}
                                {tutorSocieties.length > 2 && (
                                  <span className="text-[10px] text-gray-400 font-medium">+{tutorSocieties.length - 2}</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/salesHead/demoSlotAllocation?tutorId=${tutor._id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            View Slots
                          </button>
                          <button
                            onClick={() => handleAssignSocietyClick(tutor)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isExpanded
                              ? "bg-purple-700 text-white"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                              }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            {isExpanded ? "Close" : "Assign Society"}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* ── Inline Society Picker ── */}
                    {isExpanded && (
                      <div className="border-t border-purple-200 bg-purple-50/50 px-3 sm:px-5 py-4">
                        <div className="space-y-3">
                          {/* Search + City Filter */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search societies..."
                                value={societySearch}
                                onChange={(e) => setSocietySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                autoFocus
                              />
                            </div>
                            <div className="relative sm:w-44">
                              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white appearance-none"
                              >
                                <option value="">All Cities</option>
                                {uniqueCities.map((city) => (
                                  <option key={city} value={city}>{city}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Society Grid */}
                          {loadingSocieties ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                            </div>
                          ) : filteredSocieties.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                              <MapPin className="w-8 h-8 mb-2 opacity-30" />
                              <p className="text-sm">No societies found</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[480px] overflow-y-auto pr-1">
                              {filteredSocieties.map((society) => {
                                const isSelected = selectedSocietyIds.includes(society._id);
                                return (
                                  <button
                                    key={society._id}
                                    onClick={() => toggleSociety(society._id)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-left transition-all ${isSelected
                                      ? "border-purple-500 bg-purple-100/80"
                                      : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                                      }`}
                                  >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-purple-600" : "border-2 border-gray-300"
                                      }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1">
                                        <p className="text-sm font-medium text-gray-800 truncate">{society.name}</p>
                                        {society.isPopular && (
                                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                                        <p className="text-[11px] text-gray-400 truncate">{society.city}</p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                            <p className="text-xs text-gray-500">
                              {selectedSocietyIds.length} societ{selectedSocietyIds.length !== 1 ? "ies" : "y"} selected
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setExpandedTutorId(null);
                                  setSelectedSocietyIds([]);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveSocieties}
                                disabled={saving}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                {saving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                {saving ? "Saving..." : "Save Societies"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loadingTutors && (
          <p className="text-xs text-gray-400 text-center mt-4">
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? "s" : ""} shown
          </p>
        )}
      </div>
    </div>
  );
};

export default TutorManagementPage;