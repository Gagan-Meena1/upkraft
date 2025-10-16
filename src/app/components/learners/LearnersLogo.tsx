"use client";

import React from 'react'
import LogoMid01 from '@/assets/logo-mid-01.png'
import LogoMid02 from '@/assets/logo-mid-02.png'
import LogoMid03 from '@/assets/logo-mid-03.png'

const LearnersLogo = () => {
  return (
    <div className='logo-sec'>
        <div className='container'>
            <div className='logo-box'>
                <ul className='m-0 p-0 mb-5 list-unstyled d-flex align-items-center gap-4 justify-content-center'>
                    <li>
                        <img src={LogoMid01.src} alt="" style={{ width: '150px', height: 'auto' }} />
                    </li>
                    <li>
                        <img src={LogoMid02.src} alt="" style={{ width: '150px', height: 'auto' }} />
                    </li>
                    <li>
                        <img src={LogoMid03.src} alt="" style={{ width: '150px', height: 'auto' }} />
                    </li>
                </ul>
                <p className='p-0 m-0 text-center'>Your kid gets the right support to clear exams and gain musician certification.</p>
            </div>
        </div>
    </div>
  )
}

export default LearnersLogo
