'use client'
import React, { useState } from 'react'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ReferAndEarn from '../../components/referEarnDetails/ReferAndEarn';
import ReferEarnDetailsList from '../../components/referEarnDetails/ReferEarnDetailsList';
import ReferTutor from '../../components/referEarnDetails/ReferTutor';
import ReferStudent from '../../components/referEarnDetails/ReferStudent';

const ReferEarnDetails = () => {
  return (
    <div className="refer-earn-details-sec">
      <div className="row">
        <div className="col-xl-8 col-md-12">
          <div className="h-100 card-box position-relative practice-studio-sec">
            <div className="top-heading-box mb-4">
              <h2>Refer & Earn</h2>
            </div>
            <div className="tab-sec-music payment-summary-sec">
              <Tabs defaultActiveKey="ReferTutor" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="ReferTutor" title="Refer Tutor">
                    <ReferTutor />
                </Tab>
                <Tab eventKey="ReferStudent" title="Refer Student">
                    Refer Student
                    <ReferStudent/>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-md-12 mt-xl-0 mt-4">
            <div className='earn-refer-card card-box'>
                <ReferAndEarn />
                <ReferEarnDetailsList />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReferEarnDetails;
