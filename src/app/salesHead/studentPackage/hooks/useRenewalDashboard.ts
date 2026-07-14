import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Lead, Stats, Options, Filters, CardFilter } from "../types";

export function useRenewalDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [options, setOptions] = useState<Options>({ societies: [], tutorNames: [], rmNames: [], spocNames: [] });
    const [activeCard, setActiveCard] = useState<CardFilter>("urgent");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filters, setFilters] = useState<Filters>({ society: [], tutorName: [], rm: [], spoc: [], type: "", renewalStatus: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const cache = useRef<Record<string, any>>({});
    const [stats, setStats] = useState<Stats>({ total: 0, overdue: 0, urgent: 0, soon: 0, ontrack: 0, completed: 0, renewed: 0, dropped: 0 });

    // Renewal modal state
    const [renewalModalLead, setRenewalModalLead] = useState<Lead | null>(null);
    const [renewalOption, setRenewalOption] = useState<"same" | "changed">("same");
    const [renewalNotes, setRenewalNotes] = useState("");
    const [renewalClasses, setRenewalClasses] = useState(0);
    const [renewalFrequency, setRenewalFrequency] = useState("");
    const [renewalAmount, setRenewalAmount] = useState(0);

    const limit = 50;

    const cacheKey = (p: number) =>
        `${activeCard}__${debouncedSearch}__${JSON.stringify(filters)}__${p}`;

    // Debounce search
    useEffect(() => {
        const h = setTimeout(() => {
            setDebouncedSearch(search);
            if (search) setActiveCard("all" as any);   // show all results when searching
            setPage(1);
            cache.current = {};
        }, 500);
        return () => clearTimeout(h);
    }, [search]);

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => {
            const field = prev[key];
            // Array fields: toggle value in/out
            if (Array.isArray(field)) {
                const arr = field as string[];
                const next = arr.includes(value)
                    ? arr.filter(v => v !== value)
                    : [...arr, value];
                return { ...prev, [key]: next };
            }
            // String fields (type, renewalStatus): simple replace
            return { ...prev, [key]: value };
        });
        setPage(1);
        cache.current = {};
    };

    const handleCardClick = (key: CardFilter) => {
        setActiveCard(key);
        setPage(1);
        cache.current = {};
    };

    const clearFilters = () => {
        setFilters({ society: [], tutorName: [], rm: [], spoc: [], type: "", renewalStatus: "" });
        setSearch("");
        setActiveCard("urgent");
        setPage(1);
        cache.current = {};
    };

    // Stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const serialized: Record<string, string> = { search: debouncedSearch };
            for (const [k, v] of Object.entries(filters)) {
                serialized[k] = Array.isArray(v) ? v.join(",") : v;
            }
            const query = new URLSearchParams(serialized);
            const res = await fetch(`/Api/salesHead/studentPackage/stats?${query}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.counts);
                setOptions(data.options);
            }
        } catch { console.error("Stats fetch failed"); }
        finally { setStatsLoading(false); }
    }, [debouncedSearch, filters]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Paginated data
    const fetchPage = useCallback(async (targetPage: number, isPrefetch = false) => {
        const key = cacheKey(targetPage);
        if (!isPrefetch && cache.current[key]) {
            setLeads(cache.current[key].data);
            setTotalPages(cache.current[key].pagination.totalPages);
            setTotalItems(cache.current[key].pagination.total);
            setLoading(false);
            return;
        }
        try {
            if (!isPrefetch) setLoading(true);
            const serialized: Record<string, string> = {
                page: targetPage.toString(), limit: limit.toString(),
                search: debouncedSearch, cardFilter: activeCard
            };
            for (const [k, v] of Object.entries(filters)) {
                serialized[k] = Array.isArray(v) ? v.join(",") : v;
            }
            const query = new URLSearchParams(serialized);
            const res = await fetch(`/Api/salesHead/studentPackage?${query}`);
            const data = await res.json();
            if (data.success) {
                cache.current[key] = data;
                if (!isPrefetch) {
                    setLeads(data.data);
                    setTotalPages(data.pagination.totalPages);
                    setTotalItems(data.pagination.total);
                }
            }
        } catch { if (!isPrefetch) toast.error("Failed to load data"); }
        finally { if (!isPrefetch) setLoading(false); }
    }, [debouncedSearch, filters, activeCard]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            await fetchPage(page);
            if (!mounted) return;
            if (page < totalPages && !cache.current[cacheKey(page + 1)]) fetchPage(page + 1, true);
            if (page > 1 && !cache.current[cacheKey(page - 1)]) fetchPage(page - 1, true);
        };
        load();
        return () => { mounted = false; };
    }, [page, fetchPage, totalPages]);

    const handleInlineStatusUpdate = async (id: string, studentId: string, newStatus: string) => {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        // If "Renewed" is selected, open the renewal modal instead of saving directly
        if (newStatus === "Renewed") {
            setRenewalModalLead(lead);
            setRenewalOption("same");
            setRenewalNotes(lead.renewalNotes || "");
            setRenewalClasses(lead.renewalClasses || 0);
            setRenewalFrequency(lead.renewalFrequency || "");
            setRenewalAmount(lead.renewalAmount || 0);
            return;
        }

        setLeads(prev => prev.map(l => l.id === id ? { ...l, renewalStatus: newStatus } : l));
        try {
            const res = await fetch("/Api/salesHead/studentPackage/edit", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    renewalStatus: newStatus,
                    courseEntryIndex: lead.courseEntryIndex,
                    entryIndex: lead.entryIndex,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success("Status updated");
            cache.current = {};
            fetchStats();
        } catch (err: any) {
            toast.error(err.message || "Failed to update");
            fetchPage(page);
        }
    };

    const handleRenewalSubmit = async () => {
        if (!renewalModalLead) return;
        const notesValue = renewalOption === "changed" ? renewalNotes : "Same as previous";
        try {
            const res = await fetch("/Api/salesHead/studentPackage/edit", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: renewalModalLead.studentId,
                    renewalStatus: "Renewed",
                    renewalNotes: notesValue,
                    renewalClasses,
                    renewalFrequency,
                    renewalAmount,
                    courseEntryIndex: renewalModalLead.courseEntryIndex,
                    entryIndex: renewalModalLead.entryIndex,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success("Marked as Renewed");
            setLeads(prev => prev.map(l =>
                l.id === renewalModalLead.id
                    ? {
                        ...l, renewalStatus: "Renewed", renewalNotes: notesValue,
                        renewalClasses, renewalFrequency, renewalAmount,
                    }
                    : l
            ));
            setRenewalModalLead(null);
            cache.current = {};
            fetchStats();
        } catch (err: any) {
            toast.error(err.message || "Failed to update");
        }
    };

    const handleHideStudent = async (id: string, studentId: string) => {
        if (!confirm("Hide this student from the renewal dashboard?")) return;
        setLeads(prev => prev.filter(l => l.id !== id));
        setTotalItems(prev => prev - 1);
        try {
            const res = await fetch("/Api/salesHead/studentPackage/edit", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, hideFromRenewalDashboard: true })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success("Student hidden");
            fetchStats();
        } catch (err: any) {
            toast.error(err.message || "Failed to hide");
            fetchPage(page);
        }
    };

    const handleSaveModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;
        try {
            const res = await fetch("/Api/salesHead/studentPackage/edit", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: editingLead.studentId,
                    custName: editingLead.custName, email: editingLead.email,
                    phone: editingLead.phone, society: editingLead.society,
                    salesSPOC: editingLead.spoc, renewalStatus: editingLead.renewalStatus,
                    renewalNotes: editingLead.renewalNotes,
                    notes: editingLead.notes,
                    pkgAmount: editingLead.pkgAmount,
                    rm: editingLead.rm,
                    courseEntryIndex: editingLead.courseEntryIndex,
                    entryIndex: editingLead.entryIndex,
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Updated successfully");
                setIsModalOpen(false);
                cache.current = {};
                fetchPage(page);
                fetchStats();
            } else toast.error(data.error || "Failed");
        } catch { toast.error("Failed to save"); }
    };

    return {
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
    };
}