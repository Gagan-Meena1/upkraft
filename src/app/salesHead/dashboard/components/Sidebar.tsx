import React from 'react';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-fallback"><span className="up">Up</span><span className="k">Kraft</span></div>
      </div>
      <div className="sb-label">Main Menu</div>
      <div className="sb-item active">
        <span className="ico">📊</span> Dashboard
      </div>
      <div className="sb-item">
        <span className="ico">👥</span> Leads
      </div>
      <div className="sb-item">
        <span className="ico">📅</span> Schedule
      </div>
      <div className="sb-item">
        <span className="ico">📈</span> Reports
      </div>
      <div className="sb-label">Settings</div>
      <div className="sb-item">
        <span className="ico">👤</span> Profile
      </div>
      <div className="sb-item">
        <span className="ico">⚙️</span> Configuration
      </div>
      <div className="sb-footer">
        UpKraft © 2026<br/>Sales Head Portal
      </div>
    </div>
  );
}
