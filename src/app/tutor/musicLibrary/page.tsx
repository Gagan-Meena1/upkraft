 "use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Filter, RefreshCw, FileText, Music, 
  User, BookOpen, PlusCircle, Users, BookCheck, Menu, X,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from 'react-bootstrap';

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
      
//       {/* Sidebar */}
//       <div className={`bg-white border-r border-gray-200 h-screen ${
//         isMobile 
//           ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
//               isOpen ? 'translate-x-0' : '-translate-x-full'
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
const MusicLibraryTable = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    difficulty: '',
    instrument: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [availableFilters, setAvailableFilters] = useState({
    genres: [],
    difficulties: [],
    instruments: []
  });

  // Fetch songs from API
  const fetchSongs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.instrument) params.append('instrument', filters.instrument);
      
      const response = await fetch(`/Api/songs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSongs(data.songs || []);
        setPagination(data.pagination || {});
        setAvailableFilters(data.filters || {});
      } else {
        throw new Error(data.error || 'Failed to fetch songs');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching songs:', err);
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)}KB` : `${mb.toFixed(1)}MB`;
  };

  // Format skills text
  const formatSkills = (skills) => {
    if (!skills) return '';
    return skills.length > 50 ? `${skills.substring(0, 50)}...` : skills;
  };

  // Get file type icon
  const getFileIcon = (fileType, extension) => {
    if (fileType === 'audio' || extension === '.mp3') {
      return <Music className="w-4 h-4 text-orange-500" />;
    }
    return <FileText className="w-4 h-4 text-green-500" />;
  };

  // Handle download
  const handleDownload = (song) => {
    if (song.url) {
      window.open(song.url, '_blank');
    }
  };

  if (loading && songs.length === 0) {
    return (
      <div className=" w-100 d-flex justify-content-center align-items-center gap-2 h-100">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-700 font-medium">Loading music library...</span>
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
    <div className="music-tabs-lab-sec refer-tutor-sec">
      {/* Search and Filters */}
      <div className="bg-form-box pb-3">
        <div className="row">
          {/* Search */}
          <div className='col-lg-3 col-md-6 mb-lg-0 mb-md-4 mb-2'>
            <div className="search-box">
              <div className='position-relative'>
              <Button className='btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute btn btn-primary btn btn-primary'>
                <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.4995 17.5L13.8828 13.8833"
                        stroke="#505050"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                        stroke="#505050"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
              </Button>
              <input
                type="text"
                placeholder="Search songs, artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control ps-5 w-100"
              />
              </div>
            </div>
          </div>

          {/* Genre Filter */}
          <div className='col-lg-3 col-md-6 mb-lg-0  mb-md-4 mb-2'>
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="w-100"
            >
              <option value="">All Genres</option>
              {availableFilters.genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className='col-lg-3 col-md-6 mb-lg-0  mb-md-4 mb-2'>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-100"
            >
              <option value="">All Difficulties</option>
              {availableFilters.difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
          {/* Instrument Filter */}
          
          <div className='col-lg-3 col-md-6 mb-lg-0  mb-md-4 mb-2'>
            <select
              value={filters.instrument}
              onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
              className="w-100"
            >
              <option value="">All Instruments</option>
              {availableFilters.instruments.map(instrument => (
                <option key={instrument} value={instrument}>{instrument}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
  <div className="assignments-list-com table-responsive">
  <div className="table-responsive w-1230">
    <div className=' table-sec'>
      <table className="table align-middle m-0">
        <thead >
          <tr>
            <th>Actions</th>
            <th>Song</th>
            <th>Artist</th>
            <th>Instrument</th>
            <th>Genre</th>
            <th>Difficulty</th>
            <th>Year</th>
            <th>Notes</th>
            <th>Skills</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
  <tr key={song._id} >
    <td>
      {song.url ? (
        <a  className='btn btn-primary d-flex align-items-center gap-1 add-assignments'
          href={`/visualizer.html?songUrl=${encodeURIComponent(song.url)}`}
        >
          <Music style={{ width: '15px', height: '15px'}} />
          Open
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </td>

              <td>
                <div className="flex items-center space-x-2">
                  {/* {getFileIcon(song.fileType, song.extension)} */}
                  <span className="font-medium text-gray-900 truncate max-w-xs">
                    {song.title}
                  </span>
                </div>
              </td>
              <td>
                {song.artist || 'Unknown'}
              </td>
              <td>
                {song.primaryInstrumentFocus || 'N/A'}
              </td>
              <td>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-900">
                  {song.genre || 'N/A'}
                </span>
              </td>
              <td>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  song.difficulty === 'Beginner' ? 'bg-green-100 text-green-900' :
                  song.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-900' :
                  song.difficulty === 'Advanced' ? 'bg-red-100 text-red-900' :
                  'bg-gray-100 text-gray-900'
                }`}>
                  {song.difficulty || 'N/A'}
                </span>
              </td>
              <td>
                {song.year || 'N/A'}
              </td>
              <td>
                {song.notes || '-'}
              </td>
              <td>
                {formatSkills(song.skills)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {songs.length === 0 && !loading && (
    <div className="text-center py-12">
      <Music className="mx-auto w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-700 font-medium text-lg">No songs found</p>
      {(searchTerm || filters.genre || filters.difficulty || filters.instrument) && (
        <button 
          onClick={() => {
            setSearchTerm('');
            setFilters({ genre: '', difficulty: '', instrument: '' });
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
    </div>
  );
};

// Main Page Component
const MusicLibraryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-100">
      {/* Sidebar */}
      {/* <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} /> */}
      
      {/* Main Content */}
      <div className="card-box">
        {/* Header */}
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
           <div className="left-head gap-2">
            {/* {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
              >
                <Menu size={24} />
              </button>
            )} */}
              <h2>Music Library</h2>
              <p className="m-0">Manage and organize your music collection</p>
            </div>
          <div className='right-form'>
            <Button 
              onClick={() => window.location.reload()}
              className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2 btn btn-primary"
            >
              <RefreshCw className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <hr className="hr-light"></hr>
        
        {/* Page Content */}
          <MusicLibraryTable />
      </div>
    </div>
  );
};

export default MusicLibraryPage;