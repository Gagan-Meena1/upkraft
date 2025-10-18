"use client";

import React, { useState, useMemo } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

// Country codes data
const countryCodes = [
    { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
    { code: "+355", country: "Albania", flag: "🇦🇱" },
    { code: "+213", country: "Algeria", flag: "🇩🇿" },
    { code: "+376", country: "Andorra", flag: "🇦🇩" },
    { code: "+244", country: "Angola", flag: "🇦🇴" },
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+374", country: "Armenia", flag: "🇦🇲" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
    { code: "+32", country: "Belgium", flag: "🇧🇪" },
    { code: "+55", country: "Brazil", flag: "🇧🇷" },
    { code: "+1", country: "Canada", flag: "🇨🇦" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+45", country: "Denmark", flag: "🇩🇰" },
    { code: "+20", country: "Egypt", flag: "🇪🇬" },
    { code: "+358", country: "Finland", flag: "🇫🇮" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+30", country: "Greece", flag: "🇬🇷" },
    { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+62", country: "Indonesia", flag: "🇮🇩" },
    { code: "+98", country: "Iran", flag: "🇮🇷" },
    { code: "+964", country: "Iraq", flag: "🇮🇶" },
    { code: "+353", country: "Ireland", flag: "🇮🇪" },
    { code: "+972", country: "Israel", flag: "🇮🇱" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+60", country: "Malaysia", flag: "🇲🇾" },
    { code: "+52", country: "Mexico", flag: "🇲🇽" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+47", country: "Norway", flag: "🇳🇴" },
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+63", country: "Philippines", flag: "🇵🇭" },
    { code: "+48", country: "Poland", flag: "🇵🇱" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+974", country: "Qatar", flag: "🇶🇦" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
    { code: "+46", country: "Sweden", flag: "🇸🇪" },
    { code: "+41", country: "Switzerland", flag: "🇨🇭" },
    { code: "+886", country: "Taiwan", flag: "🇹🇼" },
    { code: "+66", country: "Thailand", flag: "🇹🇭" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
    { code: "+1", country: "United States", flag: "🇺🇸" },
    { code: "+84", country: "Vietnam", flag: "🇻🇳" },
];

const ModalStudent = ({ show, handleClose }) => {
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
    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!countrySearch) return countryCodes;
        const search = countrySearch.toLowerCase();
        return countryCodes.filter(
            (c) =>
                c.country.toLowerCase().includes(search) ||
                c.code.includes(search)
        );
    }, [countrySearch]);

    // Handle input changes dynamically
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle country code selection
    const handleCountrySelect = (code) => {
        setFormData({ ...formData, countryCode: code });
        setShowCountryDropdown(false);
        setCountrySearch("");
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const submissionData = {
                ...formData,
                userType: key,
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
                    countryCode: "+91",
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

    // Get selected country details
    const selectedCountry = countryCodes.find((c) => c.code === formData.countryCode);

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
                                                    <div style={{ position: "relative", width: "140px" }}>
                                                        <Form.Control
                                                            type="text"
                                                            value={`${selectedCountry?.flag} ${formData.countryCode}`}
                                                            onFocus={() => setShowCountryDropdown(true)}
                                                            onChange={(e) => setCountrySearch(e.target.value.replace(/[^\d+]/g, ""))}
                                                            placeholder="Code"
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                        {showCountryDropdown && (
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "100%",
                                                                    left: 0,
                                                                    right: 0,
                                                                    maxHeight: "200px",
                                                                    overflowY: "auto",
                                                                    backgroundColor: "white",
                                                                    border: "1px solid #ccc",
                                                                    borderRadius: "4px",
                                                                    zIndex: 1000,
                                                                    marginTop: "2px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search country..."
                                                                    value={countrySearch}
                                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "8px",
                                                                        border: "none",
                                                                        borderBottom: "1px solid #eee",
                                                                        outline: "none",
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                {filteredCountries.map((country) => (
                                                                    <div
                                                                        key={country.code + country.country}
                                                                        onClick={() => handleCountrySelect(country.code)}
                                                                        style={{
                                                                            padding: "8px",
                                                                            cursor: "pointer",
                                                                            borderBottom: "1px solid #f0f0f0",
                                                                        }}
                                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                                                                    >
                                                                        {country.flag} {country.country} ({country.code})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="Phone Number"
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
                                                    <div style={{ position: "relative", width: "140px" }}>
                                                        <Form.Control
                                                            type="text"
                                                            value={`${selectedCountry?.flag} ${formData.countryCode}`}
                                                            onFocus={() => setShowCountryDropdown(true)}
                                                            onChange={(e) => setCountrySearch(e.target.value.replace(/[^\d+]/g, ""))}
                                                            placeholder="Code"
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                        {showCountryDropdown && (
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "100%",
                                                                    left: 0,
                                                                    right: 0,
                                                                    maxHeight: "200px",
                                                                    overflowY: "auto",
                                                                    backgroundColor: "white",
                                                                    border: "1px solid #ccc",
                                                                    borderRadius: "4px",
                                                                    zIndex: 1000,
                                                                    marginTop: "2px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search country..."
                                                                    value={countrySearch}
                                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                                    style={{
                                                                        width: "100%",
                                                                        padding: "8px",
                                                                        border: "none",
                                                                        borderBottom: "1px solid #eee",
                                                                        outline: "none",
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                {filteredCountries.map((country) => (
                                                                    <div
                                                                        key={country.code + country.country}
                                                                        onClick={() => handleCountrySelect(country.code)}
                                                                        style={{
                                                                            padding: "8px",
                                                                            cursor: "pointer",
                                                                            borderBottom: "1px solid #f0f0f0",
                                                                        }}
                                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                                                                    >
                                                                        {country.flag} {country.country} ({country.code})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="Phone Number"
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