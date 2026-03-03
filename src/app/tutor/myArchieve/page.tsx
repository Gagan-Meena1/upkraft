"use client";
import { useState, useEffect } from 'react';
import { 
  LogOut, ChevronLeft, ChevronRight, User, BookOpen, PlusCircle, Users, BookCheck, Menu, X,
  Download, Calendar, Music, Guitar, Piano, TrendingUp, Clock, Star, ChevronDown, ChevronUp,
  Play, Pause, Volume2, UserCircle, Drum, Mic, ArrowLeft
} from "lucide-react";
import Link from "next/link";
export default function PracticeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ piano: [], guitar: [], drums: [], vocals: [], other: [] });
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
  const [evaluatingAI, setEvaluatingAI] = useState({});

  const [feedbackForm, setFeedbackForm] = useState<{ openFor: string | null, score: number }>({ openFor: null, score: 8 });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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

const handleAIEvaluation = async (audioFileUrl, instrument, resultId) => {
  try {
    setEvaluatingAI(prev => ({ ...prev, [resultId]: true }));
    
    // Fetch the original audio file from Cloudinary URL
    const audioResponse = await fetch(audioFileUrl);
    if (!audioResponse.ok) throw new Error('Failed to fetch audio file');
    
    const audioBlob = await audioResponse.blob();
    const fileName = `practice_recording_${Date.now()}.webm`;
    const audioFile = new File([audioBlob], fileName, { 
      type: audioBlob.type || 'audio/webm'
    });
    
    // Create FormData
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('ratingPath', instrument);
    
    console.log('Sending AI evaluation request for instrument:', instrument);
    
    const response = await fetch('/Api/proxy/practice', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ AI Evaluation Response:', data);
    
    // ✅ Update the database with analysis results
    await updateResultWithAnalysis(resultId, data.ratings, instrument);
    
    // ✅ Refresh the results
    if (archiveMode === 'my') {
      await fetchResults();
    } else {
      await fetchStudentsResults();
    }
    
    alert('AI Evaluation completed successfully! The analysis has been saved.');
    
  } catch (error) {
    console.error('❌ Error during AI evaluation:', error);
    alert(`Failed to evaluate: ${error.message}`);
  } finally {
    setEvaluatingAI(prev => ({ ...prev, [resultId]: false }));
  }
};

// ✅ UPDATED: Use PUT method for updating analysis
const updateResultWithAnalysis = async (resultId, analysisData, instrument) => {
  try {
    const response = await fetch('/Api/practice/saveResult', {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resultId,
        instrument,
        analysisData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update analysis: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Analysis saved to database:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating analysis:', error);
    throw error;
  }
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

  const updateResultInState = (resultId, updater) => {
    if (archiveMode === 'students' && selectedStudent) {
      const updatedStudents = (studentsData?.students || []).map(s => {
        if (s.studentId !== selectedStudent.studentId) return s;
        const updatedResults = {
          piano: (s.results.piano || []).map(r => r._id === resultId ? updater(r) : r),
          guitar: (s.results.guitar || []).map(r => r._id === resultId ? updater(r) : r)
        };
        return { ...s, results: updatedResults };
      });
      setStudentsData(prev => ({ ...prev, students: updatedStudents }));
      const newSelected = updatedStudents.find(s => s.studentId === selectedStudent.studentId);
      if (newSelected) setSelectedStudent(newSelected);
    } else {
      setResults(prev => ({
        piano: (prev.piano || []).map(r => r._id === resultId ? updater(r) : r),
        guitar: (prev.guitar || []).map(r => r._id === resultId ? updater(r) : r)
      }));
    }
  };

  const openFeedbackForm = (resultId, currentScore?) => {
    setFeedbackForm({ openFor: resultId, score: currentScore ?? 8 });
  };

  const closeFeedbackForm = () => {
    setFeedbackForm({ openFor: null, score: 8 });
  };

  const submitFeedback = async (resultId, instrument, feedback) => {
    if (!feedbackForm.openFor || feedbackForm.openFor !== resultId) return;
    setFeedbackSubmitting(true);
    try {
      const response = await fetch('/Api/practice/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, score: feedbackForm.score, instrument, feedback })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      // Combine state updates into a single call
      updateResultInState(resultId, (r) => ({ 
        ...r, 
        tutorScore: feedbackForm.score,
        tutorFeedback: feedback 
      }));
      closeFeedbackForm();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
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
        case 'drums':
          return studentResults.drums || [];
        case 'vocals':
          return studentResults.vocals || [];
        case 'other':
          return studentResults.other || [];
        default:
          return [
            ...(studentResults.piano || []), 
            ...(studentResults.guitar || []),
            ...(studentResults.drums || []),
            ...(studentResults.vocals || []),
            ...(studentResults.other || [])
          ].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
      }
    } else {
      switch (activeTab) {
        case 'piano':
          return results.piano || [];
        case 'guitar':
          return results.guitar || [];
        case 'drums':
          return results.drums || [];
        case 'vocals':
          return results.vocals || [];
        case 'other':
          return results.other || [];
        default:
          return [
            ...(results.piano || []), 
            ...(results.guitar || []),
            ...(results.drums || []),
            ...(results.vocals || []),
            ...(results.other || [])
          ].sort((a, b) => 
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
    <div className="min-h-screen w-100">
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="h-100 card-box position-relative practice-studio-sec ">
        <main className="">
          {userCategory === 'Tutor' && (
            <div className="tab-sec-music">
              <ul className="mb-3 nav nav-tabs">
                <li className='nav-item'>
                <button
                  onClick={() => handleArchiveModeChange('my')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    archiveMode === 'my' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <UserCircle size={20} />
                  My Archive
                </button>
                </li>
                <li className='nav-item'>

                <button
                  onClick={() => handleArchiveModeChange('students')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    archiveMode === 'students' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Users size={20} />
                  Students' Archive
                </button>
                </li>
              </ul>
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
              <div className="results-sec row">
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <TrendingUp className='d-block m-auto mb-2 text-center'/>
                    </span>
                    <div className='text'>
                      <p>Total Sessions</p>
                      <h3>{currentStats.totalSessions || 0}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <Piano className="d-block m-auto mb-2 text-center" />
                    </span>
                    <div className='text'>
                      <p>Piano</p>
                      <h3>{currentStats.pianoSessions || 0}</h3>
                    </div>
                    
                  </div>
                </div>
                
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <Guitar  className="d-block m-auto mb-2 text-center"/>
                    </span>
                    <div className='text'>
                      <p>Guitar</p>
                      <h3>{currentStats.guitarSessions || 0}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <Drum className="d-block m-auto mb-2 text-center"/>
                    </span>
                    <div className='text'>
                      <p>Drums</p>
                      <h3>{currentStats.drumsSessions || 0}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <Mic className="d-block m-auto mb-2 text-center"/>
                    </span>
                    <div className='text'>
                      <p>Vocals</p>
                      <h3>{currentStats.vocalsSessions || 0}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
                  <div className="card-results text-center">
                    <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                      <Clock className="d-block m-auto mb-2 text-center"/>
                    </span>
                    <div className='text'>
                      <p>Last Activity</p>
                      <h3>
                        {currentStats.lastActivity ? new Date(currentStats.lastActivity).toLocaleDateString() : 'No activity'}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
          <div className="tab-sec-music bottom-tabs mt-4">
              <ul className="mb-3 nav nav-tabs">
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'all' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  All ({currentStats.totalSessions || 0})
                </button>
                </li>
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('piano')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'piano' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Piano size={16} />
                  Piano ({currentStats.pianoSessions || 0})
                </button>
                </li>
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('guitar')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'guitar' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Guitar size={16} />
                  Guitar ({currentStats.guitarSessions || 0})
                </button>
                </li>
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('drums')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'drums' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Drum size={16} />
                  Drums ({currentStats.drumsSessions || 0})
                </button>
                </li>
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('vocals')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'vocals' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Mic size={16} />
                  Vocals ({currentStats.vocalsSessions || 0})
                </button>
                </li>
                <li className='nav-item'>
                <button
                  onClick={() => setActiveTab('other')}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === 'other' 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <Music size={16} />
                  Other ({currentStats.otherSessions || 0})
                </button>
                </li>
                </ul>
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
                <div className="row mt-4">
                  {filteredResults.map((result) => (
                    <div key={result._id} className=" col-md-12 mb-4">
                      <div className="my-archieve-card">
                        <div className="top-archieve-card d-flex align-items-center gap-2 justify-content-between mb-4">
                          <div className="left-box d-flex align-items-center gap-2">
                            <div className='icons-box'>
                              {result.instrument === 'piano' && <Piano className="card-arc-icons" />}
                              {result.instrument === 'guitar' && <Guitar className="card-arc-icons" />}
                              {result.instrument === 'drums' && <Drum className="card-arc-icons" />}
                              {result.instrument === 'vocals' && <Mic className="card-arc-icons" />}
                              {result.instrument === 'other' && <Music className="card-arc-icons" />}
                            </div>
                            <div className='text-box'>
                              <h3>{result.title}</h3>
                              <div className="date-can-box d-flex align-items-center gap-3">
                                <span className="date-calener d-flex align-items-center gap-2">
                                  <Calendar size={14} />
                                  {new Date(result.createdAt).toLocaleDateString()}
                                </span>
                                
                                {result.tutorScore !== undefined && (
                                  <span className="name-of-stu">
                                    {result.tutorScore}/10
                                  </span>
                                )}
                                <span className="capitalize">{result.instrument}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="right-box d-flex align-items-center gap-2">

                            
                            {archiveMode === 'students' && (
                              <div className="relative">
                                <button
                                  onClick={() => openFeedbackForm(result._id, result.tutorScore)}
                                  title="Give Feedback"
                                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <PlusCircle size={16} />
                                </button>

                                {feedbackForm.openFor === result._id && (
                                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">

                                    <label className="text-xs font-semibold text-gray-600">Score (1-10)</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <input
                                      
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={feedbackForm.score}
                                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, score: parseInt(e.target.value, 10) }))}
                                        className="w-full"
                                      />
                                      <div className="w-10 text-center text-sm font-bold text-purple-700">{feedbackForm.score}</div>

                                    </div>
                                    
                                      <textarea
                                        value={feedbackForm.feedback}
                                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                                        className="w-full mt-2 p-1 border border-gray-300 rounded-md !text-sm"
                                        rows={3}
                                        placeholder="Optional feedback notes..."
                                      />
                                    <div className="mt-3 flex justify-end gap-2">
                                      <button
                                        onClick={closeFeedbackForm}
                                        className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                                        type="button"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => submitFeedback(result._id, result.instrument, feedbackForm.feedback)}
                                        disabled={feedbackSubmitting}
                                        className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50"
                                        type="button"
                                      >
                                        {feedbackSubmitting ? 'Saving...' : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* AI Evaluation Button - Only for piano and guitar */}
                                {(result.instrument === 'piano' || result.instrument === 'guitar') && (
                                  <button
                                    onClick={() => handleAIEvaluation(result.audioFileUrl, result.instrument, result._id)}
                                    disabled={
                                      evaluatingAI[result._id] || 
                                      (result.instrument === 'piano' 
                                        ? (result.pianoAnalysis && Object.keys(result.pianoAnalysis).length > 0)
                                        : (result.guitarAnalysis && Object.keys(result.guitarAnalysis).length > 0)
                                      )
                                    }
                                    className="btn-evaluated d-flex align-items-center gap-2"
                                    title={
                                      (result.instrument === 'piano' 
                                        ? (result.pianoAnalysis && Object.keys(result.pianoAnalysis).length > 0)
                                        : (result.guitarAnalysis && Object.keys(result.guitarAnalysis).length > 0)
                                      ) 
                                        ? "Analysis already completed" 
                                        : "Get AI Evaluation"
                                    }
                                  >
                                    {evaluatingAI[result._id] ? (
                                      <>
                                        <div className="text-"></div>
                                        Evaluating...
                                      </>
                                    ) : (
                                      (result.instrument === 'piano' 
                                        ? (result.pianoAnalysis && Object.keys(result.pianoAnalysis).length > 0)
                                        : (result.guitarAnalysis && Object.keys(result.guitarAnalysis).length > 0)
                                      )
                                    ) ? (
                                      <>
                                        <Star size={16} />
                                        Evaluated
                                      </>
                                    ) : (
                                      <>
                                        <Star size={16} />
                                        AI Evaluation
                                      </>
                                    )}
                                  </button>
                                )}
                                                            
                            <button
                              onClick={() => toggleAudioPlayback(result.audioFileUrl, result._id)}
                              className="video-btn-play"
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
                              className="download-btn"
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
                              className="Dropdown-btn"
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
                              {/* <p className="text-xs text-blue-600">{selectedStudent.studentEmail}</p> */}
                            </div>
                          </div>
                        )}
                        
                        {result.analysisResults?.overall_rating && (
                          <div className="bottom-text-desc">
                            <span className={`btn-btm-text ${getFeedbackColor(result.analysisResults.overall_rating.feedback)}`}>
                              {result.analysisResults.overall_rating.feedback}
                            </span>
                            <p className="text-details">
                              {result.analysisResults.overall_rating.suggestion}
                            </p>
                          </div>
                        )}
                        { result.tutorFeedback && (
                          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                              Tutor Feedback
                            </h4>
                            <p className="text-yellow-900">{result.tutorFeedback}</p>
                          </div>
                        )}
                      </div>


                      {expandedCards[result._id] && (
                        <div className="my-archieve-accordion-card">
                          {result.analysisResults?.places_to_improve && (
                            <div className="mb-4 archieve-accordion-card-top">
                              <h4 className="heading-box d-flex align-items-center gap-2">
                                <Star size={18} className="text-orange-500" />
                                Areas for Improvement
                              </h4>
                              <div className={`box-top ${getFeedbackColor(result.analysisResults.places_to_improve.feedback)}`}>
                                <span className="heading-btn-box">
                                  {result.analysisResults.places_to_improve.feedback}
                                </span>
                                <p className="">
                                  {result.analysisResults.places_to_improve.suggestion}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className=' archieve-accordion-card-bottom'>
                            <h4 className="heading-card-archieve">Detailed Analysis</h4>
                            <div className="card-archive grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(result.instrument === 'piano' ? result.pianoAnalysis || {} : result.guitarAnalysis || {}).map(([key, analysis]) => {
                                if (!analysis || !analysis.feedback) return null;
                                
                                return (
                                  <div key={key} className="box-card-box-archieve">
                                    <h5 className="heading-archieve">
                                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h5>
                                    <div className={`btn-type ${getFeedbackColor(analysis.feedback)}`}>
                                      {analysis.feedback}
                                    </div>
                                    <p className="text-para">
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