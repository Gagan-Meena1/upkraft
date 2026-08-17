"use client";
import Link from "next/link";
import { useState } from "react";
import { useRenewalDashboard } from "./hooks/useRenewalDashboard";
import StatsCards from "@/app/components/StatsCards";
import FiltersBar from "@/app/components/FiltersBar";
import LeadTable from "@/app/components/LeadTable";
import EditModal from "@/app/components/EditModal";
import RenewalModal from "@/app/components/RenewalModal";
import StudentInfoPopup from "@/app/components/StudentInfoPopup";

// Converts an array of lead objects into a CSV string and triggers a browser download.
function exportLeadsToCSV(leads: any[], filename = "renewal-leads.csv") {
  if (!leads || leads.length === 0) {
    alert("No data to export.");
    return;
  }

  // Flatten nested objects/arrays into readable strings, one level deep.
  const flattenValue = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  // Escape a field for CSV: wrap in quotes if it contains a comma, quote, or newline.
  const escapeCSV = (field: string) => {
    if (/[",\n]/.test(field)) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  // Union of all keys across leads, so the CSV covers every column even if some leads are missing fields.
  const columns = Array.from(
    leads.reduce((set, lead) => {
      Object.keys(lead || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const headerRow = columns.map(escapeCSV).join(",");
  const dataRows = leads.map((lead) =>
    columns.map((col) => escapeCSV(flattenValue(lead?.[col]))).join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\n");

  // BOM prefix so Excel opens UTF-8 content (e.g. names with special chars) correctly.
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RenewalDashboardPage() {
  const {
    leads, loading, statsLoading, stats, options,
    activeCard, page, totalPages, totalItems,
    search, filters, isModalOpen, editingLead,
    setSearch, setPage, setIsModalOpen, setEditingLead,
    handleFilterChange, handleCardClick, clearFilters,
    handleInlineStatusUpdate, handleHideStudent, handleSaveModal, handleSendTutorChange,
    // Renewal modal
    renewalModalLead, setRenewalModalLead,
    renewalOption, setRenewalOption,
    renewalNotes, setRenewalNotes,
    renewalClasses, setRenewalClasses,
    renewalFrequency, setRenewalFrequency,
    renewalAmount, setRenewalAmount,
    handleRenewalSubmit,
    infoStudentId,
    setInfoStudentId,
    infoCourseId,
    setInfoCourseId,
    handleRemovePackage,
  } = useRenewalDashboard();

  const [csvExporting, setCsvExporting] = useState(false);

  // Fetch ALL data (ignoring pagination) and export as CSV
  const handleExportAllCSV = async () => {
    setCsvExporting(true);
    try {
      const serialized: Record<string, string> = {
        page: "1",
        limit: "999999",
        search: search,
        cardFilter: activeCard,
      };
      for (const [k, v] of Object.entries(filters)) {
        serialized[k] = Array.isArray(v) ? v.join(",") : v;
      }
      const query = new URLSearchParams(serialized);
      const res = await fetch(`/Api/salesHead/studentPackage?${query}`);
      const data = await res.json();
      if (data.success && data.data) {
        exportLeadsToCSV(data.data, `renewal-leads-${new Date().toISOString().slice(0, 10)}.csv`);
      } else {
        alert("Failed to fetch data for export.");
      }
    } catch (err) {
      console.error("CSV export error:", err);
      alert("Failed to export CSV.");
    } finally {
      setCsvExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f9] text-[#1a1a2e] font-sans pb-10">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-[54px] flex items-center px-5 sticky top-0 z-50 shadow-sm gap-3">
        <div className="text-[17px] font-extrabold tracking-tight">
          <span className="text-[#5C16C5]">Up</span><span className="text-gray-600">Kraft</span>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 rounded px-2 py-0.5 font-bold hidden md:inline-block">
          RENEWAL DASHBOARD
        </span>
        <div className="ml-auto flex gap-2 items-center">
          <span className="text-[11px] text-gray-400">
            Updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <Link href="/salesHead/retention" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
            📊 Retention View
          </Link>
          <button
            onClick={handleExportAllCSV}
            disabled={csvExporting}
            className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait"
          >
            {csvExporting ? "⏳ Exporting..." : "⬇ Export CSV"}
          </button>
        </div>
      </nav>

      <StatsCards
        stats={stats}
        statsLoading={statsLoading}
        activeCard={activeCard}
        onCardClick={handleCardClick}
      />

      <FiltersBar
        search={search}
        filters={filters}
        options={options}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        activeCard={activeCard}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onPageChange={setPage}
        onClear={clearFilters}
        onCardClear={() => handleCardClick("all")}
      />

      <LeadTable
        leads={leads}
        loading={loading}
        onEdit={(l) => { setEditingLead(l); setIsModalOpen(true); }}
        onHide={handleHideStudent}
        onStatusChange={handleInlineStatusUpdate}
        onShowInfo={(studentId, courseId) => { setInfoStudentId(studentId); setInfoCourseId(courseId); }}
        onSendTutorChange={handleSendTutorChange}
        onRemovePackage={handleRemovePackage}
      />

      {isModalOpen && editingLead && (
        <EditModal
          lead={editingLead}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onChange={setEditingLead}
        />
      )}

      {renewalModalLead && (
        <RenewalModal
          lead={renewalModalLead}
          option={renewalOption}
          notes={renewalNotes}
          renewalClasses={renewalClasses}
          renewalFrequency={renewalFrequency}
          renewalAmount={renewalAmount}
          onOptionChange={setRenewalOption}
          onNotesChange={setRenewalNotes}
          onRenewalClassesChange={setRenewalClasses}
          onRenewalFrequencyChange={setRenewalFrequency}
          onRenewalAmountChange={setRenewalAmount}
          onSubmit={handleRenewalSubmit}
          onClose={() => setRenewalModalLead(null)}
        />
      )}

      {infoStudentId && (
        <StudentInfoPopup
          studentId={infoStudentId}
          courseId={infoCourseId || undefined}
          onClose={() => { setInfoStudentId(null); setInfoCourseId(null); }}
        />
      )}
    </div>
  );
}