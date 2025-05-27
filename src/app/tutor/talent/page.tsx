"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Download, User, Calendar, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

// Separate component that uses useSearchParams
const TalentDisplayContent = () => {
  const [talentData, setTalentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const fetchTalentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/admin/talent?studentId=${studentId}`);
      const result = await response.json();

      if (result.success) {
        setTalentData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch talent data');
      }
    } catch (err) {
      setError('Network error occurred while fetching data');
      console.error('Error fetching talent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchTalentData();
    }
  }, [studentId]);

  const handleFileDownload = () => {
    if (talentData?.fileUrl) {
      const link = document.createElement('a');
      link.href = talentData.fileUrl;
      link.download = talentData.fileName || 'talent-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading talent data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push(`/tutor/studentDetails?studentId=${studentId}`)}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-4xl font-bold text-orange-600">Talent Assessment</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-orange-400" />
                <div>
                  <h2 className="text-2xl font-bold">Talent Document</h2>
                  <p className="text-gray-300">Assessment and Recommendations</p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Recommendation Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Recommendation
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-orange-500">
                  <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                    {talentData?.recommendation || 'No recommendation available'}
                  </p>
                </div>
              </div>

              {/* File Section */}
              {talentData?.fileUrl && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center">
                    <Download className="w-6 h-6 mr-2" />
                    Attached File
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {talentData.fileName || 'Talent File'}
                          </p>
                          <p className="text-sm text-gray-600">Click to download</p>
                        </div>
                      </div>
                      <button
                        onClick={handleFileDownload}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Document Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Created Date</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(talentData?.createdAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {/* Additional metadata can go here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            This talent assessment document was generated on {formatDate(talentData?.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const TalentDisplayLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Loading talent data...</p>
    </div>
  </div>
);

// Main component wrapped with Suspense
const TalentDisplayPage = () => {
  return (
    <Suspense fallback={<TalentDisplayLoading />}>
      <TalentDisplayContent />
    </Suspense>
  );
};

export default TalentDisplayPage;