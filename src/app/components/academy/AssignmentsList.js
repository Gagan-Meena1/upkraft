"use client";
import React from "react";
import Link from 'next/link';
import { Button, Dropdown, Form, ProgressBar } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";


const AssignmentsList = () => {
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
                      <svg width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.4995 17.5L13.8828 13.8833"
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
                    <option>All Status</option>
                    <option value="1">Pending</option>
                    <option value="2">Completed</option>
                    <option value="3">Overdue</option>
                    <option value="4">Graded</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>All Tutors</option>
                    <option value="1">Sherry Wolf</option>
                    <option value="2">Rahul Joshi</option>
                    <option value="3">Priya Kumar</option>
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
                    <option>Sort by: Recent</option>
                    <option value="1">Sort by: Due Date</option>
                    <option value="2">Sort by: Completion Rate</option>
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
                    <th>Assignment</th>
                    <th>Tutor </th>
                    <th>Course</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Submissions</th>
                    <th>Status</th>
                    <th>Grade</th>
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
                          <h6>Practice Major Scales</h6>
                          <span>Week 3 Assignment</span>
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
                    <td>Piano Basics</td>
                    <td>12 students</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <span>Nov 05, 2025</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="progress-indicator">
                            <div className="progress-ring progress-complete">10/12</div>
                        </div>
                    </td>
                    <td>
                        <span className="status-badge status-pending">Pending</span>
                    </td>
                    <td>---</td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="text-btn-blue" href="/" >
                                    View
                                </Link>
                            </li>
                            <li>
                                <Link class="text-btn-blue" href="/" data-discover="true">
                                   Grade
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
                          <h6>Fingerstyle Exercise</h6>
                          <span>Week 5 Assignment</span>
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
                    <td>Guitar Advanced</td>
                    <td>15 students</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <span>Nov 02, 2025</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="progress-indicator">
                            <div className="progress-ring progress-complete">18/18</div>
                        </div>
                    </td>
                    <td>
                        <span className="status-badge status-completed">Completed</span>
                    </td>
                    <td>
                        <span class="grade-badge grade-a">A</span>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="text-btn-blue" href="/" >
                                    View
                                </Link>
                            </li>
                            <li>
                                <Link class="text-btn-blue" href="/" data-discover="true">
                                   Report
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
                          <h6>Breathing Exercises</h6>
                          <span>Week 5 Assignment</span>
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
                    <td>Vocals Beginner</td>
                    <td>15 students</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">⚠️</span>
                            <div className="text-box">
                                <span>Nov 02, 2025</span>
                                <span className="d-block">(Overdue)</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="progress-indicator">
                            <div className="progress-ring progress-partial">8/18</div>
                        </div>
                    </td>
                    <td>
                        <span className="status-badge status-overdue">Overdue</span>
                    </td>
                    <td>
                        ---
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="text-btn-blue" href="/" >
                                    View
                                </Link>
                            </li>
                            <li>
                                <Link class="text-btn-blue" href="/" data-discover="true">
                                   Remind
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
                          <h6>Breathing Exercises</h6>
                          <span>Week 5 Assignment</span>
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
                    <td>Vocals Beginner</td>
                    <td>15 students</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <span>Nov 02, 2025</span>
                                <span className="d-block">(Overdue)</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="progress-indicator">
                            <div className="progress-ring progress-partial">8/18</div>
                        </div>
                    </td>
                    <td>
                        <span className="status-badge status-pending">Pending</span>
                    </td>
                    <td>
                        ---
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="text-btn-blue" href="/" >
                                    View
                                </Link>
                            </li>
                            <li>
                                <Link class="text-btn-blue" href="/" data-discover="true">
                                   Grade
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
                          <h6>Breathing Exercises</h6>
                          <span>Week 5 Assignment</span>
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
                    <td>Vocals Beginner</td>
                    <td>15 students</td>
                    <td>
                        <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                                <span>Nov 02, 2025</span>
                                <span className="d-block">(Overdue)</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="progress-indicator">
                            <div className="progress-ring progress-complete">8/8</div>
                        </div>
                    </td>
                    <td>
                        <span className="status-badge status-graded">Graded</span>
                    </td>
                    <td>
                        <span class="grade-badge grade-b">B+</span>
                    </td>
                    <td className="text-center">
                        <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="text-btn-blue" href="/" >
                                    View
                                </Link>
                            </li>
                            <li>
                                <Link class="text-btn-blue" href="/" data-discover="true">
                                   Report
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

export default AssignmentsList
