"use client";

import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";

interface StudentFormProps {
  tutorName?: string;
  onSuccess?: () => void;
}

const formatPhoneNumber = (value: string, countryCode: string) => {
  const digits = value.replace(/\D/g, "");

  if (countryCode === "+91") {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  } else if (countryCode === "+1") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  } else if (countryCode === "+44") {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`;
  } else {
    return digits.replace(/(\d{3,4})(?=\d)/g, "$1 ").trim();
  }
};

const StudentForm: React.FC<StudentFormProps> = ({ tutorName, onSuccess }) => {
  const [key, setKey] = useState<"Student" | "Tutor">("Student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
    countryCode: "+91",
    skill: "",
    demoDate: "",
    demoTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");

  const generateTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    for (let hour = 10; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 20 && min > 0) break;
        const value = `${String(hour).padStart(2, "0")}:${String(min).padStart(
          2,
          "0"
        )}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const label = `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
        slots.push({ value, label });
      }
    }
    return slots;
  };

  const isValidDateTime = (date?: string, time?: string) => {
    if (!date || !time) return true;
    const selected = new Date(`${date}T${time}`);
    const now = new Date();
    const plus24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return selected >= plus24;
  };

  const get24HoursFromNow = () => {
    const future = new Date();
    future.setHours(future.getHours() + 24);
    const date = future.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = future.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} at ${time}`;
  };

  const getMinDate = () => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString().split("T")[0];
  };

  const calculateEndTime = (startTime?: string) => {
    if (!startTime) return "";
    const [h, m] = startTime.split(":").map(Number);
    let endH = h;
    let endM = m + 30;
    if (endM >= 60) {
      endH += 1;
      endM -= 60;
    }
    const hour12 = endH > 12 ? endH - 12 : endH === 0 ? 12 : endH;
    const ampm = endH >= 12 ? "PM" : "AM";
    return `${hour12}:${String(endM).padStart(2, "0")} ${ampm}`;
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formatted = formatPhoneNumber(value, formData.countryCode);
      setFormData((p) => ({ ...p, phone: formatted }));
      return;
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === "demoDate" || name === "demoTime") {
      const dateToCheck = name === "demoDate" ? value : formData.demoDate;
      const timeToCheck = name === "demoTime" ? value : formData.demoTime;
      if (dateToCheck && timeToCheck) {
        if (!isValidDateTime(dateToCheck, timeToCheck)) {
          setDateTimeError(
            `⚠️ Please select a date and time at least 24 hours from now (after ${get24HoursFromNow()})`
          );
        } else {
          setDateTimeError("");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDateTime(formData.demoDate, formData.demoTime)) {
      setDateTimeError(
        `⚠️ Please select a date and time at least 24 hours from now (after ${get24HoursFromNow()})`
      );
      return;
    }
    setLoading(true);
    setMessage("");
    setDateTimeError("");
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        city: formData.city,
        phone: formData.phone,
        countryCode: formData.countryCode,
        skill: formData.skill,
        userType: key,
        tutorName: key === "Student" ? tutorName || null : null,
        demoDate: formData.demoDate,
        demoTime: formData.demoTime,
      };

      const res = await fetch("/Api/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Your information has been submitted successfully!");
        setFormData((p) => ({
          ...p,
          name: "",
          email: "",
          city: "",
          phone: "",
          skill: "",
          demoDate: "",
          demoTime: "",
        }));
        if (onSuccess) onSuccess();
      } else {
        setMessage(`❌ ${data.error || "Failed to submit form"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <Form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>Contact Number</Form.Label>
            <div style={{ display: "flex", gap: 10 }}>
              <Form.Control
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                style={{ width: 120 }}
                required
              />
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>
              {key === "Student" ? "Instrument" : "Instrument Expertise"}
            </Form.Label>
            <Form.Control
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              placeholder={key === "Student" ? "Instrument" : "Instrument Expertise"}
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>City</Form.Label>
            <Form.Control
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter City"
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>
              {key === "Student" ? "Preferred Demo Date" : "Preferred Interview Date"}
            </Form.Label>
            <Form.Control
              name="demoDate"
              type="date"
              value={formData.demoDate}
              onChange={handleChange}
              min={getMinDate()}
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12 mb-3">
          <Form.Group>
            <Form.Label>
              {key === "Student" ? "Preferred Demo Time" : "Preferred Interview Time"}
            </Form.Label>
            <Form.Select
              name="demoTime"
              value={formData.demoTime}
              onChange={handleChange}
              required
            >
              <option value="">Select start time</option>
              {generateTimeSlots().map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Form.Select>
            {formData.demoTime && (
              <Form.Text className="text-muted">
                {key === "Student" ? "Demo" : "Interview"} session:{" "}
                {generateTimeSlots().find((s) => s.value === formData.demoTime)?.label} -{" "}
                {calculateEndTime(formData.demoTime)} (30 minutes)
              </Form.Text>
            )}
          </Form.Group>
        </div>

        {dateTimeError && (
          <div className="col-lg-12">
            <div className="alert alert-warning" role="alert">
              {dateTimeError}
            </div>
          </div>
        )}

        <div className="col-lg-12 mt-3">
          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </Form>
  );

  return (
    <div className="student-form-card bg-transparent backdrop-blur-md p-6 rounded-lg shadow-md">
      <div className="mb-4 text-sm font-medium">I am a :</div>
      <Tabs
        id="student-form-tabs"
        activeKey={key}
        onSelect={(k: any) => {
          setKey(k);
          setDateTimeError("");
          setFormData((prev) => ({
            ...prev,
            name: "",
            email: "",
            city: "",
            phone: "",
            skill: "",
            demoDate: "",
            demoTime: "",
          }));
        }}
      >
        <Tab eventKey="Student" title="Student">
          <div className="p-4">{renderForm()}</div>
        </Tab>
        <Tab eventKey="Tutor" title="Tutor">
          <div className="p-4">{renderForm()}</div>
        </Tab>
      </Tabs>

      {message && (
        <div className="mt-3 text-center">
          <small>{message}</small>
        </div>
      )}
    </div>
  );
};

export default StudentForm;