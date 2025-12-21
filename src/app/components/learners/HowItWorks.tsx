"use client";

import React from 'react'
import Howitwork01 from '@/assets/how-it-work-01.png'
import Howitwork02 from '@/assets/how-it-work-02.png'
import Howitwork03 from '@/assets/how-it-work-03.png'

const HowItWorks = () => {
  return (
    <div className='how-it-work'>
        <div className='container'>
            <div className='heading-box text-start'>
                <h2 className="!text-[34px]">How it Works </h2>
            </div>
            <div className='how-it-work-inner'>
                <div className='top-img-box text-how-it-work'>
                    <div className='row'>
                        <div className='col-md-4'>
                            <div className='img-box'>
                                <img src={Howitwork01.src} alt="" />
                            </div>
                             <div className='text-how-h'>
                                <h6>Find the Right Tutor</h6>
                                <p>Browse profiles, book a consultation.</p>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='img-box'>
                                <img src={Howitwork02.src} alt="" />
                            </div>
                             <div className='text-how-h'>
                                <h6>Build a Personalized Plan</h6>
                                <p>Tutors use smart templates for structured goals</p>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='img-box'>
                                <img src={Howitwork03.src} alt="" />
                            </div>
                            <div className='text-how-h'>
                                <h6>Practice Smart, Progress Fast</h6>
                                <p>AI guides students; tutors track progress</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='line-min-dox'>
                    <div className='row position-relative'>
                        <span className='line-counter'></span>
                        <div className='col-md-4'>
                            <div className='counter'>1</div>
                        </div>
                        <div className='col-md-4'>
                            <div className='counter'>2</div>
                        </div>
                        <div className='col-md-4'>
                            <div className='counter'>3</div>
                        </div>
                    </div>
                </div>
                {/* <div className='text-how-it-work'>
                    <div className='row'>
                        <div className='col-md-4'>
                            <div className='text-how-h'>
                                <h6>Find the Right Tutor</h6>
                                <p>Browse profiles, book a consultation.</p>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='text-how-h'>
                                <h6>Build a Personalized Plan</h6>
                                <p>Tutors use smart templates for structured goals</p>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='text-how-h'>
                                <h6>Practice Smart, Progress Fast</h6>
                                <p>AI guides students; tutors track progress</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    </div>
  )
}

export default HowItWorks