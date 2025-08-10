import React from "react";
import { Search, Send, Bell } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#FAF8F6] border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl text-[#505050]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={20}
          />
          <input
            type="text"
            placeholder="Search here"
            className="w-full pl-10  pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-[#505050]"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Send Icon */}
          <button
            aria-label="Send Message"
            type="button"
            className="p-3 bg-[#4200EA] text-white rounded-full cursor-pointer transition-colors"
          >
            <Send size={24} />
          </button>

          {/* Notification Bell */}
          <button
            aria-label="Notification bell"
            type="button"
            className="relative p-2 rounded-full bg-[#C4B0F9]/17 text-[#7A7A7A]  transition-colors"
          >
            <Bell size={32} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EE4B4B] rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#212121]">Sherry Wolf</p>
              <p className="text-sm text-[#505050]">Tutor</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
