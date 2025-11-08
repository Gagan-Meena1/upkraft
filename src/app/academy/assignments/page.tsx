"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import AssignmentCompletionTrends from "../../components/academy/AssignmentCompletionTrends";
import AssignmentsList from "../../components/academy/AssignmentsList";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status?: boolean;
  createdAt: string;
  tutor?: {
    userId: string;
    username: string;
    email: string;
  };
  course?: {
    _id: string;
    title: string;
    category?: string;
  };
  totalAssignedStudents?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    username: string;
    userCategory: string;
    totalAssignments: number;
    assignments: Assignment[];
  };
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completedPercentage: 0,
    pendingPercentage: 0,
    overduePercentage: 0,
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/Api/assignment');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const data: ApiResponse = await response.json();
        
        if (data.success) {
          const assignmentsData = data.data.assignments || [];
          setAssignments(assignmentsData);
          calculateStatistics(assignmentsData);
        } else {
          throw new Error(data.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const calculateStatistics = (assignmentsData: Assignment[]) => {
    const now = new Date();
    let total = 0;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    assignmentsData.forEach(assignment => {
      total++;
      const deadline = new Date(assignment.deadline);
      const isOverdue = deadline < now && !assignment.status;

      if (assignment.status) {
        completed++;
      } else if (isOverdue) {
        overdue++;
      } else {
        pending++;
      }
    });

    const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
    const overduePercentage = total > 0 ? Math.round((overdue / total) * 100) : 0;

    setStats({
      total,
      completed,
      pending,
      overdue,
      completedPercentage,
      pendingPercentage,
      overduePercentage,
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-sec container-fluid">
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-sec container-fluid">
          <div className="alert alert-danger" role="alert">
            Error: {error}
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
            <h2 className="m-0">Assignments Management</h2>
          </div>
        </div>
        <div className='card-academy-box mt-4'>
          <div className='row'>
            <div className='col-lg-3 col-6 mb-4'>
              <div className='card-box academy-card d-block h-100'>
                <h2>{stats.total}</h2>
                <p className='m-0 p-0 pt-2'>Total Assignments (Active)</p>
              </div>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <div className='card-box academy-card d-block h-100'>
                <h2>{stats.completed}</h2>
                <p className='m-0 p-0 pt-2'>Completed Assignments</p>
                <span className="badge tag-exam">{stats.completedPercentage}%</span>
              </div>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <div className='card-box academy-card d-block h-100'>
                <h2>{stats.pending}</h2>
                <p className='m-0 p-0 pt-2'>Pending Submissions</p>
                <span className="badge tag-red">{stats.pendingPercentage}%</span>
              </div>
            </div>
            <div className='col-lg-3 col-6 mb-4'>
              <div className='card-box academy-card d-block h-100'>
                <h2>{stats.overdue}</h2>
                <p className='m-0 p-0 pt-2'>Overdue Assignments</p>
                <span className="badge tag-red">{stats.overduePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-sec mb-4 container-fluid">
        <div className="row align-ite">
          <div className="col-md-12 mb-4">
            <div className="card-box">
              <AssignmentCompletionTrends assignments={assignments} />
            </div>
          </div>
        </div>
      </div>

      <div className="table-box container-fluid">
        <AssignmentsList />
      </div>
    </div>
  );
};

export default Assignments;
