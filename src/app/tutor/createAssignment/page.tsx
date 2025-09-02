"use client"

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, Clock, ArrowLeft, FileText, X, ChevronDown } from 'lucide-react';

export default function CreateAssignment() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedSong, setSelectedSong] = useState('Wonderwall (Ver 1)');
  const [otherSong, setOtherSong] = useState('');
  const [practiceStudio, setPracticeStudio] = useState(true);
  const [speed, setSpeed] = useState('25%');
  const [metronome, setMetronome] = useState('25%');
  const [loop, setLoop] = useState('Set A');
  const [musicSheetFile, setMusicSheetFile] = useState<File | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [musicSheetFileName, setMusicSheetFileName] = useState('');
  const [assignmentFileName, setAssignmentFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const songOptions = [
    'Wonderwall (Ver 1)',
    'Stairway to Heaven',
    'Hotel California',
    'Sweet Child O Mine',
    'Other'
  ];

  const speedOptions = ['25%', '50%', '75%', '100%'];
  const metronomeOptions = ['25%', '50%', '75%', '100%'];
  const loopOptions = ['Set A', 'Set B', 'Set C', 'Full Song'];
  
  const handleMusicSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMusicSheetFile(e.target.files[0]);
      setMusicSheetFileName(e.target.files[0].name);
    }
  };

  const handleAssignmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAssignmentFile(e.target.files[0]);
      setAssignmentFileName(e.target.files[0].name);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const classId = urlParams.get('classId');
      const courseId = urlParams.get('courseId');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('selectedSong', selectedSong === 'Other' ? otherSong : selectedSong);
      formData.append('practiceStudio', practiceStudio.toString());
      formData.append('speed', speed);
      formData.append('metronome', metronome);
      formData.append('loop', loop);
      formData.append('classId', classId || '');
      formData.append('courseId', courseId || '');
      
      if (musicSheetFile) {
        formData.append('musicSheetFile', musicSheetFile);
      }
      
      if (assignmentFile) {
        formData.append('assignmentFile', assignmentFile);
      }
      
      const response = await fetch(`/Api/assignment?classId=${classId}&courseId=${courseId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      if (courseId) {
        router.push(`/tutor/courses/${courseId}`);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className='w-full'>
      <Head>
        <title>Create Assignment</title>
      </Head>
      
      <div className="w-full min-h-screen bg-white">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-purple-600">Create New Assignment</h1>
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 mb-8">Fill the details below to create a new assignments for students</p>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* Assignment Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Enter assignment title ( e.g., Midterm Project )"
              />
            </div>
            
            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <div className="relative">
                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
            
            {/* Assignment Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                placeholder="Please watch knowledge hub video."
              />
            </div>
            
            {/* Select Song */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Song
              </label>
              <div className="relative">
                <select
                  value={selectedSong}
                  onChange={(e) => setSelectedSong(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
                >
                  {songOptions.map((song) => (
                    <option key={song} value={song}>{song}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Others (Specify) - Show when "Other" is selected */}
            {selectedSong === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Others (Specify)
                </label>
                <input
                  type="text"
                  value={otherSong}
                  onChange={(e) => setOtherSong(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="-"
                />
              </div>
            )}
            
            {/* Assignment on Practice Studio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment on Practice Studio
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPracticeStudio(true)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    practiceStudio 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeStudio(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !practiceStudio 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Speed and Metronome - Show when Practice Studio is Yes */}
            {practiceStudio && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed
                  </label>
                  <div className="relative">
                    <select
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
                    >
                      {speedOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metronome
                  </label>
                  <div className="relative">
                    <select
                      value={metronome}
                      onChange={(e) => setMetronome(e.target.value)}
                      className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
                    >
                      {metronomeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            )}

            {/* Loop - Show when Practice Studio is Yes */}
            {practiceStudio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loop
                </label>
                <div className="relative">
                  <select
                    value={loop}
                    onChange={(e) => setLoop(e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
                  >
                    {loopOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            )}
            
            {/* Upload Music Sheet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Music Sheet (If any)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Upload size={24} className="text-purple-600" />
                  </div>
                  <label htmlFor="music-sheet-upload" className="cursor-pointer">
                    <span className="text-purple-600 hover:text-purple-700 font-medium">Upload Music Sheet</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input 
                      id="music-sheet-upload" 
                      name="music-sheet-upload" 
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="sr-only" 
                      onChange={handleMusicSheetChange}
                    />
                  </label>
                </div>
              </div>
              {musicSheetFileName && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileText size={16} className="mr-2 text-purple-400" />
                  {musicSheetFileName}
                </div>
              )}
            </div>

            {/* Upload Assignment File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment File (PDF, PNG, or other document)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Upload size={24} className="text-purple-600" />
                  </div>
                  <label htmlFor="assignment-file-upload" className="cursor-pointer">
                    <span className="text-purple-600 hover:text-purple-700 font-medium">Upload a File</span>
                    <span className="text-gray-500"> or drag and drop</span>
                    <input 
                      id="assignment-file-upload" 
                      name="assignment-file-upload" 
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="sr-only" 
                      onChange={handleAssignmentFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF, PNG, JPG, DOC up to 10MB
                  </p>
                </div>
              </div>
              {assignmentFileName && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileText size={16} className="mr-2 text-purple-400" />
                  {assignmentFileName}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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