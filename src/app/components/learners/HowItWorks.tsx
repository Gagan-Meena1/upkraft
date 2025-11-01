"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Howitwork01 from "@/assets/how-it-work-01.png";
import Howitwork02 from "@/assets/how-it-work-02.png";
import Howitwork03 from "@/assets/how-it-work-03.png";

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const section = sectionRef.current;
            const items = gsap.utils.toArray(".work-item") as HTMLElement[];
            const counters = gsap.utils.toArray(".counter") as HTMLElement[];
            const line = ".line-counter";

            // Initial states - first item visible, others hidden
            gsap.set(items[0], { opacity: 1, y: 0 }); // ✅ First item already visible
            gsap.set(items.slice(1), { opacity: 0, y: -40 }); // Others hidden
            gsap.set(counters[0], { opacity: 1, scale: 1 }); // ✅ First counter visible
            gsap.set(counters.slice(1), { opacity: 0, scale: 0.8 }); // Others hidden
            gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

            // Master timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 80px",
                    end: "+=150%",
                    scrub: true,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                },
            });

            // Animate line to 33% (first section) - already there visually
            tl.to(line, { scaleX: 0.33, duration: 0.2, ease: "none" }, 0);

            // Step 1: Item 2 appears + line grows to 66%
            tl.to(items[1], { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.3);
            tl.to(counters[1], { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, 0.3);
            tl.to(line, { scaleX: 0.66, duration: 0.3, ease: "power2.out" }, 0.3);

            // Step 2: Item 3 appears + line completes to 100%
            tl.to(items[2], { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.7);
            tl.to(counters[2], { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, 0.7);
            tl.to(line, { scaleX: 1, duration: 0.3, ease: "power2.out" }, 0.7);
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="how-it-work relative overflow-hidden" ref={sectionRef}>
            <div className="container">
                <div className="heading-box text-start sticky-heading">
                    <h2>How it works</h2>
                </div>

                <div className="how-it-work-inner">
                    <div className="top-img-box text-how-it-work">
                        <div className="row">
                            <div className="col-md-4 work-item">
                                <div className="img-box">
                                    <img src={Howitwork01.src} alt="Find the Right Tutor" />
                                </div>
                                <div className="text-how-h">
                                    <h6>Find the Right Tutor</h6>
                                    <p>Browse profiles, book a consultation.</p>
                                </div>
                            </div>
                            <div className="col-md-4 work-item">
                                <div className="img-box">
                                    <img src={Howitwork02.src} alt="Build a Personalized Plan" />
                                </div>
                                <div className="text-how-h">
                                    <h6>Build a Personalized Plan</h6>
                                    <p>Tutors use smart templates for structured goals.</p>
                                </div>
                            </div>
                            <div className="col-md-4 work-item">
                                <div className="img-box">
                                    <img src={Howitwork03.src} alt="Practice Smart, Progress Fast" />
                                </div>
                                <div className="text-how-h">
                                    <h6>Practice Smart, Progress Fast</h6>
                                    <p>AI guides students; tutors track progress.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="line-min-dox">
                        <div className="row position-relative">
                            <span className="line-counter"></span>
                            <div className="col-md-4">
                                <div className="counter">1</div>
                            </div>
                            <div className="col-md-4">
                                <div className="counter">2</div>
                            </div>
                            <div className="col-md-4">
                                <div className="counter">3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
