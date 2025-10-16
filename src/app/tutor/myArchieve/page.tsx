"use client";
import { useState, useEffect } from 'react';
import { 
  LogOut, ChevronLeft, ChevronRight, User, BookOpen, PlusCircle, Users, BookCheck, Menu, X,
  Download, Calendar, Music, Guitar, Piano, TrendingUp, Clock, Star, ChevronDown, ChevronUp,
  Play, Pause, Volume2, UserCircle
} from "lucide-react";

export default function PracticeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ piano: [], guitar: [] });
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState({});
  const [playingAudio, setPlayingAudio] = useState({});
  const [archiveMode, setArchiveMode] = useState('my');
  const [studentsData, setStudentsData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [userCategory, setUserCategory] = useState(null);

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
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      
      const response = await fetch(`/Api/practice/getResults?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        setStats(data.stats);
        setUserCategory(data.category);
        // console.log('User category:', data.category); // Debug log
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

  const fetchStudentsResults = async () => {
    try {
      setStudentsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      
      const response = await fetch(`/Api/practice/getResultAllStudents?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudentsData(data.data);
        if (data.data.students && data.data.students.length > 0) {
          setSelectedStudent(data.data.students[0]);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch students results');
      }
    } catch (error) {
      console.error('Error fetching students results:', error);
      setError(error.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleArchiveModeChange = (mode) => {
    setArchiveMode(mode);
    setActiveTab('all');
    
    if (mode === 'students' && !studentsData) {
      fetchStudentsResults();
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
      if (playingAudio[resultId].audio) {
        playingAudio[resultId].audio.pause();
        playingAudio[resultId].audio.currentTime = 0;
      }
      setPlayingAudio(prev => ({ ...prev, [resultId]: null }));
    } else {
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
    if (archiveMode === 'students') {
      if (!selectedStudent) return [];
      
      const studentResults = selectedStudent.results;
      switch (activeTab) {
        case 'piano':
          return studentResults.piano || [];
        case 'guitar':
          return studentResults.guitar || [];
        default:
          return [...(studentResults.piano || []), ...(studentResults.guitar || [])].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
      }
    } else {
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
    }
  };

  const getCurrentStats = () => {
    if (archiveMode === 'students' && selectedStudent) {
      return selectedStudent.stats;
    }
    return stats;
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
            onClick={() => archiveMode === 'my' ? fetchResults() : fetchStudentsResults()}
            className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredResults = getFilteredResults();
  const currentStats = getCurrentStats();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-h-screen">
        <main className="p-4 sm:p-6">
          {/* Debug info - remove after testing */}
          {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm">Debug: User Category = {userCategory || 'null'}</p>
            <p className="text-sm">Condition check: {userCategory === 'Tutor' ? 'TRUE' : 'FALSE'}</p>
          </div> */}

          {userCategory === 'Tutor' && (
            <div className="mb-6 flex justify-center">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-1 inline-flex shadow-sm">
                <button
                  onClick={() => handleArchiveModeChange('my')}
                  className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                    archiveMode === 'my' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserCircle size={20} />
                  My Archive
                </button>
                <button
                  onClick={() => handleArchiveModeChange('students')}
                  className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                    archiveMode === 'students' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users size={20} />
                  Students' Archive
                </button>
              </div>
            </div>
          )}

          {archiveMode === 'students' && studentsData?.students && studentsData.students.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Student:</h3>
              <div className="flex flex-wrap gap-3">
                {studentsData.students.map((student) => (
                  <button
                    key={student.studentId}
                    onClick={() => setSelectedStudent(student)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      selectedStudent?.studentId === student.studentId
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {student.profileImage ? (
                      <img 
                        src={student.profileImage} 
                        alt={student.studentName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {student.studentName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${
                        selectedStudent?.studentId === student.studentId ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {student.studentName}
                      </p>
                      <p className="text-xs text-gray-500">{student.stats.totalSessions} sessions</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {studentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{currentStats.totalSessions || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Piano Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{currentStats.pianoSessions || 0}</p>
                    </div>
                    <Piano className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Guitar Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{currentStats.guitarSessions || 0}</p>
                    </div>
                    <Guitar className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Last Activity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentStats.lastActivity ? new Date(currentStats.lastActivity).toLocaleDateString() : 'No activity'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-1 mb-8 inline-flex shadow-sm">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'all' 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Results ({currentStats.totalSessions || 0})
                </button>
                <button
                  onClick={() => setActiveTab('piano')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'piano' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Piano size={16} />
                  Piano ({currentStats.pianoSessions || 0})
                </button>
                <button
                  onClick={() => setActiveTab('guitar')}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'guitar' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Guitar size={16} />
                  Guitar ({currentStats.guitarSessions || 0})
                </button>
              </div>

              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Music size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions Found</h3>
                  <p className="text-gray-500">
                    {archiveMode === 'students' 
                      ? 'This student has no practice sessions yet.' 
                      : 'Start practicing to see your results here!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
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

                        {archiveMode === 'students' && selectedStudent && (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            {selectedStudent.profileImage ? (
                              <img 
                                src={selectedStudent.profileImage} 
                                alt={selectedStudent.studentName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                                {selectedStudent.studentName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm text-blue-900">{selectedStudent.studentName}</p>
                              <p className="text-xs text-blue-600">{selectedStudent.studentEmail}</p>
                            </div>
                          </div>
                        )}
                        
                        {result.analysisResults?.overall_rating && (
                          <div className="flex items-center gap-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getFeedbackColor(result.analysisResults.overall_rating.feedback)}`}>
                              {result.analysisResults.overall_rating.feedback}
                            </span>
                            <p className="text-sm text-gray-700 flex-1">
                              {result.analysisResults.overall_rating.suggestion}
                            </p>
                          </div>
                        )}
                      </div>

                      {expandedCards[result._id] && (
                        <div className="p-6 bg-gray-50">
                          {result.analysisResults?.places_to_improve && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Star size={18} className="text-orange-500" />
                                Areas for Improvement
                              </h4>
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
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(result.instrument === 'piano' ? result.pianoAnalysis || {} : result.guitarAnalysis || {}).map(([key, analysis]) => {
                                if (!analysis || !analysis.feedback) return null;
                                
                                return (
                                  <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}