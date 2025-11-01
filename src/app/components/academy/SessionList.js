"use client";
import React from "react";
import Link from 'next/link';
import { Button, Dropdown, Form, ProgressBar } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import Profile from "../../../assets/Mask-profile.png";


const SessionList = () => {
  return (
     <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec justify-content-end d-flex align-items-center mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="right-form">
            <Form>
              <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
                <div className="search-box">
                  <Form.Group className="position-relative mb-0">
                    <Form.Label className="d-none">search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search tutors by name, subject, or email..."
                    />
                    <Button
                      type=""
                      className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.4995 17.5L13.8828 13.8833"
                          stroke="#505050"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                          stroke="#505050"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </Button>
                  </Form.Group>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>All Tutors</option>
                    <option value="1">Sherry Wolf</option>
                    <option value="2">Rahul Joshi</option>
                    <option value="3">Priya Kumar</option>
                    <option value="4">Aditya Mehta</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>All Courses</option>
                    <option value="1">Piano Basics</option>
                    <option value="2">Guitar Advanced</option>
                    <option value="3">Vocals Beginner</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>Date: Last 7 Days</option>
                    <option value="1">Date: Last 30 Days</option>
                    <option value="2">Date: Last 90 Days</option>
                    <option value="3">Date: Custom Range</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>Sort by: Recent</option>
                    <option value="1">Sort by: Quality Score</option>
                    <option value="2">Sort by: Duration</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </div>

        
        <div className="assignments-list-com">
          <div className="table-sec ">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1300">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Tutor </th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Quality Score</th>
                    <th>Status</th>
                    <th>Recording</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎹
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎸
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        ---
                    </td>
                    <td>
                        <span className="btn-light-blue">Scheduled</span>
                    </td>
                    <td>
                        ---
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 12C19.7614 12 22 9.76142 22 7C22 4.23858 19.7614 2 17 2C14.2386 2 12 4.23858 12 7C12 7.79984 12.1878 8.55582 12.5217 9.22624C12.6105 9.4044 12.64 9.60803 12.5886 9.80031L12.2908 10.9133C12.1615 11.3965 12.6035 11.8385 13.0867 11.7092L14.1997 11.4114C14.392 11.36 14.5956 11.3895 14.7738 11.4783C15.4442 11.8122 16.2002 12 17 12Z" stroke="#4301EA" stroke-width="1.5"></path> <path d="M15 7H19M17 9L17 5" stroke="#4301EA" stroke-width="1.5" stroke-linecap="round"></path> <path d="M2.00655 9.93309C1.93421 11.8412 2.41713 15.0817 5.6677 18.3323C6.45191 19.1165 7.23553 19.7396 8 20.2327M3.53781 6.93723C4.93076 5.54428 7.15317 5.73144 8.03759 7.31617L8.6866 8.4791C9.2723 9.52858 9.03718 10.9053 8.11471 11.8278C8.11471 11.8278 8.11471 11.8278 8.11471 11.8278C8.11459 11.8279 6.99588 12.9468 9.02451 14.9755C11.0525 17.0035 12.1714 15.8861 12.1722 15.8853C12.1722 15.8853 12.1722 15.8853 12.1722 15.8853C13.0947 14.9628 14.4714 14.7277 15.5209 15.3134L16.6838 15.9624C18.2686 16.8468 18.4557 19.0692 17.0628 20.4622C16.2258 21.2992 15.2004 21.9505 14.0669 21.9934C13.2529 22.0243 12.1963 21.9541 11 21.6111" stroke="#4301EA" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCaredrediered" stredoke-width="0"></g><g id="SVGRepo_tredaceredCaredrediered" stredoke-linecap="redound" stredoke-linejoin="redound"></g><g id="SVGRepo_iconCaredrediered"> <path d="M9.70711 8.29289C9.31658 7.90237 8.68342 7.90237 8.29289 8.29289C7.90237 8.68342 7.90237 9.31658 8.29289 9.70711L10.5858 12L8.29289 14.2929C7.90237 14.6834 7.90237 15.3166 8.29289 15.7071C8.68342 16.0976 9.31658 16.0976 9.70711 15.7071L12 13.4142L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L13.4142 12L15.7071 9.70711C16.0976 9.31658 16.0976 8.68342 15.7071 8.29289C15.3166 7.90237 14.6834 7.90237 14.2929 8.29289L12 10.5858L9.70711 8.29289Z" fill="red"></path> <path fill-redule="evenodd" clip-redule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" fill="red"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎤
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🥁
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎹
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎸
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🎤
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-icons-box">
                          🥁
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>
                        <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                                <h6>Sherry Wolf</h6>
                                <span>Piano</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="avatar-mini d-block">ER</div>
                        <div className="sur-name">Eunice Robel</div>
                    </td>
                    <td>Piano Basics</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <strong>Oct 30, 2025</strong>
                                <span>2:00 - 3:00 PM</span>
                            </div>
                        </div>
                    </td>
                    <td>60 min</td>
                    <td>
                        <span className="btn-light-green">⭐ 9.2</span>
                    </td>
                    <td>
                        <span className="btn-light-green">Completed</span>
                    </td>
                    <td>
                        <Link class="video-thumbnail" href="/" >▶️</Link>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path></g></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path> </g></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                 
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev />
              <Pagination.Item active>{1}</Pagination.Item>
              <Pagination.Item>{2}</Pagination.Item>
              <Pagination.Item>{3}</Pagination.Item>
              <Pagination.Ellipsis />
              <Pagination.Item>{99}</Pagination.Item>
              <Pagination.Next />
            </Pagination>
          </div>
        </div>


      </div>
    </div>
  )
}

export default SessionList
