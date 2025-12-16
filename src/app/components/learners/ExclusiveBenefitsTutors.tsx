"use client";

import React, { useState } from "react";
import Link from "next/link";
import FullImg from "@/assets/full-img.png";
import tutors01 from "@/assets/tutors-01.png";
import tutors02 from "@/assets/tutors-02.png";
import tutors03 from "@/assets/tutors-03.png";
import tutors04 from "@/assets/tutors-04.png";
import tutors05 from "@/assets/tutors-05.png";
import tutors06 from "@/assets/tutors-06.png";
import tutors07 from "@/assets/tutors-07.png";
import ModalStudent from './ModalStudent';

const ExclusiveBenefitsTutors = () => {
    const [showModal, setShowModal] = useState(false);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <div className="benefit-tutors-sec">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">
                        Exclusive Benefits for <span className="!text-[#6e09bd]">Tutors</span>
                    </h2>
                    <p className="text-gray-600">Your All-in-One Teaching Toolkit</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md-8">
                    {/* Left Column */}
                    <div className=" order-md-1 order-1">
                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors01.src} alt="Enroll New Students" />
                            </div>
                            <h6 className="mt-4 font-semibold">Enroll New Students</h6>
                            <p>Enroll new students from Platform</p>
                        </div>

                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors02.src} alt="2000+ Song Library" />
                            </div>
                            <h6 className="mt-4 font-semibold">2000+ Song Library</h6>
                            <p>Make learning fun and engaging</p>
                        </div>

                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors03.src} alt="Hyper Personalisation" />
                            </div>
                            <h6 className="mt-4 font-semibold">Hyper Personalisation of Assignments</h6>
                            <p>Tailored learning for every student</p>
                        </div>
                    </div>

                    {/* Middle Column */}
                    <div className=" order-md-2 order-3">
                        <div className="tutor-box mb-4 text-center border p-4 mx-md-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors04.src} alt="Payments & Scheduling" />
                            </div>
                            <h6 className="mt-4 font-semibold">Payments & Scheduling</h6>
                            <p>Automated reminders & easy billing</p>
                        </div>

                        <div className="tutor-full-img-box flex justify-center items-center p-md-4 rounded">
                            <img src={FullImg.src} alt="Tutor Teaching" className="max-w-full" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className=" order-md-3 order-2">
                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors05.src} alt="Progress Dashboards" />
                            </div>
                            <h6 className="mt-4 font-semibold">Progress Dashboards</h6>
                            <p>Share progress with parents instantly</p>
                        </div>

                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors06.src} alt="Automated Parent Updates" />
                            </div>
                            <h6 className="mt-4 font-semibold">Automated Parent Updates</h6>
                            <p>Communication without extra effort</p>
                        </div>

                        <div className="tutor-box mb-4 text-center border p-4 rounded">
                            <div className="img-box flex justify-center">
                                <img src={tutors07.src} alt="2X Growth" />
                            </div>
                            <h6 className="mt-4 font-semibold">2X Growth in Practice Hours</h6>
                            <p>Boost engagement with AI feedback</p>
                        </div>
                    </div>
                </div>

                {/* ✅ Centered Button */}
                <div className="text-center mt-4">
                    <Link href="" className="btn btn-orange" onClick={handleShow}>
                       Book a Demo
                    </Link>
                </div>
            </div>
            <ModalStudent show={showModal} handleClose={handleClose} />
        </div>
    );
};

export default ExclusiveBenefitsTutors;
