"use client";

import React, { useState } from 'react';
import { Plus, Book, Clock, DollarSign, FileText, List } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

interface CurriculumSession {
  sessionNo: number;
  topic: string;
  tangibleOutcome:string;
}

export default function CreateCoursePage(){
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [curriculum, setCurriculum] = useState<CurriculumSession[]>([
      { sessionNo: 1, topic: '',tangibleOutcome:'' }
    ]);

  const addCurriculumSession = () => {
    setCurriculum([
      ...curriculum, 
      { sessionNo: curriculum.length + 1, topic: '',tangibleOutcome:'' }
    ]);
  };

  const updateCurriculumSession = (index: number, field: 'topic' | 'tangibleOutcome', value: string) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index][field] = value;
    setCurriculum(newCurriculum);
  };
  const handleSubmit = async (e: React.FormEvent) => {
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
          description,
          duration,
          price: parseFloat(price),
          curriculum
        })
      });

      if (!response.ok) {
        // Handle non-200 responses
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }

      // Show success toast
      toast.success('Course created successfully!', {
        duration: 3000,
        position: 'top-right'
      });

      // Reset form and redirect
      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      setDuration('');
      setPrice('');
      setCurriculum([{ sessionNo: 1, topic: '' ,tangibleOutcome:''}]);

      // Optional: Redirect to dashboard or course list
      router.push('/tutor/courses');

    } catch (error) {
//       // Handle errors
      console.error('Course creation error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred', {
        duration: 3000,
        position: 'top-right'
      });
      setIsSubmitting(false);
     }
 };

  return (
    <div className="min-h-screen bg-gray-400 text-gray-800 p-6">
      {/* Add Toaster component for notifications */}
      <Toaster />

      <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-lg rounded-xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 drop-shadow-md">Create New Course</h1>
          <Link href="/tutor">
            <button className="gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:from-pink-500 hover:to-blue-500 transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>
        

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Book className="text-pink-500 " size={24} />
              <label className="text-gray-800 font-semibold">Course Title</label>
            </div>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title (e.g., Advanced Web Development)"
              className="w-full bg-white/30 backdrop-blur-lg text-gray-800 placeholder-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          {/* Course Description */}
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-blue-500" size={24} />
              <label className="text-gray-800 font-semibold">Course Description</label>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive description of the course"
              className="w-full bg-white/30 backdrop-lg text-gray-800 placeholder-blue-500 p-3 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Duration and Price */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="bg-white/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-green-500" size={24} />
                <label className="text-gray-800 font-semibold">Course Duration</label>
              </div>
              <input 
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Total course duration (e.g., 4 weeks)"
                className="w-full bg-white/30 backdrop-blur-lg text-gray-800 placeholder-green-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Price */}
            <div className="bg-white/20 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="text-yellow-200" size={24} />
                <label className="text-gray-800 font-semibold">Course Price</label>
              </div>
              <input 
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Course price in INR"
                className="w-full bg-white/30 backdrop-blur-lg text-gray-800 placeholder-yellow-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Curriculum */}
          <div className="bg-white/20 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <List className="text-purple-500" size={24} />
                <label className="text-gray-800 font-semibold">Curriculum</label>
              </div>
              <button 
                type="button"
                onClick={addCurriculumSession}
                className="bg-gray-500 text-gray-800 px-3 py-1 rounded-lg flex items-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-colors"
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
                  className="w-20 bg-white/30 text-center text-gray-800 p-2 rounded-lg"
                />
                <input 
  type="text"
  value={session.topic}
  onChange={(e) => updateCurriculumSession(index, 'topic', e.target.value)}
  placeholder={`Enter topic for Session ${session.sessionNo}`}
  className="flex-1 bg-white/30 backdrop-blur-lg text-gray-800 placeholder-purple-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
  required
/>
<input 
  type="text"
  value={session.tangibleOutcome}
  onChange={(e) => updateCurriculumSession(index, 'tangibleOutcome', e.target.value)}
  placeholder={`Enter tangible outcome for Session ${session.sessionNo}`}
  className="flex-1 bg-white/30 backdrop-blur-lg text-gray-800 placeholder-purple-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className={`bg-gray-500  text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-gray-500 hover:to-blue-500 transition-colors'}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}