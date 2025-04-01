"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "Talent Identification",
      description: "1-1 Counsellor session to scientifically assess talent areas, personalised session curated to maximise learning."
    },
    {
      title: "Tutor Discovery",
      description: "Find the perfect mentor matching your learning style and goals through our advanced matching system."
    },
    {
      title: "AI-Powered Analytics",
      description: "Visual audits and sentiment analysis for each session, providing detailed progress insights."
    },
    {
      title: "AI Music Tutor",
      description: "Practice with our intelligent AI tutor that provides real-time feedback and personalized guidance."
    },
    {
      title: "Live Practice Sessions",
      description: "Connect and practice with friends online in real-time collaborative sessions."
    },
    {
      title: "Competition Ready",
      description: "Get prepared for national and international level competitions with expert guidance."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: activeCard * 320,
        behavior: 'smooth'
      });
    }
  }, [activeCard]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
        <img src="logo.png" alt="" className="w-36 h-auto" /></div>        <div className="flex space-x-4">
          <Link href="/signup">
            <button className="px-6 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full flex flex-col justify-center items-center text-center px-8 py-24 md:py-32">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-orange-600">Welcome to UPKRAFT</h1>
        <p className="text-lg max-w-2xl text-gray-700 mb-10">
          Unified full-stack AI-driven Tech platform elevating after-school program experience
          through quality, transparency, and outcome-driven focus to create leaders of tomorrow.
        </p>
        <Link href="/login">
      <button className="px-8 py-3 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition">
        Get Started
      </button>
    </Link>
      </div>

      {/* Features Section */}
      <div className="w-full flex flex-col items-center bg-white py-24 px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Why Choose UPKRAFT</h2>
        
        {/* Feature Cards Slider */}
        <div className="w-full max-w-6xl relative">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 gap-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 w-full max-w-sm bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 snap-center transition-all duration-300 ${activeCard === index ? 'scale-105' : 'scale-100'}`}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeCard === index ? 'bg-gray-900 w-6' : 'bg-gray-300'
                }`}
                onClick={() => setActiveCard(index)}
              />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-70 hover:opacity-100 hidden md:block"
            onClick={() => setActiveCard(prev => (prev === 0 ? features.length - 1 : prev - 1))}
          >
            ←
          </button>
          <button 
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-70 hover:opacity-100 hidden md:block"
            onClick={() => setActiveCard(prev => (prev === features.length - 1 ? 0 : prev + 1))}
          >
            →
          </button>
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full bg-gray-900 text-gray-50 py-24 px-8 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to transform your learning journey?</h2>
        <p className="text-lg text-gray-300 max-w-2xl mb-10">
          Join thousands of students who have already discovered their potential with UPKRAFT's innovative platform.
        </p>
        <Link href="/signup">
      <button className="px-8 py-3 bg-gray-50 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition">
        Get Started
      </button>
    </Link>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="font-bold text-xl text-gray-900 mb-6 md:mb-0">UPKRAFT</div>
          <div className="flex space-x-8 text-gray-600">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Features</a>
            <a href="#" className="hover:text-gray-900">Pricing</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
          <div className="mt-6 md:mt-0 text-gray-500">© 2025 UPKRAFT. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}