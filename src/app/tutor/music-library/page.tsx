"use client";

import { useEffect, useMemo, useState } from "react";
import { LogOut, ChevronLeft, ChevronRight, BookOpen, Users, PlusCircle, User, BookCheck, Menu, X, Music } from "lucide-react";

type SongItem = {
  id?: string;
  title: string;
  artist?: string;
  url?: string;
  fileType?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string | Date;
  tags?: string | string[];
  filename?: string;
  // New fields from schema
  primaryInstrumentFocus?: string;
  genre?: string;
  difficulty?: 'Easy' | 'Beginner' | 'Beginner-Intermediate' | 'Intermediate' | 'Advanced' | 'Expert';
  year?: number;
  notes?: string;
  skills?: string;
};

type SongSearchResponse = {
  items: SongItem[];
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

function getDifficultyColor(difficulty?: string) {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'beginner-intermediate':
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-orange-100 text-orange-800';
    case 'expert':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function MusicLibraryWithSidebar() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const limit = 20;

  // Check if mobile and set sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
        const res = await fetch(`/Api/songs/search?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(body || `Failed to load songs (${res.status})`);
        }
        const data: SongSearchResponse = await res.json();
        if (!ignore) {
          setSongs(Array.isArray(data?.items) ? data.items : []);
          setTotalPages(data?.totalPages || 1);
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Unable to fetch songs");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [query, page]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => {
      return (
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q) ||
        (s.primaryInstrumentFocus || "").toLowerCase().includes(q) ||
        (s.genre || "").toLowerCase().includes(q) ||
        (s.difficulty || "").toLowerCase().includes(q) ||
        (s.skills || "").toLowerCase().includes(q) ||
        (s.notes || "").toLowerCase().includes(q)
      );
    });
  }, [songs, query]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        console.log('Logged out successfully');
        window.location.href = '/login';
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sticky Sidebar */}
      <div className={`bg-white border-r border-gray-200 h-screen sticky top-0 ${
        isMobile 
          ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : sidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-xl text-orange-600 ${!sidebarOpen && !isMobile && 'hidden'}`}>
            <a href="/tutor" className="cursor-pointer">
              UpKraft
            </a>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {isMobile ? (
              sidebarOpen ? <X size={20} /> : <Menu size={20} />
            ) : (
              sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
            )}
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-2 py-4">
            <a 
              href="/tutor/profile" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <User size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Profile</span>}
            </a>
            <a 
              href="/tutor/courses" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <BookOpen size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Courses</span>}
            </a>
            <a 
              href="/tutor/create-course" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <PlusCircle size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Create Course</span>}
            </a>
            <a 
              href="/tutor/myStudents" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <Users size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Students</span>}
            </a>
            <a 
              href="/tutor/assignments" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Assignments</span>}
            </a>
            <a 
              href="/visualizer.html" 
              className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <Music size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Practice Studio</span>}
            </a>
            <a 
              href="/tutor/music-library" 
              className="flex items-center p-2 rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all font-medium mb-1"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <Music size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Music Library</span>}
            </a>
            <button 
              onClick={() => {
                handleLogout();
                isMobile && setSidebarOpen(false);
              }}
              className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
            >
              <LogOut size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen overflow-hidden">
        {/* Sticky Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Music Library</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="bg-white shadow rounded-xl p-6 min-h-full">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                  placeholder="Search songs, artists, genres, skills, or instruments"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.4995 17.5L13.8828 13.8833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Songs Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full border-collapse bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm font-semibold text-gray-600">
                    <th className="p-4 border-b border-gray-200">Title</th>
                    <th className="p-4 border-b border-gray-200">Artist</th>
                    <th className="p-4 border-b border-gray-200">Instrument</th>
                    <th className="p-4 border-b border-gray-200">Genre</th>
                    <th className="p-4 border-b border-gray-200">Difficulty</th>
                    <th className="p-4 border-b border-gray-200">Year</th>
                    <th className="p-4 border-b border-gray-200">Skills</th>
                    <th className="p-4 border-b border-gray-200">Notes</th>
                    <th className="p-4 border-b border-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {loading && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                          Loading songs...
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-red-600 bg-red-50">
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {error}
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <Music size={48} className="text-gray-300 mb-3" />
                          <p className="text-lg font-medium">No songs found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filtered.map((s, i) => (
                    <tr key={s.id || s.url || s.filename || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{s.title}</td>
                      <td className="p-4 text-gray-600">{s.artist || "-"}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {s.primaryInstrumentFocus || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {s.genre || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        {s.difficulty ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(s.difficulty)}`}>
                            {s.difficulty}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{s.year || "-"}</td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate" title={s.skills || "-"}>
                          {s.skills || "-"}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate" title={s.notes || "-"}>
                          {s.notes || "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        {s.url ? (
                          <a
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 transition-colors"
                            href={`/visualizer.html?songUrl=${encodeURIComponent(s.url!)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Music size={14} className="mr-1" />
                            Open
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center text-sm text-gray-500">
                Showing {filtered.length} of {songs.length} songs
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {/* Page Numbers */}
                {(() => {
                  const windowSize = 5;
                  const windowStart = Math.max(1, Math.min(page - 2, Math.max(1, totalPages - windowSize + 1)));
                  const buttons = [] as number[];
                  for (let pnum = windowStart; pnum <= Math.min(totalPages, windowStart + windowSize - 1); pnum++) {
                    buttons.push(pnum);
                  }
                  return buttons.map((pnum) => (
                    <button
                      key={pnum}
                      onClick={() => setPage(pnum)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        pnum === page 
                          ? "bg-orange-600 text-white border-orange-600" 
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pnum}
                    </button>
                  ));
                })()}
                <button
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}