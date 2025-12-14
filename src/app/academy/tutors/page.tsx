"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link';
import TutorTable from "../../components/academy/TutorTable";
import AddNewTutorModal from "../../components/AddNewTutorModal";
import { useRouter } from 'next/navigation';
import { UserPlus, Users } from "lucide-react";

const Tutors = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalTutors: 0,
    activeTutors: 0,
    totalStudents: 0,
    monthlyRevenue: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [tutors, setTutors] = useState([]);

  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

const fetchStats = async () => {
  try {
    setLoadingStats(true);
    const response = await fetch("/Api/academy/tutors");
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.tutors) {
        const tutorsData = data.tutors;
        
        // Store tutors data
        setTutors(tutorsData);
        
        const activeTutors = tutorsData.filter(t => t.isVerified).length;
        const totalStudents = tutorsData.reduce((sum, t) => sum + (t.studentCount || 0), 0);
        const monthlyRevenue = tutorsData.reduce((sum, t) => sum + (t.revenue || 0), 0);
        
        setStats({
          totalTutors: tutorsData.length,
          activeTutors,
          totalStudents,
          monthlyRevenue
        });
      }
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    setLoadingStats(false);
  }
};

  const handleTutorAdded = () => {
    // Trigger refresh of tutor table and stats
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

  const handleManageSlotsClick = () => {
    router.push('/academy/slots');
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sec container-fluid">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Tutors Management</h2>
          </div>
          <div className="right-form d-flex align-items-center gap-3 flex-xl-nowrap flex-wrap">
            <button 
              onClick={handleManageSlotsClick}
              className="btn btn-primary add-assignments d-flex align-items-center justify-content-center gap-2"
            >
              <span className="mr-2"><Users/></span> Manage Slots
            </button>
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
                    <div className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>{loadingStats ? "..." : stats.totalTutors}</h2>
                        <p className='m-0 p-0 pt-2'>Total Tutors</p>
                    </div>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <div className='card-box academy-card d-block  p-md-5 p-4 px-md-3 px-3'>
                        <h2>{loadingStats ? "..." : stats.activeTutors}</h2>
                        <p className='m-0 p-0 pt-2'>Active Now</p>
                    </div>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <div className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>{loadingStats ? "..." : stats.totalStudents}</h2>
                        <p className='m-0 p-0 pt-2'>Total Students</p>
                    </div>
                </div>
                <div className='col-lg-3 col-6 mb-4'>
                    <div className='card-box academy-card d-block p-md-5 p-4 px-md-3 px-3'>
                        <h2>{loadingStats ? "..." : formatCurrency(stats.monthlyRevenue)}</h2>
                        <p className='m-0 p-0 pt-2'>Monthly Revenue</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div className="table-box container-fluid">
<TutorTable 
  key={refreshKey} 
  tutorsData={tutors} 
  loading={loadingStats}
/>      </div>
      <AddNewTutorModal onTutorAdded={handleTutorAdded} />
    </div>
  );
};

export default Tutors;
