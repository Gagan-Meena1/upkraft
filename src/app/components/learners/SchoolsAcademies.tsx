"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import SchoolImg from '@/assets/schoolImg.png'
import ModalSchool from './ModalSchool'

const SchoolsAcademies = () => {
    const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div className='schools-academi-sec'>
        <div className='container'>
            <div className='row'>
                <div className='col-lg-6'>
                    <div className='m-0 me-lg-5'>
                        <div className='heading-box text-start mb-5'>
                            <h2 className='mb-3'>UpKraft for <span>Schools & Academies</span></h2>
                            <p>AI-Powered Music Learning, Simplified for Academies & Schools</p>
                            <Link href="" className='btn btn-orange' onClick={handleShow}>Express Interest</Link>
                        </div>
                        <div className='img-box'>
                            <img src={SchoolImg.src} alt="" />
                        </div>
                    </div>
                </div>
                <div className='col-lg-6'>
                    <div className='text-school-box'>
                        <ul className=' p-0 m-0 list-unstyled'>
                            <li>
                                <span className='text-head'>Simplified Admin</span>
                                <span className='txet-bottom'>Easily manage students, schedules, and fees — all in one organized platform</span>
                            </li>
                            <li>
                                <span className='text-head'>AI Practice Companion</span>
                                <span className='txet-bottom'>Provide instant, real-time feedback for every student to boost learning and progress</span>
                            </li>
                            <li>
                                <span className='text-head'>Progress Insights</span>
                                <span className='txet-bottom'>Monitor student performance and growth effortlessly, all at a single glance</span>
                            </li>
                            <li>
                                <span className='text-head'>Global Resources</span>
                                <span className='txet-bottom'>Access curated sheets, tutorials, and learning materials</span>
                            </li>
                            <li>
                                <span className='text-head'>Trinity & Recommended Songs</span>
                                <span className='txet-bottom'>Engage in structured practice using official pieces to improve skills systematically.</span>
                            </li>
                            <li>
                                <span className='text-head'>Flexible Learning</span>
                                <span className='txet-bottom'>Seamlessly support classroom, hybrid, or remote teaching for flexible learning experiences.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      <ModalSchool show={showModal} handleClose={handleClose} />
    </div>
  )
}

export default SchoolsAcademies
