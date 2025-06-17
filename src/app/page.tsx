"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Chat from './components/Chat';

export default function Home() {
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

 const features = [
  {
    title: "Scientific Talent Assessment",
    description: "Discover your musical DNA through AI-powered 1-on-1 counseling sessions that scientifically identify your natural talent areas and optimal learning pathways .",
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
      carouselRef.current.scrollTo({
        left: activeCard * 320,
        behavior: 'smooth'
      });
    }
  }, [activeCard]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900"style={{ backgroundColor: '#fbf5ee' }}>
      {/* Font imports */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

        /* Typography System */
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

        /* Legacy classes for compatibility */
        h1, h2, h3, .heading-font {
          font-family: 'Manrope', sans-serif;
          color: #ff8d57;
          font-weight: 700;
        }

        p, .body-font, body, input, button, textarea, select {
          font-family: 'Lato', sans-serif;
        }

        .lato-semibold {
          font-family: 'Lato', sans-serif;
          font-weight: 600;
        }

        .lato-normal {
          font-family: 'Lato', sans-serif;
          font-weight: 400;
        }
        
        .playfair-display {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      {/* Navigation */}
      <nav className="w-full py-2 px-8 flex justify-between items-center sticky top-0 bg-gray-200 backdrop-blur-md z-100"style={{ backgroundColor: '#fbf5ee' }}>
        <div className="font-extrabold text-2xl text-gray-800">
          <Link href="/" className="cursor-pointer">
            <Image 
              src="/logo.png"
              alt="UpKraft"
              width={288}
              height={72}
              priority
              className="object-contain w-36 h-auto" 
            />
          </Link>
        </div>
        <div className="flex space-x-4 body-text">
          <Link href="/signup">
            <button className="px-6 py-2 text-gray-900 font-medium rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200 body-text-semibold">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 text-gray-900 font-medium rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200 body-text-semibold">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full h-screen relative mt-0.5"style={{ backgroundColor: '#fbf5ee' }}>
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
      <div className="w-full flex flex-col items-center bg-white py-24 px-8 relative overflow-hidden"style={{ backgroundColor: '#fbf5ee' }}>
        {/* Content */}
        <div className="relative w-full flex flex-col items-center"style={{ backgroundColor: '#fbf5ee' }}>
          <h1 className="heading-primary text-5xl md:text-6xl lg:text-6xl xl:text-5xl text-center mb-12">
            <span>Why Choose </span>
            <span className="accent">UpKraft</span>
            <span className="accent">?</span>
          </h1>  
          
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
                  <div className="flex justify-center mb-4 text-3xl">
                    {feature.icon}
                  </div>
                  <h4 className="heading-secondary text-xl mb-4 text-center">{feature.title}</h4>
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

      

      {/* Exclusive Benefits for Tutors */}
      <div className="w-full flex flex-col lg:flex-row items-center relative overflow-hidden py-16 lg:py-0 lg:min-h-screen">
        {/* Horizontal semicircle Background behind image */}
        <div 
          className="absolute left-1/4 bottom-1/10 transform -translate-x-1/2 bg-[#ff8d57] opacity-20"
          style={{ 
            width: '700px', 
            height: '400px',
            borderRadius: '300px 300px 0 0'
          }}
        />
        
        {/* Left Half - Image */}
        <div className="w-full lg:w-1/2 h-64 lg:h-screen relative flex items-center justify-center mb-8 lg:mb-0 z-10">
          <div 
            className="w-full max-w-md lg:w-4/5 h-full lg:h-4/5 bg-cover bg-center bg-no-repeat rounded-2xl shadow-2xl"
            style={{
              backgroundImage: 'url("/tutor.png")',
            }}
          />
        </div>
        
        {/* Right Half - Content */}
        <div className="w-full lg:w-1/2 px-8 lg:px-12 relative z-10">
          <div className="max-w-lg mx-auto lg:mx-0">
            <h2 className="heading-primary text-3xl lg:text-4xl mb-12">
              <span>Exclusive Benefits for </span>
              <span className="accent">Tutors</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">👥</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Enroll New Students</h3>
                  <p className="body-text">Enroll new students from Platform</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">💼</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Digital Administration</h3>
                  <p className="body-text">Digitalize Entire Administrative Tutor Tasks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">📊</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">AI Quality Metrics</h3>
                  <p className="body-text">AI Enabled Class Quality Metrics, Personalized Insights into Teaching Methodology</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">AI Tutor Support</h3>
                  <p className="body-text">AI Tutor driving engagement with students to practice</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <a href="https://your-typeform-link-for-tutors.com" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 bg-[#ff8d57] text-white font-medium rounded-lg hover:bg-orange-700 transition body-text-semibold shadow-lg">
                  Express Interest
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Benefits for Customers */}
      <div className="w-full flex flex-col lg:flex-row-reverse items-center relative overflow-hidden py-16 lg:py-0 lg:min-h-screen "style={{ backgroundColor: '#fbf5ee' }}>
        {/* Horizontal semicircle Background behind image */}
        <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none">
         <div 
          className="absolute left-1/2 bottom-1/10 transform -translate-x-1/2 bg-[#ff8d57] opacity-20"
          style={{ 
            width: '700px', 
            height: '400px',
            borderRadius: '300px 300px 0 0'
          }}
        />
        </div>
        
        {/* Right Half - Image */}
        <div className="w-full lg:w-1/2 h-64 lg:h-screen relative flex items-center justify-center mb-8 lg:mb-0 z-10">
          <div 
            className="w-full max-w-md lg:w-4/5 h-full lg:h-4/5 bg-cover bg-center bg-no-repeat rounded-2xl shadow-2xl"
            style={{
              backgroundImage: 'url("/parents.png")',
              transform: 'scaleX(-1)'
            }}
          />
        </div>
        
        {/* Left Half - Content */}
        <div className="w-full lg:w-1/2 px-8 lg:px-12 relative z-10">
          <div className="max-w-lg mx-auto lg:mx-0">
            <h2 className="heading-primary text-3xl lg:text-4xl mb-12 lg:whitespace-nowrap">
              <span>Exclusive Benefits for </span>
              <span className="accent">Customers</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">🔍</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Quality Tutor Discovery</h3>
                  <p className="body-text">Seamless Quality Tutor Discovery</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Talent Assessment</h3>
                  <p className="body-text">1-1 Counsellor Session to identify Talent Areas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">📈</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Competition Ready</h3>
                  <p className="body-text">Curriculum Visibility with Performance Dashboards</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">🎓</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">AI Engagement Support</h3>
                  <p className="body-text">AI Tutor support on Engagement and Practice in between classes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#ff8d57] text-lg">⭐</span>
                </div>
                <div>
                  <h3 className="heading-tertiary text-lg mb-2">Quality Insights</h3>
                  <p className="body-text">AI driven class quality Insights ensuring high tutor delivery standards</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <a href="https://your-typeform-link-for-customers.com" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 bg-[#ff8d57] text-white font-medium rounded-lg hover:bg-orange-700 transition body-text-semibold shadow-lg">
                  Express Interest
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="w-full py-24 px-8 bg-gradient-to-r from-orange-50 to-orange-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="heading-primary text-4xl lg:text-5xl mb-6">
            <span>Ready to Transform Your </span>
            <span className="accent">Extracurricular Journey</span>
            <span>?</span>
          </h2>
          <p className="body-text text-lg lg:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of musicians who have already discovered their potential with UpKraft's AI-powered platform.
          </p>
          <div className="flex justify-center">
            <a href="/signup" target="_blank" rel="noopener noreferrer">
              <button className="px-10 py-4 bg-[#ff8d57] text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 body-text-semibold shadow-lg text-lg">
                Get Started Today
              </button>
            </a>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff8d57] rounded-full opacity-10"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#ff8d57] rounded-full opacity-10"></div>
        </div>
      </div>

      {/* Add Chat component */}
      <Chat />

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-12 px-8"style={{ backgroundColor: '#fbf5ee' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="cursor-pointer">
              <Image 
                src="/logo.png"
                alt="UpKraft"
                width={288}
                height={72}
                priority
                className="object-contain w-36 h-auto" 
              />
            </Link>
          </div>
          <div className="flex space-x-8 text-gray-600">
            <a href="#" className="hover:text-gray-900 body-text">About</a>
            <a href="#" className="hover:text-gray-900 body-text">Features</a>
            <a href="#" className="hover:text-gray-900 body-text">Pricing</a>
            <a href="#" className="hover:text-gray-900 body-text">Contact</a>
          </div>
          <div className="mt-6 md:mt-0 text-gray-500">
            <div className="flex space-x-4 mb-4 justify-center">
              <a href="#"><img src="facebook.png" alt="Facebook" className="w-6 h-auto"/></a>
              <a href="#"><img src="twitter.png" alt="Twitter" className="w-6 h-auto" /></a>
              <a href="#"><img src="instagram .png" alt="Instagram" className="w-6 h-auto" /></a>
            </div>
            <p className="body-text text-center">© 2025 UpKraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}