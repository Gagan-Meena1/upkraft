"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, BarChart3, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import axios from 'axios';

interface ClassQualityData {
  session_focus_clarity_score: number;
  session_focus_clarity_score_justification: string;
  content_delivery_score: number;
  content_delivery_justification: string;
  student_engagement_score: number;
  student_engagement_justification: string;
  student_progress_score: number;
  student_progress_justification: string;
  key_performance_score: number;
  key_performance_justification: string;
  communication_score: number;
  communication_justification: string;
  overall_quality_score: number;
  overall_quality_justification: string;
}

export default function StudentClassQualityPage() {
  const [qualityData, setQualityData] = useState<ClassQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const params = useParams();
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/Api/users/user');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${await response.text()}`);
        }
  
        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const fetchClassQuality = async () => {
    if (!params.classId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/Api/classQuality?item_id=${params.classId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setQualityData(response.data);
    } catch (err: any) {
      console.error('Error fetching class quality:', err);
      setError(err.response?.data?.error || 'Failed to fetch class quality data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically start analysis when component mounts
  useEffect(() => {
    fetchClassQuality();
  }, [params.classId]);

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
      justification: qualityData.session_focus_clarity_score_justification,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Content Delivery",
      score: qualityData.content_delivery_score,
      justification: qualityData.content_delivery_justification,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Student Engagement",
      score: qualityData.student_engagement_score,
      justification: qualityData.student_engagement_justification,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Student Progress",
      score: qualityData.student_progress_score,
      justification: qualityData.student_progress_justification,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Key Performance",
      score: qualityData.key_performance_score,
      justification: qualityData.key_performance_justification,
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      title: "Communication",
      score: qualityData.communication_score,
      justification: qualityData.communication_justification,
      icon: <BarChart3 className="w-6 h-6" />
    }
  ] : [];

  const pageContent = (
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
              Class Quality Analysis
            </h1>
          </div>
          {error && (
            <button
              onClick={fetchClassQuality}
              disabled={loading}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors shadow-md flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Retry Analysis</span>
            </button>
          )}
        </header>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Analyzing Class Quality
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI is reviewing the class recording and evaluating teaching effectiveness...
            </p>
            <div className="bg-gray-200 rounded-full h-2 w-64 mx-auto">
              <div className="bg-orange-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This may take a few moments</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Analysis Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Score Card */}
        {qualityData && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Quality Score</h2>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`text-6xl font-bold ${getScoreColor(qualityData.overall_quality_score).split(' ')[0]}`}>
                  {qualityData.overall_quality_score.toFixed(1)}
                </div>
                <div className="text-2xl text-gray-500">/10</div>
              </div>
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i < Math.floor(qualityData.overall_quality_score / 2) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {qualityData.overall_quality_justification}
              </p>
            </div>
          </div>
        )}

        {/* Quality Metrics Grid */}
        {qualityData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getScoreColor(metric.score)}`}>
                      {metric.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{metric.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getScoreIcon(metric.score)}
                    <span className={`text-2xl font-bold ${getScoreColor(metric.score).split(' ')[0]}`}>
                      {metric.score}
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
                      style={{ width: `${(metric.score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {metric.justification}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout userData={userData} userType="student">
      {pageContent}
    </DashboardLayout>
  );
} 