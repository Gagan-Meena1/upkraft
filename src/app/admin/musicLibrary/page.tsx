"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  FileText,
  Music,
  User,
  BookOpen,
  PlusCircle,
  Users,
  BookCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Folder,
  Heart,
  Edit,   // Add this
  Trash2, // Add this
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button, Modal, Form } from "react-bootstrap";

// Sidebar Component
// const Sidebar = ({ isOpen, onToggle, isMobile }) => {
//   const router = useRouter();

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={onToggle}
//         />
//       )}

      {/* Sidebar */}
      {/* <div className={`bg-white border-r border-gray-200 h-screen ${
         isMobile
           ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
               isOpen ? 'translate-x-0' : '-translate-x-full'
//             }`
//           : isOpen ? 'w-64' : 'w-16'
//       } transition-all duration-300 flex flex-col`}>

//         {/* Logo/Header */}
//         <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//           <div className={`font-extrabold text-l text-orange-600 ${!isOpen && !isMobile && 'hidden'}`}>
//             <Link href="/tutor" className="cursor-pointer">
//               <Image
//                 src="/logo.png"
//                 alt="UpKraft"
//                 width={288}
//                 height={72}
//                 priority
//                 className="object-contain w-36 h-auto"
//               />
//             </Link>
//           </div>
//           <button
//             onClick={onToggle}
//             className="p-1 rounded-lg hover:bg-gray-100"
//           >
//             {isMobile ? (
//               isOpen ? <X size={20} /> : <Menu size={20} />
//             ) : (
//               isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
//             )}
//           </button>
//         </div>

//         {/* Navigation Links */}
//         <div className="flex flex-col h-full">
//           <nav className="flex-1 px-2 py-4">
//             <Link
//               href="/tutor"
//               className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//               onClick={() => isMobile && onToggle()}
//             >
//               <User size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">Dashboard</span>}
//             </Link>

//             <Link
//               href="/tutor/courses"
//               className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//               onClick={() => isMobile && onToggle()}
//             >
//               <BookOpen size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">My Courses</span>}
//             </Link>
//             <Link
//               href="/musicLibrary"
//               className="flex items-center p-2 rounded-lg bg-orange-50 text-orange-600 mb-1 transition-all border-r-2 border-orange-600"
//               onClick={() => isMobile && onToggle()}
//             >
//               <Music size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">Music Library</span>}
//             </Link>

//             <Link
//               href="/tutor/myStudents"
//               className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//               onClick={() => isMobile && onToggle()}
//             >
//               <Users size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">My Students</span>}
//             </Link>
//             <Link
//               href="/tutor/assignments"
//               className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//               onClick={() => isMobile && onToggle()}
//             >
//               <BookCheck size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">Assignments</span>}
//             </Link>
//             <Link
//               href="/visualizer.html"
//               className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//               onClick={() => isMobile && onToggle()}
//             >
//               <BookCheck size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">Practice Studio</span>}
//             </Link>
//             <button
//               onClick={async () => {
//                 try {
//                   const response = await fetch('/Api/users/logout');
//                   if (response.ok) {
//                     toast.success('Logged out successfully');
//                     router.push('/login');
//                   } else {
//                     toast.error('Failed to logout');
//                   }
//                 } catch (error) {
//                   toast.error('Error during logout');
//                   console.error('Logout error:', error);
//                 }
//                 isMobile && onToggle();
//               }}
//               className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 mb-1 transition-all"
//             >
//               <LogOut size={20} />
//               {(isOpen || isMobile) && <span className="ml-3">Logout</span>}
//             </button>
//           </nav>
//         </div>
//       </div>
//     </>
//   );
// };

