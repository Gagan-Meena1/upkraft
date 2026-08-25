import { useState, useEffect, useMemo, useRef } from "react";
import { TutorClassData } from "../types";

/**
 * Custom hook that fetches tutor class data and provides
 * search/selection state with 700ms debounced filtering.
 */
export function useTutorClasses() {
  const [tutors, setTutors] = useState<TutorClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Selection
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);

  // Debounce search with 700ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 700);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data on mount
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/Api/salesHead/tutorClasses");
        const data = await res.json();
        if (!cancelled) {
          if (data.success) {
            setTutors(data.tutors);
          } else {
            setError(data.error || "Failed to load tutor data");
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Client-side filtered list
  const filteredTutors = useMemo(() => {
    if (!debouncedSearch.trim()) return tutors;
    const q = debouncedSearch.toLowerCase();
    return tutors.filter((t) =>
      t.username.toLowerCase().includes(q)
    );
  }, [tutors, debouncedSearch]);

  // Selected tutor object
  const selectedTutor = useMemo(() => {
    if (!selectedTutorId) return null;
    return tutors.find((t) => t._id === selectedTutorId) ?? null;
  }, [tutors, selectedTutorId]);

  return {
    tutors,
    filteredTutors,
    loading,
    error,
    search,
    setSearch,
    selectedTutorId,
    setSelectedTutorId,
    selectedTutor,
  };
}
