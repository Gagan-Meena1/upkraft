"use client"

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const CreateAssignmentClient = dynamic(
  () => import("./CreateAssignmentClient"),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreateAssignmentClient />
    </Suspense>
  );
}