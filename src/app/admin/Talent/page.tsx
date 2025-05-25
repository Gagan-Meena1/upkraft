"use client"

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, Clock, ArrowLeft, FileText } from 'lucide-react';

export default function CreateAssignment() {
  const router = useRouter();
  
  const [recommendation, setRecommendation] = useState('');
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
      const studentId = urlParams.get('studentId');
      
      const formData = new FormData();
      formData.append('recommendation', recommendation);
      formData.append('studentId', studentId || '');
      
      if (file) {
        formData.append('assignmentFile', file);
      }
      
      // Replace with your actual API endpoint
      const response = await fetch(`/Api/admin/talent?studentId=${studentId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      // Redirect back to course page on success
      if (studentId) {
        router.push(`/admin/students/studentInfo?studentId=${studentId}`);
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
      <title>Talent Identification Centre</title>
    </Head>
    
    <div className="w-full min-h-screen px-4 py-8 bg-gray-50">
    <button 
        onClick={() => router.back()} 
        className="flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        <span className="font-medium">Back</span>
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* <h1 className="text-3xl font-bold text-orange-500 mb-2">Create New Assignment</h1>
        <p className="text-gray-500 mb-8">Fill in the details below to create a new assignment for your students</p> */}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          
          {/* recommendation */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-orange-600 mb-1">
              Recommendation
            </label>
            <textarea
              id="description"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border text-gray-800 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Provide assignment instructions and requirements..."
            />
          </div>
          
          {/* Deadline */}
          <div>
           
           
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-orange-600 mb-1">
               File (PDF, PNG, or other document)
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
                  Submitting...
                </span>
              ) : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
   
  );
  
}