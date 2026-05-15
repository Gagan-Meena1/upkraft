"use client";
import React from 'react';

interface ToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  demoFilter: string;
  onDemoFilterChange: (val: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (val: string) => void;
  tutorFilter: string;
  onTutorFilterChange: (val: string) => void;
  tutorNames: string[];
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  totalCount: number;
  filteredCount: number;
  onAddLead?: () => void;
}

export default function Toolbar({
  search, onSearchChange,
  demoFilter, onDemoFilterChange,
  paymentFilter, onPaymentFilterChange,
  tutorFilter, onTutorFilterChange,
  tutorNames,
  dateFilter, onDateFilterChange,
  totalCount, filteredCount,
  onAddLead,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="filter-select"
        value={demoFilter}
        onChange={e => onDemoFilterChange(e.target.value)}
      >
        <option value="">All Demo Status</option>
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Overdue">Overdue</option>
      </select>

      <select
        className="filter-select"
        value={paymentFilter}
        onChange={e => onPaymentFilterChange(e.target.value)}
      >
        <option value="">All Payment Status</option>
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
      </select>

      <select
        className="filter-select"
        value={tutorFilter}
        onChange={e => onTutorFilterChange(e.target.value)}
      >
        <option value="">All Tutors</option>
        {tutorNames.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      <input
        type="date"
        className="filter-select"
        value={dateFilter}
        onChange={e => onDateFilterChange(e.target.value)}
        title="Filter by slot assigned date"
      />

      <div className="toolbar-right">
        {onAddLead && (
          <button className="btn btn-primary add-lead-btn" onClick={onAddLead}>
            + Add Lead
          </button>
        )}
        <div className="result-count">
          Showing {filteredCount} of {totalCount} leads
        </div>
      </div>
    </div>
  );
}
