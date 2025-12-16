"use client";

import React, { useState } from 'react'
import VideoImg01 from '@/assets/video-placeholder.png'
import Link from 'next/link';
import ModalStudent from './ModalStudent';
import Modal from 'react-bootstrap/Modal';
import YTImage from '@/assets/yt-video.png';

const KnowledgeHub = () => {
    const [showModal, setShowModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleVideoOpen = () => setShowVideoModal(true);
    const handleVideoClose = () => setShowVideoModal(false);

    return (
        <div className='knowledge-hub-inner-sec'>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-lg-10'>
                        <div className='heading-box text-center'>
                            <h2 className='mb-3'><span>UpKraft</span> Knowledge Hub </h2>
                            <p>Access 500+ video lessons from UpKraft tutors and begin your journey with free, easy-to-follow tutorials that make learning simple and fun. Build a strong foundation, then unlock advanced modules to keep growing and play like a pro.</p>
                        </div>

                        {/* ---------------- Video Banner ---------------- */}
                        <div className='video-box'>
                            <div className='learn-video position-relative' onClick={handleVideoOpen} style={{ cursor: 'pointer' }}>
                                <img
                                    src={YTImage.src}
                                    alt="Video Banner"
                                    width="100%"
                                    height="600"
                                    style={{ objectFit: "cover" }}
                                />
                                {/* YouTube-style Play Button */}
                                <div className='play-icon-overlay'>
                                    <div className='play-circle'>
                                        <div className='play-triangle'></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---------------- Start Lessons Button ---------------- */}
                        <div className='w-100 d-flex justify-content-center mt-4'>
                            <Link href="" className='btn btn-orange m-auto' onClick={handleShow}>
                                Explore UpKraft Channel
                            </Link>
                        </div>
                    </div>

                    {/* ---------------- Modals ---------------- */}
                    <ModalStudent show={showModal} handleClose={handleClose} />

                    <Modal show={showVideoModal} onHide={handleVideoClose} centered size="lg">
                        <Modal.Body style={{ padding: 0 }}>
                            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                                <iframe
                                    src="https://www.youtube.com/embed/VbiI2cLgSaU"
                                    title="UpKraft Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                ></iframe>
                            </div>
                        </Modal.Body>
                    </Modal>

                </div>
            </div>

            <style jsx>{`
                .play-icon-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .play-circle {
                    width: 80px;
                    height: 80px;
                    background: rgba(0, 0, 0, 0.6); /* semi-transparent dark */
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .play-circle:hover {
                    background: rgba(0, 0, 0, 0.8);
                }

                .play-triangle {
                    width: 0;
                    height: 0;
                    border-left: 25px solid white;
                    border-top: 15px solid transparent;
                    border-bottom: 15px solid transparent;
                }
            `}</style>
        </div>
    )
}

export default KnowledgeHub;
