"use client"

import React from 'react'
import './ReferAndEarn.css'
import ReferImg from '../../assets/referAndEarn.png'
import Link from 'next/link'
import Image from 'next/image'

const ReferAndEarn = () => {
  return (
    <div className='refer-and-earn-box text-center'>
        <div className='img-box'>
            <Image className='object-contain w-full h-full' src={ReferImg} alt="" />
        </div>
        <div className='text-bottom-box'>
            <div className='blue-box'>
                <h2 className='mb-2'>Refer and Earn</h2>
                <p>Invite friends and earn exclusive rewards for every successful referral!</p>
                <Link href="/student/refer-earn" className='btn btn-orange w-100 d-flex align-items-center gap-2 justify-content-center text-center'>
                    <span>Refer Now</span>
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 12H21" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 19L21.5 12L14.5 5" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ReferAndEarn
