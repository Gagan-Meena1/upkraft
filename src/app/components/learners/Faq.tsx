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
                            <h2 className='mb-3'>Frequently Asked Questions</h2>
                            <p>UpKraft stands out as the right choice because it blends innovation, reliability, and customer-centric solutions to deliver real value.</p>
                        </div>
                    </div>
                    <div className='col-md-12 '>
                        <Accordion>
                            {/* <Accordion.Item eventKey="0">
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
                            </Accordion.Item> */}
                            {/* <Accordion.Item eventKey="1">
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
                            </Accordion.Item> */}
                            <Accordion.Item eventKey="11">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>My child cannot attend their upcoming class. How do I reschedule?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        The parent or student must inform the assigned Relationship Manager (RM) at least 24 hours
                                        before the scheduled class time. Rescheduling requests must be sent via the official Upkraft
                                        WhatsApp group.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="12">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>What happens if I have an emergency and cancel less than 24 hours before the class?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Upkraft understands that emergencies may occur. However, since tutors prepare and reserve
                                        time specifically for each student, any cancellation made within 24 hours of the scheduled class
                                        cannot be rescheduled. The class will be marked as “completed.
                                        ”
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="13">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Can I message the tutor directly to change the class time?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        No. All rescheduling or change requests must be routed through the assigned Relationship
                                        Manager (RM) via the official WhatsApp group. Requests sent directly to tutors or through
                                        personal communication channels will not be considered valid.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="14">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How many times can I reschedule a class?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Students are permitted one (1) reschedule for every eight (8) classes. Any rescheduled
                                        (make-up) class must be completed within one month of the original class date.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="15">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>My child is in a Group Class. Can we reschedule if we miss a session?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        No. To maintain a consistent learning pace for all participants, Group Classes cannot be
                                        rescheduled under any circumstances.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="16">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>We are going on vacation or have school exams. Can we pause our classes?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Yes. A temporary pause may be requested for valid reasons such as school examinations,
                                        medical issues, or travel. Supporting documentation (e.g., exam timetable or medical note)
                                        may be required.
                                        Note: Pause requests are not applicable to Group Classes.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="17">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>How long can we pause the classes?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        A pause in classes is permitted for a maximum of 2 weeks to ensure continuity in the student’s
                                        learning and avoid loss of academic momentum.
                                        If the pause exceeds 2 weeks, the availability of the same tutor cannot be guaranteed upon
                                        resumption.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="18">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>What if the tutor or Upkraft cancels the class?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        If a class is cancelled by Upkraft or the tutor, the session will not be counted as a completed
                                        class. Upkraft will arrange a make-up session at a later date.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="19">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Why do you have a 24-hour notice policy?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        The 24-hour notice policy is in place to respect tutors’ professional time and preparation, while
                                        also ensuring a smooth, consistent, and high-quality learning experience for all students.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="20">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'>Can we get an extension to complete the course?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Yes. After accounting for all reschedules and pause days already used, a maximum extension
                                        of up to one (1) month may be granted to complete pending classes
                                        <br />
                                        <br />
                                        3-month courses: Eligible for a one (1) month extension to complete pending classes.
                                        <br />
                                        6-month courses: Eligible for a two (2) month extension to complete pending classes.
                                        <br />
                                        <br />
                                        Extension requests must be raised in advance through the assigned Relationship Manager
                                        (RM) via the official Upkraft WhatsApp group, are subject to approval, and tutor availability
                                        during the extension period cannot be guaranteed.
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="21">
                                <Accordion.Header>
                                    <div className='header-btn d-flex align-items-center justify-content-between gap-3'>
                                        <span className='text'> Is everyone eligible for a pause?</span>
                                        <span className='svg-icons'>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7.99805H8V12.998C8 13.2633 7.89464 13.5176 7.70711 13.7052C7.51957 13.8927 7.26522 13.998 7 13.998C6.73478 13.998 6.48043 13.8927 6.29289 13.7052C6.10536 13.5176 6 13.2633 6 12.998V7.99805H1C0.734784 7.99805 0.48043 7.89269 0.292893 7.70515C0.105357 7.51762 0 7.26326 0 6.99805C0 6.73283 0.105357 6.47848 0.292893 6.29094C0.48043 6.1034 0.734784 5.99805 1 5.99805H6V0.998047C6 0.73283 6.10536 0.478476 6.29289 0.29094C6.48043 0.103403 6.73478 -0.00195313 7 -0.00195312C7.26522 -0.00195313 7.51957 0.103403 7.70711 0.29094C7.89464 0.478476 8 0.73283 8 0.998047V5.99805H13C13.2652 5.99805 13.5196 6.1034 13.7071 6.29094C13.8946 6.47848 14 6.73283 14 6.99805C14 7.26326 13.8946 7.51762 13.7071 7.70515C13.5196 7.89269 13.2652 7.99805 13 7.99805Z" fill="#202020" /></svg>
                                        </span>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='text-box'>
                                        Pause options are available only for students enrolled in 3-month or 6-month courses:
                                        <br />
                                        <br />
                                        ● Twice-a-week classes: One (1) pause permitted every 3 months
                                        <br />
                                        ● Once-a-week classes: One (1) pause permitted every 6 months
                                        <br />
                                        Note: Pause requests are not applicable to Group Classes.
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
