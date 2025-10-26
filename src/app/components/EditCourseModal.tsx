'use client'
import React, { useState } from 'react'
import { Form } from 'react-bootstrap'
import Link from 'next/link'

const EditCourseModal = () => {
  return (
    <div className="modal fade modal-common-sec w-800 assignment-modal-sec" id="EditCourse" tabIndex={-1} aria-labelledby="customModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.125 1.875L1.875 18.125M1.875 1.875L18.125 18.125" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="modal-body">
             <div className='head-modal text-center'>
                <h2>Edit Course</h2>
                <p>Edit the course details below to update content & other information.</p>
             </div>
             <div className='form-box-modal label-strong-box'>
                <Form>
                    <div className='row'>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Course Title</Form.Label>
                                <Form.Control type="text" placeholder="Introduction to Piano" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <div className='select-box'>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label  className='w-100 d-block'>Course Category</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option>Piano</option>
                                        <option value="1">Piano 1</option>
                                        <option value="2">Piano 2</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Label  className='w-100 d-block'>Course Description</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder='Learn the fundamentals of piano playing, including notes, rhythm, and basic techniques in this beginner-friendly course.'/>
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Course Duration</Form.Label>
                                <Form.Control type="text" placeholder="4 weeks" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label className='w-100 d-block'>Course Fees</Form.Label>
                                <Form.Control type="text" placeholder="600/-" />
                            </Form.Group>
                        </div>
                        <div className='col-md-12'>
                            <div className='row add-box-more'>
                                <div className='col-md-12'>
                                    <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                        <Form.Label className='w-100 d-block'>Curriculum</Form.Label>
                                    </Form.Group>
                                </div>
                                <div className='col-md-2 col-4'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="1" className='text-center'/>
                                    </Form.Group>
                                </div>
                                <div className='col-md-5 col-8'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="Introduction to Piano" />
                                    </Form.Group>
                                </div>
                                <div className='col-md-4 col-9'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="Learning" />
                                    </Form.Group>
                                </div>
                                <div className='col-md-1 col-3'>
                                    <Link href="" className='btn-delete-list'>
                                        <svg width="38" height="56" viewBox="0 0 38 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.834 35.5C14.3757 35.5 13.9834 35.3369 13.6573 35.0108C13.3312 34.6847 13.1679 34.2922 13.1673 33.8333V23C12.9312 23 12.7334 22.92 12.574 22.76C12.4145 22.6 12.3345 22.4022 12.334 22.1667C12.3334 21.9311 12.4134 21.7333 12.574 21.5733C12.7345 21.4133 12.9323 21.3333 13.1673 21.3333H16.5007C16.5007 21.0972 16.5807 20.8994 16.7407 20.74C16.9007 20.5806 17.0984 20.5006 17.334 20.5H20.6673C20.9034 20.5 21.1015 20.58 21.2615 20.74C21.4215 20.9 21.5012 21.0978 21.5007 21.3333H24.834C25.0701 21.3333 25.2682 21.4133 25.4282 21.5733C25.5882 21.7333 25.6679 21.9311 25.6673 22.1667C25.6668 22.4022 25.5868 22.6003 25.4273 22.7608C25.2679 22.9214 25.0701 23.0011 24.834 23V33.8333C24.834 34.2917 24.6709 34.6842 24.3448 35.0108C24.0187 35.3375 23.6262 35.5006 23.1673 35.5H14.834ZM23.1673 23H14.834V33.8333H23.1673V23ZM17.334 32.1667C17.5701 32.1667 17.7682 32.0867 17.9282 31.9267C18.0882 31.7667 18.1679 31.5689 18.1673 31.3333V25.5C18.1673 25.2639 18.0873 25.0661 17.9273 24.9067C17.7673 24.7472 17.5695 24.6672 17.334 24.6667C17.0984 24.6661 16.9007 24.7461 16.7407 24.9067C16.5807 25.0672 16.5007 25.265 16.5007 25.5V31.3333C16.5007 31.5694 16.5807 31.7675 16.7407 31.9275C16.9007 32.0875 17.0984 32.1672 17.334 32.1667ZM20.6673 32.1667C20.9034 32.1667 21.1015 32.0867 21.2615 31.9267C21.4215 31.7667 21.5012 31.5689 21.5007 31.3333V25.5C21.5007 25.2639 21.4207 25.0661 21.2607 24.9067C21.1007 24.7472 20.9029 24.6672 20.6673 24.6667C20.4318 24.6661 20.234 24.7461 20.074 24.9067C19.914 25.0672 19.834 25.265 19.834 25.5V31.3333C19.834 31.5694 19.914 31.7675 20.074 31.9275C20.234 32.0875 20.4318 32.1672 20.6673 32.1667Z" fill="#E53935"/></svg>
                                    </Link>
                                </div>
                            </div>
                            <div className='row add-box-more'>
                                <div className='col-md-2 col-4'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="1" className='text-center'/>
                                    </Form.Group>
                                </div>
                                <div className='col-md-5 col-8'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="Introduction to Piano" />
                                    </Form.Group>
                                </div>
                                <div className='col-md-4 col-9'>
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Control type="text" placeholder="Learning" />
                                    </Form.Group>
                                </div>
                                <div className='col-md-1 col-3'>
                                    <Link href="" className='btn-delete-list'>
                                        <svg width="38" height="56" viewBox="0 0 38 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.834 35.5C14.3757 35.5 13.9834 35.3369 13.6573 35.0108C13.3312 34.6847 13.1679 34.2922 13.1673 33.8333V23C12.9312 23 12.7334 22.92 12.574 22.76C12.4145 22.6 12.3345 22.4022 12.334 22.1667C12.3334 21.9311 12.4134 21.7333 12.574 21.5733C12.7345 21.4133 12.9323 21.3333 13.1673 21.3333H16.5007C16.5007 21.0972 16.5807 20.8994 16.7407 20.74C16.9007 20.5806 17.0984 20.5006 17.334 20.5H20.6673C20.9034 20.5 21.1015 20.58 21.2615 20.74C21.4215 20.9 21.5012 21.0978 21.5007 21.3333H24.834C25.0701 21.3333 25.2682 21.4133 25.4282 21.5733C25.5882 21.7333 25.6679 21.9311 25.6673 22.1667C25.6668 22.4022 25.5868 22.6003 25.4273 22.7608C25.2679 22.9214 25.0701 23.0011 24.834 23V33.8333C24.834 34.2917 24.6709 34.6842 24.3448 35.0108C24.0187 35.3375 23.6262 35.5006 23.1673 35.5H14.834ZM23.1673 23H14.834V33.8333H23.1673V23ZM17.334 32.1667C17.5701 32.1667 17.7682 32.0867 17.9282 31.9267C18.0882 31.7667 18.1679 31.5689 18.1673 31.3333V25.5C18.1673 25.2639 18.0873 25.0661 17.9273 24.9067C17.7673 24.7472 17.5695 24.6672 17.334 24.6667C17.0984 24.6661 16.9007 24.7461 16.7407 24.9067C16.5807 25.0672 16.5007 25.265 16.5007 25.5V31.3333C16.5007 31.5694 16.5807 31.7675 16.7407 31.9275C16.9007 32.0875 17.0984 32.1672 17.334 32.1667ZM20.6673 32.1667C20.9034 32.1667 21.1015 32.0867 21.2615 31.9267C21.4215 31.7667 21.5012 31.5689 21.5007 31.3333V25.5C21.5007 25.2639 21.4207 25.0661 21.2607 24.9067C21.1007 24.7472 20.9029 24.6672 20.6673 24.6667C20.4318 24.6661 20.234 24.7461 20.074 24.9067C19.914 25.0672 19.834 25.265 19.834 25.5V31.3333C19.834 31.5694 19.914 31.7675 20.074 31.9275C20.234 32.0875 20.4318 32.1672 20.6673 32.1667Z" fill="#E53935"/></svg>
                                    </Link>
                                </div>
                            </div>
                            <Link href="" className='btn btn-border fixed-width-box d-flex align-items-center justify-content-center gap-2 p-3'>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9987 8.66683H8.66537V12.0002C8.66537 12.3668 8.36537 12.6668 7.9987 12.6668C7.63203 12.6668 7.33203 12.3668 7.33203 12.0002V8.66683H3.9987C3.63203 8.66683 3.33203 8.36683 3.33203 8.00016C3.33203 7.6335 3.63203 7.3335 3.9987 7.3335H7.33203V4.00016C7.33203 3.6335 7.63203 3.3335 7.9987 3.3335C8.36537 3.3335 8.66537 3.6335 8.66537 4.00016V7.3335H11.9987C12.3654 7.3335 12.6654 7.6335 12.6654 8.00016C12.6654 8.36683 12.3654 8.66683 11.9987 8.66683Z" fill="#6E09BD"/></svg>
                                <span>Add Session</span>
                            </Link>
                        </div>
                    </div>
                </Form>
             </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary w-100">
              Update Course
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCourseModal