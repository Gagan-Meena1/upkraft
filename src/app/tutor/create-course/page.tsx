"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import type { IconProps } from 'lucide-react';
import { IndianRupee, Plus, Book, Clock, FileText, List, Tag, ChevronLeft } from 'lucide-react';
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
      const response = await fetch('/Api/tutors/courses', {
        method: 'POST',
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
        throw new Error('Failed to create course');
      }

      toast.success('Course created successfully!');
      router.push('/tutor/courses');
    } catch (error) {
      toast.error('Failed to create course. Please try again.');
      console.error('Error creating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Create New Course</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Course Title */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Book className="text-orange-500" size={24} />
              <label className="text-orange-500 font-semibold">Course Title</label>
            </div>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title (e.g., Advanced Web Development)"
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Course Category */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Tag className="text-orange-500" size={24} />
              <label className="text-orange-500 font-semibold">Course Category</label>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="Music">Music</option>
              <option value="Dance">Dance</option>
              <option value="Drawing">Drawing</option>
            </select>
          </div>

          {/* Course Description */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-orange-500" size={24} />
              <label className="text-orange-500 font-semibold">Course Description</label>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive description of the course"
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 h-32 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Duration and Price */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-orange-500" size={24} />
                <label className="text-orange-500 font-semibold">Course Duration</label>
              </div>
              <input 
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Total course duration (e.g., 4 weeks)"
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Price */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <IndianRupee className="text-orange-500" size={24} />
                <label className="text-orange-500 font-semibold">Price Per Class</label>
              </div>
              <input 
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Course price in INR"
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Curriculum */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <List className="text-orange-500" size={24} />
                <label className="text-orange-500 font-semibold">Curriculum</label>
              </div>
              <button 
                type="button"
                onClick={addCurriculumSession}
                className="bg-orange-100 text-orange-500 px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-orange-200 transition-colors"
              >
                <Plus size={16} /> Add Session
              </button>
            </div>
            {curriculum.map((session, index) => (
              <div key={session.sessionNo} className="flex gap-4 mb-3">
                <input 
                  type="number"
                  value={session.sessionNo}
                  readOnly
                  className="w-20 bg-gray-50 text-center text-gray-800 p-2 rounded-lg border border-gray-200"
                />
                <input 
                  type="text"
                  value={session.topic}
                  onChange={(e) => updateCurriculumSession(index, 'topic', e.target.value)}
                  placeholder={`Enter topic for Session ${session.sessionNo}`}
                  className="flex-1 bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <input 
                  type="text"
                  value={session.tangibleOutcome}
                  onChange={(e) => updateCurriculumSession(index, 'tangibleOutcome', e.target.value)}
                  placeholder={`Enter tangible outcome for Session ${session.sessionNo}`}
                  className="flex-1 bg-gray-50 text-gray-800 placeholder-gray-500 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 transition-colors'}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}