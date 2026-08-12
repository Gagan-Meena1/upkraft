"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DeleteDataPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: info, 2: confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError("Please provide your email or phone number.");
      return;
    }
    if (step === 1) {
      setStep(2);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/Api/deleteRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .dd-page {
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          background: #fafafa;
          position: relative;
          overflow-x: hidden;
        }

        .dd-page::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .dd-page::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(253,185,78,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .dd-nav {
          padding: 20px 0;
          display: flex;
          justify-content: center;
        }

        .dd-logo {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .dd-container {
          max-width: 520px;
          margin: 0 auto;
          padding: 0 24px 80px;
          position: relative;
          z-index: 1;
        }

        .dd-header {
          text-align: center;
          margin-bottom: 36px;
          padding-top: 20px;
        }

        .dd-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(239,68,68,0.08);
          color: #dc2626;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 100px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .dd-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .dd-subtitle {
          font-size: 15px;
          color: #888;
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
        }

        .dd-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: box-shadow 0.3s;
        }

        .dd-card-body {
          padding: 32px;
        }

        .dd-field {
          margin-bottom: 20px;
        }

        .dd-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          letter-spacing: -0.1px;
        }

        .dd-input {
          width: 100%;
          padding: 13px 16px;
          font-size: 15px;
          font-family: inherit;
          border: 1.5px solid #e8e8e8;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          background: #fafafa;
          color: #111;
          box-sizing: border-box;
        }

        .dd-input:focus {
          border-color: #9333ea;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(147,51,234,0.08);
        }

        .dd-input::placeholder {
          color: #bbb;
        }

        .dd-textarea {
          resize: none;
          min-height: 80px;
        }

        .dd-info-box {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: #f8f8f8;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #f0f0f0;
        }

        .dd-info-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .dd-info-text {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
        }

        .dd-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: -0.1px;
        }

        .dd-btn-primary {
          background: #111;
          color: #fff;
        }

        .dd-btn-primary:hover {
          background: #000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .dd-btn-danger {
          background: #dc2626;
          color: #fff;
        }

        .dd-btn-danger:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220,38,38,0.25);
        }

        .dd-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .dd-btn-back {
          background: transparent;
          color: #888;
          font-size: 14px;
          padding: 12px;
          margin-top: 8px;
        }

        .dd-btn-back:hover {
          color: #333;
          background: #f5f5f5;
        }

        .dd-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #dc2626;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dd-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 24px 0;
        }

        .dd-data-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dd-data-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 14px;
          color: #555;
          border-bottom: 1px solid #f5f5f5;
        }

        .dd-data-list li:last-child {
          border-bottom: none;
        }

        .dd-data-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc2626;
          flex-shrink: 0;
          opacity: 0.6;
        }

        .dd-footer {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
        }

        .dd-footer a {
          font-size: 13px;
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
        }

        .dd-footer a:hover {
          color: #666;
        }

        /* Success State */
        .dd-success {
          text-align: center;
          padding: 48px 32px;
        }

        .dd-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 20px;
          border: 2px solid #bbf7d0;
        }

        .dd-success h2 {
          font-size: 22px;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px;
        }

        .dd-success p {
          font-size: 15px;
          color: #888;
          line-height: 1.6;
          margin: 0 0 6px;
        }

        .dd-success-note {
          font-size: 13px;
          color: #aaa;
          margin: 20px 0 28px !important;
          padding: 12px 16px;
          background: #f8f8f8;
          border-radius: 10px;
          display: inline-block;
        }

        .dd-home-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #111;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .dd-home-link:hover {
          background: #000;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Confirm step */
        .dd-confirm-header {
          text-align: center;
          padding: 28px 32px 0;
        }

        .dd-confirm-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #fef2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px;
          border: 2px solid #fecaca;
        }

        .dd-confirm-title {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          margin: 0 0 6px;
        }

        .dd-confirm-sub {
          font-size: 14px;
          color: #888;
          margin: 0;
          line-height: 1.5;
        }

        .dd-step-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .dd-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e5e5e5;
          transition: all 0.3s;
        }

        .dd-step-dot.active {
          background: #111;
          width: 24px;
          border-radius: 4px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dd-animate {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="dd-page">
        {/* Nav */}
        <nav className="dd-nav">
          <Link href="/" className="dd-logo">
            <span style={{ color: "#9333ea" }}>Up</span>
            <span style={{ color: "#111" }}>Kraft</span>
          </Link>
        </nav>

        <div className="dd-container">
          {/* Step indicator */}
          {!submitted && (
            <div className="dd-step-indicator">
              <div className={`dd-step-dot ${step === 1 ? "active" : ""}`} />
              <div className={`dd-step-dot ${step === 2 ? "active" : ""}`} />
            </div>
          )}

          {submitted ? (
            /* ── Success ── */
            <div className="dd-card dd-animate">
              <div className="dd-success">
                <div className="dd-success-icon">✓</div>
                <h2>Request Submitted</h2>
                <p>We've received your data deletion request.</p>
                <p className="dd-success-note">
                  ⏱ Processing time: <strong>7 business days</strong>
                </p>
                <Link href="/" className="dd-home-link">
                  ← Back to Home
                </Link>
              </div>
            </div>
          ) : step === 1 ? (
            /* ── Step 1: Form ── */
            <div className="dd-animate" key="step1">
              <div className="dd-header">
                <div className="dd-badge">⚠ Data Deletion</div>
                <h1 className="dd-title">Delete Your Data</h1>
                <p className="dd-subtitle">
                  Permanently remove all personal data linked to your account.
                </p>
              </div>

              <div className="dd-card">
                <div className="dd-card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="dd-field">
                      <label className="dd-label">Email Address</label>
                      <input
                        type="email"
                        className="dd-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="dd-field">
                      <label className="dd-label">Phone Number</label>
                      <input
                        type="tel"
                        className="dd-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98XXXXXXXX"
                      />
                    </div>

                    <div className="dd-field">
                      <label className="dd-label">
                        Reason <span style={{ color: "#bbb", fontWeight: 400 }}>(optional)</span>
                      </label>
                      <textarea
                        className="dd-input dd-textarea"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why would you like your data deleted?"
                      />
                    </div>

                    {error && (
                      <div className="dd-error">
                        <span>⚠</span> {error}
                      </div>
                    )}

                    <button type="submit" className="dd-btn dd-btn-primary">
                      Continue →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* ── Step 2: Confirm ── */
            <div className="dd-animate" key="step2">
              <div className="dd-card">
                <div className="dd-confirm-header">
                  <div className="dd-confirm-icon">🗑</div>
                  <h2 className="dd-confirm-title">Confirm Deletion</h2>
                  <p className="dd-confirm-sub">
                    This action is <strong>permanent</strong> and cannot be undone.
                  </p>
                </div>

                <div className="dd-card-body">
                  <div className="dd-info-box">
                    <span className="dd-info-icon">📋</span>
                    <div className="dd-info-text">
                      The following data will be permanently deleted:
                    </div>
                  </div>

                  <ul className="dd-data-list">
                    <li><span className="dd-data-dot" /> Account profile & personal information</li>
                    <li><span className="dd-data-dot" /> Class enrollment & attendance history</li>
                    <li><span className="dd-data-dot" /> Progress reports & feedback</li>
                    <li><span className="dd-data-dot" /> Payment & transaction records</li>
                    <li><span className="dd-data-dot" /> All associated media & uploads</li>
                  </ul>

                  <div className="dd-divider" />

                  {error && (
                    <div className="dd-error">
                      <span>⚠</span> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="dd-btn dd-btn-danger"
                    >
                      {loading ? "Submitting..." : "Delete My Data Permanently"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="dd-btn dd-btn-back"
                    >
                      ← Go Back
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="dd-footer">
            <Link href="/legal/privacyPolicy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/">Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}
