"use client"

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, Clock, ArrowLeft, FileText, Music, Search, X } from 'lucide-react';

export default function CreateAssignment() {
  const router = useRouter();
  const searchTimeoutRef = useRef(null);
  const songInputRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New fields
  const [songName, setSongName] = useState('');
  const [customSongName, setCustomSongName] = useState('');
  const [practiceStudio, setPracticeStudio] = useState(false);
  const [speed, setSpeed] = useState('100%');
  const [metronome, setMetronome] = useState('100%');
  
  // Song search state
  const [songSearchResults, setSongSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSongResults, setShowSongResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  
  // Debounced song search
  useEffect(() => {
    if (songName.trim().length > 2 && !selectedSong) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        searchSongs(songName.trim());
      }, 600); // 0.6 second delay
    } else {
      setSongSearchResults([]);
      setShowSongResults(false);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [songName, selectedSong]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (songInputRef.current && !songInputRef.current.contains(event.target)) {
        setShowSongResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSongInputChange = (e) => {
    const value = e.target.value;
    setSongName(value);
    
    // If user starts typing after selecting a song, clear the selection
    if (selectedSong) {
      setSelectedSong(null);
    }
    
    // Show results only if typing and no song selected
    if (value.trim().length > 2) {
      setShowSongResults(true);
    }
  };
  
  const searchSongs = async (searchTerm) => {
    try {
      setIsSearching(true);
      const response = await fetch(`/Api/searchSong?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search songs');
      }
      
      const data = await response.json();
      setSongSearchResults(data.songs || []);
      setShowSongResults(true);
    } catch (error) {
      console.error('Error searching songs:', error);
      setSongSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setSongName(`${song.title} - ${song.artist}`);
    setShowSongResults(false);
    setSongSearchResults([]); // Clear search results
    setCustomSongName(''); // Clear custom song name when selecting from DB
  };
  
  const clearSongSelection = () => {
    setSelectedSong(null);
    setSongName('');
    setCustomSongName('');
    setSongSearchResults([]);
    setShowSongResults(false);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };
  
  const handleSubmit = async (e) => {
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
      formData.append('classId', classId || '');
      formData.append('courseId', courseId || '');
      
      // Add new fields
      const finalSongName = selectedSong 
        ? `${selectedSong.title} - ${selectedSong.artist}` 
        : customSongName;
      formData.append('songName', finalSongName);
      formData.append('practiceStudio', practiceStudio.toString());
      formData.append('speed', speed);
      formData.append('metronome', metronome);
      
      if (file) {
        formData.append('assignmentFile', file);
      }
      
      const response = await fetch(`/Api/assignment?classId=${classId}&courseId=${courseId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      // Redirect back to course page on success
      if (courseId) {
        router.push(`/tutor/courses/${courseId}`);
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
            
            {/* Song Search Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative" ref={songInputRef}>
                <label htmlFor="songName" className="block text-sm font-medium text-orange-600 mb-1">
                  Search Song from Library
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Music size={18} className="text-orange-400 pr-1" />
                  </div>
                  <input
                    id="songName"
                    type="text"
                    value={songName}
                    onChange={handleSongInputChange}
                    className="w-full pl-10 pr-10 px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Start typing song name or artist..."
                  />
                  {songName && (
                    <button
                      type="button"
                      onClick={clearSongSelection}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <X size={18} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showSongResults && !selectedSong && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {songSearchResults.length > 0 ? (
                      songSearchResults.map((song) => (
                        <button
                          key={song._id}
                          type="button"
                          onClick={() => handleSongSelect(song)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800">{song.title}</div>
                          <div className="text-sm text-gray-500">
                            {song.artist} • {song.genre} • {song.difficulty}
                          </div>
                        </button>
                      ))
                    ) : (
                      !isSearching && songName.length > 2 && (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No songs found. You can enter a custom song name in the field next to this.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              
              {/* Custom Song Name */}
              <div>
                <label htmlFor="customSongName" className="block text-sm font-medium text-orange-600 mb-1">
                  Or Enter Custom Song Name
                </label>
                <input
                  id="customSongName"
                  type="text"
                  value={customSongName}
                  onChange={(e) => setCustomSongName(e.target.value)}
                  disabled={selectedSong !== null}
                  className={`w-full px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                    selectedSong ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter song name manually..."
                />
                {selectedSong && (
                  <p className="text-xs text-gray-500 mt-1">
                    Clear the song search above to enable custom song entry
                  </p>
                )}
              </div>
            </div>
            
            {/* Practice Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="speed" className="block text-sm font-medium text-orange-600 mb-1">
                  Practice Speed
                </label>
                <select
                  id="speed"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  <option value="25%">25% - Very Slow</option>
                  <option value="50%">50% - Slow</option>
                  <option value="75%">75% - Medium</option>
                  <option value="100%">100% - Full Speed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="metronome" className="block text-sm font-medium text-orange-600 mb-1">
                  Metronome Speed
                </label>
                <select
                  id="metronome"
                  value={metronome}
                  onChange={(e) => setMetronome(e.target.value)}
                  className="w-full px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  <option value="25%">25% - Very Slow</option>
                  <option value="50%">50% - Slow</option>
                  <option value="75%">75% - Medium</option>
                  <option value="100%">100% - Full Speed</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="practiceStudio" className="flex items-center cursor-pointer">
                  <input
                    id="practiceStudio"
                    type="checkbox"
                    checked={practiceStudio}
                    onChange={(e) => setPracticeStudio(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    practiceStudio ? 'bg-orange-500' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      practiceStudio ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-orange-600">
                    Enable Practice Studio
                  </span>
                </label>
              </div>
            </div>
            
            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-orange-600 mb-1">
                Deadline
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="pr-2 text-orange-400" />
                </div>
                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full pl-95 px-4 py-3 text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
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