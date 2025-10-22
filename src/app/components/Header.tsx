'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoHeader from '@/assets/LogoHeader copy.png';

const Header = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  // Detect section in view while scrolling
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');

    const handleScroll = () => {
      if (window.scrollY > 30) setIsSticky(true);
      else setIsSticky(false);

      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll on click
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      const offset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSection(id);
    }
  };

  return (
    <div className={`header-section ${isSticky ? 'sticky' : ''}`}>
      <div className='menu-container'>
        <div className="side-menu-box justify-content-between d-flex align-items-center gap-2">
          <div className="img-logo">
            <Link href="/" className="logo d-block">
              <img src={LogoHeader.src} alt="logo" width="120" />
            </Link>
          </div>

          <div
            className="offcanvas offcanvas-start menu-canvash"
            tabIndex={-1}
            id="offcanvasExample"
            aria-labelledby="offcanvasExampleLabel"
          >
            <div className="offcanvas-header d-none">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">Menu</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body">
              <div className="side-menu">
                <ul className="list-unstyled p-0 m-0 d-flex justify-content-center">
                  <li>
                    <a
                      href="#learners"
                      onClick={(e) => scrollToSection(e, 'learners')}
                      className={`d-flex align-items-center gap-2 p-0 ${activeSection === 'learners' ? 'active' : ''}`}
                    >
                      <span>Learners</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tutors"
                      onClick={(e) => scrollToSection(e, 'tutors')}
                      className={`d-flex align-items-center gap-2 p-0 ${activeSection === 'tutors' ? 'active' : ''}`}
                    >
                      <span>Tutors</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#schools"
                      onClick={(e) => scrollToSection(e, 'schools')}
                      className={`d-flex align-items-center gap-2 p-0 ${activeSection === 'schools' ? 'active' : ''}`}
                    >
                      <span>Academies</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#schools"
                      onClick={(e) => scrollToSection(e, 'schools')}
                      className={`d-flex align-items-center gap-2 p-0 ${activeSection === 'schools' ? 'active' : ''}`}
                    >
                      <span>Schools</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="log-out-btn">
            <ul className="d-flex align-items-center gap-2 list-unstyled p-0 m-0">
              <li>
                <button
                  className="btn btn-primary landing-primary"
                  onClick={() => router.push('/signup')}
                >
                  <span>Sign Up</span>
                </button>
              </li>
              <li>
                <button
                  className="btn btn-primary landing-primary"
                  onClick={() => router.push('/login')}
                >
                  <span>Login</span>
                </button>
              </li>
              <li className="btn-menu-mobile d-lg-none d-block">
                <button
                  className="btn btn-menu border-0"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasExample"
                  aria-controls="offcanvasExample"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z"
                      fill="#6E09BD"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
