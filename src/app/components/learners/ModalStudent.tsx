"use client";

import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

const ModalStudent = ({ show, handleClose }) => {
    const [key, setKey] = useState("Student");
    const [formData, setFormData] = useState({
        name: "",
        city: "",
        phone: "",
        skill: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle input changes dynamically
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {

            const submissionData = {
                ...formData,
                userType: key, // <-- Add this line
            };

            const res = await fetch("/Api/express-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Your information has been submitted successfully!");
                setFormData({ name: "", city: "", phone: "", skill: "" });
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
                        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)}>

                            {/* ---------- STUDENT TAB ---------- */}
                            <Tab eventKey="Student" title="Student">
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
                                                <Form.Label>Contact Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="phone"
                                                    placeholder="Contact Number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </div>
                                        <div className="col-lg-12">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Instrument</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="skill"
                                                    placeholder="Instrument"
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
                            </Tab>

                            {/* ---------- TUTOR TAB ---------- */}
                            <Tab eventKey="Tutor" title="Tutor">
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
                                                <Form.Label>Contact Number</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="phone"
                                                    placeholder="Contact Number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </div>
                                        <div className="col-lg-12">
                                            <Form.Group className="mb-4">
                                                <Form.Label>Instrument Expertise</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="skill"
                                                    placeholder="Instrument Expertise"
                                                    value={formData.skill}
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
