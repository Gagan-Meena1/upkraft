"use client";

import React from 'react'
import AiIcons from '@/assets/aiIcons.png'
import AiIcons2 from '@/assets/ai2icons.png'
import AiIcons3 from '@/assets/ai3icons.png'
import AiIcons4 from '@/assets/ai4icons.png'


const BannerBottomBox = () => {
  return (
    <div className='banner-bottom-text-icons-sec'>
        <div className='container'>
            <div className='row'>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons.src} alt="" />
                            <span>Expert Instructors
</span>
                        </div>
                        <p className='m-0 p-0'>Certified, vetted instructors with structured teaching frameworks
</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons2.src} alt="" />
                            <span>Structured Programs
</span>
                        </div>
                        <p className='m-0 p-0'>Level-based learning paths designed for consistency and outcomes
</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons3.src} alt="" />
                            <span>Progress Tracking
</span>
                        </div>
                        <p className='m-0 p-0'>Clear visibility into attendance, milestones, and improvement
</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons4.src} alt="" />
                            <span>AI Practice Studio
</span>
                        </div>
                        <p className='m-0 p-0'>Learn faster with real-time AI feedback to fix practice gaps
</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default BannerBottomBox
