"use client";

import React, { useState } from "react";
import { Tab, Tabs, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";

interface ModalSchoolProps {
    show: boolean;
    handleClose: () => void;
}

const ModalSchool: React.FC<ModalSchoolProps> = ({ show, handleClose }) => {
    const [key, setKey] = useState<string>("School");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        role: "",
        name: "",
        phone: "",
        email: "",
        institutionName: "",
        city: "",
        studentCount: "",
        countryCode: "+91",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch("/Api/institution-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    phone: `${formData.countryCode} ${formData.phone}`,
                    type: key,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("✅ Your details have been submitted successfully!");
                setFormData({
                    role: "",
                    name: "",
                    phone: "",
                    email: "",
                    institutionName: "",
                    city: "",
                    studentCount: "",
                    countryCode: "+91",
                });
            } else {
                setError(result.error || "Failed to send details. Please try again.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const renderForm = (type: "School" | "Academy") => (
        <Form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>Role at {type} *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`Enter your role (e.g. ${type === "School" ? "Principal" : "Owner"})`}
                            name="role"
                            required
                            value={formData.role}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Full Name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                {/* ✅ Country code dropdown with phone number */}
                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number *</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
                                style={{ maxWidth: "120px" }}
                            >
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+61">🇦🇺 +61</option>
                                <option value="+81">🇯🇵 +81</option>
                                <option value="+971">🇦🇪 +971</option>
                            </Form.Select>
                            <Form.Control
                                type="tel"
                                placeholder="Enter Contact Number"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>{type} Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`Enter ${type} Name`}
                            name="institutionName"
                            required
                            value={formData.institutionName}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter City"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Form.Group className="mb-4">
                        <Form.Label>No. of Students in your {type}</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter Number of Students"
                            name="studentCount"
                            value={formData.studentCount}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>

                <div className="col-lg-12">
                    <Button
                        variant="primary"
                        className="w-100 d-flex justify-content-center align-items-center gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" role="status" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>

                <div className="col-lg-12 mt-3 text-center small text-muted">
                    By submitting, I agree to UpKraft’s Privacy Policy.
                </div>
            </div>
        </Form>
    );

    return (
        <Modal show={show} onHide={handleClose} centered className="modal-box-both-sec">
            <Modal.Header closeButton>
                <Modal.Title>
                    <h2>Give Your Institution the UpKraft Advantage</h2>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="modal-inner-body">
                    <div className="tabs-start">
                        <Tabs
                            id="controlled-tab-example"
                            activeKey={key}
                            onSelect={(k) => k && setKey(k)}
                            className="mb-3"
                        >
                            <Tab eventKey="School" title="School">
                                {renderForm("School")}
                            </Tab>
                            <Tab eventKey="Academy" title="Academy">
                                {renderForm("Academy")}
                            </Tab>
                        </Tabs>

                        {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ModalSchool;