import React from "react";
import { Button, Form } from "react-bootstrap";
import '../../components/referEarnDetails/ReferAndEarn.css'

const ReferTutor = () => {
  return (
    <div className="refer-tutor-sec mt-5">
      <Form>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Introduction to Piano"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Email ID
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Email id"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Mobile Number
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="971xxxxxxx"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                City & Country
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Delhi, India"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <div className="select-box">
              <Form.Group
                className="mb-4"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label className="w-100 d-block">Primary Instrument</Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Piano</option>
                  <option value="1">Piano</option>
                  <option value="2">Piano</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Years of Experience
              </Form.Label>
              <Form.Control type="text" placeholder="3" />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Preferred Contact Time
              </Form.Label>
              <Form.Control type="text" placeholder="4:00 PM" />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-4" controlId="exampleForm.ControlInput1">
              <Form.Label className="w-100 d-block">
                Referral Code
              </Form.Label>
              <Form.Control type="text" placeholder="000000" />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Button type="submit" className="btn btn-primary w-100">Submit and Send Invite</Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ReferTutor;
