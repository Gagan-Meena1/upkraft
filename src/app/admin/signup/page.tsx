"use client";

import SignupForm from "@/app/components/SignupForm";

const MANAGEMENT_ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "TeamLead", label: "Team Lead" },
  { value: "Relationship Manager", label: "Relationship Manager" },
  { value: "Sales Head", label: "Sales Head" },
];

export default function AdminSignupPage() {
  return (
    <SignupForm
      roles={MANAGEMENT_ROLES}
      title="Sign up (Management)"
      logoHref="/admin"
      loginHref="/login"
    />
  );
}
