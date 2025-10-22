"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

// Country codes data with phone length validation (COMMENTED OUT - can be restored)
/*
const countryCodes = [
    { code: "+1", country: "United States", flag: "🇺🇸", minLength: 10, maxLength: 10, popular: true },
    { code: "+1", country: "Canada", flag: "🇨🇦", minLength: 10, maxLength: 10, popular: true },
    { code: "+44", country: "United Kingdom", flag: "🇬🇧", minLength: 10, maxLength: 10, popular: true },
    { code: "+91", country: "India", flag: "🇮🇳", minLength: 10, maxLength: 10, popular: true },
    { code: "+971", country: "UAE", flag: "🇦🇪", minLength: 9, maxLength: 9, popular: true },
    { code: "+61", country: "Australia", flag: "🇦🇺", minLength: 9, maxLength: 9, popular: true },
    { code: "+65", country: "Singapore", flag: "🇸🇬", minLength: 8, maxLength: 8, popular: true },
    { code: "+93", country: "Afghanistan", flag: "🇦🇫", minLength: 9, maxLength: 9 },
    { code: "+355", country: "Albania", flag: "🇦🇱", minLength: 9, maxLength: 9 },
    { code: "+213", country: "Algeria", flag: "🇩🇿", minLength: 9, maxLength: 9 },
    { code: "+376", country: "Andorra", flag: "🇦🇩", minLength: 6, maxLength: 9 },
    { code: "+244", country: "Angola", flag: "🇦🇴", minLength: 9, maxLength: 9 },
    { code: "+54", country: "Argentina", flag: "🇦🇷", minLength: 10, maxLength: 11 },
    { code: "+374", country: "Armenia", flag: "🇦🇲", minLength: 8, maxLength: 8 },
    { code: "+43", country: "Austria", flag: "🇦🇹", minLength: 10, maxLength: 13 },
    { code: "+880", country: "Bangladesh", flag: "🇧🇩", minLength: 10, maxLength: 10 },
    { code: "+32", country: "Belgium", flag: "🇧🇪", minLength: 9, maxLength: 9 },
    { code: "+55", country: "Brazil", flag: "🇧🇷", minLength: 10, maxLength: 11 },
    { code: "+86", country: "China", flag: "🇨🇳", minLength: 11, maxLength: 11 },
    { code: "+45", country: "Denmark", flag: "🇩🇰", minLength: 8, maxLength: 8 },
    { code: "+20", country: "Egypt", flag: "🇪🇬", minLength: 10, maxLength: 10 },
    { code: "+358", country: "Finland", flag: "🇫🇮", minLength: 9, maxLength: 10 },
    { code: "+33", country: "France", flag: "🇫🇷", minLength: 9, maxLength: 9 },
    { code: "+49", country: "Germany", flag: "🇩🇪", minLength: 10, maxLength: 11 },
    { code: "+30", country: "Greece", flag: "🇬🇷", minLength: 10, maxLength: 10 },
    { code: "+852", country: "Hong Kong", flag: "🇭🇰", minLength: 8, maxLength: 8 },
    { code: "+62", country: "Indonesia", flag: "🇮🇩", minLength: 10, maxLength: 12 },
    { code: "+98", country: "Iran", flag: "🇮🇷", minLength: 10, maxLength: 10 },
    { code: "+964", country: "Iraq", flag: "🇮🇶", minLength: 10, maxLength: 10 },
    { code: "+353", country: "Ireland", flag: "🇮🇪", minLength: 9, maxLength: 9 },
    { code: "+972", country: "Israel", flag: "🇮🇱", minLength: 9, maxLength: 9 },
    { code: "+39", country: "Italy", flag: "🇮🇹", minLength: 10, maxLength: 10 },
    { code: "+81", country: "Japan", flag: "🇯🇵", minLength: 10, maxLength: 10 },
    { code: "+254", country: "Kenya", flag: "🇰🇪", minLength: 10, maxLength: 10 },
    { code: "+82", country: "South Korea", flag: "🇰🇷", minLength: 10, maxLength: 11 },
    { code: "+60", country: "Malaysia", flag: "🇲🇾", minLength: 9, maxLength: 10 },
    { code: "+52", country: "Mexico", flag: "🇲🇽", minLength: 10, maxLength: 10 },
    { code: "+31", country: "Netherlands", flag: "🇳🇱", minLength: 9, maxLength: 9 },
    { code: "+64", country: "New Zealand", flag: "🇳🇿", minLength: 9, maxLength: 10 },
    { code: "+234", country: "Nigeria", flag: "🇳🇬", minLength: 10, maxLength: 10 },
    { code: "+47", country: "Norway", flag: "🇳🇴", minLength: 8, maxLength: 8 },
    { code: "+92", country: "Pakistan", flag: "🇵🇰", minLength: 10, maxLength: 10 },
    { code: "+63", country: "Philippines", flag: "🇵🇭", minLength: 10, maxLength: 10 },
    { code: "+48", country: "Poland", flag: "🇵🇱", minLength: 9, maxLength: 9 },
    { code: "+351", country: "Portugal", flag: "🇵🇹", minLength: 9, maxLength: 9 },
    { code: "+974", country: "Qatar", flag: "🇶🇦", minLength: 8, maxLength: 8 },
    { code: "+7", country: "Russia", flag: "🇷🇺", minLength: 10, maxLength: 10 },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", minLength: 9, maxLength: 9 },
    { code: "+27", country: "South Africa", flag: "🇿🇦", minLength: 9, maxLength: 9 },
    { code: "+34", country: "Spain", flag: "🇪🇸", minLength: 9, maxLength: 9 },
    { code: "+94", country: "Sri Lanka", flag: "🇱🇰", minLength: 9, maxLength: 9 },
    { code: "+46", country: "Sweden", flag: "🇸🇪", minLength: 9, maxLength: 10 },
    { code: "+41", country: "Switzerland", flag: "🇨🇭", minLength: 9, maxLength: 9 },
    { code: "+886", country: "Taiwan", flag: "🇹🇼", minLength: 9, maxLength: 9 },
    { code: "+66", country: "Thailand", flag: "🇹🇭", minLength: 9, maxLength: 9 },
    { code: "+90", country: "Turkey", flag: "🇹🇷", minLength: 10, maxLength: 10 },
    { code: "+84", country: "Vietnam", flag: "🇻🇳", minLength: 9, maxLength: 10 },
];
*/

