// hooks/useMonthlyClasses.ts
"use client";
import { useState, useEffect } from "react";

export interface ClassDetail {
    classId: string;
    startTime: string;
    courseName: string;
    tutorName: string;
    tutorEmail: string;
    studentName: string;
    attendanceStatus: string;
}

export interface MonthlyCount {
    month: string;
    label: string;
    count: number;
    classes: ClassDetail[];
}

export function useMonthlyClasses() {
    const [monthlyClasses, setMonthlyClasses] = useState<MonthlyCount[]>([]);
    const [totalClasses, setTotalClasses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<MonthlyCount | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/Api/salesHead/monthlyClasses");
                const data = await res.json();
                if (!cancelled) {
                    if (data.success) {
                        setMonthlyClasses(data.monthlyClasses);
                        setTotalClasses(data.totalClasses);
                    } else {
                        setError(data.error || "Failed to load data");
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

    return { monthlyClasses, totalClasses, loading, error, selectedMonth, setSelectedMonth };
}