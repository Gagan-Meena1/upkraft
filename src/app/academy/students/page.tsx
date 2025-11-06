"use client";
import React from "react";
import Link from 'next/link';
import StudentGrowthTrend from "../../components/academy/StudentGrowthTrend";
import StudentTable from "../../components/academy/StudentTable";
// import TutorTable from "../components/TutorTable";


const Students = () => {
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
                          <h2>487</h2>
                          <p className='m-0 p-0 pt-2'>Total Students</p>
                          <span className="badge tag-exam">↑ 8.5%</span>
                      </Link>
                  </div>
                  <div className='col-lg-3 col-6 mb-4'>
                      <Link href="/" className='card-box academy-card d-block  p-md-5 p-4 px-md-3 px-3'>
                          <h2>452</h2>
                          <p className='m-0 p-0 pt-2'>Active Students</p>
                          <span className="badge tag-exam">↑ 12 new</span>
                      </Link>
                  </div>
                  <div className='col-lg-3 col-6 mb-4'>
                      <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                          <h2>35</h2>
                          <p className='m-0 p-0 pt-2'>Trial Students</p>
                          <span className="badge tag-exam">↑ 5 this week</span>
                      </Link>
                  </div>
                  <div className='col-lg-3 col-6 mb-4'>
                      <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                          <h2>91%</h2>
                          <p className='m-0 p-0 pt-2'>Retention Rate</p>
                          <span className="badge tag-exam">↑ 2.3%</span>
                      </Link>
                  </div>
              </div>
          </div>
        </div>
        
          <div className="chart-sec mb-4">
            <div className="row align-ite">
                <div className="col-lg-12 mb-lg-0 mb-4">
                  <div className="card-box">
                      <StudentGrowthTrend />
                  </div>
                </div>
                {/* <div className="col-lg-3">
                  <div className="chart-text-right card-box h-100 d-flex align-items-center">
                    <ul className="p-0 m-0 list-unstyled">
                      <li>
                        <span className="top-data">Inquiries</span>
                        <span className="bottom-data">542</span>
                      </li>
                      <li>
                        <span className="top-data">Trial Started</span>
                        <span className="bottom-data">461</span>
                      </li>
                      <li>
                        <span className="top-data">Converted</span>
                        <span className="bottom-data">382</span>
                      </li>
                      <li className="mb-0">
                        <span className="top-data">Active (3+ mo)</span>
                        <span className="bottom-data">298</span>
                      </li>
                    </ul>
                  </div>
                </div> */}
            </div>
          </div>

        <div className="table-box">
          <StudentTable />
        </div>
      </div>
    </div>
  )
}

export default Students