"use client";

import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

interface ModalTutorProps {
  show: boolean;
  handleClose: () => void;
  tutorName?: string;
  mode?: "Student" | "Tutor";
}

// Format phone number based on country
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

const ModalTutor = ({ show, handleClose, mode = "Tutor" }: ModalTutorProps) => {
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Generate time slots (10 AM - 8 PM, 30-min intervals)
  const generateTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    for (let hour = 10; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 20 && min > 0) break;
        const time24 = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
        slots.push({ value: time24, label: time12 });
      }
    }
    return slots;
  };

  // Check if selected date and time is at least 48 hours from now
  const isValidDateTime = (date?: string, time?: string) => {
    if (!date || !time) return true;
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return selectedDateTime >= fortyEightHoursFromNow;
  };

  const get24HoursFromNow = () => {
    const future = new Date();
    future.setHours(future.getHours() + 48);
    const date = future.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = future.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${date} at ${time}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 48);
    return tomorrow.toISOString().split("T")[0];
  };

  const calculateEndTime = (startTime?: string) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHour = hours;
    let endMin = minutes + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }
    const hour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    const ampm = endHour >= 12 ? "PM" : "AM";
    return `${hour12}:${endMin.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, files } = e.target;
    if (name === "phone") {
      const formatted = formatPhoneNumber(value, formData.countryCode);
      setFormData({ ...formData, phone: formatted });
      return;
    }
    if (name === "resume" && files) {
      setResumeFile(files[0]);
      return;
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if ((name === "demoDate" || name === "demoTime") && mode === "Student") {
      const dateToCheck = name === "demoDate" ? value : formData.demoDate;
      const timeToCheck = name === "demoTime" ? value : formData.demoTime;
      if (dateToCheck && timeToCheck) {
        if (!isValidDateTime(dateToCheck, timeToCheck)) {
          setDateTimeError(`⚠️ Please select a date and time at least 48 hours from now (after ${get24HoursFromNow()})`);
        } else {
          setDateTimeError("");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDateTimeError("");

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        city: formData.city,
        phone: formData.phone,
        countryCode: formData.countryCode,
        skill: formData.skill,
        demoDate: formData.demoDate || null,
        demoTime: formData.demoTime || null,
        userType: "Tutor",
      };

      let res: Response;

      if (resumeFile) {
        // ✅ send multipart/form-data with file
        const formDataToSend = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formDataToSend.append(key, String(value));
          }
        });
        formDataToSend.append("resumeFile", resumeFile);

        res = await fetch("/Api/express-interest", {
          method: "POST",
          body: formDataToSend,
        });
      } else {
        // 🔁 keep your old JSON flow when no resume
        res = await fetch("/Api/express-interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        // reset form as you already do
        setResumeFile(null);
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
        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleChange} required />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <div style={{ display: "flex", gap: "10px" }}>
              <Form.Control type="text" name="countryCode" placeholder="+91, +1, +44, etc." value={formData.countryCode} onChange={handleChange} required style={{ width: "120px" }} />
              <Form.Control type="tel" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} required style={{ flex: 1 }} />
            </div>
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>{mode === "Student" ? "Instrument" : "Instrument Expertise"}</Form.Label>
            <Form.Control type="text" name="skill" placeholder={mode === "Student" ? "Instrument" : "Instrument Expertise"} value={formData.skill} onChange={handleChange} required />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-4">
            <Form.Label>City</Form.Label>
            <Form.Control type="text" name="city" placeholder="Enter City" value={formData.city} onChange={handleChange} required />
          </Form.Group>
        </div>

        {mode === "Student" ? (
          <>
            <div className="col-lg-12">
              <Form.Group className="mb-3">
                <Form.Label>Preferred Demo Date</Form.Label>
                <Form.Control type="date" name="demoDate" value={formData.demoDate} onChange={handleChange} min={getMinDate()} required />
              </Form.Group>
            </div>

            <div className="col-lg-12">
              <Form.Group className="mb-3">
                <Form.Label>Preferred Demo Time</Form.Label>
                <Form.Select name="demoTime" value={formData.demoTime} onChange={handleChange} required>
                  <option value="">Select start time</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </Form.Select>
                {formData.demoTime && (
                  <Form.Text className="text-muted">
                    Demo session: {generateTimeSlots().find((s) => s.value === formData.demoTime)?.label} - {calculateEndTime(formData.demoTime)} (30 minutes)
                  </Form.Text>
                )}
              </Form.Group>
            </div>
            {dateTimeError && (
              <div className="col-lg-12">
                <div className="alert alert-warning mt-2 mb-3" role="alert">
                  {dateTimeError}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="col-lg-12">
            <Form.Group className="mb-3">
              <Form.Label>Upload Resume</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              {resumeFile && (
                <Form.Text className="text-muted">
                  Selected: {resumeFile.name}
                </Form.Text>
              )}
            </Form.Group>
          </div>
        )}

        <div className="col-lg-12">
          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? "Submitting..." : mode === "Student" ? "Submit Demo Request" : "Connect"}
          </Button>
        </div>
      </div>
    </Form>
  );

  return (
    <Modal show={show} onHide={handleClose} centered className="modal-box-both-sec">
      <Modal.Header closeButton>
        <Modal.Title>
          <h2>{mode === "Student" ? "Book a Demo" : "Connect with us"}</h2>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="modal-inner-body">
          {message && <div className="mt-3 text-center"><small>{message}</small></div>}
          {renderForm()}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalTutor;
