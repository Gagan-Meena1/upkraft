"use client";
import { useState, useEffect } from 'react';
import { 
  Download, Calendar, Music, Guitar, Piano, TrendingUp, Clock, Star, ChevronDown, ChevronUp, ChevronLeft, ArrowLeft,
  Play, Pause, UserCircle, Drum, Mic
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";
import Link from "next/link";

export default function StudentArchivePage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ piano: [], guitar: [], drums: [], vocals: [], other: [] });
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [downloadingFiles, setDownloadingFiles] = useState({});
  const [playingAudio, setPlayingAudio] = useState({});
  const [evaluatingAI, setEvaluatingAI] = useState({});

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
      
      // Update the database with analysis results
      await updateResultWithAnalysis(resultId, data.ratings, instrument);
      
      // Refresh the results
      await fetchResults();
      
      alert('AI Evaluation completed successfully! The analysis has been saved.');
      
    } catch (error) {
      console.error('❌ Error during AI evaluation:', error);
      alert(`Failed to evaluate: ${error.message}`);
    } finally {
      setEvaluatingAI(prev => ({ ...prev, [resultId]: false }));
    }
  };

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

  const getFilteredResults = () => {
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
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="student">
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
      </DashboardLayout>
    );
  }

  const filteredResults = getFilteredResults();

  return (
    <DashboardLayout userType="student">
      
      <div className="min-h-screen card-box position-relative">
          <Link
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        href="/student"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>
        <main className="">
          {/* Stats Cards - Now includes 5 instruments + Last Activity */}
          
          <div className="results-sec row">

            <div className="col-xxl-2 col-lg-3 col-md-6 mb-4">
              <div className="card-results text-center">
                  <span className='d-flex align-items-center gap-2 justify-content-center m-auto'>
                    <TrendingUp className='d-block m-auto mb-2 text-center'/>
                  </span>
                  <div className='text'>
                    <p>Total Sessions</p>
                    <h3>{stats.totalSessions || 0}</h3>
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
                  <h3>{stats.pianoSessions || 0}</h3>
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
                  <h3>{stats.guitarSessions || 0}</h3>
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
                  <h3>{stats.drumsSessions || 0}</h3>
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
                  <h3>{stats.vocalsSessions || 0}</h3>
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
                  <h3>{stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'No activity'}
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* Tab Filters - Now includes all 5 instruments */}
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
              All ({stats.totalSessions || 0})
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
              Piano ({stats.pianoSessions || 0})
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
              Guitar ({stats.guitarSessions || 0})
            </button>
            </li>
            <li className='nav-item'>
            <button
              onClick={() => setActiveTab('drums')}
              className={`nav-link d-flex align-items-center gap-2  ${
                activeTab === 'drums' 
                  ? 'active' 
                  : ''
              }`}
            >
              <Drum size={16} />
              Drums ({stats.drumsSessions || 0})
            </button>
            </li>
            <li className='nav-item'>
            <button
              onClick={() => setActiveTab('vocals')}
              className={`nav-link d-flex align-items-center gap-2  ${
                activeTab === 'vocals' 
                  ? 'active' 
                  : ''
              }`}
            >
              <Mic size={16} />
              Vocals ({stats.vocalsSessions || 0})
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
              Other ({stats.otherSessions || 0})
            </button>
            </li>
            </ul>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions Found</h3>
              <p className="text-gray-500">Start practicing to see your results here!</p>
            </div>
          ) : (
            <div className="row mt-4">
              {filteredResults.map((result) => (
                <div key={result._id} className="col-md-12 mb-4">
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
                                Tutor Score: {result.tutorScore}/10
                              </span>
                            )}
                            <span className="capitalize">{result.instrument}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="right-box d-flex align-items-center gap-2">
                        {/* AI Evaluation Button - Only for piano and guitar */}
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
                          <div className={`box-top  ${getFeedbackColor(result.analysisResults.places_to_improve.feedback)}`}>
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
        </main>
      </div>
    </DashboardLayout>
  );
}