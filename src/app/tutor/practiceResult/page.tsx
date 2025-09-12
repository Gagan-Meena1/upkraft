"use client";
import { useState, useEffect } from 'react';
import { LogOut, ChevronLeft, ChevronRight, User, BookOpen, PlusCircle, Users, BookCheck, Menu, X } from "lucide-react";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [instrument, setInstrument] = useState('');
  const [error, setError] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
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
        analysisResults: results.ratings,
        cloudinaryPublicId: results.audioFile?.publicId,
        audioFileUrl: results.audioFile?.url,
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
    
    alert(`Practice session "${data.title}" saved successfully!`);
    
    // Redirect to practice history or dashboard
    window.location.href = '/tutor';
    
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
    sessionStorage.removeItem('practiceAnalysisResults');
    sessionStorage.removeItem('practiceAnalysisInstrument');
    window.location.href = '/tutor';
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
    sessionStorage.removeItem('practiceAnalysisResults');
    sessionStorage.removeItem('practiceAnalysisInstrument');
    
    alert('Practice session discarded and audio file deleted successfully');
    window.location.href = '/tutor/practice';
    
  } catch (error) {
    console.error('Error discarding results:', error);
    alert(`Failed to discard results: ${error.message}`);
  } finally {
    setDiscarding(false);
  }
};

  const goBack = () => {
    // Clear session storage and go back to practice
    sessionStorage.removeItem('practiceAnalysisResults');
    sessionStorage.removeItem('practiceAnalysisInstrument');
    window.location.href = '/tutor';
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
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

  // Define sections for different instruments
  const getInstrumentSections = () => {
    if (instrument?.toLowerCase() === 'guitar') {
      return {
        'TECHNICAL FOUNDATION': [
          'scales_major_minor_pentatonic',
          'chords_and_arpeggios',
          'strumming_patterns',
          'chord_progressions',
          'hammer_ons_pull_offs_slides_bends_combined',
          'hammer_ons',
          'pull_offs'
        ],
        'LEAD GUITAR TECHNIQUES': [
          'slides',
          'bends',
          'pre_bends',
          'vibrato_control'
        ],
        'MUSICAL EXPRESSION & PERFORMANCE': [
          'melody_playing_riffs',
          'improvisation_with_midi_backing',
          'improvisation_freeform',
          'genre_specific_riffs',
          'articulation_and_phrasing',
          'expressive_intent_musicality'
        ],
        'READING & INTERPRETATION SKILLS': [
          'sight_reading_with_known_midi',
          'sight_reading_unseen_piece',
          'reading_notation_tabs',
          'palm_muting'
        ],
        'ADVANCED TECHNIQUES': [
          'sweep_picking',
          'pinch_harmonics',
          'natural_harmonics'
        ],
        'ADDITIONAL PERFORMANCE VIEW': [
          'dynamic_control',
          'fluency',
          'genre',
          'quality',
          'note_accuracy',
          'sound'
        ]
      };
    } else {
      // Default to piano sections
      return {
        'FUNDAMENTAL TECHNIQUE': [
          'scales_major_minor_pentatonic',
          'chords_and_arpeggios',
          'arpeggiated_patterns',
          'hanon_czerny_exercises',
          'octave_jumps',
          'timing_metronome_practice'
        ],
        'EXPRESSION & ARTICULATION': [
          'legato_staccato_dynamics',
          'articulation_and_phrasing',
          'right_hand_ornamentation',
          'trills_and_fast_alternations',
          'tempo_rubato_control'
        ],
        'MUSICAL APPLICATION': [
          'melody_playing_riffs',
          'genre_specific_riffs',
          'chord_progressions',
          'left_hand_accompaniment_styles'
        ],
        'ADVANCED MUSICIANSHIP': [
          'sight_reading_with_known_midi',
          'polyphonic_counterpoint',
          'voice_leading'
        ],
        'ADDITIONAL PERFORMANCE VIEW': [
          'dynamic_control',
          'fluency_and_sync',
          'understanding_of_the_style_matching_the_genre',
          'qulaity_of_sound_basis_instrument_sound',
          'note_accuracy'
        ]
      };
    }
  };

  const formatFieldName = (fieldName) => {
    const nameMap = {
      // Piano fields
      'scales_major_minor_pentatonic': 'Scales (Major/Minor/Pentatonic)',
      'chords_and_arpeggios': 'Chords & Arpeggios',
      'arpeggiated_patterns': 'Arpeggiated Patterns',
      'hanon_czerny_exercises': 'Hanon/Czerny Exercises',
      'octave_jumps': 'Octave Jumps',
      'timing_metronome_practice': 'Timing & Metronome Practice',
      'legato_staccato_dynamics': 'Legato, Staccato, Dynamics',
      'articulation_and_phrasing': 'Articulation & Phrasing',
      'right_hand_ornamentation': 'Right-hand Ornamentation',
      'trills_and_fast_alternations': 'Trills and Fast Alternations',
      'tempo_rubato_control': 'Tempo Rubato Control',
      'melody_playing_riffs': 'Melody Playing / Riffs',
      'genre_specific_riffs': 'Genre-Specific Riffs',
      'chord_progressions': 'Chord Progressions',
      'left_hand_accompaniment_styles': 'Left-hand Accompaniment Styles',
      'sight_reading_with_known_midi': 'Sight Reading (with known MIDI)',
      'polyphonic_counterpoint': 'Polyphonic Counterpoint',
      'voice_leading': 'Voice Leading',
      'dynamic_control': 'Dynamic Control',
      'fluency_and_sync': 'Fluency',
      'understanding_of_the_style_matching_the_genre': 'Genre',
      'qulaity_of_sound_basis_instrument_sound': 'Quality',
      'note_accuracy': 'Note Accuracy',
      // Guitar fields
      'strumming_patterns': 'Strumming Patterns',
      'hammer_ons_pull_offs_slides_bends_combined': 'Hammer-ons, Pull-offs, Slides, Bends (Combined)',
      'hammer_ons': 'Hammer-ons',
      'pull_offs': 'Pull-offs',
      'slides': 'Slides',
      'bends': 'Bends',
      'pre_bends': 'Pre-bends',
      'vibrato_control': 'Vibrato Control',
      'improvisation_with_midi_backing': 'Improvisation with MIDI Backing',
      'improvisation_freeform': 'Improvisation (Freeform)',
      'expressive_intent_musicality': 'Expressive Intent/Musicality',
      'sight_reading_unseen_piece': 'Sight Reading (unseen piece)',
      'reading_notation_tabs': 'Reading Notation/Tabs',
      'palm_muting': 'Palm Muting',
      'sweep_picking': 'Sweep Picking',
      'pinch_harmonics': 'Pinch Harmonics',
      'natural_harmonics': 'Natural Harmonics',
      'fluency': 'Fluency',
      'genre': 'Genre',
      'quality': 'Quality',
      'sound': 'Sound'
    };
    return nameMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p>No analysis results were found. Please go back and record your practice session.</p>
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

  const ratings = results?.ratings || {};
  const currentSections = getInstrumentSections();

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
        
        {/* Navigation Links */}
        {/* <div className="flex flex-col h-full">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <User size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Profile</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <BookOpen size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Courses</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <PlusCircle size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Create Course</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <Users size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">My Students</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Assignments</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-purple-600 bg-purple-50 transition-all">
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Practice Studio</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <BookCheck size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Music Library</span>}
            </button>
            <button className="flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
              <LogOut size={20} />
              {(sidebarOpen || isMobile) && <span className="ml-3">Logout</span>}
            </button>
          </nav>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Practice Results</h1>
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
            <h1 className="text-4xl font-bold text-purple-600 mb-2">Session Complete!</h1>
            <p className="text-gray-500">AI feedback summary for your last recording</p>
            {results?.audioFile && (
              <div className="text-sm text-gray-400 mt-2">
                Audio file: {(results.audioFile.size / (1024 * 1024)).toFixed(2)} MB • {instrument.toUpperCase()}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="mb-8 space-y-4">
            {/* Overall Rating */}
            {ratings.overall_rating && (
              <div className={`p-6 rounded-lg border ${getFeedbackColor(ratings.overall_rating.feedback)}`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-purple-600 mb-1">Overall Rating</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-50">
                    {ratings.overall_rating.feedback}
                  </span>
                </div>
                <p className="text-center text-gray-700 leading-relaxed">
                  {ratings.overall_rating.suggestion}
                </p>
              </div>
            )}
            
            {/* Places to Improve */}
            {ratings.places_to_improve && (
              <div className={`p-6 rounded-lg border ${getFeedbackColor(ratings.places_to_improve.feedback)}`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-blue-500 mb-1">Places to Improve</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-50">
                    {ratings.places_to_improve.feedback}
                  </span>
                </div>
                <p className="text-center text-gray-700 leading-relaxed">
                  {ratings.places_to_improve.suggestion}
                </p>
              </div>
            )}
          </div>

          {/* Detailed Analysis Sections */}
          <div className="space-y-4">
            {Object.entries(currentSections).map(([sectionName, fields]) => (
              <div key={sectionName} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{sectionName}</h3>
                  <button
                    onClick={() => toggleSection(sectionName)}
                    className="px-4 py-2 border border-purple-500 text-purple-600 rounded-lg font-medium hover:bg-purple-500 hover:text-white transition-all duration-200"
                  >
                    {expandedSections[sectionName] ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {expandedSections[sectionName] && fields.length > 0 && (
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-700">Aspect</th>
                            <th className="text-left py-2 font-medium text-gray-700">Feedback</th>
                            <th className="text-left py-2 font-medium text-gray-700">Suggestions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(field => {
                            const rating = ratings[field];
                            if (!rating) return null;
                            
                            return (
                              <tr key={field} className="border-b border-gray-100 last:border-b-0">
                                <td className="py-4 pr-4 font-medium text-gray-900">
                                  {formatFieldName(field)}
                                </td>
                                <td className="py-4 pr-4">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFeedbackColor(rating.feedback).replace('border-', 'border border-')}`}>
                                    {rating.feedback}
                                  </span>
                                </td>
                                <td className="py-4 text-sm text-gray-700 leading-relaxed">
                                  {rating.suggestion}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {expandedSections[sectionName] && fields.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No data available for this section
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              onClick={saveResults}
              disabled={isProcessing}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {saving ? 'Saving...' : 'Save Results'}
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
              New Practice
            </button>
          </div>

          {/* Audio File Info */}
          {results?.audioFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-800 mb-2">Recording Details</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>File Size: {(results.audioFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                <div>Format: {results.audioFile.type}</div>
                <div>Stored in: Cloudinary</div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {results?.timestamp && (
            <div className="text-center text-gray-500 text-sm mt-6">
              Analysis completed on {new Date(results.timestamp).toLocaleString()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}