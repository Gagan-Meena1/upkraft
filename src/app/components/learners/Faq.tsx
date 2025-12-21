"use client";

import React from 'react'
import Accordion from 'react-bootstrap/Accordion';

const Faq = () => {
    return (
        <div className='faq-inner-sec'>
            <div className='container'>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='heading-box text-center'>
                            <h2 className='mb-3 !text-2xl font-semibold'>Frequently Asked Questions</h2>
                            <p>UpKraft stands out as the right choice because it blends innovation, reliability, and customer-centric solutions to deliver real value.</p>
                        </div>
                    </div>
                    <div className='col-md-12 '>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do I join as a tutor on UpKraft?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Register on our platform, complete your KYC verification, and set up your teaching profile.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do I earn from teaching?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        You earn from each class/package booked by your students. Upkraft deducts a small platform fee before transferring your payout.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do payments work?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        All student fees are collected by Upkraft. Verified payouts are made directly to your registered bank account.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Can I assign my own curriculum?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Yes. You can assign custom curriculum, upload assignments, and track student progress.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="4">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>What happens if I cancel a class?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        You should give advance notice. Frequent cancellations may impact your tutor rating and payouts.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="5">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How does the AI practice studio help me?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        It gives your students real-time practice feedback, saving you time and improving student learning outcomes.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="6">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do I find a tutor ?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Browse tutors by instrument, genre, and experience, and book classes directly through Upkraft.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="7">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do I pay for classes ?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Payments are securely processed via the Upkraft platform. You can choose per-class or package options.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="8">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Can I get a refund if I miss a class?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Refunds are only applicable if the tutor cancels the class. Missed student classes are non-refundable.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="9">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How do assignments work?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Tutors assign weekly practice tasks. You can complete them in the built-in practice studio with AI recommendations.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="10">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Can parents track student progress?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Yes. Parents receive regular updates and notifications about their child’s practice and performance.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Faq
