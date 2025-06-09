'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface VideoMeetingProps {
  url: string;
  token?: string;  
  onLeave?: () => void;
}

function VideoMeeting({ url, token, onLeave }: VideoMeetingProps) {
  const [callObject, setCallObject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Waiting to initialize...');
  const initializingRef = useRef(false);
  const dailyRef = useRef<any>(null);
  const mountedRef = useRef(false);

  // Replace your cleanup function in VideoMeeting component with this:

const cleanup = useCallback(async () => {
  console.log('[VideoMeeting] AGGRESSIVE CLEANUP INITIATED');
  
  // IMMEDIATELY remove all iframes - don't wait for Daily.co
  document.querySelectorAll('iframe').forEach(el => {
    console.log('[VideoMeeting] Force removing iframe:', el.src);
    el.remove();
  });
  
  // Remove Daily.co specific elements
  document.querySelectorAll('[data-daily-js], [data-daily], .daily-js-frame').forEach(el => {
    console.log('[VideoMeeting] Removing Daily element');
    el.remove();
  });
  
  // Reset body and html styles
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.documentElement.style.overflow = '';
  
  // Clean up Daily.co instance (but don't wait for it)
  if (dailyRef.current) {
    try {
      console.log('[VideoMeeting] Destroying Daily.co instance...');
      // Fire and forget - don't await
      dailyRef.current.leave().catch(() => {});
      dailyRef.current.destroy().catch(() => {});
    } catch (error) {
      console.error('[VideoMeeting] Daily cleanup error:', error);
    }
    dailyRef.current = null;
    setCallObject(null);
  }
  
  console.log('[VideoMeeting] AGGRESSIVE CLEANUP COMPLETED');
}, []);

// Also add this to your useEffect in VideoMeeting:
useEffect(() => {
  // ... your existing code ...

  // Add this extra cleanup for page navigation
  const handleBeforeUnload = () => {
    console.log('[VideoMeeting] Page unloading - emergency cleanup');
    // Immediate iframe removal
    document.querySelectorAll('iframe').forEach(el => el.remove());
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    cleanup();
  };
}, [url, cleanup, onLeave]);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    const init = async () => {
      if (!url || initializingRef.current) {
        return;
      }

      try {
        console.log('[VideoMeeting] Starting initialization with URL:', url);
        initializingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Clean up any existing instances first
        await cleanup();

        const { default: Daily } = await import('@daily-co/daily-js');
        
        const callFrame = Daily.createFrame({
          url,
          showLeaveButton: false,
          showFullscreenButton: true,
          iframeStyle: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            border: '0',
            zIndex: '10',
          }
        });

        callFrame
          .on('loading', () => {
            console.log('[VideoMeeting] Loading...');
            setConnectionStatus('Loading video call...');
          })
          .on('loaded', () => {
            console.log('[VideoMeeting] Loaded');
            setConnectionStatus('Video call loaded, joining...');
          })
          .on('joining-meeting', () => {
            console.log('[VideoMeeting] Joining meeting...');
            setConnectionStatus('Joining meeting...');
          })
          .on('joined-meeting', () => {
            console.log('[VideoMeeting] Joined meeting');
            setConnectionStatus('Connected!');
            setCallObject(callFrame);
            setIsLoading(false);
          })
          .on('left-meeting', () => {
            console.log('[VideoMeeting] Left meeting');
            cleanup();
            onLeave?.();
          })
          .on('error', (e: any) => {
            console.error('[VideoMeeting] Error:', e);
            setError(`Video call error: ${e?.errorMsg || 'Unknown error'}`);
          });

        dailyRef.current = callFrame;

        console.log('[VideoMeeting] Joining with URL:', url);
        try {
          const joinOptions: any = { url: url };
          if (token) {
            joinOptions.token = token;
          }
          
          await callFrame.join(joinOptions);  
          console.log('[VideoMeeting] Join call initiated');
        } catch (joinError) {
          console.error('[VideoMeeting] Join error:', joinError);
          throw joinError;
        }

      } catch (err: any) {
        console.error('[VideoMeeting] Error:', err);
        setError(`Failed to initialize: ${err.message}`);
        setIsLoading(false);
        initializingRef.current = false;
        cleanup();
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [url, cleanup, onLeave]);

  // Add an effect to handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
        onLeave?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanup, onLeave]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-xl font-semibold mb-4">Error</div>
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              cleanup();
              onLeave?.();
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  if (!callObject) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center p-4">
          <div className="text-white text-xl mb-4">
            {isLoading ? 'Connecting to video call...' : 'Initializing video call...'}
          </div>
          <div className="text-gray-400 mb-2">{connectionStatus}</div>
          <div className="text-gray-500 text-sm break-all max-w-md">{url}</div>
          <button
            onClick={() => {
              cleanup();
              onLeave?.();
            }}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-20">
      <button
        onClick={() => {
          cleanup();
          onLeave?.();
        }}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
      >
        Leave Meeting
      </button>
    </div>
  );
}

export default dynamic(() => Promise.resolve(VideoMeeting), { ssr: false }); 