// Format phone number based on country
const formatPhoneNumber = (value, countryCode) => {
    const digits = value.replace(/\D/g, '');
    
    // Different formatting patterns based on country
    if (countryCode === '+91') { // India: XXXXX XXXXX
        if (digits.length <= 5) return digits;
        return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    } else if (countryCode === '+1') { // US/Canada: (XXX) XXX-XXXX
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (countryCode === '+44') { // UK: XXXX XXXXXX
        if (digits.length <= 4) return digits;
        return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`;
    } else {
        // Default: add space every 3-4 digits
        return digits.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim();
    }
};

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
    
    // COMMENTED OUT - Dropdown related state (can be restored)
    /*
    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [phoneError, setPhoneError] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    
    const dropdownRef = useRef(null);
    const countryInputRef = useRef(null);
    const phoneInputRef = useRef(null);
    */

    // COMMENTED OUT - Dropdown related useEffect hooks (can be restored)
    /*
    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
                setCountrySearch("");
                setHighlightedIndex(0);
            }
        };

        if (showCountryDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCountryDropdown]);

    // Separate popular and other countries
    const { popularCountries, otherCountries } = useMemo(() => {
        const filtered = countryCodes.filter(c => 
            !countrySearch || 
            c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.code.includes(countrySearch)
        );
        
        return {
            popularCountries: filtered.filter(c => c.popular),
            otherCountries: filtered.filter(c => !c.popular)
        };
    }, [countrySearch]);

    const allFilteredCountries = [...popularCountries, ...otherCountries];
    */

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'phone') {
            // Format phone number based on country code
            const formatted = formatPhoneNumber(value, formData.countryCode);
            setFormData({ ...formData, phone: formatted });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // COMMENTED OUT - Dropdown related functions (can be restored)
    /*
    // Handle country code selection
    const handleCountrySelect = (country) => {
        setFormData({ 
            ...formData, 
            countryCode: country.code,
            phone: "" // Reset phone when country changes
        });
        setShowCountryDropdown(false);
        setCountrySearch("");
        setHighlightedIndex(0);
        setPhoneError("");
        
        // Focus phone input after selection
        setTimeout(() => phoneInputRef.current?.focus(), 100);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showCountryDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < allFilteredCountries.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (allFilteredCountries[highlightedIndex]) {
                    handleCountrySelect(allFilteredCountries[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowCountryDropdown(false);
                setCountrySearch("");
                break;
        }
    };

    // Scroll highlighted item into view
    useEffect(() => {
        if (showCountryDropdown) {
            const element = document.getElementById(`country-item-${highlightedIndex}`);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedIndex, showCountryDropdown]);
    */

    // Handle form submission
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
                    countryCode: formData.countryCode, // Keep the selected country code
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

    // COMMENTED OUT - Country dropdown component (can be restored)
    /*
    // Get selected country details
    const selectedCountry = countryCodes.find((c) => c.code === formData.countryCode);

    // Country dropdown component (mobile full-screen modal)
    const CountryDropdown = () => {
        if (isMobile && showCountryDropdown) {
            return (
                <Modal 
                    show={showCountryDropdown} 
                    onHide={() => {
                        setShowCountryDropdown(false);
                        setCountrySearch("");
                    }}
                    fullscreen
                    animation={true}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Select Country</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: 0 }}>
                        <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, padding: '15px', borderBottom: '1px solid #eee' }}>
                            <Form.Control
                                type="text"
                                placeholder="Search country or code..."
                                value={countrySearch}
                                onChange={(e) => {
                                    setCountrySearch(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                autoFocus
                                style={{ fontSize: '16px' }}
                            />
                        </div>
                        
                        {popularCountries.length > 0 && !countrySearch && (
                            <div>
                                <div style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                                    POPULAR COUNTRIES
                                </div>
                                {popularCountries.map((country, idx) => (
                                    <div
                                        key={`${country.code}-${country.country}`}
                                        onClick={() => handleCountrySelect(country)}
                                        style={{
                                            padding: '15px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            backgroundColor: country.code === formData.countryCode ? '#e8f4f8' : 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>
                                            <span style={{ fontSize: '24px', marginRight: '10px' }}>{country.flag}</span>
                                            {country.country}
                                        </span>
                                        <span style={{ color: '#666', fontSize: '14px' }}>{country.code}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {otherCountries.length > 0 && (
                            <div>
                                {!countrySearch && (
                                    <div style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                                        ALL COUNTRIES
                                    </div>
                                )}
                                {otherCountries.map((country, idx) => (
                                    <div
                                        key={`${country.code}-${country.country}`}
                                        onClick={() => handleCountrySelect(country)}
                                        style={{
                                            padding: '15px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            backgroundColor: country.code === formData.countryCode ? '#e8f4f8' : 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>
                                            <span style={{ fontSize: '24px', marginRight: '10px' }}>{country.flag}</span>
                                            {country.country}
                                        </span>
                                        <span style={{ color: '#666', fontSize: '14px' }}>{country.code}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            );
        }

        // Desktop dropdown
        if (!isMobile && showCountryDropdown) {
            return (
                <div
                    ref={dropdownRef}
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "300px",
                        overflowY: "auto",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        zIndex: 1000,
                        marginTop: "2px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                    onKeyDown={handleKeyDown}
                >
                    <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => {
                                setCountrySearch(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: "100%",
                                padding: "8px",
                                border: "none",
                                borderBottom: "1px solid #eee",
                                outline: "none",
                            }}
                            autoFocus
                        />
                    </div>
                    
                    {popularCountries.length > 0 && !countrySearch && (
                        <>
                            <div style={{ padding: '6px 10px', backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '11px', color: '#666' }}>
                                POPULAR
                            </div>
                            {popularCountries.map((country, idx) => {
                                const globalIdx = idx;
                                return (
                                    <div
                                        id={`country-item-${globalIdx}`}
                                        key={`${country.code}-${country.country}`}
                                        onClick={() => handleCountrySelect(country)}
                                        style={{
                                            padding: "8px 10px",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #f0f0f0",
                                            backgroundColor: highlightedIndex === globalIdx ? '#e8f4f8' : 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(globalIdx)}
                                    >
                                        <span>
                                            {country.flag} {country.country}
                                        </span>
                                        <span style={{ color: '#666' }}>{country.code}</span>
                                    </div>
                                );
                            })}
                            <div style={{ height: '1px', backgroundColor: '#ddd', margin: '4px 0' }} />
                        </>
                    )}
                    
                    {otherCountries.map((country, idx) => {
                        const globalIdx = popularCountries.length + idx;
                        return (
                            <div
                                id={`country-item-${globalIdx}`}
                                key={`${country.code}-${country.country}`}
                                onClick={() => handleCountrySelect(country)}
                                style={{
                                    padding: "8px 10px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f0f0f0",
                                    backgroundColor: highlightedIndex === globalIdx ? '#e8f4f8' : 'white',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                                onMouseEnter={() => setHighlightedIndex(globalIdx)}
                            >
                                <span>
                                    {country.flag} {country.country}
                                </span>
                                <span style={{ color: '#666' }}>{country.code}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return null;
    };
    */

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
                            placeholder={key === "Student" ? "Instrument" : "Instrument Expertise"}
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
                                    countryCode: formData.countryCode, // Keep the selected country code
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