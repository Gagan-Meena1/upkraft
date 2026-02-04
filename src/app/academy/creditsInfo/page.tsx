"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Spinner, Alert } from 'react-bootstrap';
import Profile from "../../../assets/Mask-profile.png";

function CreditsInfoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }

    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/academy/userDetail?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      
      if (data.success) {
        setUserData(data.user);
      } else {
        throw new Error(data.error || 'Failed to load user data');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => router.back()}>
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">
          <p>No user data found</p>
          <Button variant="outline-warning" onClick={() => router.back()}>
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  const totalCreditsAdded = userData.creditsInput
    ?.filter(item => item.credits > 0)
    .reduce((sum, item) => sum + item.credits, 0) || 0;

  const totalCreditsDeducted = userData.creditsInput
    ?.filter(item => item.credits < 0)
    .reduce((sum, item) => sum + Math.abs(item.credits), 0) || 0;

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            ← Back
          </Button>
          <h2 className="mb-0">Credits Information</h2>
        </div>
      </div>

      <div className="row g-4">
        {/* Student Info Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <Image
                  src={userData.profileImage || Profile}
                  alt={userData.username}
                  width={100}
                  height={100}
                  className="rounded-circle"
                />
              </div>
              <h4 className="mb-2">{userData.username}</h4>
              <p className="text-muted mb-1">{userData.email}</p>
              {/* {userData.contact && (
                <p className="text-muted mb-1">📞 {userData.contact}</p>
              )} */}
              {userData.city && (
                <p className="text-muted mb-3">📍 {userData.city}</p>
              )}
              
              <div className="mt-4 p-3 bg-light rounded">
                <div className="text-muted small mb-1">Current Balance</div>
                <div className="display-6 fw-bold text-primary">
                  {userData.credits || 0}
                  <span className="fs-6 text-muted ms-2">credits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {/* <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h6 className="card-title mb-3">Summary</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-success">✓ Total Added:</span>
                <strong className="text-success">+{totalCreditsAdded}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-danger">✗ Total Deducted:</span>
                <strong className="text-danger">-{totalCreditsDeducted}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Net Balance:</span>
                <strong className="text-primary">{userData.credits || 0}</strong>
              </div>
            </div>
          </div> */}
        </div>

        {/* Credits History */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Credits Transaction History</h5>
            </div>
            <div className="card-body p-0">
              {!userData.creditsInput || userData.creditsInput.length === 0 ? (
                <div className="text-center py-5">
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="mx-auto mb-3"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M9 11l3 3L22 4" 
                      stroke="#ccc" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" 
                      stroke="#ccc" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-muted">No credit transactions yet</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '15%' }}>Type</th>
                        <th style={{ width: '15%' }}>Amount</th>
                        <th style={{ width: '70%' }}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.creditsInput
                        .slice()
                        .reverse()
                        .map((transaction, index) => {
                          const isAddition = transaction.credits > 0;
                          return (
                            <tr key={index}>
                              <td>
                                <span 
                                  className={`badge ${
                                    isAddition 
                                      ? 'bg-success-subtle text-success' 
                                      : 'bg-danger-subtle text-danger'
                                  }`}
                                  style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                                >
                                  {isAddition ? '+ Added' : '- Deducted'}
                                </span>
                              </td>
                              <td>
                                <strong 
                                  className={isAddition ? 'text-success' : 'text-danger'}
                                  style={{ fontSize: '1.1rem' }}
                                >
                                  {isAddition ? '+' : ''}{transaction.credits}
                                </strong>
                              </td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="text-dark">
                                    {transaction.message || 'No message provided'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreditsInfo() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    }>
      <CreditsInfoContent />
    </Suspense>
  );
}