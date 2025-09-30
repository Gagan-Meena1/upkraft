import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import { DatePicker } from 'rsuite'
import './AddAssignmentsModal.css'

const AddNewStudentModal = () => {
  const [musicSheet, setMusicSheet] = useState(null);
  const [assignmentFile, setAssignmentFile] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "music") {
      setMusicSheet(file);
    } else {
      setAssignmentFile(file);
    }
  };
  return (
    <div className="modal fade modal-common-sec w-800 assignment-modal-sec" id="AddStudentModal" aria-labelledby="customModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.125 1.875L1.875 18.125M1.875 1.875L18.125 18.125" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="modal-body">
             <div className='head-modal text-center'>
                <h2>Add New Student</h2>
                <p>Complete the form below to register a new student account</p>
             </div>
             <div className='form-box-modal label-strong-box'>
                <Form>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className="upload-box student-modal">
                                <Form.Label className="title-label w-100 d-block d-none">Upload Music Sheet (if any)</Form.Label>
                                <label htmlFor="musicUpload" className="upload-label border-0 p-0">
                                    <div className="upload-area">
                                        {!musicSheet ? (
                                            <p>
                                                <span className="icon"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#F5F5F5"/></svg></span>
                                                <span className='add-icons'>
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#6E09BD"/><path d="M17.3333 12.6667C17.3333 12.4899 17.2631 12.3203 17.1381 12.1953C17.013 12.0702 16.8435 12 16.6667 12C16.4899 12 16.3203 12.0702 16.1953 12.1953C16.0702 12.3203 16 12.4899 16 12.6667V16H12.6667C12.4899 16 12.3203 16.0702 12.1953 16.1953C12.0702 16.3203 12 16.4899 12 16.6667C12 16.8435 12.0702 17.013 12.1953 17.1381C12.3203 17.2631 12.4899 17.3333 12.6667 17.3333H16V20.6667C16 20.8435 16.0702 21.0131 16.1953 21.1381C16.3203 21.2631 16.4899 21.3333 16.6667 21.3333C16.8435 21.3333 17.013 21.2631 17.1381 21.1381C17.2631 21.0131 17.3333 20.8435 17.3333 20.6667V17.3333H20.6667C20.8435 17.3333 21.0131 17.2631 21.1381 17.1381C21.2631 17.013 21.3333 16.8435 21.3333 16.6667C21.3333 16.4899 21.2631 16.3203 21.1381 16.1953C21.0131 16.0702 20.8435 16 20.6667 16H17.3333V12.6667Z" fill="white"/></svg>
                                                </span>
                                            </p>
                                            ) : (
                                            <p className="file-name">{musicSheet.name}</p>
                                        )}
                                    </div>
                                </label>
                                <input id="musicUpload" type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => handleFileChange(e, "music")} hidden />
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Full Name</Form.Label>
                                <Form.Control type="text" placeholder="John Doe" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <div className='select-box'>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label  className='w-100 d-block'>Gender</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option value="1">Female</option>
                                        <option value="2">male</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <div className='select-box'>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label  className='w-100 d-block'>Instrument</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option value="1">Piano</option>
                                        <option value="2">Piano 1</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Email address</Form.Label>
                                <Form.Control type="email" placeholder="name@gmail.com" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>DOB</Form.Label>
                                <Form.Control type="text" placeholder="YY-MM-DD" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Contact Number</Form.Label>
                                <Form.Control type="text" placeholder="91790XXXXX" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Location</Form.Label>
                                <Form.Control type="text" placeholder="China" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Home Address</Form.Label>
                                <Form.Control type="text" placeholder="45xxxxx" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Pincode</Form.Label>
                                <Form.Control type="text" placeholder="45xxxxx" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <div className='select-box'>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label  className='w-100 d-block'>Gender</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option value="1">Female</option>
                                        <option value="2">male</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        {/* <div className='col-md-12'>
                            <Form.Group className="mb-3 position-relative" controlId="exampleForm.ControlTextarea1">
                                <Form.Label className='w-100 d-block'>Deadline</Form.Label>
                                <DatePicker format="MM/dd/yyyy" className='w-100'/>
                            </Form.Group>
                        </div> */}
                    </div>
                </Form>
             </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary w-100">
              Add Student
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddNewStudentModal