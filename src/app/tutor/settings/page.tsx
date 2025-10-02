"use client";

import { useState } from "react";

// Must match your Owner schema fields
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

const initialFormData: OwnerData = {
  firstName: "",
  lastName: "",
  gender: "Male",       // default
  language: "English",  // default
  email: "",
  dob: "",
  username: "",
  phone: "",
  address: "",
  pincode: "",
  education: "",
  expertise: "",
  instrument: "Piano",      // default
  teachingMode: "In Person",// default
  aboutMe: "",
};

export default function SettingsOwnerAccount() {
  const [formData, setFormData] = useState<OwnerData>(initialFormData);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Save Owner to backend
  const handleSave = async () => {
    try {
      const res = await fetch("/Api/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save owner");

      alert("Owner saved successfully!");
      setFormData(initialFormData);
    } catch (error) {
      console.error(error);
      alert("Error saving owner.");
    }
  };

  // Cancel → reset form
  const handleCancel = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-gray-100">
      {/* Left Section - Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Owner Account</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />

            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <SelectField label="Language" name="language" value={formData.language} onChange={handleChange} options={["English", "Spanish", "French"]} />

            <InputField type="email" label="Email" name="email" value={formData.email} onChange={handleChange} />
            <InputField type="date" label="DOB" name="dob" value={formData.dob} onChange={handleChange} />

            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} />
            <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />

            <InputField label="Relevant Education" name="education" value={formData.education} onChange={handleChange} />
            <InputField label="Expertise" name="expertise" value={formData.expertise} onChange={handleChange} />

            <SelectField label="Primary Instrument" name="instrument" value={formData.instrument} onChange={handleChange} options={["Piano", "Guitar", "Violin"]} />
            <SelectField label="Teaching Mode" name="teachingMode" value={formData.teachingMode} onChange={handleChange} options={["In Person", "Online", "Hybrid"]} />
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">About Me</label>
            <textarea
              name="aboutMe"
              rows={4}
              value={formData.aboutMe}
              onChange={handleChange}
              className="form-input resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button onClick={handleCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-8 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Profile Card */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {formData.firstName || "Owner"} {formData.lastName || ""}
              </h3>
              <p className="text-sm text-gray-500">Tutor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global styling for inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #D1D5DB;
          color: #374151;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 2px #C4B5FD;
        }
      `}</style>
    </div>
  );
}

// 🔹 Reusable Input Field
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="form-input"
      />
    </div>
  );
}

// 🔹 Reusable Select Field
function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="form-input"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
