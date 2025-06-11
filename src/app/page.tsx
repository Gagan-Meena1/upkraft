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
          {/* <img src="logo.png" alt="UpKraft Logo" className="w-36 h-auto" /> */}
          <Link href="/" className="cursor-pointer">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={288} // Use 2x the display size for crisp rendering
              height={72}  // Adjust based on your logo's actual aspect ratio
              priority
              className="object-contain w-36 h-auto" 
            />
          </Link>
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
      <div className="w-full h-screen relative mt-0.5">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="video.mp4" type="video/mp4" />
          {/* <source src="hero-video.webm" type="video/webm" /> */}
          Your browser does not support the video tag.
        </video>
      </div>

     {/* Features Section */}
      <div className="w-full flex flex-col items-center bg-white py-24 px-8 relative overflow-hidden">
          {/* Background Image with Opacity */}
          <div 
            className="absolute inset-0 bg-cover  bg-no-repeat"
            style={{
              backgroundImage: 'url("/bg1.png")', // Replace with your image path
              opacity: 0.7
            }}
          />
      
  {/* Optional: Dark overlay for better text readability */}
  <div className="absolute inset-0 bg-black/10" />
  
  {/* Content - with relative positioning to stay above background */}
  <div className="relative z-10 w-full flex flex-col items-center">
    <h2 className="heading-font text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
      Why Choose UpKraft
    </h2>
    
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
            className={`flex-shrink-0 w-full max-w-sm bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200 snap-center transition-all duration-300 ${activeCard === index ? 'scale-105' : 'scale-100'}`}
          >
            <div className="flex justify-center mb-4">
              {/* <img src={feature.icon} alt={feature.title} className="rounded-full bg-orange-100 p-2" /> */}
            </div>
            <h3 className="heading-font font-semibold mb-4 text-center text-gray-900">{feature.title}</h3>
            <p className="body-font text-gray-700 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              activeCard === index ? 'bg-gray-900 w-6' : 'bg-gray-400'
            }`}
            onClick={() => setActiveCard(index)}
          />
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-80 hover:opacity-100 hidden md:block shadow-lg"
        onClick={() => setActiveCard(prev => (prev === 0 ? features.length - 1 : prev - 1))}
      >
        ←
      </button>
      <button 
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-80 hover:opacity-100 hidden md:block shadow-lg"
        onClick={() => setActiveCard(prev => (prev === features.length - 1 ? 0 : prev + 1))}
      >
        →
      </button>
    </div>
  </div>
</div>

     

{/* Call to Action */}
<div className="w-full  text-gray-900 py-24 px-8 flex flex-col items-center text-center relative overflow-hidden">
  {/* Background Image with Opacity */}
<div 
  className="absolute inset-0 bg-cover bg-no-repeat"
  style={{
    backgroundImage: 'url("/bg1.png")',
    opacity: 0.7,
    transform: 'scaleX(-1) scaleY(-1)'
  }}
/>
  {/* Optional: Dark overlay for better text readability */}
  <div className="absolute inset-0 bg-black/10" />
  
  {/* Content - with relative positioning to stay above background */}
  <div className="relative z-10 flex flex-col items-center text-center">
    <h2 className="heading-font text-3xl font-bold mb-6" style={{ color: '#df7861' }}>
      Ready to transform your learning journey?
    </h2>
    <p className="body-font text-gray-900 max-w-2xl mb-10">
      Join thousands of students who have already discovered their potential with UpKraft's innovative platform.
    </p>
    <Link href="/signup">
      <button className="px-8 py-3 bg-gray-50 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition body-font shadow-lg">
        Get Started
      </button>
    </Link>
  </div>
</div>
      {/* Footer */}
      <footer className="w-full bg-gray-50 py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
          <Link href="/" className="cursor-pointer">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={288} // Use 2x the display size for crisp rendering
              height={72}  // Adjust based on your logo's actual aspect ratio
              priority
              className="object-contain w-36 h-auto" 
            />
          </Link>            {/* <div className="font-bold text-xl heading-font" style={{ color: '#df7861' }}>UpKraft</div> */}
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