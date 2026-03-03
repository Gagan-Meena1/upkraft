"use client";

import React, { useState, useEffect } from "react";
import Banner from "./learners/Banner";
import BannerBottomBox from "./learners/BannerBottomBox";
import WhyChoose from "./learners/WhyChoose";
import HowItWorks from "./learners/HowItWorks";
import LearnFromExperts from "./learners/LearnFromExperts";
import ExclusiveBenefits from "./learners/ExclusiveBenefits";
import LearnersLogo from "./learners/LearnersLogo";
import ExclusiveBenefitsTutors from "./learners/ExclusiveBenefitsTutors";
import SchoolsAcademies from "./learners/SchoolsAcademies";
import KnowledgeHub from "./learners/KnowledgeHub";
import Faq from "./learners/Faq";
import ModalStudent from "@/app/components/learners/ModalStudent";
import AcademicPartners from "./learners/AcademicPartners";

const Learners = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  // Scroll to FAQ when landing with hash #faq (e.g. from /T&Cs redirect).
  // Delay so that after a redirect the full page has rendered and scroll position sticks.
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#faq") return;
    const el = document.getElementById("faq");
    if (!el) return;

    const scrollToFaq = () => el.scrollIntoView({ behavior: "smooth" });
    const t = setTimeout(scrollToFaq, 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="main-learners relative">
      {/* Sticky Express Interest Button */}
      <button
        onClick={handleOpen}
        className="fixed top-1/2 
                   text-black font-bold uppercase tracking-wider
                   py-2 px-4 rounded-md shadow-xl 
                   transition-all duration-300 hover:brightness-110"
        style={{
          right: "-88px",
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center center",
          whiteSpace: "nowrap",
          backgroundColor: "#FDB94E",
          zIndex: 9999,
          fontSize: "14 px",
          letterSpacing: "2px",
        }}
      >
        Book a Demo
      </button>

      {/* Modal */}
      <ModalStudent show={showModal} handleClose={handleClose} />

      {/* Page Sections */}
      <div className="banner-learners">
        <Banner />
      </div>
      <div className="banner-bottom-box-sec">
        <BannerBottomBox />
      </div>
      <div className="why-choose-sec">
        <WhyChoose />
      </div>
      <div className="how-it-work-sec">
        <HowItWorks />
      </div>
      <div className="learn-from-experts-sec">
        <LearnFromExperts />
      </div>
      <div className="exclusive-benefits-sec" id="learners">
        <ExclusiveBenefits />
      </div>
      <div className="learners-logo-sec">
        <LearnersLogo />
      </div>
      <div className="exclusive-tutors-sec" id="tutors">
        <ExclusiveBenefitsTutors />
      </div>
      <div className="schools-academies-sec" id="schools">
        <SchoolsAcademies />
      </div>
      <div className="schools-academies-sec" id="schools">
        <AcademicPartners />
      </div>
      <div className="knowledge-hub-sec">
        <KnowledgeHub />
      </div>
      <div className="faq-sec" id="faq">
        <Faq />
      </div>
    </div>
  );
};

export default Learners;