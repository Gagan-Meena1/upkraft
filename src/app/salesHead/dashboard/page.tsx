"use client";

import React, { useEffect, useState, useMemo } from 'react';
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

  // Filter state
  const [search, setSearch] = useState('');
  const [demoFilter, setDemoFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [tutorFilter, setTutorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  // Extract unique tutor names from leads
  const tutorNames = useMemo(() => {
    const names = new Set<string>();
    leads.forEach(lead => {
      if (lead.tutorName && typeof lead.tutorName === 'object' && lead.tutorName.username) {
        names.add(lead.tutorName.username);
      }
    });
    return Array.from(names).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          (lead.name || '').toLowerCase().includes(q) ||
          (lead.contactNumber || '').includes(q) ||
          (lead.email || '').toLowerCase().includes(q) ||
          (lead.participantName || '').toLowerCase().includes(q) ||
          (lead._id || '').toString().toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Demo status filter
      if (demoFilter) {
        const leadStatus = lead.status || 'Pending';
        if (leadStatus !== demoFilter) return false;
      }

      // Payment status filter
      if (paymentFilter) {
        const leadPaymentStatus = lead.payment?.status || 'Pending';
        if (leadPaymentStatus !== paymentFilter) return false;
      }

      // Tutor name filter
      if (tutorFilter) {
        const leadTutorName = lead.tutorName && typeof lead.tutorName === 'object'
          ? lead.tutorName.username : null;
        if (leadTutorName !== tutorFilter) return false;
      }

      // Slot assigned date filter
      if (dateFilter) {
        const slotDate = lead.demoDate;
        if (!slotDate) return false;
        // Compare YYYY-MM-DD
        const leadDate = new Date(slotDate).toISOString().split('T')[0];
        if (leadDate !== dateFilter) return false;
      }

      return true;
    });
  }, [leads, search, demoFilter, paymentFilter, tutorFilter, dateFilter]);

  // Callback for LeadsTable to update leads in-place after edit
  const handleLeadUpdated = (updatedLead: any) => {
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? { ...l, ...updatedLead } : l));
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-body">
        <Sidebar />
        <div className="main">
          <TopNav />
          <StatsRow />
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            demoFilter={demoFilter}
            onDemoFilterChange={setDemoFilter}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={setPaymentFilter}
            tutorFilter={tutorFilter}
            onTutorFilterChange={setTutorFilter}
            tutorNames={tutorNames}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            totalCount={leads.length}
            filteredCount={filteredLeads.length}
          />
          {loading ? (
            <div className="empty-state">
              <div className="em-ico">⏳</div>
              <p>Loading leads...</p>
            </div>
          ) : (
            <LeadsTable leads={filteredLeads} onLeadUpdated={handleLeadUpdated} />
          )}
          <Pagination />
        </div>
      </div>
    </div>
  );
}
