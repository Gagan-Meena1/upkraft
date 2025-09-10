"use client"
import React, { useEffect, useState } from 'react'

const MyLibrary = () => {
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    loadSessions();
  }, []);

  // Load practice sessions (this could come from API, localStorage, etc.)
  const loadSessions = () => {
    try {
      // Example: Load from localStorage or API
      // For now, using static data
      const practiceSessions = [
        {
          id: 1,
          name: "Practice Session 1",
          date: "2024-01-15",
          instrument: "guitar",
          duration: "15 min"
        },
        {
          id: 2,
          name: "Practice Session 2",
          date: "2024-01-16",
          instrument: "piano",
          duration: "20 min"
        },
        {
          id: 3,
          name: "Practice Session 3",
          date: "2024-01-17",
          instrument: "guitar",
          duration: "18 min"
        },
        {
          id: 4,
          name: "Practice Session 4",
          date: "2024-01-18",
          instrument: "piano",
          duration: "25 min"
        },
        {
          id: 5,
          name: "Practice Session 5",
          date: "2024-01-19",
          instrument: "guitar",
          duration: "12 min"
        },
        {
          id: 6,
          name: "Practice Session 6",
          date: "2024-01-20",
          instrument: "piano",
          duration: "30 min"
        }
      ];
      
      setSessions(practiceSession);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setLoading(false);
    }
  };

  const handleSessionClick = (session) => {
    // Handle session selection/playback
    console.log('Selected session:', session);
    // You could navigate to practice page or load session data
  };

  const formatDate = (dateString) => {
    if (!mounted) return dateString;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Show loading state during SSR and initial client render
  if (!mounted || loading) {
    return (
      <div className='my-library-tab mt-md-5 mt-4'>
        <div className='row'>
          {[...Array(6)].map((_, index) => (
            <div key={index} className='col-lg-3 col-md-4 mb-3 col-6'>
              <div className='list-my-library'>
                <p>Loading...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='my-library-tab mt-md-5 mt-4'>
      {sessions.length === 0 ? (
        <div className='text-center py-5'>
          <h4 className='text-muted'>No Practice Sessions Found</h4>
          <p className='text-muted'>Your saved practice sessions will appear here.</p>
        </div>
      ) : (
        <div className='row'>
          {sessions.map((session) => (
            <div key={session.id} className='col-lg-3 col-md-4 mb-3 col-6'>
              <div 
                className='list-my-library cursor-pointer'
                onClick={() => handleSessionClick(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSessionClick(session);
                  }
                }}
              >
                <div className='session-info'>
                  <p className='session-name mb-1'>{session.name}</p>
                  <small className='text-muted d-block'>
                    {formatDate(session.date)}
                  </small>
                  <small className='text-muted d-block'>
                    {session.instrument} • {session.duration}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyLibrary