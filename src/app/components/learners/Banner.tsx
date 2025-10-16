"use client";

import React, { useState } from 'react';
import BannerImg from "@/assets/banner-img.png"
import Link from 'next/link'
import ModalStudent from './ModalStudent';

const Banner = () => {
    const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div className='banner-sec position-relative'>
      <div className='banner-img'>
        <img src={BannerImg.src} alt=''></img>
      </div>
      <div className='text-box-banner'>
        <div className='text-box'>
            <h1 className='mb-2'>Reimagine Music Learning with AI</h1>
            <h3 className='mb-2'>Built for Music Tutors & Students Worldwide</h3>
            <p>UpKraft is one stop solution to make music learning smarter, faster, and trackable.</p>
            <Link href="" className='btn btn-orange' onClick={handleShow}>Express Interest</Link>
            <ul className='d-flex p-0 m-0 mt-xl-5 mt-4 list-unstyled justify-content-center'>
                <li>Music</li>
                <li>Vocals</li>
                <li>Guitar</li>
                <li>Piano</li>
            </ul>
        </div>
      </div>
      <ModalStudent show={showModal} handleClose={handleClose} />
    </div>
  )
}

export default Banner
