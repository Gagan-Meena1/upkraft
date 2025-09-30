"use client";

import { useState, useEffect } from "react";

interface OwnerData {
  firstName: string;
  lastName: string;
  gender: string;
  language: string;
  email: string;
  dob: string;
  username: string;
  phone: string;
  address: string;
  pincode: string;
  education: string;
  expertise: string;
  instrument: string;
  teachingMode: string;
  aboutMe: string;
}

export default function SettingsOwnerAccount({ ownerId }: { ownerId: string }) {
  const [formData, setFormData] = useState<OwnerData>({
    firstName: "",
    lastName: "",
    gender: "Male",
    language: "English",
    email: "",
    dob: "",
    username: "",
    phone: "",
    address: "",
    pincode: "",
    education: "",
    expertise: "",
    instrument: "Piano",
    teachingMode: "In Person",
    aboutMe: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch owner data
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(`/Api/owner?id=${ownerId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch owner");

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "Male",
          language: data.language || "English",
          email: data.email || "",
          dob: data.dob || "",
          username: data.username || "",
          phone: data.phone || "",
          address: data.address || "",
          pincode: data.pincode || "",
          education: data.education || "",
          expertise: data.expertise || "",
          instrument: data.instrument || "Piano",
          teachingMode: data.teachingMode || "In Person",
          aboutMe: data.aboutMe || "",
        });

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchOwner();
  }, [ownerId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/Api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: ownerId, ...formData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save owner");
      alert("Owner settings saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving owner settings");
    }
  };

  const handleCancel = () => window.location.reload();

  if (loading) return <p>Loading owner data...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left Section - Form */}
          <div className="flex-1 bg-white rounded-lg p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">Owner Account</h1>

            <div className="space-y-5">
              {/* Grid Form */}
              {[
                ["firstName", "First Name", "text"],
                ["lastName", "Last Name", "text"],
                ["email", "Email", "email"],
                ["dob", "DOB", "date"],
                ["username", "Username", "text"],
                ["phone", "Phone", "tel"],
                ["address", "Address", "text"],
                ["pincode", "Pincode", "text"],
                ["education", "Relevant Education", "text"],
                ["expertise", "Expertise", "text"],
              ].map(([name, label, type]) => (
                <div className="grid grid-cols-2 gap-5" key={name}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name as keyof OwnerData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ))}

              {/* Selects */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Instrument</label>
                  <select
                    name="instrument"
                    value={formData.instrument}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option>Piano</option>
                    <option>Guitar</option>
                    <option>Violin</option>
                    <option>Drums</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Mode</label>
                  <select
                    name="teachingMode"
                    value={formData.teachingMode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option>In Person</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              {/* About Me */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <textarea
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Profile Card */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-sm text-gray-500">Tutor</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600">Owner profile connected with Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
