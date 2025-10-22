"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, Pencil, X } from "lucide-react";

interface Curriculum {
  _id: string;
  title: string;
  description: string;
}

interface Course {
  _id: string;
  title: string;
  instructorId: string;
  description: string;
  duration: string;
  price: number;
  curriculum: Curriculum[];
  createdAt: string;
  updatedAt: string;
}

interface Tutor {
  _id: string;
  username: string;
  age: number;
  address: string;
  contact: string;
  email: string;
  category: string;
  courses: any[];
  education?: string;
  city?: string;
  skills?: string;
  experience?: number;
  studentsCoached?: number;
  teachingMode?: string;
  instagramLink?: string;
  // facebookLink?: string;
  // linkedInLink?: string;
  // youtubeLink?: string;
  profileImage?: string;
  aboutMyself?: string;
}

const teachingModeOptions = [
  { value: "", label: "Select Mode" },
  { value: "Online", label: "Online" },
  { value: "In-person", label: "In-person" },
  { value: "Both", label: "Both" },
  { value: "Hybrid", label: "Hybrid" },
];

const TutorProfilePage = () => {
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTutor, setEditedTutor] = useState<Tutor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch tutor info
  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        const response = await axios.get("/Api/tutors/tutorInfo");
        setTutor(response.data.tutor);
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching tutor info:", error);
        setError("Failed to load tutor information");
      } finally {
        setLoading(false);
      }
    };
    fetchTutorInfo();
  }, []);

  // Modal Handlers
  const openEditModal = () => {
    if (tutor) {
      setEditedTutor({ ...tutor });
      setPreviewImage(tutor.profileImage || null);
      setIsEditModalOpen(true);
    }
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedTutor(null);
    setProfileImageFile(null);
    setPreviewImage(null);
  };

  // Input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editedTutor) {
      setEditedTutor({
        ...editedTutor,
        [name]: value,
      });
    }
  };

  const handleProfileImageClick = () => fileInputRef.current?.click();

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

 const handleSaveChanges = async () => {
  if (!editedTutor) return;
  setIsSaving(true);

  try {
    const formData = new FormData();
    
    // Create a clean object with all fields
    const tutorData = {
      username: editedTutor.username,
      email: editedTutor.email,
      contact: editedTutor.contact,
      city: editedTutor.city,
      address: editedTutor.address,
      education: editedTutor.education,
      skills: editedTutor.skills,
      experience: editedTutor.experience,
      studentsCoached: editedTutor.studentsCoached, // Ensure this is included
      teachingMode: editedTutor.teachingMode, // Ensure this is included
      instagramLink: editedTutor.instagramLink,
      aboutMyself: editedTutor.aboutMyself,
    };
    
    formData.append("userData", JSON.stringify(tutorData));
    
    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    const response = await axios.put(
      `/Api/userUpdate?userId=${tutor?._id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setTutor(response.data.tutor);
    closeEditModal();
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    alert("Failed to update profile. Please try again.");
  } finally {
    setIsSaving(false);
  }
};

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6307c9]"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-500 text-xl">
        {error}
      </div>
    );

  if (!tutor)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500 text-xl">
        No tutor information available
      </div>
    );

  return (
    <>
      {/* Main Page Content */}
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isEditModalOpen ? "blur-sm scale-[0.99]" : ""}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 w-full top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
            <button
              onClick={openEditModal}
              className="flex items-center bg-[#6307c9] text-white px-4 py-2 rounded-md hover:bg-[#7a1fe6] transition-all shadow-sm"
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10">
          {/* Profile Header Section */}
          <div className="bg-gradient-to-r from-[#6307c9] to-[#8142d8] rounded-xl p-8 shadow-lg text-white mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {tutor.profileImage ? (
                    <Image
                      src={tutor.profileImage}
                      alt={tutor.username}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center text-[#6307c9] text-5xl font-bold">
                      {tutor.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{tutor.username}</h1>
                <p className="text-white text-opacity-90 text-lg">📧 {tutor.email}</p>
                <p className="text-white text-opacity-90 text-lg">📞 {tutor.contact}</p>
                <div className="flex space-x-4 mt-4 justify-center md:justify-start">
                  {tutor.instagramLink && <a href={tutor.instagramLink} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-pink-100 transition"><Instagram className="text-pink-600 w-5 h-5" /></a>}
                  {/* {tutor.facebookLink && <a href={tutor.facebookLink} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-blue-100 transition"><Facebook className="text-blue-600 w-5 h-5" /></a>}
                  {tutor.linkedInLink && <a href={tutor.linkedInLink} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-blue-200 transition"><Linkedin className="text-blue-700 w-5 h-5" /></a>}
                  {tutor.youtubeLink && <a href={tutor.youtubeLink} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full hover:bg-red-100 transition"><Youtube className="text-red-600 w-5 h-5" /></a>} */}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-[#6307c9] pl-3">
              Tutor Profile
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <InfoBox label="Tutor Name" value={tutor.username} />
                <InfoBox label="Relevant Education" value={tutor.education || "Not specified"} />
                <InfoBox label="City" value={tutor.city || tutor.address || "Not specified"} />
                <InfoBox label="Skill Expertise" value={tutor.skills || "Not specified"} />
                <InfoBox label="Teaching Experience (years)" value={tutor.experience || "Not specified"} />
                
              </div>
              <div className="space-y-4">
                <InfoBox label="Students Coached" value={tutor.studentsCoached || "Not specified"} />
                <InfoBox label="Teaching Mode" value={tutor.teachingMode || "Not specified"} />
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Myself</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tutor.aboutMyself || "No information provided."}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal (separate from page blur) */}
      {isEditModalOpen && editedTutor && (
        <EditModal
          editedTutor={editedTutor}
          previewImage={previewImage}
          fileInputRef={fileInputRef}
          handleProfileImageClick={handleProfileImageClick}
          handleProfileImageChange={handleProfileImageChange}
          handleInputChange={handleInputChange}
          handleSaveChanges={handleSaveChanges}
          closeEditModal={closeEditModal}
          isSaving={isSaving}
        />
      )}
    </>
  );
};

// InfoBox Component
const InfoBox = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-gray-100 rounded-lg p-4">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
    <p className="text-lg text-gray-800">{value}</p>
  </div>
);

// EditModal Component
const EditModal = ({
  editedTutor,
  previewImage,
  fileInputRef,
  handleProfileImageClick,
  handleProfileImageChange,
  handleInputChange,
  handleSaveChanges,
  closeEditModal,
  isSaving,
}: any) => (
  <div className="fixed inset-0 z-50 flex justify-center items-center">
    {/* Blur Background */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

    {/* Modal */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-5xl md:max-h-[95vh] overflow-y-auto z-10">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center z-20">
        <h3 className="text-2xl font-semibold text-gray-800">Edit Profile</h3>
        <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-8">
        {/* Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={handleProfileImageClick}
            className="relative w-36 h-36 rounded-full overflow-hidden cursor-pointer group border-4 border-dashed border-[#6307c9] hover:border-[#8142d8] transition-colors duration-300"
          >
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#6307c9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-500 mt-2">Add Photo</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" onChange={handleProfileImageChange} accept="image/*" className="hidden" />
        </div>

        {/* Form Sections */}
        <FormSection
          title="Basic Information"
          fields={[
            { name: "username", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "contact", label: "Contact Number", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "address", label: "Address/Academy", type: "text" },
            { name: "teachingMode", label: "Teaching Mode", type: "text" },
            { name: "studentsCoached", label: "Student Coached", type: "number" },
          ]}
          data={editedTutor}
          handleInputChange={handleInputChange}
        />

        <FormSection
          title="Professional Information"
          fields={[
            { name: "education", label: "Education", type: "text" },
            { name: "skills", label: "Skills", type: "text" },
            { name: "experience", label: "Experience (years)", type: "number" },
          ]}
          data={editedTutor}
          handleInputChange={handleInputChange}
        />

        <FormSection
          title="Social Media Links"
          fields={[
            { name: "instagramLink", label: "Instagram", type: "url", placeholder: "https://instagram.com/username" },
            // { name: "facebookLink", label: "Facebook", type: "url", placeholder: "https://facebook.com/username" },
            // { name: "linkedInLink", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/username" },
            // { name: "youtubeLink", label: "YouTube", type: "url", placeholder: "https://youtube.com/@username" },
          ]}
          data={editedTutor}
          handleInputChange={handleInputChange}
        />

        {/* About Me */}
        <div className="mt-6">
          <h4 className="font-bold text-gray-700 mb-3">About Me</h4>
          <textarea
            name="aboutMyself"
            value={editedTutor.aboutMyself || ""}
            onChange={handleInputChange}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6307c9] outline-none"
            placeholder="Share your experience, achievements, and style of teaching..."
          />
        </div>

        {/* Save Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={closeEditModal} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`px-6 py-2 bg-[#6307c9] text-white rounded-md hover:bg-[#7a1fe6] transition flex items-center ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Form Section Reusable Component
const FormSection = ({
  title,
  fields,
  data,
  handleInputChange,
}: {
  title: string;
  fields: { name: string; label: string; type: string; placeholder?: string }[];
  data: Tutor;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="mt-6 text-gray-800">
    <h4 className="font-bold text-gray-700 mb-4">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          {field.name === "teachingMode" ? (
            <select
              name="teachingMode"
              value={data.teachingMode || ""}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6307c9] outline-none"
            >
              {teachingModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={(data as any)[field.name] || ""}
              onChange={handleInputChange}
              placeholder={field.placeholder || ""}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6307c9] outline-none"
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

export default TutorProfilePage;
