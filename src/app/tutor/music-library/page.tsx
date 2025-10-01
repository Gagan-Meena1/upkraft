"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, FileText, Music, Play
} from 'lucide-react';

// Type definitions
interface Song {
  _id: string;
  title: string;
  artist?: string;
  primaryInstrumentFocus?: string;
  genre?: string;
  difficulty?: string;
  year?: number;
  notes?: string;
  skills?: string;
  url?: string;
  fileType?: string;
  extension?: string;
  fileSize?: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

interface AvailableFilters {
  genres: string[];
  difficulties: string[];
  instruments: string[];
}

// Music Library Table Component
const MusicLibraryTable = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    difficulty: '',
    instrument: ''
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
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
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
        setAvailableFilters({
          genres: data.filters?.genres || [],
          difficulties: data.filters?.difficulties || [],
          instruments: data.filters?.instruments || [],
        });
      } else {
        throw new Error(data.error || 'Failed to fetch songs');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchSongs(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters]);

  const formatSkills = (skills?: string) => {
    if (!skills) return '';
    return skills.length > 50 ? `${skills.substring(0, 50)}...` : skills;
  };

  const getFileIcon = (fileType?: string, extension?: string) => {
    if (fileType === 'audio' || extension === '.mp3') {
      return <Music className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4 text-purple-400" />;
  };

  if (loading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Loading music library...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium mb-3">Error: {error}</p>
        <button
          onClick={() => fetchSongs()}
          className="px-6 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-800 font-medium transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all"
            />
          </div>

          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all"
          >
            <option value="">All Genres</option>
            {availableFilters.genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all"
          >
            <option value="">All Difficulties</option>
            {availableFilters.difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          <select
            value={filters.instrument}
            onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
            className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all"
          >
            <option value="">All Instruments</option>
            {availableFilters.instruments.map(instrument => (
              <option key={instrument} value={instrument}>{instrument}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Actions</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Song</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Artist</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Instrument</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Genre</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Difficulty</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Year</th>
                <th className="text-left py-4 px-6 font-bold text-white text-sm uppercase tracking-wide">Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {songs.map((song, index) => (
                <tr key={song._id} className={`hover:bg-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}`}>
                  <td className="py-4 px-6">
                    {song.url ? (
                      <a
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        href={`/visualizer.html?songUrl=${encodeURIComponent(song.url)}`}
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        Open
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No URL</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(song.fileType, song.extension)}
                      <span className="font-semibold text-gray-900 truncate max-w-xs">
                        {song.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 max-w-xs truncate font-medium">
                    {song.artist || 'Unknown'}
                  </td>
                  <td className="py-4 px-6 text-gray-700 max-w-xs truncate font-medium">
                    {song.primaryInstrumentFocus || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 shadow-sm">
                      {song.genre || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${song.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        song.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          song.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {song.difficulty || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">{song.year || 'N/A'}</td>
                  <td className="py-4 px-6 text-gray-600 text-sm max-w-xs truncate">{formatSkills(song.skills)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {songs.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
              <Music className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-gray-700 font-semibold text-xl mb-2">No songs found</p>
            <p className="text-gray-500 mb-4">Try adjusting your filters</p>
            {(searchTerm || filters.genre || filters.difficulty || filters.instrument) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ genre: '', difficulty: '', instrument: '' });
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 border border-purple-100">
          <p className="text-sm text-gray-700 font-medium">
            Page <span className="font-bold text-purple-600">{pagination.currentPage}</span> of <span className="font-bold text-purple-600">{pagination.totalPages}</span>
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchSongs(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="px-6 py-2 border-2 border-purple-300 rounded-lg text-purple-700 font-semibold hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              Previous
            </button>
            <button
              onClick={() => fetchSongs(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 p-6 sm:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Music Library
          </h1>
          <p className="text-gray-600 font-medium">Explore and manage your music collection</p>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6 sm:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <MusicLibraryTable />
        </div>
      </main>
    </div>
  );
};

export default MusicLibraryPage;