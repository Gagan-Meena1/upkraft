"use client";
import React from "react";
import Link from 'next/link';
// import TutorTable from "../../components/academy/TutorTable";
import CoursesList from "../../components/academy/CoursesList";


const Courses = () => {
  return (
      <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Courses Management</h2>
          </div>
        </div>
        <div className='card-academy-box mt-4'>
            <div className='row'>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3 '>
                        <h2>28</h2>
                        <p className='m-0 p-0 pt-2'>Total Courses</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block  p-md-5 p-4 px-md-3 px-3'>
                        <h2>24</h2>
                        <p className='m-0 p-0 pt-2'>Published Courses</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>4</h2>
                        <p className='m-0 p-0 pt-2'>Draft Courses</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>487</h2>
                        <p className='m-0 p-0 pt-2'>Total Enrollments</p>
                    </Link>
                </div>
            </div>
        </div>
      </div>
      <div className="table-box container-fluid">
        <CoursesList />
      </div>
    </div>
  )
}

export default Courses