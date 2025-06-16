'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface VideoMeetingProps {
  url: string;
  token?: string;  
  userRole?: string;
  onLeave?: () => void;
}

function VideoMeeting({ url, token, userRole, onLeave }: VideoMeetingProps) {
  console.log('[VideoMeeting] Props received:', { url, token, userRole, onLeave: !!onLeave });

  const [callObject, setCallObject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Waiting to initialize...');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const initializingRef = useRef(false);
  const dailyRef = useRef<any>(null);
  const mountedRef = useRef(false);

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
        // Stop recording if it's active
        if (isRecording) {
          try {
            await dailyRef.current.stopRecording();
          } catch (error) {
            console.warn('[VideoMeeting] Error stopping recording during cleanup:', error);
          }
        }
        // Fire and forget - don't await
        dailyRef.current.leave().catch(() => {});
        dailyRef.current.destroy().catch(() => {});
      } catch (error) {
        console.error('[VideoMeeting] Daily cleanup error:', error);
      }
      dailyRef.current = null;
      setCallObject(null);
      setIsRecording(false);
      setDebugInfo(null);
    }
    
    console.log('[VideoMeeting] AGGRESSIVE CLEANUP COMPLETED');
  }, [isRecording]);

  // Enhanced recording functions with better debugging
  const checkRecordingCapability = useCallback(async () => {
    if (!dailyRef.current) {
      console.log('[VideoMeeting] No Daily instance available for recording check');
      return false;
    }
    
    try {
      // First check if we're still in a meeting
      const meetingState = dailyRef.current.meetingState();
      if (meetingState !== 'joined-meeting') {
        console.log('[VideoMeeting] Not in active meeting, state:', meetingState);
        return false;
      }

      // Get participants info
      const participants = dailyRef.current.participants();
      if (!participants || !participants.local) {
        console.log('[VideoMeeting] No participants info available');
        return false;
      }

      const localParticipant = participants.local;
      
      console.log('[VideoMeeting] Recording capability check:', {
        meetingState,
        localParticipant: {
          user_name: localParticipant?.user_name,
          owner: localParticipant?.owner,
          permissions: localParticipant?.permissions
        },
        userRole,
        hasToken: !!token
      });
      
      setDebugInfo({
        meetingState,
        localParticipant,
        userRole,
        hasToken: !!token
      });
      
      return true;
    } catch (error) {
      console.error('[VideoMeeting] Error checking recording capability:', error);
      return false;
    }
  }, [userRole, token]);

  const startRecording = useCallback(async () => {
    console.log('[VideoMeeting] Starting recording...', { 
      dailyRef: !!dailyRef.current, 
      userRole 
    });
    
    if (!dailyRef.current) {
      console.error('[VideoMeeting] No Daily instance available');
      setRecordingError('Video call not connected');
      return;
    }
    
    try {
      setRecordingError(null);
      
      // Check recording capability first
      await checkRecordingCapability();
      
      console.log('[VideoMeeting] Attempting to start cloud recording...');
      
      // Try different recording methods
      let result;
      
      // Method 1: Try with explicit cloud recording
      try {
        result = await dailyRef.current.startRecording({
          type: 'cloud'
        });
        console.log('[VideoMeeting] Cloud recording started with type:', result);
      } catch (cloudError) {
        console.log('[VideoMeeting] Cloud recording with type failed, trying simple method...', cloudError);
        
        // Method 2: Try simple startRecording
        result = await dailyRef.current.startRecording();
        console.log('[VideoMeeting] Simple recording started:', result);
      }
      
      setIsRecording(true);
      setRecordingError(null);
      
    } catch (error: any) {
      console.error('[VideoMeeting] Recording failed:', error);
      const errorMsg = error.message || error.toString();
      
      // Enhanced error handling
      let userFriendlyError = errorMsg;
      if (errorMsg.includes('not enabled')) {
        userFriendlyError = 'Recording is not enabled for this meeting. Please check your permissions.';
      } else if (errorMsg.includes('permission')) {
        userFriendlyError = 'You do not have permission to record this meeting.';
      } else if (errorMsg.includes('already recording')) {
        userFriendlyError = 'Recording is already in progress.';
        setIsRecording(true);
        return;
      }
      
      setRecordingError(userFriendlyError);
      alert(`Recording failed: ${userFriendlyError}`);
    }
  }, [userRole, checkRecordingCapability]);

  const stopRecording = useCallback(async () => {
    console.log('[VideoMeeting] Stopping recording...');
    
    if (!dailyRef.current) {
      console.error('[VideoMeeting] No Daily instance available');
      return;
    }
    
    try {
      setRecordingError(null);
      
      console.log('[VideoMeeting] Calling Daily stopRecording...');
      const result = await dailyRef.current.stopRecording();
      console.log('[VideoMeeting] Recording stopped successfully:', result);
      
      setIsRecording(false);
      
    } catch (error: any) {
      console.error('[VideoMeeting] Stop recording failed:', error);
      const errorMsg = error.message || error.toString();
      setRecordingError(`Failed to stop recording: ${errorMsg}`);
      
      alert(`Stop recording failed: ${errorMsg}`);
    }
  }, []);

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
          .on('joined-meeting', (event) => {
            console.log('[VideoMeeting] Joined meeting', event);
            setConnectionStatus('Connected!');
            setCallObject(callFrame);
            setIsLoading(false);
            
            // Check recording capability after joining
            setTimeout(() => {
              checkRecordingCapability();
            }, 2000);
          })
          .on('recording-started', (event) => {
            console.log('[VideoMeeting] Recording started event:', event);
            setIsRecording(true);
            setRecordingError(null);
          })
          .on('recording-stopped', (event) => {
            console.log('[VideoMeeting] Recording stopped event:', event);
            setIsRecording(false);
          })
          .on('recording-error', (event: any) => {
            console.error('[VideoMeeting] Recording error event:', event);
            setRecordingError(`Recording error: ${event.errorMsg}`);
            setIsRecording(false);
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

        console.log('[VideoMeeting] Joining with URL:', url, 'Token:', !!token);
        try {
          const joinOptions: any = { url: url };
          if (token) {
            joinOptions.token = token;
            console.log('[VideoMeeting] Using meeting token for join');
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

    // Add emergency cleanup handler
    const handleBeforeUnload = () => {
      console.log('[VideoMeeting] Page unloading - emergency cleanup');
      document.querySelectorAll('iframe').forEach(el => el.remove());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [url, cleanup, onLeave, checkRecordingCapability]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center p-4 max-w-md">
          <div className="text-red-500 text-xl mb-4">Video Call Error</div>
          <div className="text-white mb-4">{error}</div>
          <button
            onClick={() => {
              cleanup();
              onLeave?.();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back
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
    <>
      {/* Debug info panel - only show for tutors */}
      {userRole?.toLowerCase() === 'tutor' && debugInfo && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs max-w-xs z-30">
          <div>Role: {userRole}</div>
          <div>Token: {token ? 'Yes' : 'No'}</div>
          <div>Owner: {debugInfo.localParticipant?.owner ? 'Yes' : 'No'}</div>
          <div>User: {debugInfo.localParticipant?.user_name}</div>
        </div>
      )}
      
      {/* Error message */}
      {recordingError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-3 rounded max-w-sm text-sm z-30">
          {recordingError}
          <button 
            onClick={() => setRecordingError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Control buttons */}
      <div className="fixed bottom-4 right-4 z-20 flex gap-2">
        {userRole?.toLowerCase() === 'tutor' && (
          <>
            <button
              onClick={checkRecordingCapability}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg text-sm"
            >
              Check Recording
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg transition-colors shadow-lg ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
            </button>
          </>
        )}
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
    </>
  );
}

export default dynamic(() => Promise.resolve(VideoMeeting), { ssr: false });