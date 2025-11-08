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
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        tutorName: key === "Student" ? tutorName || null : null, // ✅ Only include for Student
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
