'use client'
import React, { useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Link from 'next/link';

const MyCourseTabs = () => {
  return (
     <>
        <div className='h-100 card-box position-relative practice-studio-sec p-0'>
          <div className='tab-sec-music payment-summary-sec'>
              <Tabs defaultActiveKey="Classes" id="uncontrolled-tab-example" className="mb-3" >
                <Tab eventKey="Classes" title="Classes">
                    <div className='course-card-tabs-sec'>
                        <div className='course-tabs-card'>
                            <h2>Fundamental 1</h2>
                            <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners. Pianos are keyboard instruments that produce sound when felt-covered hammers strike strings. They are versatile and used in various musical genres. </p>
                            
                            <div className='assignments-list d-flex align-items-center gap-2 flex-wrap mt-3 w-100 justify-content-between w-100'>
                                <ul className='d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100'>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Date :</span>
                                        <span className='student-txt'><strong>29th May 2025</strong></span>
                                    </li>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Day :</span>
                                        <span className='student-txt'><strong>Thursday</strong></span>
                                    </li>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Time :</span>
                                        <span className='student-txt'><strong>03:30 - 04:00 PM</strong></span>
                                    </li>
                                </ul>
                            </div>
                            <ul className='btn-list d-flex align-items-center gap-2 list-unstyled p-0 m-0 mt-4'>
                                <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66667 9.33317H11.3333M4.66667 7.33317H11.3333M4.66667 11.3332H8.66667M10.6667 1.99984V3.4665C10.6667 3.60795 10.6105 3.74361 10.5105 3.84363C10.4104 3.94365 10.2748 3.99984 10.1333 3.99984H5.86667C5.72522 3.99984 5.58956 3.94365 5.48954 3.84363C5.38952 3.74361 5.33333 3.60795 5.33333 3.4665V1.99984M6.66667 1.99984C6.66667 1.64622 6.80714 1.30708 7.05719 1.05703C7.30724 0.80698 7.64638 0.666504 8 0.666504C8.35362 0.666504 8.69276 0.80698 8.94281 1.05703C9.19286 1.30708 9.33333 1.64622 9.33333 1.99984M3.6 1.99984H12.4C12.8243 1.99984 13.2313 2.16841 13.5314 2.46847C13.8314 2.76852 14 3.17549 14 3.59984V13.7332C14 14.1575 13.8314 14.5645 13.5314 14.8645C13.2313 15.1646 12.8243 15.3332 12.4 15.3332H3.6C3.38989 15.3332 3.18183 15.2918 2.98771 15.2114C2.79359 15.131 2.6172 15.0131 2.46863 14.8645C2.16857 14.5645 2 14.1575 2 13.7332V3.59984C2 3.38972 2.04139 3.18166 2.12179 2.98754C2.2022 2.79342 2.32006 2.61704 2.46863 2.46847C2.76869 2.16841 3.17565 1.99984 3.6 1.99984Z" stroke="#6E09BD" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span>Assignment</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border btn-red-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.5667 4.30102C12.6237 4.24408 12.669 4.17647 12.6998 4.10204C12.7307 4.02762 12.7466 3.94784 12.7467 3.86726C12.7467 3.78669 12.7309 3.70689 12.7001 3.63243C12.6693 3.55797 12.6242 3.4903 12.5672 3.43329C12.5103 3.37628 12.4427 3.33104 12.3683 3.30016C12.2938 3.26928 12.2141 3.25336 12.1335 3.25331C12.0529 3.25326 11.9731 3.26908 11.8987 3.29987C11.8242 3.33066 11.7565 3.37581 11.6995 3.43275L7.99924 7.13302L4.30004 3.43275C4.1849 3.31761 4.02874 3.25293 3.86591 3.25293C3.70308 3.25293 3.54692 3.31761 3.43178 3.43275C3.31664 3.54789 3.25195 3.70406 3.25195 3.86689C3.25195 4.02972 3.31664 4.18588 3.43178 4.30102L7.13204 8.00022L3.43178 11.6994C3.37477 11.7564 3.32954 11.8241 3.29869 11.8986C3.26783 11.9731 3.25195 12.0529 3.25195 12.1336C3.25195 12.2142 3.26783 12.294 3.29869 12.3685C3.32954 12.443 3.37477 12.5107 3.43178 12.5677C3.54692 12.6828 3.70308 12.7475 3.86591 12.7475C3.94654 12.7475 4.02637 12.7316 4.10086 12.7008C4.17535 12.6699 4.24303 12.6247 4.30004 12.5677L7.99924 8.86742L11.6995 12.5677C11.8146 12.6827 11.9708 12.7472 12.1335 12.7471C12.2962 12.747 12.4522 12.6823 12.5672 12.5672C12.6822 12.452 12.7468 12.2959 12.7467 12.1332C12.7466 11.9704 12.6818 11.8144 12.5667 11.6994L8.86644 8.00022L12.5667 4.30102Z" fill="#E53935"/></svg>
                                        <span>Remove</span>
                                    </Link>
                                </li>
                                 <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66667 9.33317H11.3333M4.66667 7.33317H11.3333M4.66667 11.3332H8.66667M10.6667 1.99984V3.4665C10.6667 3.60795 10.6105 3.74361 10.5105 3.84363C10.4104 3.94365 10.2748 3.99984 10.1333 3.99984H5.86667C5.72522 3.99984 5.58956 3.94365 5.48954 3.84363C5.38952 3.74361 5.33333 3.60795 5.33333 3.4665V1.99984M6.66667 1.99984C6.66667 1.64622 6.80714 1.30708 7.05719 1.05703C7.30724 0.80698 7.64638 0.666504 8 0.666504C8.35362 0.666504 8.69276 0.80698 8.94281 1.05703C9.19286 1.30708 9.33333 1.64622 9.33333 1.99984M3.6 1.99984H12.4C12.8243 1.99984 13.2313 2.16841 13.5314 2.46847C13.8314 2.76852 14 3.17549 14 3.59984V13.7332C14 14.1575 13.8314 14.5645 13.5314 14.8645C13.2313 15.1646 12.8243 15.3332 12.4 15.3332H3.6C3.38989 15.3332 3.18183 15.2918 2.98771 15.2114C2.79359 15.131 2.6172 15.0131 2.46863 14.8645C2.16857 14.5645 2 14.1575 2 13.7332V3.59984C2 3.38972 2.04139 3.18166 2.12179 2.98754C2.2022 2.79342 2.32006 2.61704 2.46863 2.46847C2.76869 2.16841 3.17565 1.99984 3.6 1.99984Z" stroke="#6E09BD" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span>Feedback</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className='course-tabs-card'>
                            <h2>Fundamental 2</h2>
                            <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners. Pianos are keyboard instruments that produce sound when felt-covered hammers strike strings. They are versatile and used in various musical genres. </p>
                            
                            <div className='assignments-list d-flex align-items-center gap-2 flex-wrap mt-3 w-100 justify-content-between w-100'>
                                <ul className='d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100'>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Date :</span>
                                        <span className='student-txt'><strong>29th May 2025</strong></span>
                                    </li>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Day :</span>
                                        <span className='student-txt'><strong>Thursday</strong></span>
                                    </li>
                                    <li className='d-flex align-items-center gap-2'>
                                        <span className='student-text'>Time :</span>
                                        <span className='student-txt'><strong>03:30 - 04:00 PM</strong></span>
                                    </li>
                                </ul>
                            </div>
                            <ul className='btn-list d-flex align-items-center gap-2 list-unstyled p-0 m-0 mt-4'>
                                <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66667 9.33317H11.3333M4.66667 7.33317H11.3333M4.66667 11.3332H8.66667M10.6667 1.99984V3.4665C10.6667 3.60795 10.6105 3.74361 10.5105 3.84363C10.4104 3.94365 10.2748 3.99984 10.1333 3.99984H5.86667C5.72522 3.99984 5.58956 3.94365 5.48954 3.84363C5.38952 3.74361 5.33333 3.60795 5.33333 3.4665V1.99984M6.66667 1.99984C6.66667 1.64622 6.80714 1.30708 7.05719 1.05703C7.30724 0.80698 7.64638 0.666504 8 0.666504C8.35362 0.666504 8.69276 0.80698 8.94281 1.05703C9.19286 1.30708 9.33333 1.64622 9.33333 1.99984M3.6 1.99984H12.4C12.8243 1.99984 13.2313 2.16841 13.5314 2.46847C13.8314 2.76852 14 3.17549 14 3.59984V13.7332C14 14.1575 13.8314 14.5645 13.5314 14.8645C13.2313 15.1646 12.8243 15.3332 12.4 15.3332H3.6C3.38989 15.3332 3.18183 15.2918 2.98771 15.2114C2.79359 15.131 2.6172 15.0131 2.46863 14.8645C2.16857 14.5645 2 14.1575 2 13.7332V3.59984C2 3.38972 2.04139 3.18166 2.12179 2.98754C2.2022 2.79342 2.32006 2.61704 2.46863 2.46847C2.76869 2.16841 3.17565 1.99984 3.6 1.99984Z" stroke="#6E09BD" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span>Assignment</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border btn-red-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.5667 4.30102C12.6237 4.24408 12.669 4.17647 12.6998 4.10204C12.7307 4.02762 12.7466 3.94784 12.7467 3.86726C12.7467 3.78669 12.7309 3.70689 12.7001 3.63243C12.6693 3.55797 12.6242 3.4903 12.5672 3.43329C12.5103 3.37628 12.4427 3.33104 12.3683 3.30016C12.2938 3.26928 12.2141 3.25336 12.1335 3.25331C12.0529 3.25326 11.9731 3.26908 11.8987 3.29987C11.8242 3.33066 11.7565 3.37581 11.6995 3.43275L7.99924 7.13302L4.30004 3.43275C4.1849 3.31761 4.02874 3.25293 3.86591 3.25293C3.70308 3.25293 3.54692 3.31761 3.43178 3.43275C3.31664 3.54789 3.25195 3.70406 3.25195 3.86689C3.25195 4.02972 3.31664 4.18588 3.43178 4.30102L7.13204 8.00022L3.43178 11.6994C3.37477 11.7564 3.32954 11.8241 3.29869 11.8986C3.26783 11.9731 3.25195 12.0529 3.25195 12.1336C3.25195 12.2142 3.26783 12.294 3.29869 12.3685C3.32954 12.443 3.37477 12.5107 3.43178 12.5677C3.54692 12.6828 3.70308 12.7475 3.86591 12.7475C3.94654 12.7475 4.02637 12.7316 4.10086 12.7008C4.17535 12.6699 4.24303 12.6247 4.30004 12.5677L7.99924 8.86742L11.6995 12.5677C11.8146 12.6827 11.9708 12.7472 12.1335 12.7471C12.2962 12.747 12.4522 12.6823 12.5672 12.5672C12.6822 12.452 12.7468 12.2959 12.7467 12.1332C12.7466 11.9704 12.6818 11.8144 12.5667 11.6994L8.86644 8.00022L12.5667 4.30102Z" fill="#E53935"/></svg>
                                        <span>Remove</span>
                                    </Link>
                                </li>
                                 <li>
                                    <Link href="" className=' p-2 px-3 small btn btn-border d-flex align-items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66667 9.33317H11.3333M4.66667 7.33317H11.3333M4.66667 11.3332H8.66667M10.6667 1.99984V3.4665C10.6667 3.60795 10.6105 3.74361 10.5105 3.84363C10.4104 3.94365 10.2748 3.99984 10.1333 3.99984H5.86667C5.72522 3.99984 5.58956 3.94365 5.48954 3.84363C5.38952 3.74361 5.33333 3.60795 5.33333 3.4665V1.99984M6.66667 1.99984C6.66667 1.64622 6.80714 1.30708 7.05719 1.05703C7.30724 0.80698 7.64638 0.666504 8 0.666504C8.35362 0.666504 8.69276 0.80698 8.94281 1.05703C9.19286 1.30708 9.33333 1.64622 9.33333 1.99984M3.6 1.99984H12.4C12.8243 1.99984 13.2313 2.16841 13.5314 2.46847C13.8314 2.76852 14 3.17549 14 3.59984V13.7332C14 14.1575 13.8314 14.5645 13.5314 14.8645C13.2313 15.1646 12.8243 15.3332 12.4 15.3332H3.6C3.38989 15.3332 3.18183 15.2918 2.98771 15.2114C2.79359 15.131 2.6172 15.0131 2.46863 14.8645C2.16857 14.5645 2 14.1575 2 13.7332V3.59984C2 3.38972 2.04139 3.18166 2.12179 2.98754C2.2022 2.79342 2.32006 2.61704 2.46863 2.46847C2.76869 2.16841 3.17565 1.99984 3.6 1.99984Z" stroke="#6E09BD" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        <span>Feedback</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey="Curriculum" title="Curriculum">
                    <div className='course-card-tabs-sec'>
                        <div className='course-tabs-card'>
                            <h2>Session 1 : Fundamental 1</h2>
                            <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners.</p>
                        </div>
                        <div className='course-tabs-card'>
                            <h2>Session 3 : Fundamental 3</h2>
                            <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners.</p>
                        </div>
                    </div>
                </Tab>
              </Tabs>
          </div>
     </div>
    </>
  )
}

export default MyCourseTabs