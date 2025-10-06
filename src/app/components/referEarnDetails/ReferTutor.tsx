import React, { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import '../../components/referEarnDetails/ReferAndEarn.css'

interface ReferralData {
  name: string;
  email: string;
  mobile: string;
  cityAndCountry: string;
  primaryInstrument: string;
  experienceInYears: string;
  preferredContactTime: string;
  referralCode: string;
}

const ReferTutor = () => {
  const [formData, setFormData] = useState<ReferralData>({
    name: '',
    email: '',
    mobile: '',
    cityAndCountry: '',
    primaryInstrument: 'Piano',
    experienceInYears: '',
    preferredContactTime: '',
    referralCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});

    try {
      const response = await fetch('/Api/referTutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit referral');
      }

      setSubmitStatus({
        success: true,
        message: 'Tutor referral submitted successfully!'
      });

      setFormData({
        name: '',
        email: '',
        mobile: '',
        cityAndCountry: '',
        primaryInstrument: 'Piano',
        experienceInYears: '',
        preferredContactTime: '',
        referralCode: ''
      });

    } catch (error) {
      console.error('Error submitting tutor referral:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const instrumentOptions = [
    "Piano", 
    "Guitar", 
    "Violin", 
    "Drums", 
    "Voice", 
    "Flute", 
    "Saxophone", 
    "Trumpet",
    "Bass Guitar",
    "Cello",
    "Clarinet",
    "Other"
  ];

  const contactTimeOptions = [
    "Mornings (9 AM - 12 PM)",
    "Afternoons (12 PM - 4 PM)",
    "Evenings (6 PM - 9 PM)",
    "Weekends only",
    "Flexible"
  ];

  return (
    <div className="refer-tutor-sec mt-5">
      {submitStatus.message && (
        <Alert variant={submitStatus.success ? 'success' : 'danger'} className="mb-4">
          {submitStatus.message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="name">
              <Form.Label className="w-100 d-block">
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="email">
              <Form.Label className="w-100 d-block">
                Email ID
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Email id"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="mobile">
              <Form.Label className="w-100 d-block">
                Mobile Number
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="971xxxxxxx"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="cityAndCountry">
              <Form.Label className="w-100 d-block">
                City & Country
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Delhi, India"
                name="cityAndCountry"
                value={formData.cityAndCountry}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <div className="select-box">
              <Form.Group
                className="mb-4"
                controlId="primaryInstrument"
              >
                <Form.Label className="w-100 d-block">Primary Instrument</Form.Label>
                <Form.Select 
                  name="primaryInstrument"
                  value={formData.primaryInstrument}
                  onChange={handleInputChange}
                  required
                >
                  {instrumentOptions.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="experienceInYears">
              <Form.Label className="w-100 d-block">
                Years of Experience
              </Form.Label>
              <Form.Control 
                type="number" 
                min="0"
                placeholder="3" 
                name="experienceInYears"
                value={formData.experienceInYears}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <div className="select-box">
              <Form.Group className="mb-4" controlId="preferredContactTime">
                <Form.Label className="w-100 d-block">
                  Preferred Contact Time
                </Form.Label>
                <Form.Select
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select preferred time</option>
                  {contactTimeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="referralCode">
              <Form.Label className="w-100 d-block">
                Referral Code
              </Form.Label>
              <Form.Control 
                type="text" 
                placeholder="000000" 
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit and Send Invite'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ReferTutor;
