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
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";

interface Tutor {
  _id: string;
  username: string;
  email: string;
  timezone: string;
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

  // Society modal state
  const [showSocietyModal, setShowSocietyModal] = useState(false);
  const [selectedTutorForSociety, setSelectedTutorForSociety] = useState<Tutor | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [societySearch, setSocietySearch] = useState("");
  const [assigningSlots, setAssigningSlots] = useState(false);

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

  // Fetch societies in background
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

  const filteredSocieties = societies.filter(
    (s) =>
      s.name.toLowerCase().includes(societySearch.toLowerCase()) ||
      s.city.toLowerCase().includes(societySearch.toLowerCase())
  );

  const handleAssignSocietyClick = (tutor: Tutor) => {
    setSelectedTutorForSociety(tutor);
    setSelectedSociety(null);
    setSocietySearch("");
    setShowSocietyModal(true);
  };

  const handleAssignSlots = () => {
    if (!selectedTutorForSociety || !selectedSociety) return;
    setAssigningSlots(true);
    router.push(
      `/salesHead/demoSlotAllocation?tutorId=${selectedTutorForSociety._id}&societyId=${selectedSociety._id}`
    );
  };

  const closeModal = () => {
    setShowSocietyModal(false);
    setSelectedTutorForSociety(null);
    setSelectedSociety(null);
    setSocietySearch("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Tutor Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Assign societies and demo slots to tutors
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutors..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
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
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Tutor</div>
                <div className="col-span-3 hidden sm:block">Timezone</div>
                <div className="col-span-3 sm:col-span-3 text-right">Actions</div>
              </div>

              {filteredTutors.map((tutor, idx) => (
                <div
                  key={tutor._id}
                  className="grid grid-cols-12 px-5 py-4 items-center hover:bg-purple-50/40 transition-colors"
                >
                  {/* Index */}
                  <div className="col-span-1 text-sm text-gray-400 font-mono">
                    {idx + 1}
                  </div>

                  {/* Tutor info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-purple-700">
                        {tutor.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {tutor.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{tutor.email}</p>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="col-span-3 hidden sm:block">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {tutor.timezone || "UTC"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAssignSocietyClick(tutor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Assign Society</span>
                      <span className="sm:hidden">Society</span>
                    </button>
                  </div>
                </div>
              ))}
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

      {/* ── Society Modal ── */}
      {showSocietyModal && selectedTutorForSociety && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Assign Society</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  For{" "}
                  <span className="font-medium text-purple-600">
                    {selectedTutorForSociety.username}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Society search */}
            <div className="px-6 pt-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={societySearch}
                  onChange={(e) => setSocietySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Society list */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
              {loadingSocieties ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
              ) : filteredSocieties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <MapPin className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No societies found</p>
                </div>
              ) : (
                filteredSocieties.map((society) => {
                  const isSelected = selectedSociety?._id === society._id;
                  return (
                    <button
                      key={society._id}
                      onClick={() => setSelectedSociety(society)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-purple-600" : "bg-gray-100"
                            }`}
                          >
                            <Building2
                              className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-500"}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-800">
                                {society.name}
                              </p>
                              {society.isPopular && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-400">{society.city}</p>
                              <span className="text-gray-300 mx-1">·</span>
                              <p className="text-xs text-gray-400">
                                {society.tutors?.length || 0} tutor
                                {society.tutors?.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-gray-100 space-y-3">
              {selectedSociety && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-sm text-purple-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <span className="font-medium">{selectedSociety.name}</span> selected
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSlots}
                  disabled={!selectedSociety || assigningSlots}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {assigningSlots ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Assign Slots
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!selectedSociety && (
                <p className="text-xs text-center text-gray-400">
                  Select a society above to enable slot assignment
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorManagementPage;