"use client";

import React, { useEffect, useState } from 'react';
import './dashboard.css';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import StatsRow from './components/StatsRow';
import Toolbar from './components/Toolbar';
import LeadsTable from './components/LeadsTable';
import Pagination from './components/Pagination';

export default function SalesHeadDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/Api/registration');
        const data = await res.json();
        if (data.success) {
          setLeads(data.data);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  return (
    <div className="dashboard-root">
      <div className="dashboard-body">
        <Sidebar />
        <div className="main">
          <TopNav />
          <StatsRow />
          <Toolbar />
          {loading ? (
            <div className="empty-state">
              <div className="em-ico">⏳</div>
              <p>Loading leads...</p>
            </div>
          ) : (
            <LeadsTable leads={leads} />
          )}
          <Pagination />
        </div>
      </div>
    </div>
  );
}
