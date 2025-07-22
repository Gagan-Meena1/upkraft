"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Download, User, Calendar, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

const TalentDisplayPage = () => {
  const [talentData, setTalentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  
  const fetchTalentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/admin/talent`);
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
    fetchTalentData();
  }, []);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base sm:text-lg">Loading talent data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => router.push('/student')}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors duration-200 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 break-words">
              Talent Assessment
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                    Talent Document
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Assessment and Recommendations
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Recommendation Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 mb-3 sm:mb-4 flex items-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                  <span className="break-words">Recommendation</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-orange-500">
                  <p className="text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap break-words">
                    {talentData?.recommendation || 'No recommendation available'}
                  </p>
                </div>
              </div>

              {/* File Section */}
              {talentData?.fileUrl && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 mb-3 sm:mb-4 flex items-center">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                    <span className="break-words">Attached File</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {talentData.fileName || 'Talent File'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Click to download
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleFileDownload}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-bold text-orange-600 mb-3 sm:mb-4 flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="break-words">Document Information</span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Created Date</p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                      {formatDate(talentData?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 px-4">
          <p className="text-gray-500 text-xs sm:text-sm break-words">
            This talent assessment document was generated on {formatDate(talentData?.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalentDisplayPage;