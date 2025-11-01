"use client";
import React from "react";
import Link from 'next/link';
import AssignmentCompletionTrends from "../../components/academy/AssignmentCompletionTrends";
import AssignmentsList from "../../components/academy/AssignmentsList";


const Assignments = () => {
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
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>342</h2>
                        <p className='m-0 p-0 pt-2'>Total Assignments (Active)</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>198</h2>
                        <p className='m-0 p-0 pt-2'>Completed Assignments</p>
                        <span className="badge tag-exam">58%</span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>114</h2>
                        <p className='m-0 p-0 pt-2'>Pending Submissions</p>
                        <span className="badge tag-red">33%</span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>30</h2>
                        <p className='m-0 p-0 pt-2'>Overdue Assignments</p>
                        <span className="badge tag-red">9%</span>
                    </Link>
                </div>
                {/* <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>156</h2>
                        <p className='m-0 p-0 pt-2'>Awaiting Grading</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>72%</h2>
                        <p className='m-0 p-0 pt-2'>Avg Completion Rate</p>
                    </Link>
                </div> */}
            </div>
        </div>
      </div>
      <div className="chart-sec mb-4 container-fluid">
          <div className="row align-ite">
              <div className="col-md-12 mb-4">
                <div className="card-box">
                    <AssignmentCompletionTrends />
                </div>
              </div>
          </div>
        </div>

      <div className="table-box  container-fluid">
        <AssignmentsList />
      </div>
    </div>

  )
}

export default Assignments