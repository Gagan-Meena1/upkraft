"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import LogoHeader from '../../assets/LogoHeader.png'
import { Button, Form } from 'react-bootstrap'
import Image from 'next/image'
import Chat from './Chat'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useUserData } from "@/app/providers/UserData/page";

const TopHeaderStudent = ({ role, setRole }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { userData, loading, clearData } = useUserData();

  const shouldShowDropdown = userData?.category === "Student" && userData?.academyId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      clearData();
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error during logout');
      console.error('Logout error:', error);
    }
    setShowDropdown(false);
  };

  const handleSettingsClick = () => {
    router.push('/student/settings');
    setShowDropdown(false);
  };

  return (
    <div className='top-header-sec d-flex align-items-center w-100'>
      <div className='logo-box d-lg-none d-block'>
        <Link href="/" className='logo-head'>
          <Image src={LogoHeader} alt='logo' />
        </Link>
      </div>
      <div className='right-top-header d-flex align-items-center justify-content-lg-between justify-content-end gap-2'>
        <div className='search-box d-lg-block d-none'>
          <Form>
            <Form.Group className="position-relative mb-0">
              <Form.Label className='d-none'>search</Form.Label>
              <Form.Control type="text" placeholder="Search here" />
              <Button variant='link' className="btn border-0 bg-transparent p-0 m-0 !top-[10px] position-absolute">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4995 17.5L13.8828 13.8833" stroke="#505050" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#505050" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Button>
            </Form.Group>
          </Form>
        </div>
        <div className='right-head-details'>
          <div className='listing-details-author d-flex align-items-center justify-content-end'>
            <ul className=' d-flex align-items-center gap-md-3 gap-2 mb-0 p-0 list-unstyled'>
              <li>
                <Chat />
              </li>
              <li>
                <Link href="" className='btn-box btn-dark'>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_31833)"><path fillRule="evenodd" clipRule="evenodd" d="M13.8532 0.145982C13.9218 0.214468 13.969 0.301399 13.989 0.396203C14.0091 0.491006 14.0012 0.589597 13.9662 0.679982L8.96625 13.68C8.93085 13.772 8.86906 13.8514 8.78864 13.9084C8.70822 13.9654 8.61275 13.9973 8.51423 14.0002C8.41571 14.0031 8.31853 13.9768 8.23491 13.9246C8.15129 13.8725 8.08496 13.7967 8.04425 13.707L5.95325 9.10698L9.02925 6.02998C9.16173 5.88781 9.23385 5.69976 9.23042 5.50546C9.22699 5.31116 9.14828 5.12577 9.01087 4.98836C8.87345 4.85095 8.68807 4.77224 8.49377 4.76881C8.29947 4.76538 8.11142 4.8375 7.96924 4.96998L4.89225 8.04598L0.292245 5.95598C0.202212 5.91532 0.126242 5.8489 0.0739231 5.7651C0.0216042 5.6813 -0.00471863 5.58388 -0.00172314 5.48514C0.00127235 5.3864 0.0334519 5.29075 0.0907541 5.21028C0.148056 5.12981 0.227913 5.06811 0.320245 5.03298L13.3202 0.0329824C13.4105 -0.00174309 13.5089 -0.00955065 13.6035 0.0105056C13.6981 0.0305618 13.7848 0.0776212 13.8532 0.145982Z" fill="white" /></g><defs><clipPath id="clip0_558_31833"><rect width="14" height="14" fill="white" /></clipPath></defs></svg>
                </Link>
              </li>
              <li>
                <Link href="" className='btn-box'>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.25 10.3663V8.75H15V10.625C15 10.7907 15.0659 10.9497 15.1831 11.0669L16.875 12.7587V13.75H3.125V12.7587L4.81687 11.0669C4.93409 10.9497 4.99996 10.7907 5 10.625V8.125C4.99837 7.2468 5.2285 6.38372 5.66716 5.62292C6.10583 4.86212 6.73748 4.23054 7.49833 3.79197C8.25919 3.35341 9.12229 3.12337 10.0005 3.12511C10.8787 3.12685 11.7409 3.3603 12.5 3.80188V2.40375C11.905 2.14037 11.2723 1.97247 10.625 1.90625V0.625H9.375V1.90625C7.83411 2.06308 6.4061 2.7857 5.36711 3.93436C4.32811 5.08303 3.75194 6.57615 3.75 8.125V10.3663L2.05812 12.0581C1.94091 12.1753 1.87504 12.3343 1.875 12.5V14.375C1.875 14.5408 1.94085 14.6997 2.05806 14.8169C2.17527 14.9342 2.33424 15 2.5 15H6.875V15.625C6.875 16.4538 7.20424 17.2487 7.79029 17.8347C8.37634 18.4208 9.1712 18.75 10 18.75C10.8288 18.75 11.6237 18.4208 12.2097 17.8347C12.7958 17.2487 13.125 16.4538 13.125 15.625V15H17.5C17.6658 15 17.8247 14.9342 17.9419 14.8169C18.0592 14.6997 18.125 14.5408 18.125 14.375V12.5C18.125 12.3343 18.0591 12.1753 17.9419 12.0581L16.25 10.3663ZM11.875 15.625C11.875 16.1223 11.6775 16.5992 11.3258 16.9508C10.9742 17.3025 10.4973 17.5 10 17.5C9.50272 17.5 9.02581 17.3025 8.67417 16.9508C8.32254 16.5992 8.125 16.1223 8.125 15.625V15H11.875V15.625Z" fill="#7A7A7A" /><path d="M16.25 7.5C17.6307 7.5 18.75 6.38071 18.75 5C18.75 3.61929 17.6307 2.5 16.25 2.5C14.8693 2.5 13.75 3.61929 13.75 5C13.75 6.38071 14.8693 7.5 16.25 7.5Z" fill="#EE4B4B" /></svg>
                </Link>
              </li>
            </ul>
            <div className='right-head-details d-md-flex align-items-center gap-2 position-relative' ref={dropdownRef}>
              {loading ? (
                <div className="spinner-border text-primary spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <>
                  <div
                    className='img-admin border-0 cursor-pointer'
                    onClick={() => shouldShowDropdown && setShowDropdown(!showDropdown)}
                    style={{ cursor: shouldShowDropdown ? 'pointer' : 'default' }}
                  >
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
                          backgroundColor: '#ff8c00',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: shouldShowDropdown ? 'pointer' : 'default'
                        }}
                      >
                        {userData?.username?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className='author-details d-md-block d-none'>
                    <h6>{userData?.username}</h6>
                    <p>{userData?.category}</p>
                  </div>

                  {shouldShowDropdown && showDropdown && (
                    <div className="user-dropdown-menu">
                      <div
                        className="user-dropdown-item"
                        onClick={handleSettingsClick}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01131 9.77251C4.28062 9.5799 4.48574 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>Settings</span>
                            </div>
                            <div 
                                className="user-dropdown-item"
                                onClick={handleLogout}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17L21 12L16 7" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 12H9" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </>
              )}
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

export default TopHeaderStudent
