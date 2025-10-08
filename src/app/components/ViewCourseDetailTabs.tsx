'use client'
import React from 'react'
import Music from '../../assets/music.png'
import Student01 from '../../assets/student-01.png'
import Link from 'next/link'
import MyCourseTabs from './MyCourseTabs'

const ViewCourseDetailTabs = () => {
  return (
    <div className='assignment-detail-sec'>
        <div className='card-box top-card-assignment-details d-flex align-items-center flex-md-nowrap flex-wrap gap-3 mb-4'>
            <div className='left-card'>
                <div className='card-img-box'>
                    <img src={Music} alt="" />
                </div>
            </div>
            <div className='right-card d-flex align-items-end justify-content-between w-100 flex-md-nowrap flex-wrap'>
                <div className='assignment-details-right assignments-list-box p-0 m-0 border-0'>
                    <h2 className='mb-3'>Introduction To Piano</h2>
                    <div className='assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between w-100'>
                        <ul className='d-flex align-items-center gap-xl-4 gap-2 flex-wrap p-0 m-0 w-100'>
                            <li className='d-flex align-items-center gap-2'>
                                <span className='student-text'>Duration :</span>
                                <span className='student-txt'><strong>4 weeks</strong></span>
                            </li>
                            <li className='d-flex align-items-center gap-2'>
                                <span className='student-text'>Sessions :</span>
                                <span className='student-txt'><strong>4</strong></span>
                            </li>
                            <li className='d-flex align-items-center gap-2'>
                                <span className='student-text'>Price :</span>
                                <span className='student-txt'><strong>Rs 6000</strong></span>
                            </li>
                            <li className='d-flex align-items-center gap-2'>
                                <span className='student-text'>Started From :</span>
                                <span className='student-txt'><strong>25 July</strong></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div className='assignments-list d-flex align-items-center gap-2 flex-wrap w-100 justify-content-between'>
                        <div className='student-img-name d-flex align-items-center flex-md-nowrap flex-wrap gap-2'>
                            <p>Student :</p>
                            <ul className='p-0 m-0 list-unstyled d-flex align-items-center gap-xl-4  gap-2'>
                                <li className='d-flex align-items-center gap-2 w-100'>
                                    <img src={Student01} alt="" />
                                    <span className='name'>Lorena Dare</span>
                                </li>
                                <li className='d-flex align-items-center gap-2 w-100'>
                                    <img src={Student01} alt="" />
                                    <span className='name'>Lorena Dare</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <Link href="/add-new-session" className='btn btn-primary d-flex align-items-center gap-2 justify-content-end p-1 px-3 small text-nowrap w-100 mobile-width justify-content-center mt-md-0 mt-4'>
                    <span>Add Session</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9987 8.66536H8.66536V11.9987C8.66536 12.1755 8.59513 12.3451 8.4701 12.4701C8.34508 12.5951 8.17551 12.6654 7.9987 12.6654C7.82189 12.6654 7.65232 12.5951 7.52729 12.4701C7.40227 12.3451 7.33203 12.1755 7.33203 11.9987V8.66536H3.9987C3.82189 8.66536 3.65232 8.59513 3.52729 8.4701C3.40227 8.34508 3.33203 8.17551 3.33203 7.9987C3.33203 7.82189 3.40227 7.65232 3.52729 7.52729C3.65232 7.40227 3.82189 7.33203 3.9987 7.33203H7.33203V3.9987C7.33203 3.82189 7.40227 3.65232 7.52729 3.52729C7.65232 3.40227 7.82189 3.33203 7.9987 3.33203C8.17551 3.33203 8.34508 3.40227 8.4701 3.52729C8.59513 3.65232 8.66536 3.82189 8.66536 3.9987V7.33203H11.9987C12.1755 7.33203 12.3451 7.40227 12.4701 7.52729C12.5951 7.65232 12.6654 7.82189 12.6654 7.9987C12.6654 8.17551 12.5951 8.34508 12.4701 8.4701C12.3451 8.59513 12.1755 8.66536 11.9987 8.66536Z" fill="white"/></svg>
                </Link>
            </div>
        </div>

        <div className='card-box card-tabs-sec'>
            <MyCourseTabs />
        </div>
    </div>
  )
}

export default ViewCourseDetailTabs