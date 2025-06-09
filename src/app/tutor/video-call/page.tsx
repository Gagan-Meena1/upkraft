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
    
    console.log('[VideoCallPage] NUCLEAR CLEANUP INITIATED');
    
    try {
      // 1. Remove ALL iframes (not just Daily.co ones)
      document.querySelectorAll('iframe').forEach(el => {
        console.log('[VideoCallPage] Removing iframe:', el.src);
        el.remove();
      });
      
      // 2. Remove Daily.co specific elements
      document.querySelectorAll('[data-daily-js], [data-daily], .daily-js-frame').forEach(el => {
        console.log('[VideoCallPage] Removing Daily element');
        el.remove();
      });
      
      // 3. Force exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      // 4. Clear any fixed/absolute positioned elements that might be Daily.co
      document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]').forEach(el => {
        if (el.innerHTML.includes('daily') || el.style.zIndex === '10' || el.style.zIndex === '9999') {
          console.log('[VideoCallPage] Removing suspicious fixed element');
          el.remove();
        }
      });
      
      // 5. Reset body styles that Daily.co might have changed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.overflow = '';
      
      console.log('[VideoCallPage] NUCLEAR CLEANUP COMPLETED');
    } catch (error) {
      console.error('[VideoCallPage] Cleanup error:', error);
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
      console.log('[VideoCallPage] BEFORE UNLOAD - Swipe detected!');
      nuclearCleanup();
    };

    const handleUnload = (event) => {
      console.log('[VideoCallPage] UNLOAD - Cleaning up');
      nuclearCleanup();
    };

    const handlePageHide = (event) => {
      console.log('[VideoCallPage] PAGE HIDE - Mobile swipe back');
      nuclearCleanup();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[VideoCallPage] VISIBILITY CHANGE - Tab hidden');
        nuclearCleanup();
        // Force navigation after cleanup
        setTimeout(() => {
          router.back();
        }, 100);
      }
    };

    // MOST IMPORTANT: Intercept popstate (back button/swipe)
    const handlePopState = (event) => {
      console.log('[VideoCallPage] POPSTATE - Back navigation detected');
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
    document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });

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
      console.log('[VideoCallPage] Component unmounting - Final cleanup');
      
      // Restore original history methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      
      // Remove all listeners
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
      window.removeEventListener('unload', handleUnload, { capture: true });
      window.removeEventListener('pagehide', handlePageHide, { capture: true });
      window.removeEventListener('popstate', handlePopState, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
      
      nuclearCleanup();
    };
  }, [searchParams, router, nuclearCleanup]);

  const handleLeave = () => {
    console.log('[VideoCallPage] Leave button clicked');
    nuclearCleanup();
    setTimeout(() => {
      router.back();
    }, 200);
  };

  if (!meetingUrl) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <VideoMeeting url={meetingUrl} onLeave={handleLeave} />
    </div>
  );
}

// Main component with Suspense boundary
export default function VideoCallPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VideoCallContent />
    </Suspense>
  );
}