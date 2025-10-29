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
}

const KnowledgeHubAdmin = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    youtubeId: '',
    courseTitle: '',
    thumbnail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const extractYoutubeId = (url: string): string => {
    // Extract YouTube ID from various URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/  // Direct ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url; // Return as-is if no pattern matches
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const extractedId = extractYoutubeId(value);
    setFormData(prev => ({
      ...prev,
      youtubeId: extractedId
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
        thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Video added successfully!' });
        // Reset form
        setFormData({
          title: '',
          description: '',
          youtubeId: '',
          courseTitle: '',
          thumbnail: ''
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add video. Please try again.' 
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
          <p className="text-gray-600">Add new videos to the knowledge hub</p>
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
                YouTube Video URL or ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="youtubeUrl"
                onChange={handleYoutubeUrlChange}
                placeholder="https://youtube.com/watch?v=VIDEO_ID or just VIDEO_ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              {formData.youtubeId && (
                <p className="mt-2 text-sm text-gray-600">
                  Extracted ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formData.youtubeId}</span>
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
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
                placeholder="Enter video description with emojis, line breaks, etc."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can use emojis, line breaks, and bullet points
              </p>
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
              <p className="mt-1 text-xs text-gray-500">
                If left empty, will automatically use YouTube's thumbnail
              </p>
            </div>

            {/* Preview */}
            {formData.youtubeId && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={formData.thumbnail || `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
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
                  Adding Video...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Video to Knowledge Hub
                </>
              )}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to add a video:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Copy the YouTube video URL or just the video ID</li>
            <li>Paste it in the "YouTube Video URL or ID" field</li>
            <li>Fill in the title (required) and other optional fields</li>
            <li>Click "Add Video to Knowledge Hub"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubAdmin;