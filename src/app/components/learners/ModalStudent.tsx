"use client";

import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

interface ModalStudentProps {
  show: boolean;
  handleClose: () => void;
  tutorName?: string; // 👈 New prop for storing tutor name
}

// Format phone number based on country
const formatPhoneNumber = (value, countryCode) => {
  const digits = value.replace(/\D/g, "");

  if (countryCode === "+91") {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  } else if (countryCode === "+1") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
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

const ModalStudent = ({ show, handleClose, tutorName }: ModalStudentProps) => {
  const [key, setKey] = useState("Student");
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

  // Generate time slots (9 AM - 9 PM, 30-min intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 20 && min > 0) break; // Stop at 9:00 PM
      const time24 = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? "PM" : "AM";
      const time12 = `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
      slots.push({ value: time24, label: time12 });
    }
  }
  return slots;
};

// Get minimum date (today)
const getMinDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Calculate end time (start time + 30 minutes)
const calculateEndTime = (startTime) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formatted = formatPhoneNumber(value, formData.countryCode);
      setFormData({ ...formData, phone: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
     const submissionData = {
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
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Your information has been submitted successfully!");
        setFormData({
  name: "",
  email: "",
  city: "",
  phone: "",
  countryCode: formData.countryCode,
  skill: "",
  demoDate: "",
  demoTime: "",
});
      } else {
        setMessage(`❌ ${data.error || "Failed to submit form"}`);
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Please try again.");
      console.error("Error:", error);
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
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <div style={{ display: "flex", gap: "10px" }}>
              <Form.Control
                type="text"
                name="countryCode"
                placeholder="+91, +1, +44, etc."
                value={formData.countryCode}
                onChange={handleChange}
                required
                style={{ width: "120px" }}
              />
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
            </div>
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-3">
            <Form.Label>
              {key === "Student" ? "Instrument" : "Instrument Expertise"}
            </Form.Label>
            <Form.Control
              type="text"
              name="skill"
              placeholder={
                key === "Student" ? "Instrument" : "Instrument Expertise"
              }
              value={formData.skill}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>

        <div className="col-lg-12">
          <Form.Group className="mb-4">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              placeholder="Enter City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </div>
<div className="col-lg-12">
  <Form.Group className="mb-3">
    <Form.Label>
      {key === "Student" ? "Preferred Demo Date" : "Preferred Interview Date"}
    </Form.Label>
    <Form.Control
      type="date"
      name="demoDate"
      value={formData.demoDate}
      onChange={handleChange}
      min={getMinDate()}
      required
    />
  </Form.Group>
</div>

<div className="col-lg-12">
  <Form.Group className="mb-3">
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
      {generateTimeSlots().map((slot) => (
        <option key={slot.value} value={slot.value}>
          {slot.label}
        </option>
      ))}
    </Form.Select>
    {formData.demoTime && (
      <Form.Text className="text-muted">
        {key === "Student" ? "Demo" : "Interview"} session: {formData.demoTime && generateTimeSlots().find(s => s.value === formData.demoTime)?.label} - {calculateEndTime(formData.demoTime)} (30 minutes)
      </Form.Text>
    )}
  </Form.Group>
</div>

        <div className="col-lg-12">
          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </Form>
  );

  return (
    <Modal show={show} onHide={handleClose} centered className="modal-box-both-sec">
      <Modal.Header closeButton>
        <Modal.Title>
          <h2>Join UpKraft</h2>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="modal-inner-body">
          <div className="modal-text-heading">I am a :</div>
          <div className="tabs-start">
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => {
                setKey(k);
                   setFormData({
  name: "",
  email: "",
  city: "",
  phone: "",
  countryCode: formData.countryCode,
  skill: "",
  demoDate: "",
  demoTime: "",
});
              }}
            >
              <Tab eventKey="Student" title="Student">
                {renderForm()}
              </Tab>

              <Tab eventKey="Tutor" title="Tutor">
                {renderForm()}
              </Tab>
            </Tabs>
          </div>

          {message && (
            <div className="mt-3 text-center">
              <small>{message}</small>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalStudent;
