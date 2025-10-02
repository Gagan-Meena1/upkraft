"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, FileText, Music
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

  if (loading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs, artists..."
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
            {availableFilters.genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Difficulties</option>
            {availableFilters.difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          {/* Instrument Filter */}
          <select
            value={filters.instrument}
            onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">All Instruments</option>
            {availableFilters.instruments.map(instrument => (
              <option key={instrument} value={instrument}>{instrument}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Song</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Artist</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Instrument</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Genre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {songs.map((song) => (
                <tr key={song._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    {song.url ? (
                      <a
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 transition-colors"
                        href={`/visualizer.html?songUrl=${encodeURIComponent(song.url)}`}
                      >
                        <Music className="w-3 h-3 mr-1" />
                        Open
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
                    {song.artist || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">
                    {song.primaryInstrumentFocus || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-900">
                      {song.genre || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      song.difficulty === 'Beginner' ? 'bg-green-100 text-green-900' :
                      song.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-900' :
                      song.difficulty === 'Advanced' ? 'bg-red-100 text-red-900' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {song.difficulty || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {song.year || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">
                    {song.notes || '-'}
                  </td>
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
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Music Library</h1>
          <p className="text-gray-700 font-medium">Manage and organize your music collection</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto bg-gray-50">
        <MusicLibraryTable />
      </main>
    </div>
  );
};

export default MusicLibraryPage;
