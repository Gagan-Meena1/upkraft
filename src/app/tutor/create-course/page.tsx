"use client";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { IndianRupee, Plus, Book, Clock, FileText, List, Tag, ChevronLeft, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

interface CurriculumSession {
  sessionNo: number;
  topic: string;
  tangibleOutcome: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [curriculum, setCurriculum] = useState<CurriculumSession[]>([
    { sessionNo: 1, topic: '', tangibleOutcome: '' }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);

  const categories = ["Music", "Dance", "Drawing"];

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const edit = searchParams.get('edit');
    const id = searchParams.get('courseId');
    
    if (edit === 'true' && id) {
      setIsEditing(true);
      setCourseId(id);
      fetchCourseDetails(id);
    }
  }, []);

  const fetchCourseDetails = async (id: string) => {
    try {
      const response = await fetch(`/Api/tutors/courses/${id}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      
      const data = await response.json();
      const course = data.courseDetails;
      
      setTitle(course.title);
      setCategory(course.category);
      setDescription(course.description);
      setDuration(course.duration);
      setPrice(course.price.toString());
      setCurriculum(course.curriculum);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    }
  };

  const addSession = () => {
    setCurriculum([
      ...curriculum,
      {
        sessionNo: curriculum.length + 1,
        topic: '',
        tangibleOutcome: ''
      }
    ]);
  };

  const removeSession = (indexToRemove: number) => {
    if (curriculum.length <= 1) {
      toast.error('At least one session is required');
      return;
    }
    
    const updatedCurriculum = curriculum
      .filter((_, index) => index !== indexToRemove)
      .map((session, index) => ({
        ...session,
        sessionNo: index + 1
      }));
    
    setCurriculum(updatedCurriculum);
    toast.success('Session removed successfully');
  };

  const handleCurriculumChange = (index: number, field: string, value: string) => {
    const updatedCurriculum = [...curriculum];
    if (field === 'topic') {
      updatedCurriculum[index].topic = value;
    } else if (field === 'outcome') {
      updatedCurriculum[index].tangibleOutcome = value;
    }
    setCurriculum(updatedCurriculum);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = isEditing ? `/Api/tutors/courses/${courseId}` : '/Api/tutors/courses';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          category,
          description,
          duration,
          price: parseFloat(price),
          curriculum
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update course' : 'Failed to create course');
      }

      toast.success(isEditing ? 'Course updated successfully!' : 'Course created successfully!');
      router.push('/tutor/courses');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toaster />
      <div className="bg-white rounded-xl w-full h-screen overflow-y-auto mt-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-semibold text-[#6F09BA]">Add Course</h2>
            <p className="text-sm text-gray-600 mt-1">Complete the form below to register a new student account</p>
          </div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Course Title */}
            <div>
              <label className="block font-inter font-medium text-[16px] text-[#212121] mb-2">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title ( e.g., Introduction to Piano )"
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Course Category */}
            <div>
              <label className="block font-inter font-medium text-[16px] text-[#212121] mb-2">Course Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Description */}
            <div>
              <label className="block font-inter font-medium text-[16px] text-[#212121] mb-2">Course Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive description of the course"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent resize-none text-gray-900"
                required
              />
            </div>

            {/* Course Duration */}
            <div>
              <label className="block font-inter font-medium text-[16px] text-[#212121] mb-2">Course Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Total course duration (e.g., 4 weeks )"
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Course Fees */}
            <div>
              <label className="block font-inter font-medium text-[16px] text-[#212121] mb-2">Course Fees</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Course price in INR"
                className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent text-gray-900"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Curriculum Section */}
            <div className="bg-gray-50 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-[#6F09BA] rounded-full mr-3"></span>
                  Course Curriculum
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 pb-2 border-b ">
                  <div className="col-span-1 text-center">Session</div>
                  <div className="col-span-5">Topic</div>
                  <div className="col-span-5">Learning Outcome</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Session Rows */}
                {curriculum.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center text-gray-800">
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="w-[84px] h-[56px] border border-[#DEE0E3] rounded-[4px] px-[25px] py-[16px] flex items-center justify-center text-sm font-medium text-[#6B7582]">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.topic}
                        onChange={(e) => handleCurriculumChange(index, "topic", e.target.value)}
                        placeholder={`Enter topic for Session ${index + 1}`}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.tangibleOutcome}
                        onChange={(e) => handleCurriculumChange(index, "outcome", e.target.value)}
                        placeholder="What will students achieve?"
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6F09BA] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {curriculum.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSession(index)}
                          className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                          title="Remove this session"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Session Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={addSession}
                    className="flex items-center space-x-2 px-4 py-2 text-[#6F09BA] border border-[#6F09BA] hover:bg-[#6F09BA] hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-none font-medium transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#6F09BA] text-white hover:bg-[#5A0799]'
              }`}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Course' : 'Add Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}