"use client"

import { useState } from 'react';
import { Link2, Users, Gift } from 'lucide-react';

export default function ReferAndEarn() {
  const [activeTab, setActiveTab] = useState<'tutor' | 'student'>('tutor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    city: '',
    instrument: 'Piano',
    experience: '',
    contactTime: '',
    referralCode: ''
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your API call here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left Section - Form */}
          <div className="flex-1 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Refer & Earn</h1>

            {/* Tabs */}
            <div className="flex gap-0 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('tutor')}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === 'tutor' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Refer Tutor
                {activeTab === 'tutor' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('student')}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === 'student' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Refer Student
                {activeTab === 'student' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                )}
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email id"
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="971xxxxxxx"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 text-gray-700 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City & Country
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Delhi, India"
                    className="w-full px-4 text-gray-700 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Instrument
                  </label>
                  <div className="relative">
                    <select
                      name="instrument"
                      value={formData.instrument}
                      onChange={handleChange}
                      className="w-full px-4 text-gray-700 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white text-sm pr-10"
                    >
                      <option value="Piano">Piano</option>
                      <option value="Guitar">Guitar</option>
                      <option value="Violin">Violin</option>
                      <option value="Drums">Drums</option>
                      <option value="Flute">Flute</option>
                      <option value="Saxophone">Saxophone</option>
                    </select>
                    <svg 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Time
                  </label>
                  <input
                    type="text"
                    name="contactTime"
                    value={formData.contactTime}
                    onChange={handleChange}
                    placeholder="4:00 PM"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="000000"
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-purple-600 text-white py-3.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors mt-6"
              >
                Submit and Send Invite
              </button>
            </div>
          </div>

          {/* Right Section - Info Card */}
          <div className="relative w-96">
            <div className="bg-purple-600 rounded-xl p-6 text-white sticky top-6">
              <div className="mb-5">
                <img
                  src="/tutorDashboard.png"
                  alt="Refer and Earn"
                  className="w-full h-48 object-contain rounded-lg"
                />
              </div>

              <h2 className="text-xl font-bold mb-2">Refer and Earn</h2>
              <p className="text-purple-100 text-sm mb-6 leading-relaxed">
                Invite friends and earn exclusive rewards for every successful referral!
              </p>

              <div className="space-y-5">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Share your referral link</h3>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      Invite your friends to join the upkraft using your unique referral link
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Your friend join</h3>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      When your friend joins upkraft through your shared link, they become a part of our community
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">You both earn reward</h3>
                    <p className="text-xs text-purple-100 leading-relaxed">
                      As a token of appreciation, both you and your friend will receive 40 credits each.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}