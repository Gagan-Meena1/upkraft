'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoMeeting from '@/app/components/VideoMeeting';

export default function VideoCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetingUrl, setMeetingUrl] = useState<string>('');

  // Cleanup function to remove any Daily.co iframes
  const cleanup = useCallback(() => {
    document.querySelectorAll('iframe[title*="daily"]').forEach(el => el.remove());
  }, []);

  useEffect(() => {
    const url = searchParams.get('url');
    if (!url) {
      router.push('/tutor'); // Redirect back if no URL provided
      return;
    }
    setMeetingUrl(url);

    // Add popstate event listener for browser back button
    const handlePopState = () => {
      cleanup();
      router.push('/tutor');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      cleanup();
    };
  }, [searchParams, router, cleanup]);

  const handleLeave = () => {
    cleanup();
    router.push('/tutor'); // Redirect back to tutor page when leaving
  };

  if (!meetingUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <VideoMeeting url={meetingUrl} onLeave={handleLeave} />
    </div>
  );
} 