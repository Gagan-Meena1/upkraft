"use client"
import React from 'react'
import ProgressBar from "react-bootstrap/ProgressBar";
import { Button, Form } from 'react-bootstrap'
import Link from 'next/link'
import StudentProfileImg from '../../../assets/student-profile-img.png'
import './FeedbackPendingDetails.css'
import Image from 'next/image';

const FeedbackPendingDetails = () => {
  return (
    <div className='feedback-pending-details-sec'>
      <div className='feed-back-heading'>
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-md-3 flex-xl-nowrap flex-wrap">
            <div className='left-head'>
                <h2 className='m-0'>Feedback Pending</h2>
            </div>
            <div className='right-form'>
               <Link href="" className='link-text'>Back to Dashboard</Link>
            </div>
        </div>
        <hr className='hr-light'/>
      </div>
      <div className='feedback-pending-box d-flex flex-wrap'>
        <div className='feedback-left-box'>
          <div className='feedback-box-scroll'>
            <div className='card-feedback'>
              <div className='feedback-img-text'>
                <ul className=' list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                  <li className='d-flex align-items-center gap-2'>
                    <Image src={StudentProfileImg} alt="" />
                    <h3>Stewart Deckow</h3>
                  </li>
                  <li>
                    <span className='pending'>Pending</span>
                  </li>
                </ul>
              </div>
              <ul className='chat-list-box list-unstyled p-0 m-0'>
                <li className='card-chat active'>Introduction href Piano</li>
                <li className='card-chat '>Finger Warmups</li>
              </ul>
            </div>
            <div className='card-feedback'>
              <div className='feedback-img-text'>
                <ul className=' list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                  <li className='d-flex align-items-center gap-2'>
                    <Image src={StudentProfileImg} alt="" />
                    <h3>Stewart Deckow</h3>
                  </li>
                  <li>
                    <span className='pending'>Pending</span>
                  </li>
                </ul>
              </div>
              <ul className='chat-list-box list-unstyled p-0 m-0'>
                <li className='card-chat'>Introduction href Piano</li>
                <li className='card-chat '>Finger Warmups</li>
              </ul>
            </div>
            <div className='card-feedback'>
              <div className='feedback-img-text'>
                <ul className=' list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                  <li className='d-flex align-items-center gap-2'>
                    <Image src={StudentProfileImg} alt="" />
                    <h3>Stewart Deckow</h3>
                  </li>
                  <li>
                    <span className='pending'>Pending</span>
                  </li>
                </ul>
              </div>
              <ul className='chat-list-box list-unstyled p-0 m-0'>
                <li className='card-chat'>Introduction href Piano</li>
                <li className='card-chat '>Finger Warmups</li>
              </ul>
            </div>
            <div className='card-feedback'>
              <div className='feedback-img-text'>
                <ul className=' list-unstyled p-0 m-0 d-flex align-items-center position-relative justify-content-between gap-2'>
                  <li className='d-flex align-items-center gap-2'>
                    <Image src={StudentProfileImg} alt="" />
                    <h3>Stewart Deckow</h3>
                  </li>
                  <li>
                    <span className='pending'>Pending</span>
                  </li>
                </ul>
              </div>
              <ul className='chat-list-box list-unstyled p-0 m-0'>
                <li className='card-chat'>Introduction href Piano</li>
                <li className='card-chat '>Finger Warmups</li>
              </ul>
            </div>
          </div>
        </div>
        <div className='feedback-right-box'>
          <div className='feedback-box'>
            <div className='head-feedback d-flex align-items-center gap-2 justify-content-between flex-md-nowrap flex-wrap gap-4'>
              <div className='text-head-feedback'>
                <h2>Student Performance Evaluation</h2>
                <p>Provide feedback on student’s performance</p>
              </div>
              <div className='btn-right'>
                <Link href='' className='btn-link border-box d-flex align-items-center gap-2 justify-content-center'>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3333 10.0001C13.5101 10.0001 13.6797 10.0703 13.8047 10.1953C13.9298 10.3203 14 10.4899 14 10.6667V13.3334C14 13.687 13.8595 14.0261 13.6095 14.2762C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2762C2.14048 14.0261 2 13.687 2 13.3334V10.6667C2 10.4899 2.07024 10.3203 2.19526 10.1953C2.32029 10.0703 2.48986 10.0001 2.66667 10.0001C2.84348 10.0001 3.01305 10.0703 3.13807 10.1953C3.2631 10.3203 3.33333 10.4899 3.33333 10.6667V13.3334H12.6667V10.6667C12.6667 10.4899 12.7369 10.3203 12.8619 10.1953C12.987 10.0703 13.1565 10.0001 13.3333 10.0001ZM8.58933 2.31605L11.3 5.02672C11.3637 5.08822 11.4145 5.16178 11.4494 5.24312C11.4843 5.32445 11.5027 5.41193 11.5035 5.50045C11.5043 5.58897 11.4874 5.67676 11.4539 5.75869C11.4204 5.84062 11.3709 5.91506 11.3083 5.97765C11.2457 6.04025 11.1712 6.08975 11.0893 6.12327C11.0074 6.15679 10.9196 6.17366 10.8311 6.17289C10.7425 6.17212 10.6551 6.15373 10.5737 6.11879C10.4924 6.08385 10.4188 6.03306 10.3573 5.96939L8.66667 4.28006V10.6667C8.66667 10.8435 8.59643 11.0131 8.4714 11.1381C8.34638 11.2632 8.17681 11.3334 8 11.3334C7.82319 11.3334 7.65362 11.2632 7.5286 11.1381C7.40357 11.0131 7.33333 10.8435 7.33333 10.6667V4.27939L5.64267 5.96939C5.51693 6.09083 5.34853 6.15802 5.17373 6.1565C4.99893 6.15499 4.83173 6.08487 4.70812 5.96127C4.58452 5.83766 4.5144 5.67045 4.51288 5.49566C4.51136 5.32086 4.57856 5.15246 4.7 5.02672L7.41067 2.31605C7.48805 2.23865 7.57993 2.17725 7.68105 2.13535C7.78217 2.09346 7.89055 2.0719 8 2.0719C8.10945 2.0719 8.21783 2.09346 8.31895 2.13535C8.42007 2.17725 8.51195 2.23865 8.58933 2.31605Z" fill="#6E09BD"/></svg>
                  <span>Upload Recording</span>
                </Link>
              </div>
            </div>
            <div className='bottom-feedback-box row'>
               
              <div className='col-xxl-6 mb-0'>
                  <div className='progressbar-line-sec'>
                      <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Rhythm</h6>
                              <ProgressBar now={62} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "62%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                      <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Understanding of hrefpic</h6>
                              <ProgressBar now={32} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "32%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                      <div className="card-box mb-0 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Ear Training</h6>
                              <ProgressBar now={42} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "42%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                      <div className="card-box mb-0 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Technique</h6>
                              <ProgressBar now={42} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "42%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                  </div>
              </div>
              <div className='col-xxl-6 mb-4'>
                  <div className='progressbar-line-sec'>
                      <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Theoretical Understanding</h6>
                              <ProgressBar now={46} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "46%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                      <div className="card-box mb-3 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Performance</h6>
                              <ProgressBar now={56} variant="" style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "56%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                      <div className="card-box mb-0 d-flex align-items-center gap-2 justify-content-between">
                          <div className="left-progress-bar">
                              <h6 className="mb-2">Assignment</h6>
                              <ProgressBar now={68} variant="" className='w-100' style={{ height: "8px", backgroundColor: "#eee" }}>
                                  <div style={{ width: "68%", height: "100%",  backgroundColor: "#7b2ff7", borderRadius: "6px", }}></div>
                              </ProgressBar>
                          </div>
                          <div className="right-text-box red-text">
                              <span className='main-text'> 5</span>
                              <span className="text-muted">/10</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className='bottom-recording-box'>
                <p><strong>Personal Feedback & Area for Improvement</strong></p>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label  className='w-100 d-none'>Provide detailed feedback and suggestions for improvement...</Form.Label>
                        <Form.Control as="textarea" rows={5} placeholder='Provide detailed feedback and suggestions for improvement...'/>
                    </Form.Group>
                </Form>
                <div className='d-flex align-items-end justify-content-end mt-4'>
                  <Button type='button' className='btn btn-primary'>Submit Evaluation</Button>
                </div>
              </div>

            </div>


          </div>
        </div>
      </div>
     </div>
  )
}

export default FeedbackPendingDetails