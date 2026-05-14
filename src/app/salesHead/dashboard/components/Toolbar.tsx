import React from 'react';

export default function Toolbar() {
  return (
    <div className="toolbar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search by name, phone, or ID..." />
      </div>
      <select className="filter-select">
        <option value="">All Statuses</option>
      </select>
      <select className="filter-select">
        <option value="">All Societies</option>
      </select>
      <div className="toolbar-right">
        <div className="result-count">Showing Leads</div>
      </div>
    </div>
  );
}
