"use client";
import React, { useState } from 'react';
import { X, Upload, Calendar, Music, FileText, BookOpen, Users } from 'lucide-react';
import { useRouter } from "next/navigation";  // ✅ import router

export default function CreateAssignmentModal() {
  const [isOpen, setIsOpen] = useState(true);

  const [practiceStudio, setPracticeStudio] = useState('yes');
  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    description: '',
    song: 'Wonderwall (Ver 1)',
    others: '',
    course: '',
    class: '',
    speed: '25%',
    metronome: '25%',
    loop: 'Set A',
    musicSheet: null,
    assignmentFile: null
  });
  const router = useRouter(); // ✅ init router

  const courses = [
    'Guitar Basics',
    'Piano Fundamentals',
    'Vocal Training',
    'Music Theory',
    'Advanced Composition'
  ];

  const classes = [
    'Class A - Beginner',
    'Class B - Intermediate',
    'Class C - Advanced',
    'Class D - Professional'
  ];

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your submit logic here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => router.push("/tutor/assignments")}  // ✅ go back if backdrop clicked
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 border-b border-purple-500">
          <button
            onClick={() => router.push("/tutor/assignments")}  // ✅ go back if backdrop clicked
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Create New Assignment</h2>
          <p className="text-purple-100 text-sm">Fill in the details below to create a new assignment for students</p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
          <div className="p-8 space-y-6">
            {/* Assignment Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                placeholder="e.g., Midterm Project"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Course and Class - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Course */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-600" />
                  Select Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="">Choose a course</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Select Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-purple-600" />
                  Select Class
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="">Choose a class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" />
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            {/* Assignment Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment Description
              </label>
              <textarea
                placeholder="Please watch knowledge hub video."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Select Song */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Music size={16} className="text-purple-600" />
                Select Song
              </label>
              <select
                value={formData.song}
                onChange={(e) => setFormData({...formData, song: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem'
                }}
              >
                <option>Wonderwall (Ver 1)</option>
                <option>Stairway to Heaven</option>
                <option>Hotel California</option>
                <option>Sweet Child O' Mine</option>
              </select>
            </div>

            {/* Others (Specify) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Others (Specify)
              </label>
              <input
                type="text"
                placeholder="-"
                value={formData.others}
                onChange={(e) => setFormData({...formData, others: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Assignment on Practice Studio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Assignment on Practice Studio
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPracticeStudio('yes')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    practiceStudio === 'yes'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeStudio('no')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    practiceStudio === 'no'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Speed and Metronome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Speed
                </label>
                <select
                  value={formData.speed}
                  onChange={(e) => setFormData({...formData, speed: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option>25%</option>
                  <option>50%</option>
                  <option>75%</option>
                  <option>100%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Metronome
                </label>
                <select
                  value={formData.metronome}
                  onChange={(e) => setFormData({...formData, metronome: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option>25%</option>
                  <option>50%</option>
                  <option>75%</option>
                  <option>100%</option>
                </select>
              </div>
            </div>

            {/* Loop */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loop
              </label>
              <select
                value={formData.loop}
                onChange={(e) => setFormData({...formData, loop: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem'
                }}
              >
                <option>Set A</option>
                <option>Set B</option>
                <option>Set C</option>
                <option>Set D</option>
              </select>
            </div>

            {/* Upload Music Sheet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Music Sheet (if any)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group">
                <Upload className="mx-auto mb-3 text-gray-400 group-hover:text-purple-600 transition-colors" size={40} />
                <p className="text-purple-600 font-medium mb-1">Upload Music Sheet</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
              </div>
            </div>

            {/* Upload Assignment File */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignment File (PDF, PNG, or other document)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer group">
                <Upload className="mx-auto mb-3 text-gray-400 group-hover:text-purple-600 transition-colors" size={40} />
                <p className="text-purple-600 font-medium mb-1">Upload a File</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">PDF, PNG, JPG, DOC up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Assignment
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c084fc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
      `}</style>
    </div>
  );
}