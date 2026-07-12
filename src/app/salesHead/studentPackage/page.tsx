"use client";
import { useRenewalDashboard } from "./hooks/useRenewalDashboard";
import StatsCards from "@/app/components/StatsCards";
import FiltersBar from "@/app/components/FiltersBar";
import LeadTable from "@/app/components/LeadTable";
import EditModal from "@/app/components/EditModal";
import RenewalModal from "@/app/components/RenewalModal";

export default function RenewalDashboardPage() {
  const {
    leads, loading, statsLoading, stats, options,
    activeCard, page, totalPages, totalItems,
    search, filters, isModalOpen, editingLead,
    setSearch, setPage, setIsModalOpen, setEditingLead,
    handleFilterChange, handleCardClick, clearFilters,
    handleInlineStatusUpdate, handleHideStudent, handleSaveModal,
    // Renewal modal
    renewalModalLead, setRenewalModalLead,
    renewalOption, setRenewalOption,
    renewalNotes, setRenewalNotes,
    renewalClasses, setRenewalClasses,
    renewalFrequency, setRenewalFrequency,
    renewalAmount, setRenewalAmount,
    handleRenewalSubmit,
  } = useRenewalDashboard();

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
          <button className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50">
            ⬇ Export CSV
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
    </div>
  );
}