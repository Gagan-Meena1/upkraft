"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
// import StudentGrowthTrend from "../../components/academy/StudentGrowthTrend";
import StudentTable from "../../components/academy/StudentTable";

interface Student {
  _id: string;
  username: string;
  email: string;
  profileImage: string;
  contact: string;
  city: string;
  tutor: string;
  course: string;
  lastClass: string | null;
  progress: number;
  attendance: Array<any>;
  status: string;
  credits: number;
  teachingMode: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  vacation: number;
  dormant: number;
  blocked: number;
}


const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [data, setData] = useState<{stats: Stats}>({stats: {
    total: 0,
    active: 0,
    inactive: 0,
    vacation: 0,
    dormant: 0,
    blocked: 0
  }});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStudents = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/Api/academy/students?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students);
      console.log("Fetched students data:", data.students);
      setPagination(data.pagination);
      setData({stats: data.stats});
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard">
      <div className="container-fluid">
        <div className="dashboard-sec">
          <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
            <div className="left-head">
              <h2 className="m-0">Students Management</h2>
            </div>
            <div className="right-form">
              <Link 
                href="/academy/createStudent"
                className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
              >
                <span className="mr-2">+</span> Add Student
              </Link>
            </div>
          </div>

          <div className='card-academy-box mt-4'>
            <div className='row'>
              <div className='col-lg-3 col-6 mb-4'>
                <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3 '>
                  <h2>{pagination?.totalStudents || 0}</h2>
                  <p className='m-0 p-0 pt-2'>Total Students</p>
                  <span className="badge tag-exam">↑ 8.5%</span>
                </Link>
              </div>
              <div className='col-lg-3 col-6 mb-4'>
                <Link href="/" className='card-box academy-card d-block  p-md-5 p-4 px-md-3 px-3'>
                  <h2>{data.stats.active}</h2>
                  <p className='m-0 p-0 pt-2'>Active Students</p>
                  <span className="badge tag-exam">↑  new</span>
                </Link>
              </div>
              {/* <div className='col-lg-3 col-6 mb-4'>
                <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                  <h2>35</h2>
                  <p className='m-0 p-0 pt-2'>Trial Students</p>
                  <span className="badge tag-exam">↑ 5 this week</span>
                </Link>
              </div> */}
              {/* <div className='col-lg-3 col-6 mb-4'>
                <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                  <h2>91%</h2>
                  <p className='m-0 p-0 pt-2'>Retention Rate</p>
                  <span className="badge tag-exam">↑ 2.3%</span>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
        
        <div className="chart-sec mb-4">
          <div className="row align-ite">
            <div className="col-lg-12 mb-lg-0 mb-4">
              <div className="card-box">
                {/* <StudentGrowthTrend /> */}
              </div>
            </div>
          </div>
        </div>

        <div className="table-box">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <StudentTable 
              students={students} 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;