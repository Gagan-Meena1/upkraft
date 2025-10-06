import React from 'react'
import Loop from '../../../assets/loop.png'
import ResultDown from '../../../assets/result-down-arrow.png'
import Focus from '../../../assets/focus.png'

const ReferEarnDetailsList = () => {
  return (
    <div className='achievements-sec mt-md-5 mt-4 '>
        <div className='achievements-box d-flex align-items-center gap-2'>
            <div className='img-box icons-with-bg'>
                <img src={Loop} alt="" />
            </div>
            <div className='text-box'>
                <p className='m-0'>Share your referral link</p>
                <span>Invite your friends to join the upkraft using your unique referral link</span>
            </div>
        </div>
        <div className='achievements-box d-flex align-items-center gap-2'>
            <div className='img-box icons-with-bg'>
                <img src={ResultDown} alt="" />
            </div>
            <div className='text-box'>
                <p className='m-0'>Your friend join</p>
                <span>When your friend joins upkraft through your shared link , they become a part of our community</span>
            </div>
        </div>
        <div className='achievements-box d-flex align-items-center gap-2'>
            <div className='img-box icons-with-bg'>
                <img src={Focus} alt="" />
            </div>
            <div className='text-box'>
                <p className='m-0'>You both earn reward</p>
                <span>As a token of appreciation, both you and your friend will receive 40 credits each.</span>
            </div>
        </div>
    </div>
  )
}

export default ReferEarnDetailsList