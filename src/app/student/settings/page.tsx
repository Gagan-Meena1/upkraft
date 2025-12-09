"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/components/DashboardLayout';

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  age?: number;
  address?: string;
  contact?: string;
  courses: any[];
  createdAt: string;
  profileImage?: string;
}

export default function StudentSettingsPage() {
  const [activeSection, setActiveSection] = useState('student');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [studentInfo, setStudentInfo] = useState({
    studentName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSavingStudentInfo, setIsSavingStudentInfo] = useState(false);
  const [isLoadingStudentInfo, setIsLoadingStudentInfo] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingStudentInfo(true);
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
        
        // Set initial student info from user data
        setStudentInfo({
          studentName: userData.user?.username || '',
          email: userData.user?.email || '',
          phone: userData.user?.contact || '',
          address: userData.user?.address || ''
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load student information');
      } finally {
        setIsLoadingStudentInfo(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveStudentInfo = async () => {
    // Validate required fields
    if (!studentInfo.studentName || !studentInfo.email) {
      toast.error('Student name and email are required');
      return;
    }

    setIsSavingStudentInfo(true);
    try {
      const response = await fetch('/Api/student/updateInfo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: studentInfo.studentName,
          email: studentInfo.email,
          phone: studentInfo.phone,
          address: studentInfo.address
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student information');
      }

      // Show success message
      toast.success('Student information saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving student info:', error);
      toast.error(error.message || 'Failed to save student information');
      setIsSavingStudentInfo(false);
    }
  };

  const settingsNavItems = [
    { id: 'student', label: '👤 Student Info', section: 'General' }
  ];

  const groupedNavItems = settingsNavItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof settingsNavItems>);

  return (
    <DashboardLayout userData={userData || undefined} userType="student">
      <div style={{ 
        minHeight: '100vh', 
        background: '#f5f5f7',
        padding: '30px'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            color: '#1a1a1a',
            margin: 0,
            fontWeight: 600
          }}>Settings</h1>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '250px 1fr', 
          gap: '20px' 
        }}>
          {/* Left Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            height: 'fit-content'
          }}>
            {Object.entries(groupedNavItems).map(([section, items], sectionIndex) => (
              <div key={section}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '12px 16px',
                  marginTop: sectionIndex > 0 ? '16px' : '0',
                  marginBottom: '8px'
                }}>
                  {section}
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      transition: 'all 0.3s',
                      fontSize: '14px',
                      color: activeSection === item.id ? 'white' : '#666',
                      background: activeSection === item.id 
                        ? 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)' 
                        : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.background = '#f5f5f7';
                        e.currentTarget.style.color = '#1a1a1a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#666';
                      }
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Main Settings Content */}
          <div>
            {/* Student Info Section */}
            {activeSection === 'student' && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  Student Information
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '25px'
                }}>
                  Update your student details
                </div>

                {/* Loader */}
                {isLoadingStudentInfo ? (
                  <>
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes spin-loader {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '60px 20px',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                      <div 
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '4px solid #f3f3f3',
                          borderTop: '4px solid #6200EA',
                          borderRadius: '50%',
                          animation: 'spin-loader 1s linear infinite'
                        }}
                      ></div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        Loading student information...
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={studentInfo.studentName}
                        onChange={(e) => setStudentInfo({ ...studentInfo, studentName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        placeholder="Enter student name"
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={studentInfo.email}
                        onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={studentInfo.phone}
                        onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Address
                      </label>
                      <textarea
                        value={studentInfo.address}
                        onChange={(e) => setStudentInfo({ ...studentInfo, address: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s',
                          fontFamily: 'inherit',
                          minHeight: '100px',
                          resize: 'vertical'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        placeholder="Enter address"
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '12px',
                      paddingTop: '20px',
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <button
                        onClick={handleSaveStudentInfo}
                        disabled={isSavingStudentInfo}
                        style={{
                          padding: '12px 24px',
                          background: isSavingStudentInfo 
                            ? '#ccc' 
                            : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isSavingStudentInfo ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: isSavingStudentInfo ? 'none' : '0 4px 12px rgba(98, 0, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSavingStudentInfo) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(98, 0, 234, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSavingStudentInfo) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 0, 234, 0.3)';
                          }
                        }}
                      >
                        {isSavingStudentInfo ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

