"use client";
import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Video, Menu, X } from 'lucide-react';

// Types
interface VideoData {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  courseTitle: string;
  thumbnail?: string;
}

interface VideoCardProps {
  video: VideoData;
  onPlayVideo: (youtubeId: string, title: string) => void;
}

// Components
const VideoCard = ({ video, onPlayVideo }: VideoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  
  const titleNeedsTruncation = video.title.length > 60;
  const descriptionNeedsTruncation = video.description.length > 150;
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <button
            onClick={() => onPlayVideo(video.youtubeId, video.title)}
            className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors group"
          >
            <Play size={24} className="text-white ml-1" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {isTitleExpanded || !titleNeedsTruncation
                ? video.title
                : `${video.title.substring(0, 60)}...`}
            </h3>
            {titleNeedsTruncation && (
              <button
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
              >
                {isTitleExpanded ? 'Show Less' : 'See More'}
              </button>
            )}
          </div>
          <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
            Available
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen size={16} className="mr-2 text-orange-500" />
            <span className="font-medium">Course:</span>
            <span className="ml-1">{video.courseTitle}</span>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p className="whitespace-pre-line">
            {isExpanded || !descriptionNeedsTruncation
              ? video.description
              : `${video.description.substring(0, 150)}...`}
          </p>
          {descriptionNeedsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
            >
              {isExpanded ? 'Show Less' : 'See More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoModal = ({ 
  isOpen, 
  onClose, 
  youtubeId, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  youtubeId: string; 
  title: string;
}) => {
  if (!isOpen) return null;

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

// Main Component
const YouTubeVideoGallery: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ youtubeId: string; title: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Api/knowledgeHub');
        const data = await response.json();

        if (data.success) {
          const transformedVideos = data.data.map((video: any) => ({
            id: video._id,
            title: video.title,
            description: video.description || '',
            youtubeId: video.youtubeId,
            courseTitle: video.courseTitle || '',
            thumbnail: video.thumbnail || ''
          }));
          setVideos(transformedVideos);
        } else {
          setError('Failed to load videos');
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handlePlayVideo = (youtubeId: string, title: string) => {
    setSelectedVideo({ youtubeId, title });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Video size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex text-gray-900">
      <div className="flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 !text-[20px]">Video Gallery</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}
        </header>

        <main className="p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Video size={24} className="text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">YouTube Classes</h2>
              </div>
              <div className="text-sm text-gray-500">
                {videos.length} video{videos.length !== 1 ? 's' : ''} available
              </div>
            </div>

            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlayVideo={handlePlayVideo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available</h3>
                <p className="text-gray-600">Check back later for video lessons.</p>
              </div>
            )}
          </div>

          <VideoModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            youtubeId={selectedVideo?.youtubeId || ''}
            title={selectedVideo?.title || ''}
          />
        </main>
      </div>
    </div>
  );
};

export default YouTubeVideoGallery;