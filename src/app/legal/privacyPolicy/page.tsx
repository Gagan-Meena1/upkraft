"use client";

import React from "react";
import Link from "next/link";
// import "@/styles/index.css";
// import "@/styles/style.css";
// import Header from "@/app/components/Header";
// import Footer from "@/app/components/Footer";

const policies = [
  {
    number: "01",
    title: "Information We Collect",
    icon: "📋",
    subsections: [
      {
        heading: "Personal Information",
        items: ["Name", "Phone number", "Email address", "Residential area or society details"],
      },
      {
        heading: "Class & Learning Information",
        items: [
          "Course enrollments",
          "Attendance records",
          "Progress tracking data",
          "Feedback and assessments",
        ],
      },
      {
        heading: "Payment Information",
        items: ["Payment status", "Billing-related details"],
        note: "UpKraft does not store sensitive payment information such as complete debit/credit card details.",
      },
      {
        heading: "Communication Data",
        items: [
          "Messages shared through official communication channels",
          "Customer support interactions",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    icon: "🔍",
    items: [
      "Deliver and manage classes and learning programs",
      "Assign tutors and schedule sessions",
      "Track learning progress",
      "Improve services and user experience",
      "Communicate important updates and support information",
      "Process payments and maintain records",
      "Ensure operational efficiency",
    ],
  },
  {
    number: "03",
    title: "Sharing of Information",
    icon: "🤝",
    body: (
      <>
        <p style={{ marginBottom: 10 }}>
          <strong>UpKraft does not sell personal information to third parties.</strong>
        </p>
        <p style={{ marginBottom: 8 }}>Information may be shared only with:</p>
        <ul>
          <li>Assigned tutors</li>
          <li>Internal operational teams</li>
          <li>Trusted service providers required for business operations</li>
        </ul>
        <p>Information may also be disclosed if required by law or for legal compliance.</p>
      </>
    ),
  },
  {
    number: "04",
    title: "Data Storage & Security",
    icon: "🔒",
    body: (
      <>
        <p style={{ marginBottom: 10 }}>
          UpKraft takes reasonable administrative and technical measures to protect information from
          unauthorized access, misuse, loss, or disclosure.
        </p>
        <p>
          While we strive to protect user information, no digital platform or transmission method
          can guarantee complete security.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "Communication Policy",
    icon: "📣",
    body: (
      <>
        <p style={{ marginBottom: 8 }}>
          By enrolling with UpKraft, users consent to receive:
        </p>
        <ul>
          <li>Class-related updates</li>
          <li>Schedule reminders</li>
          <li>Payment notifications</li>
          <li>Service announcements</li>
          <li>Support communication through official communication channels</li>
        </ul>
      </>
    ),
  },
  {
    number: "06",
    title: "Cookies & Website Usage",
    icon: "🍪",
    body: (
      <>
        <p style={{ marginBottom: 8 }}>
          UpKraft's website may use cookies or analytics tools to:
        </p>
        <ul>
          <li>Improve user experience</li>
          <li>Understand website traffic and usage behavior</li>
          <li>Enhance platform performance</li>
        </ul>
        <p style={{ marginTop: 10 }}>
          Users may disable cookies through their browser settings, though certain website features
          may not function properly.
        </p>
      </>
    ),
  },
  {
    number: "07",
    title: "Third-Party Services",
    icon: "🔗",
    body: (
      <>
        <p style={{ marginBottom: 10 }}>
          UpKraft may use third-party tools, software, payment gateways, or communication platforms
          to operate services efficiently.
        </p>
        <p>
          These third-party providers may have their own privacy policies and practices. UpKraft is
          not responsible for the privacy practices of external platforms or services.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "Changes to This Privacy Policy",
    icon: "📝",
    body: (
      <>
        <p style={{ marginBottom: 10 }}>
          UpKraft reserves the right to update or modify this Privacy Policy at any time.
        </p>
        <p style={{ marginBottom: 10 }}>
          Any updated version will become effective upon being published on official communication
          channels.
        </p>
        <p>
          Continued use of UpKraft services after updates constitutes acceptance of the revised
          Privacy Policy.
        </p>
      </>
    ),
  },
  {
    number: "09",
    title: "Contact Us",
    icon: "💬",
    body: (
      <p>
        For any questions or concerns related to this Privacy Policy, users may contact UpKraft
        through official communication channels.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="position-relative menu-header-box bg-white">
      {/* <Header /> */}
      <main style={{ minHeight: "100vh" }}>
        {/* ── Hero Banner ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #1a0030 0%, #6E09BD 60%, #9333ea 100%)",
            padding: "80px 24px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative shapes */}
          <span
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(253,185,78,0.06)",
              top: -140,
              left: -80,
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              bottom: -70,
              right: 60,
              pointerEvents: "none",
            }}
          />

          {/* Home button */}
          <div style={{ marginBottom: 28 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                borderRadius: 50,
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                backdropFilter: "blur(4px)",
              }}
            >
              ← Back to Home
            </Link>
          </div>

          <p
            style={{
              color: "#FDB94E",
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: 12,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            UpKraft
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              margin: "0 auto 16px",
              maxWidth: 640,
              lineHeight: 1.15,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, margin: 0 }}>
            Effective Date: May 18, 2026
          </p>
        </section>

        {/* ── Intro Card ── */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 8px" }}>
          <div
            style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderLeft: "4px solid #FDB94E",
              borderRadius: 10,
              padding: "20px 24px",
              fontSize: 15,
              color: "#374151",
              lineHeight: 1.75,
            }}
          >
            Welcome to UpKraft. Your privacy is important to us. This Privacy Policy explains how
            UpKraft collects, uses, stores, and protects information when you use our services,
            website, classes, and communication channels. By using UpKraft's services, you agree to
            the terms outlined in this Privacy Policy.
          </div>
        </section>

        {/* ── Policy Sections Grid ── */}
        <section style={{ maxWidth: 920, margin: "0 auto", padding: "24px 24px 80px" }}>
          <style>{`
            .pp-card ul { padding-left: 20px; margin: 8px 0; }
            .pp-card li { margin-bottom: 6px; color: #4b5563; font-size: 15px; }
            .pp-card p { margin-bottom: 10px; color: #374151; font-size: 15px; line-height: 1.7; }
            .pp-card strong { color: #111827; }
            .pp-note {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 8px;
              padding: 10px 14px;
              font-size: 13.5px;
              color: #92400e;
              margin-top: 10px;
            }
            .pp-subsection-heading {
              font-size: 13px;
              font-weight: 700;
              color: #6E09BD;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 16px 0 6px;
            }
          `}</style>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: 16,
            }}
          >
            {policies.map((policy) => (
              <div
                key={policy.number}
                className="pp-card"
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1.5px solid #e5e7eb",
                  padding: "24px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#6E09BD";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 6px 28px rgba(110,9,189,0.10)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 2px 12px rgba(0,0,0,0.05)";
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    paddingBottom: 14,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #6E09BD, #9333ea)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {policy.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#FDB94E",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      Section {policy.number}
                    </div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111827",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {policy.title}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                {policy.subsections &&
                  policy.subsections.map((sub, si) => (
                    <div key={si}>
                      <div className="pp-subsection-heading">{sub.heading}</div>
                      <ul>
                        {sub.items.map((item, ii) => (
                          <li key={ii}>{item}</li>
                        ))}
                      </ul>
                      {sub.note && <div className="pp-note">ℹ️ {sub.note}</div>}
                    </div>
                  ))}

                {policy.items && (
                  <ul>
                    {policy.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {policy.body && <div>{policy.body}</div>}
              </div>
            ))}
          </div>

          {/* Bottom Home CTA */}
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#FDB94E",
                color: "#000",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 32px",
                borderRadius: 50,
                textDecoration: "none",
                letterSpacing: 0.5,
                boxShadow: "0 4px 16px rgba(253,185,78,0.4)",
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  );
}