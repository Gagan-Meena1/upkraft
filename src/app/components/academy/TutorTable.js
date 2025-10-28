"use client";
import React from "react";
import Image from 'next/image'
import Link from 'next/link';
import { Button, Dropdown, Form } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
// import { Link } from "react-router-dom";
import Profile from "../../../assets/Mask-profile.png";


const TutorTable = () => {
  return (
      
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Top Tutors Performing</h2>
          </div>
            <div className='right-form'>
                <Form>
                    <div className='right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap'>
                        <div className='search-box'>
                            <Form.Group className="position-relative mb-0">
                                <Form.Label className='d-none'>search</Form.Label>
                                <Form.Control type="text" placeholder="Search tutors by name, subject, or email..." />
                                <Button type="" className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </Button>
                            </Form.Group>
                        </div>
                        <div className='select-box'>
                            <Form.Select aria-label="Default select example">
                                <option>All Subjects</option>
                                <option value="1">Piano</option>
                                <option value="2">Guitar</option>
                                <option value="3">Vocals</option>
                                <option value="4">Drums</option>
                                <option value="5">Keyboard</option>
                            </Form.Select>
                        </div>
                        <div className='select-box'>
                            <Form.Select aria-label="Default select example">
                                <option>All Status</option>
                                <option value="1">Active</option>
                                <option value="2">Busy</option>
                                <option value="3">Inactive</option>
                            </Form.Select>
                        </div>
                        <div className='select-box'>
                            <Form.Select aria-label="Default select example">
                                <option>Sort by: Performance</option>
                                <option value="1">Sort by: Name (A-Z)</option>
                                <option value="2">Sort by: Students</option>
                                <option value="3">Sort by: Revenue</option>
                                <option value="4">Sort by: Join Date</option>
                            </Form.Select>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
        <div className="assignments-list-com">
          <div className="table-sec ">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1200">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Subject </th>
                    <th>Students</th>
                    <th>Classes</th>
                    <th>CSAT Score</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                        </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="student-img-name d-flex align-items-center gap-2">
                        <div className="img-box">
                          <Image src={Profile} alt="" />
                        </div>
                        <div className="text-box">
                          <h6>Sherry Wolf</h6>
                          <span>sherry@example.com</span>
                        </div>
                      </div>
                    </td>
                    <td>Piano</td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
                    </td>
                    <td className="text-center">
                        <ul className="d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 p-0">
                            <li>
                                <Link class="link-btn" href="/" >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.50195 21H21.502" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.50391 13.36V17H9.16241L19.5039 6.654L15.8514 3L5.50391 13.36Z" stroke="#1E88E5" stroke-width="2" stroke-linejoin="round"></path></svg>
                                </Link>
                            </li>
                            <li>
                                <Link class="link-btn" href="/" data-discover="true">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
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

export default TutorTable
