"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionSummary from "../../components/SessionSummary";

function SessionSummaryContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId') || '';
  const tutorIdsString = searchParams?.get('tutorIds') || '';
  
  // Convert comma-separated string to array
  const tutorIds = tutorIdsString ? tutorIdsString.split(',').filter(id => id.trim()) : [];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <SessionSummary studentId={studentId} tutorIds={tutorIds} />
        </div>
      </div>
    </div>
  );
}

export default function SessionSummaryPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <SessionSummaryContent />
    </Suspense>
  );
}