"use client";

import React from "react";
import ViewPerformancePage from "@/app/admin/tutors/page";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function TeamLeadTutorsPage() {
  return (
    <DashboardLayout userType="teamlead">
      <ViewPerformancePage />
    </DashboardLayout>
  );
}