// Music Library Table Component
const MusicLibraryTable = ({isTrinity}: {isTrinity: boolean}) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    genre: "",
    difficulty: "",
    instrument: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [availableFilters, setAvailableFilters] = useState({
    genres: [],
    difficulties: [],
    instruments: [],
  });

  // per-user favourites (localStorage namespaced)
  const [userId, setUserId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Song Form State
  const [addForm, setAddForm] = useState({
    title: "",
    artist: "",
    genre: "",
    difficulty: "",
    instrument: "",
    year: "",
    skills: "",
    file: null as File | null,
    institution: ""
  });

  // Edit Song Form State
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    genre: "",
    difficulty: "",
    instrument: "",
    year: "",
    skills: "",
    institution: ""
  });

  // Handle Edit Click
  const handleEdit = (song) => {
    setEditingSong(song);
    setEditForm({
      title: song.title || "",
      artist: song.artist || "",
      genre: song.genre || "",
      difficulty: song.difficulty || "",
      instrument: song.primaryInstrumentFocus || "",
      year: song.year || "",
      skills: song.skills || "",
      institution: song.institution || ""
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/Api/songs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSong._id,
          ...editForm,
          primaryInstrumentFocus: editForm.instrument,
        }),
      });

      if (res.ok) {
        toast.success("Song updated successfully");
        setShowEditModal(false);
        fetchSongs(pagination.currentPage);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update song");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating song");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.file) {
      toast.error("Please select a file");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", addForm.file);
      formData.append("title", addForm.title);
      formData.append("artist", addForm.artist);
      formData.append("genre", addForm.genre);
      formData.append("difficulty", addForm.difficulty);
      formData.append("primaryInstrumentFocus", addForm.instrument);
      formData.append("year", addForm.year);
      formData.append("skills", addForm.skills);
      // if (isTrinity) formData.append("institution", "Trinity");

      const res = await fetch("/Api/songs/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Song uploaded successfully");
        setShowAddModal(false);
        setAddForm({
          title: "",
          artist: "",
          genre: "",
          difficulty: "",
          instrument: "",
          year: "",
          skills: "",
          file: null,
          institution: ""
        });
        fetchSongs(1);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to upload song");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading song");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handleDelete function
  const handleDelete = async (song) => {
    if (!window.confirm(`Are you sure you want to delete "${song.title}"?`)) return;

    try {
      // Using the deleteSongs endpoint which accepts titles array
      const res = await fetch("/Api/deleteSongs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: [song.title] }),
      });

      if (res.ok) {
        toast.success("Song deleted successfully");
        fetchSongs(pagination.currentPage); // Refresh list
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete song");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting song");
    }
  };

  // Fetch songs from API
  const fetchSongs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.instrument) params.append("instrument", filters.instrument);
      if(isTrinity) params.append("institution", "trinity")

      const response = await fetch(`/Api/songs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSongs(data.songs || []);
        setPagination(data.pagination || {});
        setAvailableFilters(data.filters || {});
      } else {
        throw new Error(data.error || "Failed to fetch songs");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSongs();
  }, []);

  // Search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchSongs(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters]);

  // userId from /Api/users/user
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/Api/users/user", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        const id = data?.user?._id || data?.data?._id || null;
        if (!ignore) setUserId(id);
      } catch {
        // ignore
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // favourites from localStorage
  useEffect(() => {
    if (!userId) return;
    try {
      const key = `upkraft:favourites:${userId}`;
      const raw = localStorage.getItem(key);
      setFavourites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavourites([]);
    }
  }, [userId]);

  // update localStorage when favourites change
  useEffect(() => {
    if (!userId) return;
    try {
      const key = `upkraft:favourites:${userId}`;
      localStorage.setItem(key, JSON.stringify(favourites));
    } catch {}
  }, [favourites, userId]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)}KB` : `${mb.toFixed(1)}MB`;
  };

  // Format skills text
  const formatSkills = (skills) => {
    if (!skills) return "";
    return skills.length > 50 ? `${skills.substring(0, 50)}...` : skills;
  };

  // Get file type icon
  const getFileIcon = (fileType, extension) => {
    if (fileType === "audio" || extension === ".mp3") {
      return <Music className="w-4 h-4 text-orange-500" />;
    }
    return <FileText className="w-4 h-4 text-green-500" />;
  };

  // Handle download
  const handleDownload = (song) => {
    if (song.url) {
      window.open(song.url, "_blank");
    }
  };

  const getSongId = (song) =>
    String(song._id || song.url || song.filename || song.title || "");
  const toggleFavourite = async (song) => {
    const id = getSongId(song);
    if (!id) return;

    const willAdd = !favourites.includes(id);
    // optimistic update
    setFavourites((prev) =>
      willAdd ? [...prev, id] : prev.filter((x) => x !== id)
    );

    try {
      const res = await fetch("/Api/users/likedSongs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          songId: song._id,
          action: willAdd ? "add" : "remove",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to update liked songs");
    } catch (err) {
      // revert on error
      setFavourites((prev) =>
        willAdd ? prev.filter((x) => x !== id) : [...prev, id]
      );
      console.error("Like error:", err);
    }
  };

  if (loading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-700 font-medium">
          Loading music library...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-700 font-medium">Error: {error}</p>
        <button
          onClick={() => fetchSongs()}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-800 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Genres</option>
            {availableFilters.genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Difficulties</option>
            {availableFilters.difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>

          {/* Instrument Filter */}
          <select
            value={filters.instrument}
            onChange={(e) =>
              setFilters({ ...filters, instrument: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Instruments</option>
            {availableFilters.instruments.map((instrument) => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>

          {/* Add Song Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Song
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Song
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Artist
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Instrument
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Genre
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Difficulty
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Year
                </th>
                {/* <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Notes
                </th> */}
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Skills
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {songs.map((song) => (
                <tr
                  key={song._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* heart like button (left of Open) */}
                      <button
                        type="button"
                        onClick={() => toggleFavourite(song)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-700 border-gray-200 hover:bg-gray-50"
                        title={
                          favourites.includes(getSongId(song))
                            ? "Unfavourite"
                            : "Favourite"
                        }
                        aria-pressed={favourites.includes(getSongId(song))}
                      >
                        <Heart
                          size={18}
                          className={
                            favourites.includes(getSongId(song))
                              ? "fill-purple-600"
                              : "text-gray-400"
                          }
                        />
                      </button>

                      {song.url ? (
                        <a
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#ffffff",
                            backgroundColor: "#06b6d4",
                            boxShadow: "0 4px 14px 0 rgba(6, 182, 212, 0.5)",
                            transition: "all 0.3s",
                            textDecoration: "none",
                            margin: "0.25rem 0",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0891b2";
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 20px 0 rgba(6, 182, 212, 0.6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#06b6d4";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 14px 0 rgba(6, 182, 212, 0.5)";
                          }}
                          href={`/visualizer.html?songUrl=${encodeURIComponent(
                            song.url
                          )}`}
                          target="_blank"
                        >
                          <Music
                            style={{
                              width: "0.75rem",
                              height: "0.75rem",
                              marginRight: "0.25rem",
                            }}
                          />
                          Open
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(song)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Song"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(song)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Song"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(song.fileType, song.extension)}
                      <span className="font-medium text-gray-900 truncate max-w-xs">
                        {song.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">
                    {song.artist || "Unknown"}
                  </td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">
                    {song.primaryInstrumentFocus || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-900">
                      {song.genre || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        song.difficulty === "Beginner"
                          ? "bg-green-100 text-green-900"
                          : song.difficulty === "Intermediate"
                          ? "bg-yellow-100 text-yellow-900"
                          : song.difficulty === "Advanced"
                          ? "bg-red-100 text-red-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {song.difficulty || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {song.year || "N/A"}
                  </td>
                  {/* <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">
                    {song.notes || "-"}
                  </td> */}
                  <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">
                    {formatSkills(song.skills)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {songs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Music className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium text-lg">No songs found</p>
            {(searchTerm ||
              filters.genre ||
              filters.difficulty ||
              filters.instrument) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({ genre: "", difficulty: "", instrument: "" });
                }}
                className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-800 font-medium">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchSongs(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => fetchSongs(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-4 py-2 mr-15 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Song</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Song File (MP3, GP, XML)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e: any) =>
                  setAddForm({ ...addForm, file: e.target.files[0] })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={addForm.title}
                onChange={(e) =>
                  setAddForm({ ...addForm, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Artist</Form.Label>
              <Form.Control
                type="text"
                value={addForm.artist}
                onChange={(e) =>
                  setAddForm({ ...addForm, artist: e.target.value })
                }
                required
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Instrument</Form.Label>
                  <Form.Control
                    type="text"
                    value={addForm.instrument}
                    onChange={(e) =>
                      setAddForm({ ...addForm, instrument: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Control
                    type="text"
                    value={addForm.genre}
                    onChange={(e) =>
                      setAddForm({ ...addForm, genre: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select
                    value={addForm.difficulty}
                    onChange={(e) =>
                      setAddForm({ ...addForm, difficulty: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={addForm.year}
                    onChange={(e) =>
                      setAddForm({ ...addForm, year: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    value={addForm.skills}
                    onChange={(e) =>
                      setAddForm({ ...addForm, skills: e.target.value })
                    }
                    placeholder="e.g. Strumming, Picking"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Institution</Form.Label>
                  <Form.Select
                    value={addForm.institution}
                    onChange={(e) =>
                      setAddForm({ ...addForm, institution: e.target.value })
                    }
                  >
                    <option value="">Select Institution</option>
                    <option value="Trinity">Trinity</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload Song"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Song Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Song</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Artist</Form.Label>
              <Form.Control
                type="text"
                value={editForm.artist}
                onChange={(e) =>
                  setEditForm({ ...editForm, artist: e.target.value })
                }
                required
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Instrument</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.instrument}
                    onChange={(e) =>
                      setEditForm({ ...editForm, instrument: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.genre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, genre: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select
                    value={editForm.difficulty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, difficulty: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.year}
                    onChange={(e) =>
                      setEditForm({ ...editForm, year: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Skills</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.skills}
                    onChange={(e) =>
                      setEditForm({ ...editForm, skills: e.target.value })
                    }
                    placeholder="e.g. Strumming, Picking"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Institution</Form.Label>
                  <Form.Select
                    value={editForm.institution}
                    onChange={(e) =>
                      setEditForm({ ...editForm, institution: e.target.value })
                    }
                  >
                    <option value="">Select Institution</option>
                    <option value="Trinity">Trinity</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Main Page Component
const MusicLibraryPage = () => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState<"songs" | "trinity">("songs");
   const router = useRouter();

   // Check if mobile
   useEffect(() => {
     const checkMobile = () => {
       setIsMobile(window.innerWidth < 768);
       if (window.innerWidth >= 768) {
         setSidebarOpen(true);
       } else {
         setSidebarOpen(false);
       }
     };

     checkMobile();
     window.addEventListener("resize", checkMobile);
     return () => window.removeEventListener("resize", checkMobile);
   }, []);

   const toggleSidebar = () => {
     setSidebarOpen(!sidebarOpen);
   };

   return (
     <div className="min-h-screen w-full bg-gray-50 flex">
       {/* Sidebar */}
       {/* <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} /> */}

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
         {/* Header */}
         <header className="bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
           <div className="flex items-center space-x-4">
             {isMobile && (
               <button
                 onClick={toggleSidebar}
                 className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
               >
                 <Menu size={24} />
               </button>
             )}
             <Link
               href={`/admin`}
               className="!p-2 !rounded-full !bg-gray-200 !hover:bg-gray-300 !transition-colors !shadow-md !flex-shrink-0"
             >
               <ChevronLeft className="!text-gray-700 !w-5 !h-5 !sm:w-6 !sm:h-6" />
             </Link>
             <div>
               <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                 Music Library
               </h1>
               <p className="text-gray-700 font-medium">
                 Manage and organize your music collection
               </p>
             </div>
           </div>
           <div className="flex gap-3 items-center">
            {/* View buttons: Songs / Trinity */}
            <div className="inline-flex !mr-auto rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveView("songs")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeView === "songs" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
              >
                Songs
              </button>
              <button
                onClick={() => setActiveView("trinity")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeView === "trinity" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-800"}`}
              >
                Trinity
              </button>
            </div>

            {/* Favourites page link */}
            <Link
              href="/admin/musicLibrary/favourites"
              className="inline-flex items-center px-3 py-2 rounded-md font-medium transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              <Folder className="w-4 h-4 mr-2" />
              Favourites
            </Link>

            {/* <Button
              onClick={() => window.location.reload()}
              className="btn btn-primary d-flex align-items-center !py-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button> */}
         </div>
         </header>

         {/* Page Content */}
         <main className="flex-1 p-4 sm:p-6 overflow-auto bg-gray-50">
          {activeView === "songs" && <MusicLibraryTable isTrinity={false}/>}

          {activeView === "trinity" && <MusicLibraryTable isTrinity={true} />}
         </main>
       </div>
     </div>
   );
 };

 export default MusicLibraryPage;