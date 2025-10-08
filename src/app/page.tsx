"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Chat from './components/Chat';
import ExpressInterestModal from './components/ExpressInterestModal';
import CustomerInterestModal from './components/CustomerInterestModal';

export default function Home() {
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const features = [
    {
      title: "Scientific Talent Assessment",
      description: "Discover your musical DNA through AI-powered 1-on-1 counseling sessions that scientifically identify your natural talent areas and optimal learning pathways.",
      icon: "🎯"
    },
    {
      title: "Perfect Tutor Matching",
      description: "Our advanced matching algorithm connects you with ideal mentors based on your learning style, goals, and personality for seamless quality tutor discovery.",
      icon: "🤝"
    },
    {
      title: "AI Quality Metrics",
      description: "Get real-time insights with AI-enabled class quality metrics and personalized teaching methodology analysis ensuring high delivery standards.",
      icon: "📊"
    },
    {
      title: "Intelligent AI Tutor",
      description: "Practice with AI tutor support that drives engagement between classes, providing continuous learning assistance and practice guidance.",
      icon: "🤖"
    },
    {
      title: "Performance Dashboard",
      description: "Track your progress with comprehensive curriculum visibility and performance dashboards that visualize your musical growth journey.",
      icon: "📈"
    },
    {
      title: "Digital Administration",
      description: "Streamline your learning experience with digitalized administrative tasks and seamless platform integration for tutors and students.",
      icon: "⚡"
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
      const cardWidth = window.innerWidth < 768 ? window.innerWidth - 64 : 320;
      carouselRef.current.scrollTo({
        left: activeCard * (cardWidth + 24),
        behavior: 'smooth'
      });
    }
  }, [activeCard]);

 return (
    <div style={{
      all: 'revert',
      contain: 'layout style paint',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fbf5ee',
      color: '#1f2937',
      fontSize: '16px',
      lineHeight: '1.5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Only your page styles - nothing inherited */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

        .heading-primary {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #1f2937;
        }
        
        .heading-primary .accent {
          color: #ff8d57;
        }
        
        .heading-secondary {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          color: #ff8d57;
        }
        
        .heading-tertiary {
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          color: #1f2937;
        }

        .body-text {
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          color: #374151;
        }

        .body-text-semibold {
          font-family: 'Lato', sans-serif;
          font-weight: 600;
          color: #374151;
        }

        .playfair-display {
          font-family: 'Playfair Display', serif;
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .video-container {
            height: 60vh;
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Rest of your page content */}

      {/* Navigation */}
      <nav className="w-full py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 backdrop-blur-md z-50" style={{ backgroundColor: '#fbf5ee' }}>
        <div className="font-extrabold text-xl sm:text-2xl text-gray-800">
          <Link href="/" className="cursor-pointer">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={288}
              height={72}
              priority
              className="object-contain w-24 sm:w-32 lg:w-36 h-auto" 
            />
          </Link>
        </div>
        <div className="flex space-x-2 sm:space-x-4 body-text">
          <Link href="/signup">
            <button className="px-3 sm:px-6 py-2 text-gray-900 font-medium rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200 body-text-semibold text-sm sm:text-base">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-3 sm:px-6 py-2 text-gray-900 font-medium rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200 body-text-semibold text-sm sm:text-base">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="video-container mt-0.5" style={{ backgroundColor: '#fbf5ee' }}>
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Features Section */}
      <div className="w-full flex flex-col items-center bg-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#fbf5ee' }}>
        {/* Content */}
        <div className="relative w-full flex flex-col items-center" style={{ backgroundColor: '#fbf5ee' }}>
          <h1 className="heading-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-8 sm:mb-12 px-4">
            <span>Why Choose </span>
            <span className="accent">UpKraft</span>
            <span className="accent">?</span>
          </h1>  
          
          {/* Feature Cards Slider */}
          <div className="w-full max-w-7xl relative">
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 gap-4 sm:gap-6 px-4 sm:px-0"
            >
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`flex-shrink-0 w-72 sm:w-80 md:w-full md:max-w-sm bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 snap-center transition-all duration-300 ${activeCard === index ? 'scale-105' : 'scale-100'}`}
                >
                  <div className="flex justify-center mb-4 text-2xl sm:text-3xl">
                    {feature.icon}
                  </div>
                  <h4 className="heading-secondary text-lg sm:text-xl mb-4 text-center">{feature.title}</h4>
                  <p className="body-text text-center text-sm leading-relaxed">{feature.description}</p>
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
            
            {/* Navigation Arrows - Hidden on mobile */}
            <button 
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-80 hover:opacity-100 hidden lg:block shadow-lg"
              onClick={() => setActiveCard(prev => (prev === 0 ? features.length - 1 : prev - 1))}
            >
              ←
            </button>
            <button 
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 bg-gray-900 text-white p-2 rounded-full opacity-80 hover:opacity-100 hidden lg:block shadow-lg"
              onClick={() => setActiveCard(prev => (prev === features.length - 1 ? 0 : prev + 1))}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Exclusive Benefits for Tutors */}
      <div className="w-full flex flex-col lg:flex-row items-center relative overflow-hidden py-8 sm:py-12 lg:py-16 lg:min-h-screen">
        {/* Horizontal semicircle Background behind image */}
        <div 
          className="absolute left-1/4 bottom-1/10 transform -translate-x-1/2 bg-[#ff8d57] opacity-20 hidden sm:block"
          style={{ 
            width: '500px', 
            height: '300px',
            borderRadius: '250px 250px 0 0'
          }}
        />
        
        {/* Left Half - Image */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-screen relative flex items-center justify-center mb-8 lg:mb-0 z-10 px-4">
          <div 
            className="w-full max-w-xs sm:max-w-md lg:w-4/5 h-full lg:h-4/5 bg-cover bg-center bg-no-repeat rounded-2xl shadow-2xl"
            style={{
              backgroundImage: 'url("/tutor.png")',
            }}
          />
        </div>
        
        {/* Right Half - Content */}
        <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="max-w-lg mx-auto lg:mx-0">
            <h2 className="heading-primary text-2xl sm:text-3xl lg:text-4xl mb-8 sm:mb-12 text-center lg:text-left">
              <span>Exclusive Benefits for </span>
              <span className="accent">Tutors</span>
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">👥</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Enroll New Students</h3>
                  <p className="body-text text-sm sm:text-base">Enroll new students from Platform</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">💼</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Digital Administration</h3>
                  <p className="body-text text-sm sm:text-base">Digitalize Entire Administrative Tutor Tasks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">📊</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">AI Quality Metrics</h3>
                  <p className="body-text text-sm sm:text-base">AI Enabled Class Quality Metrics, Personalized Insights into Teaching Methodology</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">AI Tutor Support</h3>
                  <p className="body-text text-sm sm:text-base">AI Tutor driving engagement with students to practice</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 text-center lg:text-left">
              <button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#ff8d57] text-white font-medium rounded-lg hover:bg-orange-700 transition body-text-semibold shadow-lg text-sm sm:text-base"
                onClick={() => setIsModalOpen(true)}
              >
                Express Interest
              </button>
              <ExpressInterestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Benefits for Customers */}
      <div className="w-full flex flex-col lg:flex-row-reverse items-center relative overflow-hidden py-8 sm:py-12 lg:py-16 lg:min-h-screen" style={{ backgroundColor: '#fbf5ee' }}>
        {/* Horizontal semicircle Background behind image */}
        <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none">
          <div 
            className="absolute left-1/2 bottom-1/10 transform -translate-x-1/2 bg-[#ff8d57] opacity-20 hidden sm:block"
            style={{ 
              width: '500px', 
              height: '300px',
              borderRadius: '250px 250px 0 0'
            }}
          />
        </div>
        
        {/* Right Half - Image */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-screen relative flex items-center justify-center mb-8 lg:mb-0 z-10 px-4">
          <div 
            className="w-full max-w-xs sm:max-w-md lg:w-4/5 h-full lg:h-4/5 bg-cover bg-center bg-no-repeat rounded-2xl shadow-2xl"
            style={{
              backgroundImage: 'url("/parents.png")',
              transform: 'scaleX(-1)'
            }}
          />
        </div>
        
        {/* Left Half - Content */}
        <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="max-w-lg mx-auto lg:mx-0">
            <h2 className="heading-primary text-2xl sm:text-3xl lg:text-4xl mb-8 sm:mb-12 text-center lg:text-left">
              <span>Exclusive Benefits for </span>
              <span className="accent">Customers</span>
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">🔍</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Quality Tutor Discovery</h3>
                  <p className="body-text text-sm sm:text-base">Seamless Quality Tutor Discovery</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Talent Assessment</h3>
                  <p className="body-text text-sm sm:text-base">1-1 Counsellor Session to identify Talent Areas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">📈</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Competition Ready</h3>
                  <p className="body-text text-sm sm:text-base">Curriculum Visibility with Performance Dashboards</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">🎓</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">AI Engagement Support</h3>
                  <p className="body-text text-sm sm:text-base">AI Tutor support on Engagement and Practice in between classes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-base sm:text-lg">⭐</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-base sm:text-lg mb-2">Quality Insights</h3>
                  <p className="body-text text-sm sm:text-base">AI driven class quality Insights ensuring high tutor delivery standards</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 text-center lg:text-left">
              <button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#ff8d57] text-white font-medium rounded-lg hover:bg-orange-700 transition body-text-semibold shadow-lg text-sm sm:text-base"
                onClick={() => setIsCustomerModalOpen(true)}
              >
                Express Interest
              </button>
              <CustomerInterestModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
<div className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-orange-100 relative overflow-hidden">
  <div className="max-w-4xl mx-auto text-center relative z-10">
    <h2 className="heading-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 px-4">
      <span>Ready to Transform Your </span>
      <span className="accent block sm:inline">Extracurricular Journey</span>
      <span>?</span>
    </h2>
    <p className="body-text text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
      Join thousands of musicians who have already discovered their potential with UpKraft's AI-powered platform.
    </p>
    <div className="flex justify-center px-4">
      <a href="/signup" target="_blank" rel="noopener noreferrer">
        <button className="px-8 sm:px-10 py-3 sm:py-4 bg-[#ff8d57] text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 body-text-semibold shadow-lg text-base sm:text-lg">
          Get Started Today
        </button>
      </a>
    </div>
    
    {/* Copyright Notice */}
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-orange-200">
      <p className="text-sm sm:text-base text-orange-600/70">
        © 2025 Upkraft Technologies Private Limited. All rights reserved.
      </p>
    </div>
  </div>
  
  {/* Background decoration */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
    <div className="absolute -top-12 sm:-top-24 -left-12 sm:-left-24 w-24 sm:w-48 h-24 sm:h-48 bg-[#ff8d57] rounded-full opacity-10"></div>
    <div className="absolute -bottom-12 sm:-bottom-24 -right-12 sm:-right-24 w-24 sm:w-48 h-24 sm:h-48 bg-[#ff8d57] rounded-full opacity-10"></div>
  </div>
</div>

      {/* Add Chat component */}
      <Chat />
    </div>
  );
}