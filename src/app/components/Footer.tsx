"use client";

import Image from "next/image";
import Link from "next/link";
import LogoHeader from "@/assets/LogoHeader copy.png";

const Footer = () => {
    const menuItems = [
        { href: "#learners", label: "Learners" },
        { href: "#tutors", label: "Tutors" },
        { href: "#schools", label: "Academies" },
        { href: "#schools", label: "Schools" },
    ];

    return (
        <footer className="footer-sec py-5 m-0">
            <div className="container">
                <div className="inner-footer d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">

                    {/* Logo and Description */}
                    <div className="footer-logo text-center text-lg-start">
                        <Link href="/" className="d-block mb-2">
                            <Image src={LogoHeader} alt="Logo" width={120} height={40} />
                        </Link>
                        <p className="m-0 p-0 text-muted">
                            Transform Your Music Journey with AI-Powered Tools for Tutors & Learners
                        </p>
                    </div>

                    {/* Footer Menu */}
                    <ul className="footer-menu list-unstyled d-flex flex-wrap justify-content-center gap-3 m-0 p-0">
                        {menuItems.map((item, index) => (
                            <li key={`${item.href}-${index}`}>
                                <Link href={item.href} className="footer-link">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Social Icons */}
                    <div className="footer-social">
                        <ul className="list-unstyled d-flex align-items-center gap-2 flex-wrap justify-content-center m-0 p-0">
                            {/* Facebook */}
                            <li>
                                <Link href="#" className="footer-social-link">
                                    <svg width="42" height="43" viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="21" cy="21.4404" r="21" fill="#FFC357" />
                                        <path d="M22.2012 12.9404H22.2031C22.859 12.9373 23.5147 12.9656 24.168 13.0225V14.9287H22.9844C22.2527 14.9287 21.677 15.1031 21.3096 15.54C20.9587 15.9574 20.8975 16.5037 20.8975 16.9883V19.5322H24.0049L23.7217 21.7412H20.8975V29.9375H18.585V21.7354H15.832V19.5264H18.5791V16.6719C18.5791 15.4062 18.9648 14.487 19.5752 13.8848C20.1872 13.2811 21.0808 12.9404 22.2012 12.9404Z" fill="black" stroke="#202020" />
                                    </svg>
                                </Link>
                            </li>

                            {/* Instagram */}
                            <li>
                                <Link href="https://www.instagram.com/upkraft_music/#" className="footer-social-link">
                                    <svg width="42" height="43" viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="21" cy="21.4404" r="21" fill="#FFC357" />
                                        <path d="M26 11.4404H16C13.2386 11.4404 11 13.679 11 16.4404V26.4404C11 29.2019 13.2386 31.4404 16 31.4404H26C28.7614 31.4404 31 29.2019 31 26.4404V16.4404C31 13.679 28.7614 11.4404 26 11.4404Z" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M26.5002 15.9404H26.5102M25.0002 20.8104C25.1236 21.6427 24.9815 22.4926 24.594 23.2394C24.2065 23.9862 23.5933 24.5918 22.8418 24.9701C22.0903 25.3484 21.2386 25.48 20.408 25.3464C19.5773 25.2127 18.81 24.8205 18.215 24.2256C17.6201 23.6307 17.2279 22.8633 17.0943 22.0326C16.9606 21.202 17.0923 20.3503 17.4705 19.5988C17.8488 18.8473 18.4544 18.2342 19.2012 17.8467C19.948 17.4592 20.7979 17.317 21.6302 17.4404C22.4791 17.5663 23.265 17.9619 23.8719 18.5687C24.4787 19.1756 24.8743 19.9615 25.0002 20.8104Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </li>

                            {/* LinkedIn */}
                            <li>
                                <Link href="https://www.linkedin.com/company/upkraft/" className="footer-social-link">
                                    <svg
                                        width="42"
                                        height="42"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle cx="12" cy="12" r="12" fill="#FFC357" />
                                        <path
                                            d="M6.94 9.5H9.06V17.5H6.94V9.5ZM8 8.4C7.27 8.4 6.7 7.83 6.7 7.1C6.7 6.37 7.27 5.8 8 5.8C8.73 5.8 9.3 6.37 9.3 7.1C9.3 7.83 8.73 8.4 8 8.4ZM10.56 9.5H12.54V10.65H12.57C13 10 13.8 9.28 15.14 9.28C17.62 9.28 18 11.05 18 13.26V17.5H15.88V13.84C15.88 12.5 15.87 10.87 14.12 10.87C12.35 10.87 12.23 12.23 12.23 13.74V17.5H10.11V9.5H10.56Z"
                                            fill="black"
                                        />
                                    </svg>
                                </Link>
                            </li>


                            {/* YouTube */}
                            <li>
                                <Link href="https://www.youtube.com/@UPKRAFTTECHNOLOGIES" className="footer-social-link">
                                    <svg width="42" height="43" viewBox="0 0 42 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="21" cy="21.4404" r="21" fill="#FFC357" />
                                        <path d="M17 15.4404L28 21.4404L17 27.4404V15.4404Z" fill="black" />
                                        <path d="M26 11.4404H16C13.2386 11.4404 11 13.679 11 16.4404V26.4404C11 29.2019 13.2386 31.4404 16 31.4404H26C28.7614 31.4404 31 29.2019 31 26.4404V16.4404C31 13.679 28.7614 11.4404 26 11.4404Z" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
