"use client";
import React from "react";
import Image from 'next/image'
import Link from 'next/link';
import { Button, Dropdown, Form } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import Profile from "../../../assets/Mask-profile.png";

const PerformingTutors = () => {
  return (
    <div className="card-box">
      <div className="assignments-list-sec">
        <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
          <div className="left-head">
            <h2 className="m-0">Top Performing Tutors</h2>
          </div>
          <div className="right-form">
            <Link href="/" className="line-btn">
              View All →
            </Link>
          </div>
        </div>
        {/* <hr className='hr-light'/> */}
        <div className="assignments-list-com">
          <div className="table-sec ">
            <div className="table-responsive">
              <table className="table align-middle m-0 w-1200">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Students </th>
                    <th>Classes (This Month)</th>
                    <th>CSAT Score</th>
                    <th>Revenue</th>
                    <th>Status</th>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-red">85%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
                          <span>Piano</span>
                        </div>
                      </div>
                    </td>
                    <td>30</td>
                    <td>84</td>
                    <td>
                      <span className="lighter-blue">92%</span>
                    </td>
                    <td>₹45,600</td>
                    <td>
                      <span className="text-active">● Active</span>
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
  );
};

export default PerformingTutors;
