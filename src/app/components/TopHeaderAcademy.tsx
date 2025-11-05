"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// import { Link } from 'react-router-dom'
import LogoHeader from '../../assets/LogoHeader.png'
import { Button, Dropdown, Form } from 'react-bootstrap'
import Author from '../../assets/author-01.png'

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age: number;
  address: string;
  contact: string;
  courses: any[];
  createdAt: string;
  profileImage?: string;
}

const TopHeaderAcademy = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data from API
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);
  console.log("userData",userData);
  

  return (
   <div className='top-header-sec d-flex align-items-center w-100'>
      <div className='logo-box d-lg-none d-block'>
        <Link href="/" className='logo-head'>
            <Image src={LogoHeader} alt='logo'/>
        </Link>
      </div>
      <div className='right-top-header d-flex align-items-center justify-content-between gap-2'>
        <div className='search-box d-lg-block d-none'>
             <Form>
                <Form.Group className="position-relative mb-0">
                    <Form.Label className='d-none'>search</Form.Label>
                    <Form.Control type="text" placeholder="Search here" />
                    <Button className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </Button>
                </Form.Group>
            </Form>
        </div>
        <div className='right-head-details ms-auto'>  
            <div className='listing-details-author d-flex align-items-center'>
                <div className='right-head-details d-flex align-items-center gap-2'>
                    <div className='img-admin border-0'>
                        {userData?.profileImage ? (
                            <Image 
                                src={userData.profileImage} 
                                alt={userData.username || "Profile"} 
                                width={40}
                                height={40}
                                className="rounded-circle"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center" 
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    backgroundColor: '#5204d6', 
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className='author-details'>
                        <h6>{userData?.username || "Loading..."}</h6>
                        <p>{ userData?.category == "Academic" ? "Academy"  : userData?.category || "Academy"}</p>
                    </div>
                </div>
                <div className="btn-menu-mobile">
                <button className="btn btn-menu border-0 pe-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default TopHeaderAcademy
