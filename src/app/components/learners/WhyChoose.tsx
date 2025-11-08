"use client";

import React from 'react';
import StudentDashboard from '@/assets/studentDashboard.png';
// import StudentDashboard1 from '@/assets/StudentDashboard1.png';
import StudentDashboard2 from '@/assets/StudentDashboard2.png';
//import VideoPlay from '@/assets/dummy-video.mp4';
import MobileImg from '@/assets/mobile-img.jpeg'

const WhyChoose = () => {
  return (
    <div className='why-choose-us-sec'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='heading-box text-center'>
              <h2 className='mb-3'>
                Why Choose <span>UpKraft?</span>
              </h2>
              <p>Learners, tutors, parents—Upkraft is built for all.</p>
            </div>
          </div>

          <div className='col-md-12'>
            <div className='choose-box-com d-flex align-items-center justify-content-between'>
              <div className='choose-box'>
                <img src={StudentDashboard.src} alt='' />
              </div>

              <div className='mid-choose-box'>
                <div className='mobile-view-mobile'>
                    <div className='learn-video'>
                    <video width='100%' height='300' autoPlay muted loop playsInline preload='auto'>                     
                        <source src='/videos/dashboard-video.mp4' type='video/mp4' />
                        Your browser does not support the video tag.
                    </video>
                    </div>
                    <div className='mobile-shape d-md-none d-block'>
                        <img src={MobileImg.src} alt="" />
                    </div>
                </div>
              </div>

              <div className='choose-box'>
                <img src={StudentDashboard2.src} alt='' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChoose;
