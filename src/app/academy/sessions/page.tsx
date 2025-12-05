"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import SessionList from "../../components/academy/SessionList";

interface SessionStats {
  totalSessions: number;
  totalSessionsChange: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  attendanceRate: number;
  attendanceRateChange: number;
  avgQualityScore: number;
}

interface ClassData {
  _id: string;
  title: string;
  course: any;
  instructor: any;
  startTime: Date;
  endTime: Date;
  status: string;
  recordingUrl?: string;
  evaluation?: any;
  tutors: { name: string; email: string }[];  // Add this
  students: { name: string; email: string }[]; // Add this
}

const Sessions =  () => {
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalSessionsChange: 0,
    completedSessions: 0,
    scheduledSessions: 0,
    cancelledSessions: 0,
    attendanceRate: 0,
    attendanceRateChange: 0,
    avgQualityScore: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ClassData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  

const fetchData = async () => {
  try {
    setLoading(true);
    
    // Fetch both stats and sessions from single API
    const response = await fetch('/Api/academy/sessions');
    const data = await response.json();
    
    if (data.success) {
      setStats(data.stats);
      if (data.classData) {
        setSessions(data.classData);
      }
    }
    
  } catch (err) {
    console.error('Error fetching data:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const renderChangeIndicator = (change: number) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <span className={`badge ${isPositive ? 'tag-exam' : 'bg-danger'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-sec container-fluid">
          <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
            <div className="left-head">
              <h2 className="m-0">Sessions Management</h2>
            </div>
          </div>
          <div className="w-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-sec container-fluid">
          <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
            <div className="left-head">
              <h2 className="m-0">Sessions Management</h2>
            </div>
          </div>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Sessions Management</h2>
          </div>
        </div>
        <div className='card-academy-box mt-4'>
          <div className='row'>
            <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{formatNumber(stats.totalSessions)}</h2>
                <p className='m-0 p-0 pt-2'>Total Sessions (This Month)</p>
                {renderChangeIndicator(stats.totalSessionsChange)}
              </Link>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{formatNumber(stats.completedSessions)}</h2>
                <p className='m-0 p-0 pt-2'>Completed Sessions</p>
              </Link>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{formatNumber(stats.scheduledSessions)}</h2>
                <p className='m-0 p-0 pt-2'>Scheduled Sessions</p>
              </Link>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{formatNumber(stats.cancelledSessions)}</h2>
                <p className='m-0 p-0 pt-2'>Cancelled Sessions</p>
              </Link>
            </div>
            {/* <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{stats.attendanceRate}%</h2>
                <p className='m-0 p-0 pt-2'>Attendance Rate</p>
                {renderChangeIndicator(stats.attendanceRateChange)}
              </Link>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <Link href="/" className='card-box academy-card d-block h-100'>
                <h2>{stats.avgQualityScore}</h2>
                <p className='m-0 p-0 pt-2'>Avg Quality Score</p>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      <div className="table-box container-fluid">
<SessionList sessions={sessions} />      </div>
    </div>
  );
};

export default Sessions;