"use client";
import { useState, useEffect } from 'react';
import { LogOut, ChevronLeft, ChevronRight, User, BookOpen, PlusCircle, Users, BookCheck, Menu, X } from "lucide-react";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [instrument, setInstrument] = useState('');
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);

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
    loadResults();
  }, []);

  const loadResults = () => {
    try {
      if (typeof window === 'undefined') return;
      
      // Read from original session storage key
      const resultsData = sessionStorage.getItem('practiceAnalysisResults');
      const instrumentData = sessionStorage.getItem('practiceAnalysisInstrument');
      
      if (!resultsData) {
        setError(true);
        setLoading(false);
        return;
      }

      const data = JSON.parse(resultsData);
      setResults(data);
      setInstrument(instrumentData || '');
      setLoading(false);
    } catch (error) {
      console.error('Error loading results:', error);
      setError(true);
      setLoading(false);
    }
  };

  const saveResults = async () => {
    if (!results) return;
    
    try {
      setSaving(true);
      
      const response = await fetch('/Api/practice/saveResult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instrument: instrument,
          cloudinaryPublicId: results.audioFile?.publicId,
          audioFileUrl: results.audioFile?.url,
          mp3Url: results.audioFile?.mp3_url,
          shouldSave: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save results');
      }

      const data = await response.json();
      
      // Clear session storage after successful save
      sessionStorage.removeItem('practiceAnalysisResults');
      sessionStorage.removeItem('practiceAnalysisInstrument');
      
      alert(`Practice recording "${data.title}" saved successfully!`);
      
      // Redirect to practice history or dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const userType = urlParams.get('user');
      
      if (userType === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/student';
      }    
    } catch (error) {
      console.error('Error saving results:', error);
      alert(`Failed to save results: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const discardResults = async () => {
    if (!results?.audioFile?.publicId) {
      // Just clear session storage if no audio file
      sessionStorage.removeItem('practiceRecordingData');
      sessionStorage.removeItem('practiceRecordingInstrument');
      const urlParams = new URLSearchParams(window.location.search);
      const userType = urlParams.get('user');
      
      if (userType === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/student';
      }    
      return;
    }
    
    if (!confirm('Are you sure you want to discard this practice session? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDiscarding(true);
      
      // Delete from Cloudinary using the cleanup API
      const response = await fetch('/Api/practice/cleanup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cloudinaryPublicId: results.audioFile.publicId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete audio file');
      }
      
      // Clear session storage
      sessionStorage.removeItem('practiceRecordingData');
      sessionStorage.removeItem('practiceRecordingInstrument');
      
      alert('Practice session discarded and audio file deleted successfully');
      const urlParams = new URLSearchParams(window.location.search);
      const userType = urlParams.get('user');
      
      if (userType === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/student';
      }    
    } catch (error) {
      console.error('Error discarding results:', error);
      alert(`Failed to discard results: ${error.message}`);
    } finally {
      setDiscarding(false);
    }
  };

  const goBack = () => {
    // Clear session storage and go back to practice
    sessionStorage.removeItem('practiceRecordingData');
    sessionStorage.removeItem('practiceRecordingInstrument');
    
    // Check for user query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('user');
    
    if (userType === 'student') {
      window.location.href = '/student';
    } else {
      window.location.href = '/student';
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isProcessing = saving || discarding;

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
            <h3 className="text-lg font-semibold mb-2">No Recording Found</h3>
            <p>No recording was found. Please go back and record your practice session.</p>
          </div>
          <button 
            onClick={goBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Practice Recording</h1>
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
          {/* Session Complete Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">Recording Saved!</h1>
            <p className="text-gray-500">Your practice session has been recorded</p>
            {results?.audioFile && (
              <div className="text-sm text-gray-400 mt-2">
                Audio file: {(results.audioFile.size / (1024 * 1024)).toFixed(2)} MB • {instrument.toUpperCase()}
              </div>
            )}
          </div>

          {/* Audio Player Section */}
          {results?.audioFile && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Recording</h3>
              <audio 
                controls 
                className="w-full"
                src={results.audioFile.playback_url || results.audioFile.mp3_url || results.audioFile.url}
              >
                Your browser does not support the audio element.
              </audio>
              <div className="mt-4 flex gap-2 justify-center">
                <a 
                  href={results.audioFile.download_url || results.audioFile.url} 
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                >
                  Download Recording
                </a>
              </div>
            </div>
          )}

          {/* Recording Details */}
          {results?.audioFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h4 className="font-medium text-blue-800 mb-2">Recording Details</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Instrument: {instrument.toUpperCase()}</div>
                <div>File Size: {(results.audioFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                <div>Format: {results.audioFile.type}</div>
                {results.audioFile.has_mp3_version && <div>MP3 version: Available</div>}
                <div>Stored in: Cloudinary</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              onClick={saveResults}
              disabled={isProcessing}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {saving ? 'Saving...' : 'Save Recording'}
            </button>
            <button
              onClick={discardResults}
              disabled={isProcessing}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {discarding ? 'Discarding...' : 'Discard'}
            </button>
            <button
              onClick={goBack}
              disabled={isProcessing}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              New Recording
            </button>
          </div>

          {/* Timestamp */}
          {results?.timestamp && (
            <div className="text-center text-gray-500 text-sm mt-6">
              Recording created on {new Date(results.timestamp).toLocaleString()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}