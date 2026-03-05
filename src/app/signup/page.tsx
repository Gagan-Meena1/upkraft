"use client";

import SignupForm from "@/app/components/SignupForm";

const SIGNUP_ROLES = [
  { value: "Student", label: "Student" },
  { value: "Tutor", label: "Tutor" },
  { value: "Academic", label: "Academy" },
];

export default function SignupPage() {
  return (
    <SignupForm
      roles={SIGNUP_ROLES}
      title="Sign up"
      logoHref="/"
      loginHref="/login"
    />
  );
}
