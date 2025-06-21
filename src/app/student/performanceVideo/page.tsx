"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Calendar, Clock, BookOpen, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/components/DashboardLayout';

// Types
interface UserData {
  _id?: string;
  username?: string;
  email?: string;
  category?: string;
  age?: number;
  address?: string;
  contact?: string;
  courses?: string[];
  isVerified?: boolean;
  isAdmin?: boolean;
  classes?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  class: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClassData {
  _id: string;
  title: string;
  description: string;
  course: string;
  instructor: number;
  startTime: string;
  endTime: string;
  performanceVideo?: string;
  performanceVideoFileId?: string;
  feedbackId: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoCardProps {
  classItem: ClassData;
  courseTitle: string;
  onPlayVideo: (videoUrl: string, title: string) => void;
}

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
    <div className="text-2xl font-light text-gray-800">Loading video gallery...</div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
    <div className="text-2xl text-red-500">{message}</div>
  </div>
);

const VideoCard = ({ 
  classItem, 
  courseTitle, 
  onPlayVideo 
}: VideoCardProps) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // Use the direct S3 URL for efficiency
  const videoUrl = classItem.performanceVideo || '';
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
        {!thumbnailError ? (
          <div className="relative w-full h-full">
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              onError={() => setThumbnailError(true)}
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={() => onPlayVideo(videoUrl, classItem.title)}
                className="bg-orange-500 rounded-full p-4 hover:bg-orange-600 transition-colors group"
              >
                <Play size={24} className="text-white ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-gradient-to-br from-orange-500/20 to-orange-600/30 flex items-center justify-center">
            <Video size={48} className="text-orange-500/60" />
            <button
              onClick={() => onPlayVideo(videoUrl, classItem.title)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors group"
            >
              <div className="bg-orange-500 rounded-full p-4 group-hover:bg-orange-600 transition-colors">
                <Play size={24} className="text-white ml-1" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
            {classItem.title}
          </h3>
          <span className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Available
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen size={16} className="mr-2 text-orange-500" />
            <span className="font-medium">Course:</span>
            <span className="ml-1">{courseTitle}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {classItem.description}
        </p>
      </div>
    </div>
  );
};

const VideoModal = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  videoUrl: string; 
  title: string;
}) => {
  if (!isOpen) return null;

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
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

// Main Component
const VideoGallery: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const handlePlayVideo = (videoUrl: string, title: string) => {
    setSelectedVideo({ url: videoUrl, title });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/Api/users/user");

        if (response.data?.user) {
          setUserData(response.data.user);
        }

        if (response.data?.courseDetails) {
          setCourseData(response.data.courseDetails);
        }

        if (response.data?.classDetails) {
          // Filter classes to only include those with performance videos
          const classesWithVideos = response.data.classDetails.filter((classItem: ClassData) => 
            classItem.performanceVideo && classItem.performanceVideo.trim() !== ''
          );
          setClassData(classesWithVideos);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch video gallery data");
        toast.error("Failed to load video gallery");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  // Helper function to get course title by ID
  const getCourseTitle = (courseId: string): string => {
    const course = courseData.find(c => c._id === courseId);
    return course?.title || 'Unknown Course';
  };

  return (
    <DashboardLayout 
      userData={userData || undefined} 
      userType="student"
      studentId={userData?._id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Video Gallery</h1>
      </div>

      {/* Video Gallery */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video size={24} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Recorded Classes</h2>
          </div>
          <div className="text-sm text-gray-500">
            {classData.length} recording{classData.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {classData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.map((classItem) => (
              <VideoCard
                key={classItem._id}
                classItem={classItem}
                courseTitle={getCourseTitle(classItem.course)}
                onPlayVideo={handlePlayVideo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available</h3>
            <p className="text-gray-600">Check back later for recorded class sessions.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
      />
    </DashboardLayout>
  );
};

export default VideoGallery;