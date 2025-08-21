import React, { useState } from "react";
import { X, Upload, User } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: {
    name: string;
    email: string;
    contact: string;
    location: string;
    avatar: string;
  }) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    avatar: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Generate a random avatar from Pexels
      const avatarUrls = [
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
        "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=150",
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      ];

      const randomAvatar =
        avatarUrls[Math.floor(Math.random() * avatarUrls.length)];

      onAddStudent({
        ...formData,
        avatar: randomAvatar,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        contact: "",
        location: "",
        avatar: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl px-16 shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 scale-100 relative">
        {/* Header */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 absolute right-4 top-4"
        >
          <X size={30} className="text-black" />
        </button>
        <div className="flex items-center flex-col justify-between p-6 gap-2 mt-8">
          <h2 className="text-2xl font-semibold text-[#6E09BD]">
            Add New Student
          </h2>
          <p className="text-[16px] text-[#212121]">
            Complete the form below to register a new student account
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <User size={32} className="text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => alert("Upload avatar feature coming soon!")}
                aria-label="Upload Avatar"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors duration-200"
              >
                <Upload size={16} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[16px] font-medium text-[#212121] mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-sm  transition-all duration-200 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                }
                placeholder:text-[#6B7582] text-[#212121] text-[16px] font-normal
                `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-[16px] font-medium text-[#212121] mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@gmail.com"
                className={`w-full px-4 py-3 border rounded-sm  transition-all duration-200 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }
                placeholder:text-[#6B7582] text-[#212121] text-[16px] font-normal
                `}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contact"
                className="block text-[16px] font-medium text-[#212121] mb-2"
              >
                Contact Number
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="9179QXXXXX"
                className={`w-full px-4 py-3 border rounded-sm transition-all duration-200 ${
                  errors.contact
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }
                placeholder:text-[#6B7582] text-[#212121] text-[16px] font-normal
                `}
              />
              {errors.contact && (
                <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-[16px] font-medium text-[#212121] mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="China"
                className={`w-full px-4 py-3 border rounded-sm  transition-all duration-200 ${
                  errors.location
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }
                placeholder:text-[#6B7582] text-[#212121] text-[16px] font-normal
                `}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#6E09BD] hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-sm transition-colors duration-200 mt-6"
            >
              Add Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
