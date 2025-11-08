'use client'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import Link from 'next/link'
import StudentProfileImg from '../../../assets/tutor-profile.png'
import DatePicker from '../../../assets/date-picker.png'
import Clock from '../../../assets/clock.png'
import Music from '../../../assets/music.png'
import Image from 'next/image';


const TutorDetails = () => {
  return (
    
    <div className='tutor-profile-details-sec'>
        <div className='row'>
            <div className='col-xxl-8 col-md-12 mb-4'>
                <div className='row'>
                    <div className='col-xl-4 mb-4'>
                        <div className='profile-box card-box text-center red-border'>
                            <div className='img-profile'>
                                <Image src={StudentProfileImg} alt="" />
                            </div>
                            <div className='text-profile'>
                                <h2>Mabel Mueller</h2>
                                <p className='m-0 p-0'>Egypt</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-xl-4 mb-4 col-md-6'>
                        <div className='personal-details card-box'>
                            <h6>Personal Details</h6>
                            <ul className='details-list-personal p-0 m-0 list-unstyled'>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Email :</span>
                                    <span className='details-box'>eunicerobel@gmail.com</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Contact :</span>
                                    <span className='details-box'>698.661.1830</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Age :</span>
                                    <span className='details-box'>12 Years</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>DOB :</span>
                                    <span className='details-box'>1 January 2022</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Gender :</span>
                                    <span className='details-box'>male</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='col-xl-4 col-md-6 mb-4'>
                        <div className='personal-details card-box'>
                            <h6>Fee Status</h6>
                            <ul className='details-list-personal p-0 m-0 list-unstyled'>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Course :</span>
                                    <span className='details-box'>Piano</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Course Fee :</span>
                                    <span className='details-box'>Rs. 80,000</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Amount Paid :</span>
                                    <span className='details-box'>NA</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Status :</span>
                                    <span className='details-box red-text'>Not Paid</span>
                                </li>
                                <li className='d-flex align-items-center'>
                                    <span className='name-box'>Paid Via :</span>
                                    <span className='details-box'>NA</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='col-md-12  '>
                        <div className='courses-enrolled-sec card-box'>
                            <div className='head-height'>
                                <h3>Courses Enrolled</h3>
                            </div>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='enrolled-box'>
                                        <ul className='p-0 m-0 list-unstyled d-flex align-items-center gap-2 justify-content-between'>
                                            <li>
                                                <h4>Piano Classes</h4>
                                            </li>
                                            <li className='d-flex align-items-center gap-0'>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.543 4.37329C11.7114 3.97212 12.2923 3.97227 12.4609 4.37329L12.4619 4.37524L14.3516 8.83521L14.4697 9.11255L14.7695 9.13794L19.5996 9.5481H19.6025C20.0102 9.58052 20.1978 10.064 19.9424 10.3645L19.8848 10.4221L16.2148 13.6018L15.9873 13.8L16.0557 14.093L17.1553 18.8137C17.2552 19.2448 16.7906 19.5815 16.4111 19.3518L12.2607 16.842L12.0029 16.6858L11.7441 16.842L7.59473 19.342H7.59375C7.2143 19.5717 6.74987 19.2349 6.84961 18.804L7.94922 14.0833L8.01758 13.7893L7.79004 13.592L4.12012 10.4124H4.11914C3.78245 10.1208 3.96745 9.57292 4.40234 9.53833H4.4043L9.23438 9.12817L9.53516 9.10278L9.65234 8.82544L11.543 4.37524V4.37329Z" stroke="#505050"/></svg></span>
                                            </li>
                                        </ul>
                                        <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners.</p>
                                        <div className='assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between w-100'>
                                            <ul className='d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100'>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Sessions :</span>
                                                    <span className='student-txt'><strong>12</strong></span>
                                                </li>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Duration :</span>
                                                    <span className='student-txt'><strong>2 Month</strong></span>
                                                </li>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Free :</span>
                                                    <span className='student-txt'><strong>Rs 40,000</strong></span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className='right-assignment my-course-student-right mt-xxl-0 mt-3'>
                                            <div className='student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2'>
                                                <ul className='d-flex align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0'>
                                                    <li>
                                                        <Link to="/overall-performance" className='btn btn-primary d-flex align-items-center justify-content-center gap-2'>
                                                            <span>View Performance</span>
                                                            <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="white"/></svg>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/session-summary" className='btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2'>
                                                            <span>Session Summary</span>
                                                            <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="#6E09BD"/></svg>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='enrolled-box'>
                                        <ul className='p-0 m-0 list-unstyled d-flex align-items-center gap-2 justify-content-between'>
                                            <li>
                                                <h4>Guitar Classes</h4>
                                            </li>
                                            <li className='d-flex align-items-center gap-0'>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0023 17.27L16.1523 19.78C16.9123 20.24 17.8423 19.56 17.6423 18.7L16.5423 13.98L20.2123 10.8C20.8823 10.22 20.5223 9.12001 19.6423 9.05001L14.8123 8.64001L12.9223 4.18001C12.5823 3.37001 11.4223 3.37001 11.0823 4.18001L9.19227 8.63001L4.36227 9.04001C3.48227 9.11001 3.12227 10.21 3.79227 10.79L7.46227 13.97L6.36227 18.69C6.16227 19.55 7.09227 20.23 7.85227 19.77L12.0023 17.27Z" fill="#FFC357"/></svg></span>
                                                <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.543 4.37329C11.7114 3.97212 12.2923 3.97227 12.4609 4.37329L12.4619 4.37524L14.3516 8.83521L14.4697 9.11255L14.7695 9.13794L19.5996 9.5481H19.6025C20.0102 9.58052 20.1978 10.064 19.9424 10.3645L19.8848 10.4221L16.2148 13.6018L15.9873 13.8L16.0557 14.093L17.1553 18.8137C17.2552 19.2448 16.7906 19.5815 16.4111 19.3518L12.2607 16.842L12.0029 16.6858L11.7441 16.842L7.59473 19.342H7.59375C7.2143 19.5717 6.74987 19.2349 6.84961 18.804L7.94922 14.0833L8.01758 13.7893L7.79004 13.592L4.12012 10.4124H4.11914C3.78245 10.1208 3.96745 9.57292 4.40234 9.53833H4.4043L9.23438 9.12817L9.53516 9.10278L9.65234 8.82544L11.543 4.37524V4.37329Z" stroke="#505050"/></svg></span>
                                            </li>
                                        </ul>
                                        <p>Learn the basics of piano playing with fun, interactive lessons designed for beginners.</p>
                                        <div className='assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between w-100'>
                                            <ul className='d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100'>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Sessions :</span>
                                                    <span className='student-txt'><strong>12</strong></span>
                                                </li>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Duration :</span>
                                                    <span className='student-txt'><strong>2 Month</strong></span>
                                                </li>
                                                <li className='d-flex align-items-center gap-2'>
                                                    <span className='student-text'>Free :</span>
                                                    <span className='student-txt'><strong>Rs 40,000</strong></span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className='right-assignment my-course-student-right mt-xxl-0 mt-3'>
                                            <div className='student-assignment my-course-student d-flex align-items-center flex-wrap gap-xl-4 gap-2'>
                                                <ul className='d-flex align-items-center w-full-width gap-2 list-unstyled flex-wrap m-0 p-0'>
                                                    <li>
                                                        <Link to="/overall-performance" className='btn btn-primary d-flex align-items-center justify-content-center gap-2'>
                                                            <span>View Performance</span>
                                                            <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="white"/></svg>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/session-summary" className='btn btn-border padding-fixed d-flex align-items-center justify-content-center gap-2'>
                                                            <span>Session Summary</span>
                                                            <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25551 16.2428C7.13049 16.1178 7.06025 15.9482 7.06025 15.7714C7.06025 15.5946 7.13049 15.425 7.25551 15.3L13.66 8.89551L8.66973 8.89645C8.58207 8.89645 8.49527 8.87918 8.41428 8.84564C8.33329 8.81209 8.25971 8.76292 8.19773 8.70094C8.13574 8.63896 8.08657 8.56537 8.05303 8.48439C8.01948 8.4034 8.00222 8.3166 8.00222 8.22894C8.00222 8.14128 8.01948 8.05448 8.05303 7.9735C8.08657 7.89251 8.13574 7.81892 8.19773 7.75694C8.25971 7.69496 8.33329 7.64579 8.41428 7.61224C8.49527 7.5787 8.58207 7.56143 8.66973 7.56143H15.2694C15.3571 7.56132 15.4439 7.57851 15.525 7.61202C15.606 7.64552 15.6796 7.69469 15.7416 7.75669C15.8036 7.8187 15.8528 7.89233 15.8863 7.97337C15.9198 8.0544 15.937 8.14125 15.9369 8.22894L15.9369 14.8286C15.9369 14.9163 15.9196 15.0031 15.8861 15.084C15.8525 15.165 15.8034 15.2386 15.7414 15.3006C15.6794 15.3626 15.6058 15.4118 15.5248 15.4453C15.4438 15.4788 15.357 15.4961 15.2694 15.4961C15.1817 15.4961 15.0949 15.4788 15.0139 15.4453C14.933 15.4118 14.8594 15.3626 14.7974 15.3006C14.7354 15.2386 14.6862 15.165 14.6527 15.084C14.6191 15.0031 14.6019 14.9163 14.6019 14.8286L14.6028 9.83831L8.19832 16.2428C8.0733 16.3678 7.90373 16.4381 7.72692 16.4381C7.55011 16.4381 7.38054 16.3678 7.25551 16.2428Z" fill="#6E09BD"/></svg>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-xxl-4 col-md-12'>
                <div className='tutor-profile-right-box'>
                    <div className='card-box mb-4'>
                        <div className='head-height'>
                            <h3>Upcoming Classes</h3>
                        </div>
                        <div className='tutor-upcoming-clasess'>
                            <div className='tutor-upcoming-box d-flex align-items-center gap-2 mb-4'>
                                <div className='img-box-main'>
                                    <span>
                                        <Image src={Music} alt="" />
                                    </span>
                                </div>
                                <div className='text-box-main'>
                                    <h3>Introduction to Piano</h3>
                                    <ul className='p-0 m-0 d-flex align-items-center gap-2 list-unstyled flex-md-nowrap flex-wrap'>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={DatePicker} alt="" />
                                            </span>
                                            <span>Monday, Aug 25 2025</span>
                                        </li>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={Clock} alt="" />
                                            </span>
                                            <span>10:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className='tutor-upcoming-box d-flex align-items-center gap-2 mb-4'>
                                <div className='img-box-main'>
                                    <span>
                                        <Image src={Music} alt="" />
                                    </span>
                                </div>
                                <div className='text-box-main'>
                                    <h3>Introduction to Piano</h3>
                                    <ul className='p-0 m-0 d-flex align-items-center gap-2 list-unstyled flex-md-nowrap flex-wrap'>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={DatePicker} alt="" />
                                            </span>
                                            <span>Monday, Aug 25 2025</span>
                                        </li>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={Clock} alt="" />
                                            </span>
                                            <span>10:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className='tutor-upcoming-box d-flex align-items-center gap-2 mb-4'>
                                <div className='img-box-main'>
                                    <span>
                                        <Image src={Music} alt="" />
                                    </span>
                                </div>
                                <div className='text-box-main'>
                                    <h3>Introduction to Piano</h3>
                                    <ul className='p-0 m-0 d-flex align-items-center gap-2 list-unstyled flex-md-nowrap flex-wrap'>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={DatePicker} alt="" />
                                            </span>
                                            <span>Monday, Aug 25 2025</span>
                                        </li>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={Clock} alt="" />
                                            </span>
                                            <span>10:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className='tutor-upcoming-box d-flex align-items-center gap-2 mb-4'>
                                <div className='img-box-main'>
                                    <span>
                                        <Image src={Music} alt="" />
                                    </span>
                                </div>
                                <div className='text-box-main'>
                                    <h3>Introduction to Piano</h3>
                                    <ul className='p-0 m-0 d-flex align-items-center gap-2 list-unstyled flex-md-nowrap flex-wrap'>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={DatePicker} alt="" />
                                            </span>
                                            <span>Monday, Aug 25 2025</span>
                                        </li>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={Clock} alt="" />
                                            </span>
                                            <span>10:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className='tutor-upcoming-box d-flex align-items-center gap-2 mb-4'>
                                <div className='img-box-main'>
                                    <span>
                                        <Image src={Music} alt="" />
                                    </span>
                                </div>
                                <div className='text-box-main'>
                                    <h3>Introduction to Piano</h3>
                                    <ul className='p-0 m-0 d-flex align-items-center gap-2 list-unstyled flex-md-nowrap flex-wrap'>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <img src={DatePicker} alt="" />
                                            </span>
                                            <span>Monday, Aug 25 2025</span>
                                        </li>
                                        <li className='d-flex align-items-center gap-1'>
                                            <span className='img-box'>
                                                <Image src={Clock} alt="" />
                                            </span>
                                            <span>10:00 PM</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  )
}

export default TutorDetails