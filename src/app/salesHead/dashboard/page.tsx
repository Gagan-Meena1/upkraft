"use client";

import React, { useEffect, useState, useMemo } from 'react';
import './dashboard.css';
import TopNav from './components/TopNav';
// import StatsRow from './components/StatsRow';
import Toolbar from './components/Toolbar';
import LeadsTable from './components/LeadsTable';
import Pagination from './components/Pagination';

export default function SalesHeadDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
      if (demoFilter) {
        const leadStatus = lead.status || 'Pending';
        if (leadStatus !== demoFilter) return false;
      }
      if (paymentFilter) {
        const leadPaymentStatus = lead.payment?.status || 'Pending';
        if (leadPaymentStatus !== paymentFilter) return false;
      }
      if (tutorFilter) {
        const leadTutorName = lead.tutorName && typeof lead.tutorName === 'object'
          ? lead.tutorName.username : null;
        if (leadTutorName !== tutorFilter) return false;
      }
      if (dateFilter) {
        const slotDate = lead.demoDate;
        if (!slotDate) return false;
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

  // Callback when a new lead is created — refetch all leads
  const handleLeadCreated = async () => {
    try {
      const res = await fetch('/Api/registration');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Error refetching leads:', err);
    }
  };

  // Export filtered leads as CSV
  const exportCSV = () => {
    const headers = [
      'RID', 'Name', 'Mobile', 'Email', 'Society', 'Hobby',
      'Participant', 'Enquiry Date', 'Tutor Assigned', 'Tutor Email',
      'Slot Date', 'Slot Time', 'Demo Status', 'Payment Amount',
      'Payment Status', 'Notes', 'Address'
    ];

    const escapeCSV = (val: string) => {
      if (!val) return '';
      // Wrap in quotes if it contains comma, newline, or quote
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const rows = filteredLeads.map(lead => [
      lead._id?.toString().slice(-6) || '',
      lead.name || '',
      `${lead.countryCode || ''} ${lead.contactNumber || ''}`.trim(),
      lead.email || '',
      lead.societyName || lead.city || '',
      lead.instrument || '',
      lead.participantName || '',
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '',
      lead.tutorName && typeof lead.tutorName === 'object' ? lead.tutorName.username || '' : '',
      lead.tutorName && typeof lead.tutorName === 'object' ? lead.tutorName.email || '' : '',
      lead.demoDate ? new Date(lead.demoDate).toLocaleDateString('en-GB') : '',
      lead.demoTime || '',
      lead.status || 'Pending',
      String(lead.payment?.amount || 0),
      lead.payment?.status || 'Pending',
      lead.notes || '',
      lead.address || '',
    ].map(escapeCSV));

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-body">
        {/* <Sidebar /> */}
        <div className="main">
          <TopNav />
          {/* <StatsRow /> */}
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
            onAddLead={() => setShowAddModal(true)}
            onExportCSV={exportCSV}
          />
          {loading ? (
            <div className="empty-state">
              <div className="em-ico">⏳</div>
              <p>Loading leads...</p>
            </div>
          ) : (
            <LeadsTable
              leads={filteredLeads}
              onLeadUpdated={handleLeadUpdated}
              showAddModal={showAddModal}
              onCloseAddModal={() => setShowAddModal(false)}
              onLeadCreated={handleLeadCreated}
            />
          )}
          <Pagination />
        </div>
      </div>
    </div>
  );
}
