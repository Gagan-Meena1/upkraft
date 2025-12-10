"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface SuspensionModalProps {
  message: string;
}

const SuspensionModal: React.FC<SuspensionModalProps> = ({ message }) => {
  const router = useRouter();

  // Prevent all interactions when modal is open
  useEffect(() => {
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    
    // Prevent keyboard shortcuts (ESC, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow only Tab for accessibility, but prevent ESC and other shortcuts
      if (e.key === 'Escape' || (e.ctrlKey && e.key === 'w') || (e.ctrlKey && e.key === 'q')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error during logout');
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Backdrop - blocks all interactions */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'auto'
        }}
        onClick={(e) => {
          // Prevent closing on backdrop click
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={(e) => {
          // Prevent right-click menu
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Modal */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10000
          }}
          onClick={(e) => {
            // Prevent closing on modal click
            e.stopPropagation();
          }}
        >
          {/* Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '40px'
            }}>
              ⚠️
            </div>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Account Suspended
          </h2>

          {/* Message */}
          <p style={{
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {message}
          </p>

          {/* Additional Info */}
          <div style={{
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#C53030',
              margin: 0,
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Please contact your academy administrator or make a payment to renew your subscription and restore access to your account.
            </p>
          </div>

          {/* Logout Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(98, 0, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(98, 0, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 0, 234, 0.3)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuspensionModal;

