"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionSummary from "../../components/tutor/SessionSummary";

function SessionSummaryContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams?.get('studentId') || '';
  const tutorId = searchParams?.get('tutorId') || '';
  const courseId = searchParams?.get('courseId') || '';

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <SessionSummary studentId={studentId} tutorId={tutorId} courseId={courseId} />
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
