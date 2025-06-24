"use client"
import React, { useState, useEffect } from 'react';
import { User, CheckCircle, XCircle, Clock, UserCheck, ArrowLeft ,Trash} from 'lucide-react';

interface Tutor {
  _id: string;
  name: string;
  email: string;
  category: string;
  isVerified: boolean;
  createdAt?: string;
  // Add other fields as per your user model
}

interface TutorData {
  verifiedTutors: Tutor[];
  unverifiedTutors: Tutor[];
  totalTutors: number;
  verifiedCount: number;
  unverifiedCount: number;
}

const TutorManagement = () => {
  const [tutorData, setTutorData] = useState<TutorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch tutors data
  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/Api/verifyingUser');
      const result = await response.json();
      
      if (response.ok) {
        setTutorData(result.data);
      } else {
        alert('Error fetching tutors: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      alert('Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  // Approve tutor
  const approveTutor = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch('/Api/verifyingUser', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('User approved successfully!');
        fetchTutors(); // Refresh data
      } else {
        alert('Error approving tutor: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Failed to approve tutor');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject tutor
  const rejectTutor = async (userId: string) => {
    if (!confirm('Are you sure you want to reject and delete this tutor? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch('/Api/verifyingUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Tutor rejected and deleted successfully!');
        fetchTutors(); // Refresh data
      } else {
        alert('Error rejecting tutor: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Failed to reject tutor');
    } finally {
      setActionLoading(null);
    }
  };
// Remove verified tutor
  const removeVerifiedTutor = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this verified tutor? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch('/Api/verifyingUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Verified tutor removed successfully!');
        fetchTutors(); // Refresh data
      } else {
        alert('Error removing tutor: ' + result.error);
      }
    } catch (error) {
      console.error('Error removing tutor:', error);
      alert('Failed to remove tutor');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: "#fffafaff" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fffafaff" }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full border border-gray-300 hover:border-orange-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-orange-600">Tutor Management</h1>
          </div>
          <p className="text-gray-600">Manage tutor verification and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tutors</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.totalTutors || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.verifiedCount || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.unverifiedCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="inline h-5 w-5 mr-2" />
                Pending ({tutorData?.unverifiedCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCheck className="inline h-5 w-5 mr-2" />
                Approved ({tutorData?.verifiedCount || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'pending' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tutors</h2>
              {tutorData?.unverifiedTutors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending tutors</p>
              ) : (
                <div className="space-y-4">
                  {tutorData?.unverifiedTutors.map((tutor) => (
                    <div key={tutor._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{tutor.name}</h3>
                          <p className="text-sm text-gray-600">{tutor.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Category: {tutor.category} | ID: {tutor._id}
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => approveTutor(tutor._id)}
                            disabled={actionLoading === tutor._id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {actionLoading === tutor._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => rejectTutor(tutor._id)}
                            disabled={actionLoading === tutor._id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {actionLoading === tutor._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

         {activeTab === 'approved' && (
  <div className="p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Approved Tutors</h2>
    {tutorData?.verifiedTutors.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No approved tutors</p>
    ) : (
      <div className="space-y-4">
        {tutorData?.verifiedTutors.map((tutor) => (
          <div key={tutor._id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{tutor.name}</h3>
                <p className="text-sm text-gray-600">{tutor.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Category: {tutor.category} | ID: {tutor._id}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-600">Verified</span>
                </div>
                <button
                  onClick={() => removeVerifiedTutor(tutor._id)}
                  disabled={actionLoading === tutor._id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {actionLoading === tutor._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Trash className="h-4 w-4 mr-2" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default TutorManagement;