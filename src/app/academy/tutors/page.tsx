"use client";
import React, { useState } from "react";
import Image from 'next/image'
import Link from 'next/link';
import TutorTable from "../../components/academy/TutorTable";
import AddNewTutorModal from "../../components/AddNewTutorModal";

const Tutors = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTutorAdded = () => {
    // Trigger refresh of tutor table
    setRefreshKey(prev => prev + 1);
  };

  const handleAddTutorClick = () => {
    // Open the modal using Bootstrap
    const modalElement = document.getElementById("AddTutorModal");
    if (modalElement) {
      const bootstrap = require('bootstrap');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Tutors Management</h2>
          </div>
          <div className="right-form">
            <button 
              onClick={handleAddTutorClick}
              className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
            >
              <span className="mr-2">+</span> Add Tutor
            </button>
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
        <TutorTable key={refreshKey} />
      </div>
      <AddNewTutorModal onTutorAdded={handleTutorAdded} />
    </div>
  );
};

export default Tutors;
