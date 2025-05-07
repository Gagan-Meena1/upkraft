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
      description: "1-1 Counsellor session to scientifically assess talent areas, personalised session curated to maximise learning.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
    },
    {
      title: "Tutor Discovery",
      description: "Find the perfect mentor matching your learning style and goals through our advanced matching system.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
    },
    {
      title: "AI-Powered Analytics",
      description: "Visual audits and sentiment analysis for each session, providing detailed progress insights.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
    },
    {
      title: "AI Music Tutor",
      description: "Practice with our intelligent AI tutor that provides real-time feedback and personalized guidance.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
    },
    {
      title: "Live Practice Sessions",
      description: "Connect and practice with friends online in real-time collaborative sessions.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
    },
    {
      title: "Competition Ready",
      description: "Get prepared for national and international level competitions with expert guidance.",
      // icon: "/api/placeholder/64/64" // Icon placeholder
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
      {/* Font imports */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Overpass:wght@300;400;500;600;700&display=swap');
        
        h1, h2, h3, .heading-font {
          font-family: 'Syne', sans-serif;
          font-size: 25px;
          color: #ff7518;
           font-weight: 700;
        }
        
        p, .body-font {
          font-family: 'Overpass';
          font-size: 15px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="w-full py-2 px-8 flex justify-between items-center sticky top-0 bg-gray-200 backdrop-blur-md z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <img src="logo.png" alt="UpKraft Logo" className="w-36 h-auto" />
        </div>
        <div className="flex space-x-4">
          <Link href="/signup">
            <button className="px-6 py-2 bg-gray-900 text-gray-50 font-medium rounded-lg hover:bg-gray-800 transition body-font">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition body-font">
              Login
            </button>
          </Link>
        </div>
      </nav>

     {/* Hero Section */}
{/* Hero Section with Illustrations */}
<div className="w-full flex flex-col justify-center items-center text-center  md:py-20 pb-0 relative">
  <div className="w-full max-w-6xl flex items-center justify-center relative">
  
    
    {/* Illustrations arranged around content */}
    <div className="absolute w-full h-full">
      {/* Drummer - Top Center */}
      {/* Drummer - Top Left */}
<div className="hidden md:block absolute left-1/3 transform -translate-x-1/2 -translate-y-full top-24">
  <img
    src="Drum1.png"
    alt="Drum Set"
    className="w-48 h-auto"
  />
</div>

{/* Piano Player - Top Right */}
<div className="hidden md:block absolute right-1/3 transform translate-x-1/2 -translate-y-full top-24">
  <img
    src="P3.png"
    alt="Piano Player"
    className="w-48 h-auto"
  />
</div>
      
      {/* Guitarist - Left */}
      <div className="hidden mt-10 md:block w-64 absolute left-24 top-1/2 transform -translate-y-1/2">
        <img 
          src="womenWithGuitar1.png" 
          alt="Guitarist" 
          className="w-48 h-auto "
        />
      </div>
      
      {/* Ballet Dancer - Right */}
      <div className="hidden mt-10 md:block absolute right-24 top-1/2 transform -translate-y-1/2">
        <img 
          src="ballet1.png" 
          alt="Ballet Dancer" 
          className="w-48 h-auto"
        />
      </div>
    </div>
    
    {/* Central content */}
    <div className="mx-8 flex flex-col items-center z-10 pt-16 mt-20">
      <h1 className="text-5xl md:text-6xl heading-font font-bold mb-6 text-orange-500">Welcome to UpKraft</h1>
      <div className="max-w-2xl text-center mb-10 body-font">
        <p className="text-lg font-medium mb-2">
          Unified full stack <span className="font-semibold body-font">AI Tech driven Super App elevating</span>
        </p>
        <p className="text-lg font-medium mb-2 body-font">
          <span className="font-semibold body-font">after-school program experience</span> through quality, transparency,
        </p>
        <p className="text-lg font-medium body-font">
          and outcome driven focus to create leaders of tomorrow
        </p>
      </div>
      <Link href="/signup">
      <button
        className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gray-800 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-gray-600/50 border border-white/20"
      >
        <span className="text-lg">Get Started</span>
        <div
          className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
        >
          <div className="relative h-full w-10 bg-white/20"></div>
        </div>
      </button>
          </Link>
    </div>
  </div>
  
  {/* Musical Notes Footer */}
  <div className="w-full overflow-hidden mt-10 p-0 mb-0">
    <div className="flex ">
      <div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div>
      <div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div><div className="w-full">
        <img 
          src="musicalNotes.png" 
          alt="Musical Notes" 
          className="w-16 h-auto"
        />
      </div>
    </div>
  </div>
</div>

      {/* Features Section */}
      <div className="w-full flex flex-col items-center bg-white py-24 px-8">
        <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12">Why Choose UpKraft</h2>
        
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
                <div className="flex justify-center mb-4">
                  {/* <img src={feature.icon} alt={feature.title} className="rounded-full bg-orange-100 p-2" /> */}
                </div>
                <h3 className="heading-font font-semibold mb-4 text-center">{feature.title}</h3>
                <p className="body-font text-gray-600 text-center">{feature.description}</p>
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
        <div className="mb-8">
          <img src="logo.png" alt="UpKraft Icon Light" className="mx-auto" />
        </div>
        <h2 className="heading-font text-3xl font-bold mb-6" style={{ color: '#df7861' }}>Ready to transform your learning journey?</h2>
        <p className="body-font text-gray-300 max-w-2xl mb-10">
          Join thousands of students who have already discovered their potential with UpKraft's innovative platform.
        </p>
        <Link href="/signup">
          <button className="px-8 py-3 bg-gray-50 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition body-font">
            Get Started
          </button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <img src="logo.png" alt="UpKraft Logo" className="mb-2" />
            {/* <div className="font-bold text-xl heading-font" style={{ color: '#df7861' }}>UpKraft</div> */}
          </div>
          <div className="flex space-x-8 text-gray-600">
            <a href="#" className="hover:text-gray-900 body-font">About</a>
            <a href="#" className="hover:text-gray-900 body-font">Features</a>
            <a href="#" className="hover:text-gray-900 body-font">Pricing</a>
            <a href="#" className="hover:text-gray-900 body-font">Contact</a>
          </div>
          <div className="mt-6 md:mt-0 text-gray-500 body-font">
            <div className="flex space-x-4 mb-4 justify-center">
              <a href="#"><img src="facebook.png" alt="Facebook" className="w-6 h-auto"/></a>
              <a href="#"><img src="twitter.png" alt="Twitter" className="w-6 h-auto" /></a>
              <a href="#"><img src="instagram .png" alt="Instagram" className="w-6 h-auto" /></a>
            </div>
            © 2025 UpKraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}