"use client";
import React, { useState } from 'react';
import { Plus, Youtube, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface VideoFormData {
  title: string;
  description: string;
  youtubeId: string;
  courseTitle: string;
  thumbnail?: string;
  contentType: 'video' | 'short'; // NEW
}

const KnowledgeHubAdmin = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    youtubeId: '',
    courseTitle: '',
    thumbnail: '',
    contentType: 'video' // NEW DEFAULT
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const extractYoutubeId = (url: string): { id: string, type: 'video' | 'short' } => {
    // YouTube Shorts pattern
    const shortsPattern = /(?:youtube\.com\/shorts\/)([^&\s?]+)/;
    const shortsMatch = url.match(shortsPattern);
    if (shortsMatch) {
      return { id: shortsMatch[1], type: 'short' };
    }

    // Regular video patterns
    const videoPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/  // Direct ID
    ];

    for (const pattern of videoPatterns) {
      const match = url.match(pattern);
      if (match) return { id: match[1], type: 'video' };
    }
    
    return { id: url, type: 'video' }; // Default to video
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const { id: extractedId, type } = extractYoutubeId(value);
    setFormData(prev => ({
      ...prev,
      youtubeId: extractedId,
      contentType: type // AUTO-DETECT
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/Api/knowledgeHub', {
        title: formData.title,
        description: formData.description,
        youtubeId: formData.youtubeId,
        courseTitle: formData.courseTitle,
        contentType: formData.contentType, // NEW
        thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `${formData.contentType === 'short' ? 'Short' : 'Video'} added successfully!` });
        // Reset form
        setFormData({
          title: '',
          description: '',
          youtubeId: '',
          courseTitle: '',
          thumbnail: '',
          contentType: 'video'
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add content. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Youtube size={32} className="text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Hub Admin</h1>
          </div>
          <p className="text-gray-600">Add videos and shorts to the knowledge hub</p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube URL/ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video/Short URL or ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="youtubeUrl"
                onChange={handleYoutubeUrlChange}
                placeholder="https://youtube.com/watch?v=... or https://youtube.com/shorts/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              {formData.youtubeId && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Extracted ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formData.youtubeId}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: <span className={`font-semibold ${formData.contentType === 'short' ? 'text-purple-600' : 'text-blue-600'}`}>
                      {formData.contentType === 'short' ? '🎬 Short' : '🎥 Video'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Content Type Manual Override */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="video">🎥 Regular Video</option>
                <option value="short">🎬 YouTube Short</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Auto-detected from URL. Change manually if needed.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.contentType === 'short' ? 'Short' : 'Video'} Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={`Enter ${formData.contentType} title`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Course Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="e.g., Beginner Guitar Lessons"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description with emojis, line breaks, etc."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Custom Thumbnail (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Thumbnail URL (Optional)
              </label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Leave empty to use YouTube's thumbnail"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Preview */}
            {formData.youtubeId && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className={`rounded-lg overflow-hidden bg-gray-100 ${
                  formData.contentType === 'short' ? 'aspect-[9/16] max-w-xs mx-auto' : 'aspect-video'
                }`}>
                  <img
                    src={formData.thumbnail || `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding {formData.contentType === 'short' ? 'Short' : 'Video'}...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add {formData.contentType === 'short' ? 'Short' : 'Video'} to Knowledge Hub
                </>
              )}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to add content:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Copy the YouTube video or short URL</li>
            <li>Paste it - the type will be auto-detected</li>
            <li>Fill in title and other fields</li>
            <li>Click "Add to Knowledge Hub"</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-xs text-blue-700 font-medium mb-2">Supported URL formats:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Videos: youtube.com/watch?v=ID or youtu.be/ID</li>
              <li>• Shorts: youtube.com/shorts/ID</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubAdmin;