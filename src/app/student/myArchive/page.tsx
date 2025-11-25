"use client";
import { useState, useEffect } from 'react';
import { 
  Download, Calendar, Music, Guitar, Piano, TrendingUp, Clock, Star, ChevronDown, ChevronUp,
  Play, Pause, UserCircle, Drum, Mic
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

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
      <div className="min-h-screen w-full bg-gray-50 text-gray-900">
        <main className="p-4 sm:p-6">
          {/* Stats Cards - Now includes 5 instruments + Last Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Piano</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pianoSessions || 0}</p>
                </div>
                <Piano className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Guitar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.guitarSessions || 0}</p>
                </div>
                <Guitar className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drums</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.drumsSessions || 0}</p>
                </div>
                <Drum className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vocals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.vocalsSessions || 0}</p>
                </div>
                <Mic className="h-8 w-8 text-pink-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'No activity'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Tab Filters - Now includes all 5 instruments */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 mb-8 inline-flex shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'all' 
                  ? 'bg-purple-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All ({stats.totalSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('piano')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'piano' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Piano size={16} />
              Piano ({stats.pianoSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('guitar')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'guitar' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Guitar size={16} />
              Guitar ({stats.guitarSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('drums')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'drums' 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Drum size={16} />
              Drums ({stats.drumsSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('vocals')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'vocals' 
                  ? 'bg-pink-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Mic size={16} />
              Vocals ({stats.vocalsSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('other')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'other' 
                  ? 'bg-indigo-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Music size={16} />
              Other ({stats.otherSessions || 0})
            </button>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions Found</h3>
              <p className="text-gray-500">Start practicing to see your results here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {result.instrument === 'piano' && <Piano className="h-6 w-6 text-blue-500" />}
                        {result.instrument === 'guitar' && <Guitar className="h-6 w-6 text-green-500" />}
                        {result.instrument === 'drums' && <Drum className="h-6 w-6 text-orange-500" />}
                        {result.instrument === 'vocals' && <Mic className="h-6 w-6 text-pink-500" />}
                        {result.instrument === 'other' && <Music className="h-6 w-6 text-indigo-500" />}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{result.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(result.createdAt).toLocaleDateString()}
                            </span>
                            {result.tutorScore !== undefined && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                Tutor Score: {result.tutorScore}/10
                              </span>
                            )}
                            <span className="capitalize">{result.instrument}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
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
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                    { result.tutorFeedback && (
                      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                        <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                          Tutor Feedback
                        </h4>
                        <p className="text-sm text-yellow-900">{result.tutorFeedback}</p>
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
        </main>
      </div>
    </DashboardLayout>
  );
}