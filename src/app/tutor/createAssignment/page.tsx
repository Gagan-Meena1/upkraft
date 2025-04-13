"use client"

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, Clock, ArrowLeft, FileText } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function CreateAssignment() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData to handle file upload
      const urlParams = new URLSearchParams(window.location.search);
      const classId = urlParams.get('classId');
      const courseId = urlParams.get('courseId');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('classId', classId || '');
      formData.append('courseId', courseId || '');
      
      if (file) {
        formData.append('assignmentFile', file);
      }
      
      // Replace with your actual API endpoint
      const response = await fetch('/Api/assignments/create', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      // Redirect back to course page on success
      if (courseId) {
        router.push(`/tutor/course/${courseId}`);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Handle error (show error message)
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    // <DashboardLayout>
    // <>
    <div className='w-full'>
    <Head>
      <title>Create Assignment</title>
    </Head>
    
    <div className="w-full min-h-screen px-4 py-8 bg-gray-50">
    <button 
        onClick={() => router.back()} 
        className="flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        <span className="font-medium">Back to Course</span>
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Create New Assignment</h1>
        <p className="text-gray-500 mb-8">Fill in the details below to create a new assignment for your students</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-orange-600 mb-1">
              Assignment Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="e.g., Midterm Project"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-orange-600 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border text-gray-800 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Provide assignment instructions and requirements..."
            />
          </div>
          
          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-orange-600 mb-1">
              Deadline
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={18} className="text-orange-400" />
              </div>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full pl-10 px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-orange-600 mb-1">
              Assignment File (PDF, PNG, or other document)
            </label>
            <div className="mt-1 flex items-center">
              <label className="w-full flex justify-center px-6 py-4 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText size={28} className="mx-auto text-orange-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer text-orange-500 hover:text-orange-600 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="sr-only" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG, DOC up to 10MB
                  </p>
                </div>
              </label>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileText size={16} className="mr-2 text-orange-400" />
                {fileName}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating Assignment...
                </span>
              ) : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
   
  );
  
}