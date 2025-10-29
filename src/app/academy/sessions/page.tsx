"use client";
import React from "react";
import Link from 'next/link';
import SessionList from "../../components/academy/SessionList";



const Sessions = () => {
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
                        <h2>1,247</h2>
                        <p className='m-0 p-0 pt-2'>Total Sessions (This Month)</p>
                        <span className="badge tag-exam">↑ 8.2%</span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>1,168</h2>
                        <p className='m-0 p-0 pt-2'>Completed Sessions</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>58</h2>
                        <p className='m-0 p-0 pt-2'>Scheduled Sessions</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>21</h2>
                        <p className='m-0 p-0 pt-2'>Cancelled Sessions</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>94%</h2>
                        <p className='m-0 p-0 pt-2'>Attendance Rate</p>
                        <span className="badge tag-exam">↑ 2.2%</span>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block h-100'>
                        <h2>8.7</h2>
                        <p className='m-0 p-0 pt-2'>Avg Quality Score</p>
                    </Link>
                </div>
            </div>
        </div>
      </div>
      <div className="table-box container-fluid">
        <SessionList />
      </div>
    </div>
  )
}

export default Sessions