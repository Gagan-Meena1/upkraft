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
  const router = useRouter(); 

  useEffect(() => {
    // Option 1: Priority is analysisData prop
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

  const handleBackToPractice = () => {
    router.push('/visualizer.html');
  };

  const handleSaveResults = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your practice results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Session Complete!
              </h1>
              <p className="text-gray-600">
                "Practice Session Analysis" / Practice Session / Technique Assessment
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
            <div className="text-sm text-gray-600">Overall Performance</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{Object.keys(results.ratings).length}</div>
            <div className="text-sm text-gray-600">Techniques Analyzed</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Areas Improved</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">+3min</div>
            <div className="text-sm text-gray-600">Practice Time</div>
          </div>
        </div> */}

        {/* Main Results Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-purple-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Techniques Analysis</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-1/4">Technique</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-3/8">Feedback</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-3/8">Suggestions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(results.ratings).map(([technique, rating], index) => (
                  <tr key={technique} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {formatTechniqueName(technique)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {rating.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {rating.suggestion}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSaveResults}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
          >
            Save
          </button>
          <button
            onClick={handleBackToPractice}
            className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-lg border border-gray-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeResult;