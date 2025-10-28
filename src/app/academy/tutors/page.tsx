"use client";
import React from "react";
import Image from 'next/image'
import Link from 'next/link';
import TutorTable from "../../components/academy/TutorTable";

const Tutors = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Tutors Management</h2>
          </div>
        </div>
        <div className='card-academy-box mt-4'>
            <div className='row'>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3 '>
                        <h2>24</h2>
                        <p className='m-0 p-0 pt-2'>Total Tutors</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block  p-md-5 p-4 px-md-3 px-3'>
                        <h2>22</h2>
                        <p className='m-0 p-0 pt-2'>Active Now</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>480</h2>
                        <p className='m-0 p-0 pt-2'>Total Students</p>
                    </Link>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <Link href="/" className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>₹8.4L</h2>
                        <p className='m-0 p-0 pt-2'>Monthly Revenue</p>
                    </Link>
                </div>
            </div>
        </div>
      </div>
      <div className="table-box container-fluid">
        <TutorTable />
      </div>
    </div>
  );
};

export default Tutors;
