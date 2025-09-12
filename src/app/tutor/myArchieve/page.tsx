"use client";
import { useState, useEffect } from 'react';
import { 
  LogOut, ChevronLeft, ChevronRight, User, BookOpen, PlusCircle, Users, BookCheck, Menu, X,
  Download, Calendar, Music, Guitar, Piano, TrendingUp, Clock, Star, ChevronDown, ChevronUp,
  Play, Pause, Volume2
} from "lucide-react";

export default function PracticeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ piano: [], guitar: [] });
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'piano', 'guitar'
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState({});
  const [playingAudio, setPlayingAudio] = useState({});

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

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/Api/practice/getResults');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAudioFile = async (audioUrl, title, resultId) => {
    try {
      setDownloadingFiles(prev => ({ ...prev, [resultId]: true }));
      
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download audio file. Please try again.');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [resultId]: false }));
    }
  };

  const toggleAudioPlayback = (audioUrl, resultId) => {
    if (playingAudio[resultId]) {
      // Stop audio
      if (playingAudio[resultId].audio) {
        playingAudio[resultId].audio.pause();
        playingAudio[resultId].audio.currentTime = 0;
      }
      setPlayingAudio(prev => ({ ...prev, [resultId]: null }));
    } else {
      // Start audio
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        alert('Failed to play audio file.');
      });
      
      audio.onended = () => {
        setPlayingAudio(prev => ({ ...prev, [resultId]: null }));
      };
      
      setPlayingAudio(prev => ({ ...prev, [resultId]: { audio } }));
    }
  };

  const toggleCardExpansion = (resultId) => {
    setExpandedCards(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  const getFeedbackColor = (feedback) => {
    switch (feedback?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'good':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'generally reliable':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'fair':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'fell short':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'below minimum':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'no input':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'piano':
        return results.piano || [];
      case 'guitar':
        return results.guitar || [];
      default:
        return [...(results.piano || []), ...(results.guitar || [])].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="bg-red-100 border border-red-300 text-red-700 p-5 rounded-xl mb-5">
            <h3 className="text-lg font-semibold mb-2">Error Loading Results</h3>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchResults}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 h-screen ${
        isMobile 
          ? `fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : sidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`font-extrabold text-xl text-orange-600 ${!sidebarOpen && !isMobile && 'hidden'}`}>
            UpKraft
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
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Practice History</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Piano Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pianoSessions || 0}</p>
                </div>
                <Piano className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Guitar Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.guitarSessions || 0}</p>
                </div>
                <Guitar className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'No activity'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 mb-8 inline-flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Results ({stats.totalSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('piano')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'piano' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Piano size={16} />
              Piano ({stats.pianoSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('guitar')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'guitar' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Guitar size={16} />
              Guitar ({stats.guitarSessions || 0})
            </button>
          </div>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions Found</h3>
              <p className="text-gray-500">Start practicing to see your results here!</p>
              <button 
                onClick={() => window.location.href = '/tutor/practice'}
                className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
              >
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {result.instrument === 'piano' ? (
                          <Piano className="h-6 w-6 text-blue-500" />
                        ) : (
                          <Guitar className="h-6 w-6 text-green-500" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{result.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(result.createdAt).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{result.instrument}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Audio Controls */}
                        <button
                          onClick={() => toggleAudioPlayback(result.audioFileUrl, result._id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                          title={playingAudio[result._id] ? "Stop Audio" : "Play Audio"}
                        >
                          {playingAudio[result._id] ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                        
                        {/* Download Button */}
                        <button
                          onClick={() => downloadAudioFile(result.audioFileUrl, result.title, result._id)}
                          disabled={downloadingFiles[result._id]}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="Download Audio File"
                        >
                          {downloadingFiles[result._id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                        
                        {/* Expand Button */}
                        <button
                          onClick={() => toggleCardExpansion(result._id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                        >
                          {expandedCards[result._id] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Overall Rating */}
                    {result.analysisResults?.overall_rating && (
                      <div className="mt-4 flex items-center gap-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getFeedbackColor(result.analysisResults.overall_rating.feedback)}`}>
                          {result.analysisResults.overall_rating.feedback}
                        </span>
                        <p className="text-sm text-gray-700 flex-1">
                          {result.analysisResults.overall_rating.suggestion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedCards[result._id] && (
                    <div className="p-6">
                      {/* Places to Improve */}
                      {result.analysisResults?.places_to_improve && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
                          <div className={`p-4 rounded-lg border ${getFeedbackColor(result.analysisResults.places_to_improve.feedback)}`}>
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50 mb-2">
                              {result.analysisResults.places_to_improve.feedback}
                            </span>
                            <p className="text-sm">
                              {result.analysisResults.places_to_improve.suggestion}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Detailed Analysis */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(result.instrument === 'piano' ? result.pianoAnalysis || {} : result.guitarAnalysis || {}).map(([key, analysis]) => {
                            if (!analysis || !analysis.feedback) return null;
                            
                            return (
                              <div key={key} className="border border-gray-200 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2 text-sm">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h5>
                                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getFeedbackColor(analysis.feedback)}`}>
                                  {analysis.feedback}
                                </div>
                                <p className="text-xs text-gray-700">
                                  {analysis.suggestion}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}