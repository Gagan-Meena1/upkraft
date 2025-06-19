'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, BarChart3, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface CourseQualityData {
  session_focus_clarity_score: number;
  content_delivery_score: number;
  student_engagement_score: number;
  student_progress_score: number;
  key_performance_score: number;
  communication_score: number;
  overall_quality_score: number;
  total_classes: number;
  evaluated_classes: number;
  justification: string;
}

function CourseQualityContent() {
  const [qualityData, setQualityData] = useState<CourseQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');

  const fetchCourseQuality = async () => {
    if (!courseId) {
      console.log('No courseId, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/Api/courseQuality?courseId=${courseId}`);
      setQualityData(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No evaluated classes found for this course yet. Class quality scores will be aggregated here once classes are evaluated.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch course quality data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseQuality();
  }, [courseId]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 6) return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const qualityMetrics = qualityData ? [
    {
      title: "Session Focus Clarity",
      score: qualityData.session_focus_clarity_score,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Content Delivery",
      score: qualityData.content_delivery_score,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Student Engagement",
      score: qualityData.student_engagement_score,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Student Progress",
      score: qualityData.student_progress_score,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Key Performance",
      score: qualityData.key_performance_score,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Communication",
      score: qualityData.communication_score,
      icon: <BarChart3 className="w-6 h-6" />
    }
  ] : [];

  // Helper function to check if we have valid quality data
  const hasValidQualityData = (data: CourseQualityData | null) => {
    if (!data) return false;
    return Object.entries(data).some(([key, value]) => 
      ['session_focus_clarity_score', 'content_delivery_score', 'student_engagement_score', 
       'student_progress_score', 'key_performance_score', 'communication_score', 
       'overall_quality_score'].includes(key) && typeof value === 'number'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-md"
            >
              <ChevronLeft className="text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Course Quality Analysis
            </h1>
          </div>
        </header>

        {/* Main Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading Course Quality
            </h3>
            <p className="text-gray-600 mb-4">
              Calculating average quality scores across all classes...
            </p>
            <div className="bg-gray-200 rounded-full h-2 w-64 mx-auto">
              <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This should only take a moment</p>
          </div>
        ) : error || !hasValidQualityData(qualityData) ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              No Quality Data Available
            </h3>
            <p className="text-gray-600 mb-8">
              {error || "No evaluated classes found for this course yet. Quality scores will appear here once classes are evaluated."}
            </p>
            {qualityData?.total_classes > 0 && (
              <div className="bg-gray-50 rounded-lg py-3 px-6 inline-flex items-center gap-2 text-gray-600 mb-8">
                <span className="font-semibold">{qualityData.evaluated_classes}</span>
                <span>of</span>
                <span className="font-semibold">{qualityData.total_classes}</span>
                <span>classes evaluated</span>
              </div>
            )}
            <button
              onClick={fetchCourseQuality}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg py-3 px-6 font-medium transition-colors inline-flex items-center gap-2 mx-auto"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Check Again</span>
            </button>
          </div>
        ) : (
          <>
            {/* Overall Score Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Course Quality</h2>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className={`text-6xl font-bold ${getScoreColor(qualityData.overall_quality_score || 0).split(' ')[0]}`}>
                    {qualityData.overall_quality_score ? qualityData.overall_quality_score.toFixed(1) : '-'}
                  </div>
                  <div className="text-2xl text-gray-500">/10</div>
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${
                        qualityData.overall_quality_score && i < Math.floor(qualityData.overall_quality_score / 2) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                  {qualityData.justification}
                </p>
                <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
                  <div>Total Classes: {qualityData.total_classes}</div>
                  <div>Evaluated Classes: {qualityData.evaluated_classes}</div>
                </div>
              </div>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {qualityMetrics.filter(metric => metric.score !== undefined && metric.score !== null).map((metric, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getScoreColor(metric.score || 0)}`}>
                        {metric.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{metric.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(metric.score || 0)}
                      <span className={`text-2xl font-bold ${getScoreColor(metric.score || 0).split(' ')[0]}`}>
                        {metric.score ? metric.score.toFixed(1) : '-'}
                      </span>
                      <span className="text-gray-500">/10</span>
                    </div>
                  </div>
                  
                  {/* Score Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          metric.score >= 8 ? 'bg-green-500' :
                          metric.score >= 6 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${((metric.score || 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CourseQualityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading Course Quality
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait...
            </p>
          </div>
        </div>
      </div>
    }>
      <CourseQualityContent />
    </Suspense>
  );
} 