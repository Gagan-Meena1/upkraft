import React from "react";

interface NavbarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ weekLabel, onPrevWeek, onNextWeek }) => {
  return (
    <nav className="sm-nav">
      <div className="sm-logo">
        <span className="up">Up</span>
        <span className="k">Kraft</span>
      </div>
      <span className="sm-nav-tag">SLOT MANAGER</span>
      <div className="sm-nav-right">
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          {weekLabel}
        </span>
        <button className="sm-btn sm-btn-o" onClick={onPrevWeek}>
          ‹ Prev
        </button>
        <button className="sm-btn sm-btn-o" onClick={onNextWeek}>
          Next ›
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
