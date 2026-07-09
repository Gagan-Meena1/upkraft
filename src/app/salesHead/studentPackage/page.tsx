"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

// Types based on API response
interface Lead {
  id: string;
  studentId: string;
  courseId: string;
  custName: string;
  studName: string;
  email: string;
  phone: string;
  society: string;
  tutorName: string;
  tutorNames: string[];
  instrument: string;
  type: string;
  rm: string;
  spoc: string;
  pkgAmount: number;
  pkgClasses: number;
  completed: number;
  totalPkg: number;
  completion: number;
  remaining: number;
  lastClassDate: string;
  daysLeft: number;
  reschCancel: number;
  renewalStatus: string;
  notes: string;
  paymentCycle: number;
}

export default function RenewalDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50;

  // Cache for pre-fetching
  const cache = useRef<Record<number, any>>({});

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    society: "",
    tutorName: "",
    rm: "",
    spoc: "",
    type: "",
    renewalStatus: "",
  });

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [tutorNames, setTutorNames] = useState<string[]>([]);


  // Stats (if we calculate locally from current page, or we skip for now since it requires full DB scan)
  // We'll just calculate stats for the CURRENT page to show visual urgency
  const urgencyOf = (l: Lead) => {
    if (l.renewalStatus === "Renewed") return "renewed";
    if (l.completion >= 100 && l.daysLeft <= 0) return "complete";
    if (l.daysLeft <= 7) return "urgent";
    if (l.daysLeft <= 20) return "soon";
    return "ok";
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
      cache.current = {}; // Clear cache on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    cache.current = {};
  };

  const fetchPage = useCallback(async (targetPage: number, isPrefetch = false) => {
    // If we already have it in cache, and it's not a prefetch, just use it
    if (!isPrefetch && cache.current[targetPage]) {
      setLeads(cache.current[targetPage].data);
      setTotalPages(cache.current[targetPage].pagination.totalPages);
      setTotalItems(cache.current[targetPage].pagination.total);
      setLoading(false);
      return;
    }

    try {
      if (!isPrefetch) setLoading(true);

      const query = new URLSearchParams({
        page: targetPage.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        ...filters
      });

      const res = await fetch(`/Api/salesHead/studentPackage?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        cache.current[targetPage] = data; // Save to cache

        if (!isPrefetch) {
          setLeads(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.total);
          if (data.tutorNames) setTutorNames(data.tutorNames);  // ← add this

        }
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
      if (!isPrefetch) toast.error("Failed to load dashboard data");
    } finally {
      if (!isPrefetch) setLoading(false);
    }
  }, [debouncedSearch, filters, limit]);

  // Main effect to load current page and pre-fetch neighbors
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // 1. Fetch current page
      await fetchPage(page);

      if (!isMounted) return;

      // 2. Pre-fetch next page silently
      if (page < totalPages && !cache.current[page + 1]) {
        fetchPage(page + 1, true);
      }

      // 3. Pre-fetch prev page silently
      if (page > 1 && !cache.current[page - 1]) {
        fetchPage(page - 1, true);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [page, fetchPage, totalPages]);

  // Update inline Renewal Status
  const handleInlineStatusUpdate = async (id: string, studentId: string, newStatus: string) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, renewalStatus: newStatus } : l));

    // Also update cache so if they navigate back it's still updated
    Object.values(cache.current).forEach((cachePage: any) => {
      cachePage.data = cachePage.data.map((l: Lead) =>
        l.id === id ? { ...l, renewalStatus: newStatus } : l
      );
    });



    try {
      const res = await fetch("/Api/salesHead/studentPackage/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, renewalStatus: newStatus })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      // Revert if failed
      fetchPage(page);
    }
  };
  // Add this handler near your other handlers
  const handleHideStudent = async (id: string, studentId: string) => {
    if (!confirm("Hide this student from the renewal dashboard?")) return;

    // Optimistic remove from UI
    setLeads(prev => prev.filter(l => l.id !== id));
    setTotalItems(prev => prev - 1);

    try {
      const res = await fetch("/Api/salesHead/studentPackage/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, hideFromRenewalDashboard: true })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Student hidden from dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to hide student");
      fetchPage(page); // revert
    }
  };

  // Save Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const res = await fetch("/Api/salesHead/studentPackage/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: editingLead.studentId,
          custName: editingLead.custName,
          email: editingLead.email,
          phone: editingLead.phone,
          society: editingLead.society,
          salesSPOC: editingLead.spoc,
          renewalStatus: editingLead.renewalStatus,
          notes: editingLead.notes,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Details updated successfully");
        setIsModalOpen(false);
        // Force refresh current page to get DB truth
        cache.current[page] = null;
        fetchPage(page);
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (err: any) {
      toast.error("Failed to save changes");
    }
  };

  // UI Helpers
  const renderDaysPill = (l: Lead) => {
    const urgency = urgencyOf(l);
    switch (urgency) {
      case "renewed": return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">♻ Renewed</span>;
      case "complete": return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">✅ Complete</span>;
      case "urgent": return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">🔴 {l.daysLeft}d</span>;
      case "soon": return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">🟡 {l.daysLeft}d</span>;
      default: return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">🟢 {l.daysLeft}d</span>;
    }
  };

  const getProgColor = (comp: number) => {
    if (comp >= 100) return "#2563eb";
    if (comp >= 70) return "#059669";
    if (comp >= 40) return "#d97706";
    return "#dc2626";
  };

  return (
    <div className="min-h-screen bg-[#f4f4f9] text-[#1a1a2e] font-sans pb-10">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-[54px] flex items-center px-5 sticky top-0 z-50 shadow-sm gap-3">
        <div className="text-[17px] font-extrabold tracking-tight">
          <span className="text-[#5C16C5]">Up</span><span className="text-gray-600">Kraft</span>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 rounded px-2 py-0.5 font-bold whitespace-nowrap hidden md:inline-block">
          RENEWAL DASHBOARD
        </span>
        <div className="ml-auto flex gap-2 items-center">
          <button className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
            ⬇ Export CSV
          </button>
        </div>
      </nav>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center gap-2 p-5 pb-3">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-[280px]">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="border-none outline-none text-[13px] w-full bg-transparent"
          />
        </div>

        {/* Simple Filters */}
        <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none focus:border-purple-600 cursor-pointer"
          value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)}>
          <option value="">All Types</option>
          <option value="HOME TUTOR">HOME TUTOR</option>
          <option value="GROUP">GROUP</option>
        </select>

        <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none focus:border-purple-600 cursor-pointer"
          value={filters.renewalStatus} onChange={(e) => handleFilterChange("renewalStatus", e.target.value)}>
          <option value="">All Renewal Status</option>
          <option value="Not Contacted">Not Contacted</option>
          <option value="In Discussion">In Discussion</option>
          <option value="Renewed">Renewed</option>
          <option value="Dropped">Dropped</option>
          <option value="Follow Up">Follow Up</option>
        </select>



        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Total: {totalItems}</span>
          <div className="flex gap-1 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>
            <span className="text-xs font-semibold px-2">Pg {page} / {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="px-5 overflow-x-auto pb-8">
        <table className="w-full border-collapse bg-white border border-gray-200 rounded-xl overflow-hidden min-w-[1700px] text-[12px]">
          <thead className="bg-[#faf9ff] border-b-2 border-purple-100 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff] min-w-[160px]">Customer / Student</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff] min-w-[120px]">Society</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff] min-w-[140px]">Contact</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Tutor / Instrument</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Type</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">RM</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Sales SPOC</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Pkg Amount</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Completed</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Total</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Completion %</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Remaining</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Last Class / End Date</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff] min-w-[100px]">Days Left</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Renewal Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff] min-w-[150px]">Notes</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap sticky top-[54px] z-10 bg-[#faf9ff]">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading && leads.length === 0 ? (
              <tr><td colSpan={17} className="text-center py-10 text-gray-500">Loading data...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={17} className="text-center py-10 text-gray-500">No students match your filters</td></tr>
            ) : (
              leads.map((l) => {
                const rowUrgency = urgencyOf(l);
                const borderLeftColor =
                  rowUrgency === 'urgent' ? '#dc2626' :
                    rowUrgency === 'soon' ? '#d97706' :
                      rowUrgency === 'renewed' ? '#7c3aed' :
                        rowUrgency === 'complete' ? '#2563eb' : '#059669';

                return (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors bg-white group" style={{ borderLeft: `4px solid ${borderLeftColor}` }}>
                    <td className="px-4 py-3 align-middle">
                      <div className="font-bold text-gray-900 text-[12px] truncate max-w-[150px]" title={l.custName}>{l.custName || 'Unknown'}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[150px]" title={l.studName}>👤 {l.studName}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 font-medium truncate max-w-[110px]" title={l.society}>{l.society || '—'}</div>
                    </td>
                    <td className="px-4 py-3 align-middle text-[11px]">
                      {l.phone && <div><a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">📞 {l.phone}</a></div>}
                      {l.email && <div className="text-[10px] text-gray-500 truncate max-w-[130px]" title={l.email}>✉ {l.email}</div>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {l.tutorNames?.length > 1 ? (
                        // Multiple tutors — show dropdown
                        <select className="text-[11px] font-semibold text-gray-800 border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-purple-400 max-w-[130px] cursor-pointer">
                          {l.tutorNames.map((name, i) => (
                            <option key={i} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        // Single tutor — show as text
                        <div className="text-[11px] font-semibold text-gray-800 truncate max-w-[120px]" title={l.tutorName}>
                          {l.tutorName || '—'}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 truncate max-w-[120px]">🎵 {l.instrument || '—'}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {l.type === 'HOME TUTOR'
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 whitespace-nowrap">🏠 HT</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 whitespace-nowrap">👥 GRP</span>
                      }
                    </td>
                    <td className="px-4 py-3 align-middle text-[11px] font-semibold truncate max-w-[100px]">{l.rm || '—'}</td>
                    <td className="px-4 py-3 align-middle text-[11px] text-gray-600 truncate max-w-[100px]">{l.spoc || '—'}</td>
                    <td className="px-4 py-3 align-middle text-[12px] font-bold text-emerald-600">{l.pkgAmount ? `₹${l.pkgAmount}` : '—'}</td>

                    <td className="px-4 py-3 align-middle text-center font-bold text-emerald-600 text-[12px]">{l.completed}</td>
                    <td className="px-4 py-3 align-middle text-center text-[12px] font-medium">{l.totalPkg}</td>

                    <td className="px-4 py-3 align-middle">
                      <div className="w-[80px]">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(l.completion, 100)}%`, backgroundColor: getProgColor(l.completion) }}></div>
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: getProgColor(l.completion) }}>{l.completion}%</div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle text-center font-bold text-[12px]" style={{ color: l.remaining <= 2 ? '#dc2626' : 'inherit' }}>{l.remaining}</td>
                    <td className="px-4 py-3 align-middle text-[11px] whitespace-nowrap">{l.lastClassDate ? new Date(l.lastClassDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-4 py-3 align-middle">{renderDaysPill(l)}</td>

                    <td className="px-4 py-3 align-middle">
                      <select
                        className="text-[11px] font-bold rounded px-1 py-1 cursor-pointer outline-none border border-transparent hover:border-gray-300 transition-colors"
                        style={{
                          backgroundColor: l.renewalStatus === 'Renewed' ? '#f3e8ff' : l.renewalStatus === 'In Discussion' ? '#dbeafe' : l.renewalStatus === 'Dropped' ? '#fee2e2' : l.renewalStatus === 'Follow Up' ? '#fef3c7' : '#f3f4f6',
                          color: l.renewalStatus === 'Renewed' ? '#7e22ce' : l.renewalStatus === 'In Discussion' ? '#1d4ed8' : l.renewalStatus === 'Dropped' ? '#b91c1c' : l.renewalStatus === 'Follow Up' ? '#b45309' : '#6b7280'
                        }}
                        value={l.renewalStatus}
                        onChange={(e) => handleInlineStatusUpdate(l.id, l.studentId, e.target.value)}
                      >
                        <option value="Not Contacted">Not Contacted</option>
                        <option value="In Discussion">In Discussion</option>
                        <option value="Renewed">Renewed</option>
                        <option value="Dropped">Dropped</option>
                        <option value="Follow Up">Follow Up</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="text-[11px] text-gray-600 line-clamp-2 max-w-[150px]" title={l.notes}>{l.notes || '—'}</div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingLead(l); setIsModalOpen(true); }}
                          className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors shadow-sm"
                          title="Edit details"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleHideStudent(l.id, l.studentId)}
                          className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
                          title="Hide from dashboard"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingLead && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
              <h3 className="text-[15px] font-bold">Edit Details — {editingLead.custName}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-600">✕</button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveModal} className="overflow-y-auto p-6 flex flex-col gap-4">

              {/* Summary Read-only Strip */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 grid grid-cols-3 gap-3">
                <div><div className="text-[10px] text-gray-500 uppercase font-semibold">Completion</div><div className="text-[14px] font-extrabold text-purple-700">{editingLead.completion}%</div></div>
                <div><div className="text-[10px] text-gray-500 uppercase font-semibold">Days Left</div><div className="text-[14px] font-extrabold text-purple-700">{editingLead.daysLeft} d</div></div>
                <div><div className="text-[10px] text-gray-500 uppercase font-semibold">Remaining</div><div className="text-[14px] font-extrabold text-purple-700">{editingLead.remaining}</div></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Customer Name</label>
                  <input required type="text" className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                    value={editingLead.custName} onChange={e => setEditingLead({ ...editingLead, custName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                  <input required type="text" className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                    value={editingLead.phone} onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <input type="email" className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                    value={editingLead.email} onChange={e => setEditingLead({ ...editingLead, email: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Society</label>
                  <input type="text" className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                    value={editingLead.society} onChange={e => setEditingLead({ ...editingLead, society: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Sales SPOC</label>
                  <input type="text" className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600"
                    value={editingLead.spoc} onChange={e => setEditingLead({ ...editingLead, spoc: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Renewal Status</label>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 bg-white cursor-pointer"
                    value={editingLead.renewalStatus} onChange={e => setEditingLead({ ...editingLead, renewalStatus: e.target.value })}>
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Renewed">Renewed</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Follow Up">Follow Up</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Verbatim Notes</label>
                  <textarea rows={3} className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-purple-600 resize-none"
                    placeholder="Add notes, call summary, etc."
                    value={editingLead.notes} onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })}></textarea>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 mt-2">* Calculated fields (Completed, Total, Last Class) are strictly read-only and derived from actual attendance records.</div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#5C16C5] text-white rounded-lg text-xs font-semibold hover:bg-[#3d0e88] transition-colors">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
