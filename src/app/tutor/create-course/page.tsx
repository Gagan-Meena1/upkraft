"use client";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import type { IconProps } from 'lucide-react';
import { IndianRupee, Plus, Book, Clock, FileText, List, Tag, ChevronLeft, X } from 'lucide-react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
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

  const addCurriculumSession = () => {
    setCurriculum([
      ...curriculum,
      {
        sessionNo: curriculum.length + 1,
        topic: '',
        tangibleOutcome: ''
      }
    ]);
  };

  const removeCurriculumSession = (indexToRemove: number) => {
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

  const updateCurriculumSession = (index: number, field: keyof CurriculumSession, value: string) => {
    const updatedCurriculum = [...curriculum];
    updatedCurriculum[index] = {
      ...updatedCurriculum[index],
      [field]: value
    };
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* Course Title */}
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Book className="text-purple-700" size={20} />
              <label className="text-purple-700 font-semibold text-sm sm:text-base">Course Title</label>
            </div>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title (e.g., Advanced Web Development)"
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              required
            />
          </div>

          {/* Course Category */}
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Tag className="text-purple-700" size={20} />
              <label className="text-purple-700 font-semibold text-sm sm:text-base">Course Category</label>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm sm:text-base"
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="Music">Music</option>
              <option value="Dance">Dance</option>
              <option value="Drawing">Drawing</option>
            </select>
          </div>

          {/* Course Description */}
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <FileText className="text-purple-700" size={20} />
              <label className="text-purple-700 font-semibold text-sm sm:text-base">Course Description</label>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive description of the course"
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 h-24 sm:h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base resize-none"
              required
            />
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Duration */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <Clock className="text-purple-700" size={20} />
                <label className="text-purple-700 font-semibold text-sm sm:text-base">Course Duration</label>
              </div>
              <input 
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Total course duration (e.g., 4 weeks)"
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm sm:text-base"
                required
              />
            </div>

            {/* Price */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <IndianRupee className="text-purple-700" size={20} />
                <label className="text-purple-700 font-semibold text-sm sm:text-base">Price Per Month</label>
              </div>
              <input 
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Course price in INR"
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Curriculum - Mobile Optimized */}
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <List className="text-purple-700" size={20} />
                <label className="text-purple-700 font-semibold text-sm sm:text-base">Curriculum</label>
              </div>
              <button 
                type="button"
                onClick={addCurriculumSession}
                className="bg-purple-100 text-purple-500 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors text-sm font-medium w-full sm:w-auto"
              >
                <Plus size={16} /> Add Lesson
              </button>
            </div>
            
            <div className="space-y-4">
              {curriculum.map((session, index) => (
                <div key={session.sessionNo} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                  {/* Mobile: Stacked Layout */}
                  <div className="block sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-medium">
                          Lesson {session.sessionNo}
                        </span>
                      </div>
                      {curriculum.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCurriculumSession(index)}
                          className="bg-red-100 text-red-500 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
                          title="Remove this Lesson"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
                      <input 
                        type="text"
                        value={session.topic}
                        onChange={(e) => updateCurriculumSession(index, 'topic', e.target.value)}
                        placeholder={`Enter topic for Lesson ${session.sessionNo}`}
                        className="w-full bg-white pl-10 text-gray-800 placeholder-gray-500 p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tangible Outcome</label>
                      <input 
                        type="text"
                        value={session.tangibleOutcome}
                        onChange={(e) => updateCurriculumSession(index, 'tangibleOutcome', e.target.value)}
                        placeholder={`Enter tangible outcome for Lesson ${session.sessionNo}`}
                        className="w-full pl-10 bg-white text-gray-800 placeholder-gray-500 p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm"
                        
                      />
                    </div>
                  </div>

                  {/* Desktop: Horizontal Layout */}
                  <div className="hidden sm:flex gap-4 items-start">
                    <input 
                      type="number"
                      value={session.sessionNo}
                      readOnly
                      className="w-20 pl-10 bg-gray-50 text-center text-gray-800 p-2 rounded-lg border border-gray-200 mt-1"
                    />
                    <input 
                      type="text"
                      value={session.topic}
                      onChange={(e) => updateCurriculumSession(index, 'topic', e.target.value)}
                      placeholder={`Enter topic for Lesson ${session.sessionNo}`}
                      className="flex-1 pl-10 bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm sm:text-base"
                      required
                    />
                    <input 
                      type="text"
                      value={session.tangibleOutcome}
                      onChange={(e) => updateCurriculumSession(index, 'tangibleOutcome', e.target.value)}
                      placeholder={`Enter tangible outcome for Lesson ${session.sessionNo}`}
                      className="flex-1 pl-10 bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-700 text-sm sm:text-base"
                      
                    />
                    {curriculum.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCurriculumSession(index)}
                        className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200 transition-colors mt-1"
                        title="Remove this session"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto bg-purple-700 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 transition-colors'}`}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Course' : 'Create Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}