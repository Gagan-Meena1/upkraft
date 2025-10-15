"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import Exclusive01 from '@/assets/exclusive-01.jpg'
import Exclusive02 from '@/assets/exclusive-02.jpg'
import Exclusive03 from '@/assets/exclusive-03.jpg'
import Exclusive04 from '@/assets/exclusive-04.jpg'
import Exclusive05 from '@/assets/exclusive-05.jpg'
import Exclusive06 from '@/assets/exclusive-06.jpg'
import ModalStudent from './ModalStudent';

const ExclusiveBenefits = () => {
    const [showModal, setShowModal] = useState(false);
        
          const handleShow = () => setShowModal(true);
          const handleClose = () => setShowModal(false);
  return (
    <div className='exclusive-sec'>
        <div className='container'>
            <div className='row'>
                <div className='col-lg-4 col-md-5'>
                    <div className='exclusive-left-text'>
                        <h2>Exclusive Benefits for Learners</h2>
                        <p>Master music faster with our AI Practice Studio delivering real-time feedback, guided by expert tutors aligned to your style and goals. Track measurable progress every week, practice the songs you truly love, and keep parents engaged with family-friendly features that celebrate every milestone.</p>
                        <Link href="" className='btn btn-orange' onClick={handleShow}>Find my Tutor</Link>
                    </div>
                </div>
                <div className='col-lg-8 col-md-7'>
                    <div className='row'>
                        <div className='col-lg-6 col-md-12 mb-lg-5 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive01.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>AI Practice Studio</h4>
                                    <p className='mb-0'>Learn faster with real-time AI feedback</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-12 mb-lg-5 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive02.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>Expert Tutors</h4>
                                    <p className='mb-0'>Get matched with instructors who suit your style & goals</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-12 mb-lg-5 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive03.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>Progress Tracking</h4>
                                    <p className='mb-0'>See improvement week by week</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-12 mb-lg-5 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive04.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>Practice Songs You Love</h4>
                                    <p className='mb-0'>From Disney classics to advanced repertoire</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-12 mb-lg-0 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive05.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>Real-Time Dashboards</h4>
                                    <p className='mb-0'>Parents track progress & celebrate milestones</p>
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-12 mb-lg-0 mb-4'>
                            <div className='exclusive-box'>
                                <div className='img-box'>
                                    <img src={Exclusive06.src} alt="" />
                                </div>
                                <div className='text-box'>
                                    <h4>2,000+ Song Library</h4>
                                    <p className='mb-0'>Across genres and languages</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModalStudent show={showModal} handleClose={handleClose} />
    </div>
  )
}

export default ExclusiveBenefits
