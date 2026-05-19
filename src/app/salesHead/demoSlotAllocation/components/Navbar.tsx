import React from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onManageSocieties: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ weekLabel, onPrevWeek, onNextWeek, onManageSocieties }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/Api/users/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

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

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "var(--bd)", margin: "0 4px" }} />

        {/* Manage Societies */}
        <button
          className="sm-btn"
          onClick={onManageSocieties}
          style={{
            background: "var(--pl)",
            color: "var(--p)",
            border: "1.5px solid var(--p)",
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          🏘️ Manage Societies
        </button>

        {/* Dashboard */}
        <button
          className="sm-btn sm-btn-o"
          onClick={() => router.push("/salesHead/dashboard")}
          style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
        >
          📊 Dashboard
        </button>

        {/* Logout */}
        <button
          className="sm-btn"
          onClick={handleLogout}
          style={{
            background: "#fee",
            color: "#c00",
            border: "1.5px solid #fcc",
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
