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
                            <span>Fix Practice Gaps</span>
                        </div>
                        <p className='m-0 p-0'>With  our proprietary AI Practice Studio</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons2.src} alt="" />
                            <span>2K+ Multilingual Song Library</span>
                        </div>
                        <p className='m-0 p-0'>Browse and Master Worldwide Hits</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons3.src} alt="" />
                            <span>Smart Progress Tracking</span>
                        </div>
                        <p className='m-0 p-0'>All Your Metrics in One Dashboard</p>
                    </div>
                </div>
                <div className='col-xl-3 col-md-6 mb-xl-0 mb-4'>
                    <div className='banner-bottom-box text-center'>
                        <div className='icons-text d-flex align-items-center gap-2 justify-content-center'>
                            <img src={AiIcons4.src} alt="" />
                            <span>10K+ Tutors & Students</span>
                        </div>
                        <p className='m-0 p-0'>Join thriving UpKraft community</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default BannerBottomBox
