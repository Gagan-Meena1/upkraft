"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../../styles/index.css";
import "../../styles/style.css";
// import Header from "@/app/components/Header";
// import Footer from "@/app/components/Footer";

const sections = [
  {
    id: "rescheduling",
    number: "01",
    title: "Class Rescheduling Policy",
    content: (
      <>
        <p>
          If a student is unable to attend an upcoming class, the parent or student must inform the
          assigned Relationship Manager (RM) at least <strong>24 hours before</strong> the scheduled
          class time.
        </p>
        <ul>
          <li>
            Rescheduling requests must be sent only through the <strong>official UpKraft WhatsApp group</strong>.
          </li>
          <li>
            Requests made through direct messages, personal calls, or any channel outside the
            official communication group will <strong>not be considered valid</strong>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "late-cancellation",
    number: "02",
    title: "Late Cancellation Policy",
    content: (
      <>
        <p>
          UpKraft understands that emergencies may occur. However, tutors reserve time and prepare
          specifically for each student.
        </p>
        <ul>
          <li>
            Any cancellation made <strong>within 24 hours</strong> of the scheduled class time
            cannot be rescheduled.
          </li>
          <li>Such classes will be marked as <strong>"completed."</strong></li>
        </ul>
      </>
    ),
  },
  {
    id: "communication",
    number: "03",
    title: "Communication Policy",
    content: (
      <>
        <p>All requests related to the following must be routed only through the assigned Relationship Manager (RM) via the official UpKraft WhatsApp group:</p>
        <ul>
          <li>Class timing changes</li>
          <li>Rescheduling</li>
          <li>Pause requests</li>
          <li>Extensions</li>
        </ul>
        <p>
          Direct communication with tutors regarding schedule changes will{" "}
          <strong>not be considered valid</strong>.
        </p>
      </>
    ),
  },
  {
    id: "reschedule-limits",
    number: "04",
    title: "Reschedule Limits",
    content: (
      <>
        <p>Students are permitted:</p>
        <ul>
          <li>
            <strong>One (1) reschedule</strong> for every <strong>eight (8) classes</strong>.
          </li>
        </ul>
        <p>Additional conditions:</p>
        <ul>
          <li>
            Any rescheduled (make-up) class must be completed within{" "}
            <strong>one (1) month</strong> of the original class date.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "group-class",
    number: "05",
    title: "Group Class Policy",
    content: (
      <>
        <p>
          To maintain a consistent learning pace and classroom experience for all participants:
        </p>
        <ul>
          <li>
            Group Classes <strong>cannot be rescheduled</strong> under any circumstances.
          </li>
          <li>
            Pause requests are <strong>not applicable</strong> to Group Classes.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "pause",
    number: "06",
    title: "Pause Policy",
    content: (
      <>
        <p>
          Students enrolled in eligible courses may request a temporary pause for valid reasons such
          as school examinations, medical issues, or travel. Supporting documents may be requested.
        </p>
        <p>
          <strong>Duration:</strong> A pause is permitted for a maximum of{" "}
          <strong>two (2) weeks</strong>. Beyond this, availability of the same tutor upon
          resumption cannot be guaranteed.
        </p>
        <p>
          <strong>Eligibility</strong> — available only for students in 3-month or 6-month courses:
        </p>
        <ul>
          <li>Twice-a-week classes: One (1) pause permitted every 3 months</li>
          <li>Once-a-week classes: One (1) pause permitted every 6 months</li>
        </ul>
        <p>
          <em>Note: Pause requests are not applicable to Group Classes.</em>
        </p>
      </>
    ),
  },
  {
    id: "tutor-cancellation",
    number: "07",
    title: "Tutor or UpKraft Cancellation",
    content: (
      <>
        <p>If a class is cancelled by UpKraft or the tutor:</p>
        <ul>
          <li>The session will not be counted as a completed class.</li>
          <li>UpKraft will arrange a make-up session at a later date.</li>
        </ul>
      </>
    ),
  },
  {
    id: "notice",
    number: "08",
    title: "24-Hour Notice Policy",
    content: (
      <>
        <p>The 24-hour notice requirement exists to:</p>
        <ul>
          <li>Respect tutors' professional time and preparation</li>
          <li>Maintain scheduling efficiency</li>
          <li>Ensure a smooth and high-quality learning experience for all students</li>
        </ul>
      </>
    ),
  },
  {
    id: "extension",
    number: "09",
    title: "Course Extension Policy",
    content: (
      <>
        <p>
          Students may request additional time to complete pending classes after accounting for all
          reschedules and pause days already utilized.
        </p>
        <p>
          <strong>Extension Eligibility:</strong>
        </p>
        <ul>
          <li>3-month courses: Eligible for up to one (1) month extension</li>
          <li>6-month courses: Eligible for up to two (2) months extension</li>
        </ul>
        <p>
          <strong>Important:</strong> Extension requests must be raised in advance through the
          assigned RM via the official UpKraft WhatsApp group. All requests are subject to approval.
          Tutor availability during the extension period cannot be guaranteed.
        </p>
      </>
    ),
  },
  {
    id: "general",
    number: "10",
    title: "General Terms",
    content: (
      <>
        <ul>
          <li>
            UpKraft reserves the right to update or modify these Terms &amp; Conditions at any time.
          </li>
          <li>
            Continued enrollment implies acceptance of the latest Terms &amp; Conditions.
          </li>
          <li>
            UpKraft aims to maintain a professional, transparent, and student-focused learning
            environment for all learners and tutors.
          </li>
        </ul>
        <p>
          For any assistance, contact your assigned Relationship Manager (RM) through the official
          UpKraft WhatsApp group.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggle = (id: string) =>
    setActiveSection((prev) => (prev === id ? null : id));

  return (
    <div className="position-relative menu-header-box bg-white">
      {/* <Header /> */}
      <main style={{ minHeight: "100vh" }}>
        {/* ── Hero Banner ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #6E09BD 0%, #4a0680 100%)",
            padding: "80px 24px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative circles */}
          <span
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(253,185,78,0.08)",
              top: -80,
              right: -60,
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              bottom: -60,
              left: 40,
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
                transition: "background 0.2s",
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
            Terms &amp; Conditions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, margin: 0 }}>
            Effective Date: May 18, 2026
          </p>
        </section>

        {/* ── Intro ── */}
        <section
          style={{
            maxWidth: 840,
            margin: "0 auto",
            padding: "48px 24px 8px",
          }}
        >
          <div
            style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderLeft: "4px solid #6E09BD",
              borderRadius: 10,
              padding: "20px 24px",
              fontSize: 15,
              color: "#374151",
              lineHeight: 1.7,
            }}
          >
            Welcome to UpKraft. These Terms &amp; Conditions govern all classes, services, and
            learning programs offered by UpKraft. By enrolling in any UpKraft program, parents and
            students agree to the following terms.
          </div>
        </section>

        {/* ── Accordion Sections ── */}
        <section
          style={{
            maxWidth: 840,
            margin: "0 auto",
            padding: "24px 24px 80px",
          }}
        >
          {sections.map((sec) => {
            const isOpen = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  border: isOpen ? "1.5px solid #6E09BD" : "1.5px solid #e5e7eb",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  boxShadow: isOpen
                    ? "0 4px 24px rgba(110,9,189,0.08)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Header */}
                <button
                  onClick={() => toggle(sec.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 24px",
                    background: isOpen ? "#6E09BD" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    style={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: isOpen ? "rgba(255,255,255,0.2)" : "#f3e8ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: isOpen ? "#fff" : "#6E09BD",
                      flexShrink: 0,
                    }}
                  >
                    {sec.number}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: 600,
                      color: isOpen ? "#fff" : "#111827",
                    }}
                  >
                    {sec.title}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      color: isOpen ? "#FDB94E" : "#9ca3af",
                      transition: "transform 0.25s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </button>

                {/* Body */}
                {isOpen && (
                  <div
                    style={{
                      padding: "20px 24px 24px 24px",
                      background: "#fff",
                      fontSize: 15,
                      color: "#374151",
                      lineHeight: 1.75,
                      borderTop: "1px solid #f3e8ff",
                    }}
                  >
                    <style>{`
                      .tc-body ul { padding-left: 20px; margin: 10px 0; }
                      .tc-body li { margin-bottom: 6px; }
                      .tc-body p { margin-bottom: 10px; }
                      .tc-body strong { color: #111827; }
                    `}</style>
                    <div className="tc-body">{sec.content}</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Home CTA */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
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