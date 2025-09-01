'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 

interface TechniqueRating {
  feedback: string;
  suggestion: string;
}

interface AnalysisResult {
  ratings: {
    [key: string]: TechniqueRating;
  };
  usage_metadata: any;
}

interface PracticeResultProps {
  analysisData?: AnalysisResult;
}

const PracticeResult: React.FC<PracticeResultProps> = ({ analysisData }) => {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // This now works with App Router

  useEffect(() => {
    // Option 1: Priority is sessionStorage (from HTML page)
    if (analysisData) {
      setResults(analysisData);
      setLoading(false);
      return;
    }

    // Try to get from sessionStorage (Option 1 - from HTML file)
    try {
      const sessionData = sessionStorage.getItem('guitarAnalysisResults');
      if (sessionData) {
        const parsedResults = JSON.parse(sessionData);
        setResults(parsedResults);
        setLoading(false);
        // Clear the session storage after using it
        sessionStorage.removeItem('guitarAnalysisResults');
        return;
      }
    } catch (error) {
      console.error('Error parsing results from sessionStorage:', error);
    }

    // Fallback: Try URL search params if sessionStorage fails
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const resultsParam = urlParams.get('results');
      if (resultsParam) {
        try {
          const parsedResults = JSON.parse(decodeURIComponent(resultsParam));
          setResults(parsedResults);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing results from URL:', error);
        }
      }
    }

    setLoading(false);
  }, [analysisData]);

  const formatTechniqueName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Qulaity/, 'Quality'); // Fix typo in the API response
  };

  const getTechniqueIcon = (technique: string): string => {
    const iconMap: { [key: string]: string } = {
      scales: '🎵',
      chords: '🎸',
      strumming: '🎼',
      hammer: '🔨',
      pull: '↩️',
      slides: '↗️',
      bends: '↩️',
      improvisation: '🎭',
      melody: '🎶',
      sight: '👁️',
      genre: '🎯',
      articulation: '🗣️',
      palm: '✋',
      sweep: '🧹',
      harmonics: '💫',
      vibrato: '〰️',
      fluency: '⚡',
      accuracy: '🎯',
      dynamic: '🔊',
      understanding: '🧠'
    };

    const key = Object.keys(iconMap).find(k => technique.toLowerCase().includes(k));
    return key ? iconMap[key] : '🎸';
  };

  const handleBackToPractice = () => {
    router.push('/tutor');
  };

  const handleViewProgress = () => {
    router.push('/tutor/progress');
  };

  const handleSaveResults = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your practice results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find your practice analysis results.
          </p>
          <button
            onClick={handleBackToPractice}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-8 text-center shadow-lg">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎸 Practice Analysis Results
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your detailed feedback and suggestions for improvement
          </p>
        </div>

        {/* Results Grid */}
        <div className="bg-white rounded-b-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results.ratings).map(([technique, rating]) => (
              <div
                key={technique}
                className="bg-gray-50 rounded-xl p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">
                    {getTechniqueIcon(technique)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formatTechniqueName(technique)}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Feedback
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed pl-4">
                      {rating.feedback}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Suggestion
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed pl-4">
                      {rating.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToPractice}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Practice Again
          </button>
          <button
            onClick={handleSaveResults}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Save Results
          </button>
          <button
            onClick={handleViewProgress}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeResult;