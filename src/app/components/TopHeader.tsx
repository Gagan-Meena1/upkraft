"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import LogoHeader from '../../assets/LogoHeader.png'
import { Button, Dropdown, Form } from 'react-bootstrap'
import Author from '../../assets/Author.png'
import Image from 'next/image'

const TopHeader = ({ role, setRole }) => {
  return (
    <div className='top-header-sec d-flex align-items-center w-100'>
      <div className='logo-box d-lg-none d-block'>
        <Link href="/" className='logo-head'>
            <Image src={LogoHeader} alt='logo'/>
        </Link>
      </div>
      <div className='right-top-header d-flex align-items-center justify-content-between gap-2'>
        <div className='search-box'>
             <Form>
                <Form.Group className="position-relative mb-0">
                    <Form.Label className='d-none'>search</Form.Label>
                    <Form.Control type="text" placeholder="Search here" />
                    <Button className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Button>
                </Form.Group>
            </Form>
        </div>
        <div className='right-head-details'>  
            <div className='listing-details-author d-flex align-items-center'>
              <div className="dropdown-box me-4">
                  <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic" className='py-1 btn btn-border'>
                    {role}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item  onClick={() => setRole("tutor")}>tutor</Dropdown.Item>
                      <Dropdown.Item onClick={() => setRole("student")}>student</Dropdown.Item>
                      <Dropdown.Item onClick={() => setRole("admin")}>admin</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
              </div>
                <ul className=' d-flex align-items-center gap-md-3 gap-2 mb-0 p-0 list-unstyled'>
                    <li>
                        <Link href="" className='btn-box btn-dark'>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_31833)"><path fillRule="evenodd" clipRule="evenodd" d="M13.8532 0.145982C13.9218 0.214468 13.969 0.301399 13.989 0.396203C14.0091 0.491006 14.0012 0.589597 13.9662 0.679982L8.96625 13.68C8.93085 13.772 8.86906 13.8514 8.78864 13.9084C8.70822 13.9654 8.61275 13.9973 8.51423 14.0002C8.41571 14.0031 8.31853 13.9768 8.23491 13.9246C8.15129 13.8725 8.08496 13.7967 8.04425 13.707L5.95325 9.10698L9.02925 6.02998C9.16173 5.88781 9.23385 5.69976 9.23042 5.50546C9.22699 5.31116 9.14828 5.12577 9.01087 4.98836C8.87345 4.85095 8.68807 4.77224 8.49377 4.76881C8.29947 4.76538 8.11142 4.8375 7.96924 4.96998L4.89225 8.04598L0.292245 5.95598C0.202212 5.91532 0.126242 5.8489 0.0739231 5.7651C0.0216042 5.6813 -0.00471863 5.58388 -0.00172314 5.48514C0.00127235 5.3864 0.0334519 5.29075 0.0907541 5.21028C0.148056 5.12981 0.227913 5.06811 0.320245 5.03298L13.3202 0.0329824C13.4105 -0.00174309 13.5089 -0.00955065 13.6035 0.0105056C13.6981 0.0305618 13.7848 0.0776212 13.8532 0.145982Z" fill="white"/></g><defs><clipPath id="clip0_558_31833"><rect width="14" height="14" fill="white"/></clipPath></defs></svg>
                        </Link>
                    </li>
                    <li>
                        <Link href="" className='btn-box'>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.25 10.3663V8.75H15V10.625C15 10.7907 15.0659 10.9497 15.1831 11.0669L16.875 12.7587V13.75H3.125V12.7587L4.81687 11.0669C4.93409 10.9497 4.99996 10.7907 5 10.625V8.125C4.99837 7.2468 5.2285 6.38372 5.66716 5.62292C6.10583 4.86212 6.73748 4.23054 7.49833 3.79197C8.25919 3.35341 9.12229 3.12337 10.0005 3.12511C10.8787 3.12685 11.7409 3.3603 12.5 3.80188V2.40375C11.905 2.14037 11.2723 1.97247 10.625 1.90625V0.625H9.375V1.90625C7.83411 2.06308 6.4061 2.7857 5.36711 3.93436C4.32811 5.08303 3.75194 6.57615 3.75 8.125V10.3663L2.05812 12.0581C1.94091 12.1753 1.87504 12.3343 1.875 12.5V14.375C1.875 14.5408 1.94085 14.6997 2.05806 14.8169C2.17527 14.9342 2.33424 15 2.5 15H6.875V15.625C6.875 16.4538 7.20424 17.2487 7.79029 17.8347C8.37634 18.4208 9.1712 18.75 10 18.75C10.8288 18.75 11.6237 18.4208 12.2097 17.8347C12.7958 17.2487 13.125 16.4538 13.125 15.625V15H17.5C17.6658 15 17.8247 14.9342 17.9419 14.8169C18.0592 14.6997 18.125 14.5408 18.125 14.375V12.5C18.125 12.3343 18.0591 12.1753 17.9419 12.0581L16.25 10.3663ZM11.875 15.625C11.875 16.1223 11.6775 16.5992 11.3258 16.9508C10.9742 17.3025 10.4973 17.5 10 17.5C9.50272 17.5 9.02581 17.3025 8.67417 16.9508C8.32254 16.5992 8.125 16.1223 8.125 15.625V15H11.875V15.625Z" fill="#7A7A7A"/><path d="M16.25 7.5C17.6307 7.5 18.75 6.38071 18.75 5C18.75 3.61929 17.6307 2.5 16.25 2.5C14.8693 2.5 13.75 3.61929 13.75 5C13.75 6.38071 14.8693 7.5 16.25 7.5Z" fill="#EE4B4B"/></svg>
                        </Link>
                    </li>
                </ul>
                <div className='right-head-details d-flex align-items-center gap-2'>
                    <div className='img-admin'>
                        <Image src={Author} alt="" />
                    </div>
                    <div className='author-details'>
                        <h6>Sherry Wolf</h6>
                        <p>Tuhrefr</p>
                    </div>
                </div>
                <div className="btn-menu-mobile">
                <Button className="btn btn-menu border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                  <i className="fas fa-bars"></i>
                </Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default TopHeader
