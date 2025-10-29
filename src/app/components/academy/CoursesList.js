import React from "react";
import { Button, Form, ProgressBar } from "react-bootstrap";

const CoursesList = () => {
  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec justify-content-end d-flex align-items-center mb-0 gap-3 flex-xl-nowrap flex-wrap">
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
                    <option>All Instruments</option>
                    <option value="1">Piano</option>
                    <option value="2">Guitar</option>
                    <option value="3">Vocals</option>
                    <option value="4">Drums</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>All Levels</option>
                    <option value="1">Beginner</option>
                    <option value="2">Intermediate</option>
                    <option value="3">Advanced</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>All Status</option>
                    <option value="1">Published</option>
                    <option value="2">Draft</option>
                  </Form.Select>
                </div>
                <div className="select-box">
                  <Form.Select aria-label="Default select example">
                    <option>Sort by: Popular</option>
                    <option value="1">Sort by: Name (A-Z)</option>
                    <option value="2">Sort by: Recent</option>
                    <option value="3">Sort by: Enrollments</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </div>
        <div className="courses-list-sec mt-4">
          <div className="row">
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎹</span>
                  <span className="btn">Beginner</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Piano Basics</div>
                  <div className="course-description">
                    Learn fundamental piano techniques, reading sheet music, and
                    basic theory for beginners.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">82%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={85} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">SW</div>
                        Sherry
                      </div>
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">+2</div>
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎸</span>
                  <span className="btn">Intermediate</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Guitar Advanced Techniques</div>
                  <div className="course-description">
                   Master advanced guitar skills including fingerstyle, improvisation, and complex chord progressions.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">60%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={60} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">RJ</div>
                        Rahul
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎤</span>
                  <span className="btn">Beginner</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Vocals for Beginners</div>
                  <div className="course-description">
                   Develop vocal technique, breath control, pitch accuracy, and performance confidence.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">88%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={88} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">PR</div>
                        Priya
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🥁</span>
                  <span className="btn">Intermediate</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Drums Intermediate</div>
                  <div className="course-description">
                   Enhance drumming skills with complex rhythms, fills, and various music genres.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">69%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={69} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">ad</div>
                        Aditya
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎹</span>
                  <span className="btn">Beginner</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Piano Basics</div>
                  <div className="course-description">
                    Learn fundamental piano techniques, reading sheet music, and
                    basic theory for beginners.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">82%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={85} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">SW</div>
                        Sherry
                      </div>
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">+2</div>
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎸</span>
                  <span className="btn">Intermediate</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Guitar Advanced Techniques</div>
                  <div className="course-description">
                   Master advanced guitar skills including fingerstyle, improvisation, and complex chord progressions.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">60%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={60} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">RJ</div>
                        Rahul
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🎤</span>
                  <span className="btn">Beginner</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Vocals for Beginners</div>
                  <div className="course-description">
                   Develop vocal technique, breath control, pitch accuracy, and performance confidence.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">88%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={88} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">PR</div>
                        Priya
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 mb-4">
              <div className="course-card blue-card">
                <div className="top-box text-center">
                  <span className="icons">🥁</span>
                  <span className="btn">Intermediate</span>
                </div>
                <div className="course-content">
                  <div className="course-title">Drums Intermediate</div>
                  <div className="course-description">
                   Enhance drumming skills with complex rhythms, fills, and various music genres.
                  </div>

                  <div className="course-stats d-flex flex-wrap text-center">
                    <div className="stat-item">
                      <div className="stat-item-value">92</div>
                      <div className="stat-item-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">15</div>
                      <div className="stat-item-label">Lessons</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value">12 wks</div>
                      <div className="stat-item-label">Duration</div>
                    </div>
                  </div>

                  <div className="completion-bar">
                    <div className="completion-label">
                      <span>Avg Completion</span>
                      <span className="text-percent">69%</span>
                    </div>
                    <div className="progress-bar">
                        <ProgressBar variant="" className="progress-green" now={69} />
                    </div>
                  </div>

                  <div className="course-meta d-flex align-items-center justify-content-between gap-2">
                    <div className="tutor-chips d-flex align-items-center gap-2">
                      <div className="tutor-chip">
                        <div className="tutor-avatar-mini">ad</div>
                        Aditya
                      </div>
                    </div>
                    <span className="status-indicator status-published">
                      Published
                    </span>
                  </div>

                  <div className="course-actions d-flex align-items-center gap-2 justify-content-between">
                    <button className="action-btn w-100">View Details</button>
                    <button className="action-btn w-100">Edit</button>
                    <button className="action-btn w-100">Delete</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesList;
