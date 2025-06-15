'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoMeeting from '@/app/components/VideoMeeting';

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white">Loading...</div>
    </div>
  );
}

// Separate component that uses useSearchParams
function VideoCallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetingUrl, setMeetingUrl] = useState<string>('');
  const isCleaningUp = useRef(false);

  // NUCLEAR cleanup - removes everything Daily.co related
  const nuclearCleanup = useCallback(() => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;
    
    console.log('[StudentVideoCallPage] NUCLEAR CLEANUP INITIATED');
    
    try {
      // 1. Remove ALL iframes (not just Daily.co ones)
      document.querySelectorAll('iframe').forEach(el => {
        console.log('[StudentVideoCallPage] Removing iframe:', el.src);
        el.remove();
      });
      
      // 2. Remove Daily.co specific elements
      document.querySelectorAll('[data-daily-js], [data-daily], .daily-js-frame').forEach(el => {
        console.log('[StudentVideoCallPage] Removing Daily element');
        el.remove();
      });
      
      // 3. Force exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      // 4. Clear any fixed/absolute positioned elements that might be Daily.co
      document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]').forEach(el => {
        if (el.innerHTML.includes('daily') || el.style.zIndex === '10' || el.style.zIndex === '9999') {
          console.log('[StudentVideoCallPage] Removing suspicious fixed element');
          el.remove();
        }
      });
      
      // 5. Reset body styles that Daily.co might have changed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.overflow = '';
      
      console.log('[StudentVideoCallPage] NUCLEAR CLEANUP COMPLETED');
    } catch (error) {
      console.error('[StudentVideoCallPage] Cleanup error:', error);
    }
    
    setTimeout(() => {
      isCleaningUp.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    const url = searchParams.get('url');
    if (!url) {
      router.back();
      return;
    }
    setMeetingUrl(url);

    // Intercept ALL navigation attempts
    const handleBeforeUnload = (event) => {
      console.log('[StudentVideoCallPage] BEFORE UNLOAD - Swipe detected!');
      nuclearCleanup();
    };

    const handleUnload = (event) => {
      console.log('[StudentVideoCallPage] UNLOAD - Cleaning up');
      nuclearCleanup();
    };

    const handlePageHide = (event) => {
      console.log('[StudentVideoCallPage] PAGE HIDE - Mobile swipe back');
      nuclearCleanup();
    };

    const handlePopState = (event) => {
      console.log('[StudentVideoCallPage] POPSTATE - Back navigation detected');
      event.preventDefault();
      event.stopPropagation();
      
      nuclearCleanup();
      
      // Force navigation after cleanup
      setTimeout(() => {
        window.history.back();
      }, 200);
    };

    // Add all event listeners
    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
    window.addEventListener('unload', handleUnload, { capture: true });
    window.addEventListener('pagehide', handlePageHide, { capture: true });
    window.addEventListener('popstate', handlePopState, { capture: true });

    // EXTRA: Watch for URL changes (Next.js routing)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      nuclearCleanup();
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      nuclearCleanup();
      return originalReplaceState.apply(history, args);
    };

    return () => {
      console.log('[StudentVideoCallPage] Component unmounting - Final cleanup');
      
      // Restore original history methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      
      // Remove all listeners
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
      window.removeEventListener('unload', handleUnload, { capture: true });
      window.removeEventListener('pagehide', handlePageHide, { capture: true });
      window.removeEventListener('popstate', handlePopState, { capture: true });
      
      nuclearCleanup();
    };
  }, [searchParams, router, nuclearCleanup]);

  const handleLeave = () => {
    console.log('[StudentVideoCallPage] Leave button clicked');
    nuclearCleanup();
    setTimeout(() => {
      router.back();
    }, 200);
  };

  if (!meetingUrl) {
    return <LoadingSpinner />;
  }

  // Log the values being passed to VideoMeeting
  const userRole = searchParams.get('userRole') || 'Student';
  console.log('[StudentVideoCallPage] Rendering VideoMeeting with:', {
    meetingUrl,
    userRole,
    token: searchParams.get('token')
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <VideoMeeting 
        url={meetingUrl} 
        userRole={userRole} 
        token={searchParams.get('token')}
        onLeave={handleLeave} 
      />
    </div>
  );
}

// Main component with Suspense boundary
export default function StudentVideoCallPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VideoCallContent />
    </Suspense>
  );
} 