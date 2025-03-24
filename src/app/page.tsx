import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-b from-pink-400 to-blue-500 flex flex-col items-center text-gray-900 relative">
        {/* Navigation Buttons */}
        <div className="absolute top-5 right-5 flex space-x-4">
          <Link href="/signup">
            <button className="px-6 py-2 bg-white text-pink-500 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
              Sign Up
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-2 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
              Login
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="h-screen w-full flex flex-col justify-center items-center text-white text-center px-8">
          <h1 className="text-6xl font-extrabold mb-4">Welcome to UPKRAFT</h1>
          <p className="text-lg max-w-3xl">
            Unified full-stack AI-driven Tech platform elevating after-school program experience
            through quality, transparency, and outcome-driven focus to create leaders of tomorrow.
          </p>
        </div>
        <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-pink-400 to-blue-500 shadow-xl rounded-t-3xl p-10 border border-gray-200">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">Why Choose UPKRAFT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {[{
            title: "Talent Identification",
            description: "1-1 Counsellor session to scientifically assess talent areas, personalised session curated to maximise learning."
          }, {
            title: "Tutor Discovery",
            description: "Find the perfect mentor matching your learning style and goals through our advanced matching system."
          }, {
            title: "AI-Powered Analytics",
            description: "Visual audits and sentiment analysis for each session, providing detailed progress insights."
          }, {
            title: "AI Music Tutor",
            description: "Practice with our intelligent AI tutor that provides real-time feedback and personalized guidance."
          }, {
            title: "Live Practice Sessions",
            description: "Connect and practice with friends online in real-time collaborative sessions."
          }, {
            title: "Competition Ready",
            description: "Get prepared for national and international level competitions with expert guidance."
          }].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md flex flex-col border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
