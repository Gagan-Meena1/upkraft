"use client";

import React from 'react'
import Banner from './learners/Banner'
import BannerBottomBox from './learners/BannerBottomBox'
import WhyChoose from './learners/WhyChoose'
import HowItWorks from './learners/HowItWorks'
import LearnFromExperts from './learners/LearnFromExperts'
import ExclusiveBenefits from './learners/ExclusiveBenefits'
import LearnersLogo from './learners/LearnersLogo'
import ExclusiveBenefitsTutors from './learners/ExclusiveBenefitsTutors'
import SchoolsAcademies from './learners/SchoolsAcademies'
import KnowledgeHub from './learners/KnowledgeHub'
import Faq from './learners/Faq'

const Learners = () => {
  return (
    <div className='main-learners'>
      <div className='banner-learners'>
        <Banner />
      </div>
      <div className='banner-bottom-box-sec'>
        <BannerBottomBox />
      </div>
      <div className='why-choose-sec'>
        <WhyChoose />
      </div>
      <div className='how-it-work-sec'>
        <HowItWorks />
      </div>
      <div className='learn-from-experts-sec'>
        <LearnFromExperts />
      </div>
      <div className='exclusive-benefits-sec' id="learners">
        <ExclusiveBenefits />
      </div>
      <div className='learners-logo-sec'>
        <LearnersLogo />
      </div>
      <div className='exclusive-tutors-sec' id="tutors">
        <ExclusiveBenefitsTutors />
      </div>
      <div className='schools-academies-sec' id="schools">
        <SchoolsAcademies />
      </div>
      <div className='knowledge-hub-sec'>
        <KnowledgeHub />
      </div>
      <div className='faq-sec'>
        <Faq />
      </div>
    </div>
  )
}

export default Learners
