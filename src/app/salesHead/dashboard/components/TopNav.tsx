import React from 'react';

export default function TopNav() {
  return (
    <div className="topnav">
      <div>
        <h1>Lead Dashboard</h1>
        <div className="topnav-sub">Manage and track your student leads</div>
      </div>
      <div className="topnav-right">
        <button className="btn btn-outline">
          Export CSV
        </button>

      </div>
    </div>
  );
}
