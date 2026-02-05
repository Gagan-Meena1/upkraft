"use client";
import React from "react";
import Link from 'next/link';
import Pagination from "react-bootstrap/Pagination";

const SessionList = ({ sessions, pagination, onPageChange }) => {
  const renderPaginationItems = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // First page
    if (totalPages > 0) {
      items.push(
        <Pagination.Item
          key={1}
          active={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          {1}
        </Pagination.Item>
      );
    }

    // Show pages around current page
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" />);
    }

    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" />);
    }

    // Last page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="assignments-list-com">
          <div className="table-sec">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1300">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Tutor</th>
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
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        No sessions found
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session._id}>
                        <td>
                          <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="img-icons-box">🎹</div>
                            <div className="text-box">
                              <h6>{session.title}</h6>
                              <span>{session.instructor?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="student-img-name d-flex align-items-center gap-2">
                            <div className="text-box">
                              <h6>{session.instructor?.username || 'N/A'}</h6>
                              <span>{session.course?.category || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
<td>
  {session.students && session.students.length > 0 ? (
    <div className="student-img-name d-flex align-items-center gap-2">
      <div className="text-box">
        <h6>{session.students[0].name}</h6>
        {session.students.length > 1 && (
          <span>+{session.students.length - 1} more</span>
        )}
      </div>
    </div>
  ) : '---'}
</td>                        <td>{session.course?.title || 'N/A'}</td>
                        <td>
                          <div className="time-badge">
                            <span className="d-block">📅</span>
                            <div className="text-box">
                              <strong>
                                {new Date(session.startTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </strong>
                              <span>
                                {new Date(session.startTime).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })} - {new Date(session.endTime).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} min
                        </td>
                        <td>
                          {session.evaluation?.overall_quality_score 
                            ? <span className="btn-light-green">⭐ {session.evaluation.overall_quality_score}</span>
                            : '---'
                          }
                        </td>
                        <td>
                          <span className={`btn-light-${
                            session.status === 'completed' ? 'green' : 
                            session.status === 'scheduled' ? 'blue' : 'red'
                          }`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {session.recordingUrl ? (
                            <Link className="video-thumbnail" href={session.recordingUrl}>▶️</Link>
                          ) : '---'}
                        </td>
                        <td className="text-center">
                          <ul className="list-share-view d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                              <Link className="link-btn" href={`/session/${session._id}`}>
                                <svg width="64px" height="64px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                  <g id="SVGRepo_iconCarrier">
                                    <path fill="#4301EA" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"></path>
                                  </g>
                                </svg>
                              </Link>
                            </li>
                            <li>
                              <Link className="link-btn" href="/" data-discover="true">
                                <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                  <g id="SVGRepo_iconCarrier">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="#4301EA"></path>
                                  </g>
                                </svg>
                              </Link>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
            <Pagination>
              {renderPaginationItems()}
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionList;