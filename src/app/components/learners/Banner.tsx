"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ModalStudent from './ModalStudent';

const Banner = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div className='banner-sec position-relative'>
      <div className='banner-img'>
        {/* ✅ Replace image with video */}
        <video
          src="/videos/banner-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="object-cover"
          width='100%' height='300' 
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className='text-box-banner'>
        <div className='text-box'>
          <h1 className='mb-2 !text-[36px]'>Reimagining Extracurricular Learning With AI</h1>
          <h3 className='mb-2'>Built for Tutors & Students Worldwide</h3>
          <p>UpKraft is one stop solution to make extracurricular learning smarter, faster, and trackable.</p>
          <Link href="" className='btn btn-orange' onClick={handleShow}>
            Book a Demo
          </Link>

          <ul className='d-flex p-0 m-0 mt-xl-5 mt-4 list-unstyled justify-content-center'>
            <li>Guitar</li>
            <li>Piano</li>
            <li>Drums</li>
            <li>Vocals</li>
            <li>Violin</li>
            <li>Dance</li>
            <li>Drawing</li>

          </ul>
        </div>
      </div>

      <ModalStudent show={showModal} handleClose={handleClose} />
    </div>
  );
};

export default Banner;
