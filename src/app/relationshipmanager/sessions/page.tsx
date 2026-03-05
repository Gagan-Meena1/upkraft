"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import SessionList from "@/app/components/academy/SessionList";
import DashboardLayout from "@/app/components/DashboardLayout";
import { toast } from "react-hot-toast";

interface SessionStats {
    totalSessions: number;
    totalSessionsChange: number;
    completedSessions: number;
    scheduledSessions: number;
    cancelledSessions: number;
    attendanceRate: number;
    attendanceRateChange: number;
    avgQualityScore: number;
}

interface ClassData {
    _id: string;
    title: string;
    course: any;
    instructor: any;
    startTime: Date;
    endTime: Date;
    status: string;
    recordingUrl?: string;
    evaluation?: any;
    tutors: { name: string; email: string }[];
    students: { name: string; email: string }[];
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalSessions: number;
    limit: number;
}

const RelationshipManagerSessions = () => {
    const [stats, setStats] = useState<SessionStats>({
        totalSessions: 0,
        totalSessionsChange: 0,
        completedSessions: 0,
        scheduledSessions: 0,
        cancelledSessions: 0,
        attendanceRate: 0,
        attendanceRateChange: 0,
        avgQualityScore: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<ClassData[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalSessions: 0,
        limit: 15
    });

    useEffect(() => {
        fetchData(pagination.currentPage);
    }, []);

    const fetchData = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/Api/relationship-manager/sessions?page=${page}&limit=15`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
                if (data.classData) {
                    setSessions(data.classData);
                }
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else {
                throw new Error(data.error || "Failed to load sessions");
            }

        } catch (err: any) {
            console.error('Error fetching RM sessions data:', err);
            setError(err.message || 'An error occurred fetching sessions');
            toast.error(err.message || "Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchData(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    const renderChangeIndicator = (change: number) => {
        if (change === 0) return null;
        const isPositive = change > 0;
        return (
            <span className={`badge ${isPositive ? 'tag-exam' : 'bg-danger'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
        );
    };

    return (
        <DashboardLayout userType="relationshipmanager">
            <div className="flex flex-col flex-1 p-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Assigned Tutors' Sessions</h1>
                </header>

                {loading && (
                    <div className="w-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-white shadow-md rounded-lg px-6 py-4 text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col'>
                                <h2 className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalSessions)}</h2>
                                <p className='text-gray-500 text-sm mt-1'>Total Sessions (This Month)</p>
                                <div className="mt-2">
                                    {renderChangeIndicator(stats.totalSessionsChange)}
                                </div>
                            </div>
                            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col'>
                                <h2 className="text-3xl font-bold text-gray-900">{formatNumber(stats.completedSessions)}</h2>
                                <p className='text-gray-500 text-sm mt-1'>Completed Sessions</p>
                            </div>
                            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col'>
                                <h2 className="text-3xl font-bold text-gray-900">{formatNumber(stats.scheduledSessions)}</h2>
                                <p className='text-gray-500 text-sm mt-1'>Scheduled Sessions</p>
                            </div>
                            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col'>
                                <h2 className="text-3xl font-bold text-gray-900">{formatNumber(stats.cancelledSessions)}</h2>
                                <p className='text-gray-500 text-sm mt-1'>Cancelled Sessions</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <SessionList
                                sessions={sessions}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                hideActions={true}
                            />
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default RelationshipManagerSessions;
