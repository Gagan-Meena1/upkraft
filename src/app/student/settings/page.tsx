"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  city?: string;
  timezone?: string;
  courses: any[];
  createdAt: string;
  profileImage?: string;
}

export default function StudentSettingsPage() {
  const [activeSection, setActiveSection] = useState('student');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [studentInfo, setStudentInfo] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    city: '',
    timezone: ''
  });
  const [isSavingStudentInfo, setIsSavingStudentInfo] = useState(false);
  const [isLoadingStudentInfo, setIsLoadingStudentInfo] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<{ label: string; value: string }[]>([]);
  const [timezonesSearch, setTimezonesSearch] = useState<string>("");
  const [tzOpen, setTzOpen] = useState<boolean>(false);
  const tzDropdownRef = useRef<HTMLDivElement | null>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [selectedPricingModel, setSelectedPricingModel] = useState<'Monthly Subscription' | 'Package'>('Monthly Subscription');
  const router = useRouter();

  const deviceTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // Curated list of major world timezones
  const curatedTimezones = [
    { label: "London (UK)", value: "Europe/London" },
    { label: "Paris (France)", value: "Europe/Paris" },
    { label: "Berlin (Germany)", value: "Europe/Berlin" },
    { label: "Madrid (Spain)", value: "Europe/Madrid" },
    { label: "Rome (Italy)", value: "Europe/Rome" },
    { label: "Zurich (Switzerland)", value: "Europe/Zurich" },
    { label: "Athens (Greece)", value: "Europe/Athens" },
    { label: "Dubai (UAE)", value: "Asia/Dubai" },
    { label: "Riyadh (Saudi Arabia)", value: "Asia/Riyadh" },
    { label: "Cairo (Egypt)", value: "Africa/Cairo" },
    { label: "Johannesburg (South Africa)", value: "Africa/Johannesburg" },
    { label: "Moscow (Russia)", value: "Europe/Moscow" },
    { label: "Karachi (Pakistan)", value: "Asia/Karachi" },
    { label: "Delhi (India)", value: "Asia/Kolkata" },
    { label: "Dhaka (Bangladesh)", value: "Asia/Dhaka" },
    { label: "Bangkok (Thailand)", value: "Asia/Bangkok" },
    { label: "Singapore", value: "Asia/Singapore" },
    { label: "Hong Kong", value: "Asia/Hong_Kong" },
    { label: "Tokyo (Japan)", value: "Asia/Tokyo" },
    { label: "Seoul (South Korea)", value: "Asia/Seoul" },
    { label: "Beijing (China)", value: "Asia/Shanghai" },
    { label: "Sydney (Australia)", value: "Australia/Sydney" },
    { label: "Melbourne (Australia)", value: "Australia/Melbourne" },
    { label: "Auckland (New Zealand)", value: "Pacific/Auckland" },
    { label: "New York (USA)", value: "America/New_York" },
    { label: "Chicago (USA)", value: "America/Chicago" },
    { label: "Denver (USA)", value: "America/Denver" },
    { label: "Los Angeles (USA)", value: "America/Los_Angeles" },
    { label: "Toronto (Canada)", value: "America/Toronto" },
    { label: "Vancouver (Canada)", value: "America/Vancouver" },
    { label: "Mexico City (Mexico)", value: "America/Mexico_City" },
    { label: "Bogotá (Colombia)", value: "America/Bogota" },
    { label: "São Paulo (Brazil)", value: "America/Sao_Paulo" },
    { label: "Buenos Aires (Argentina)", value: "America/Argentina/Buenos_Aires" },
    { label: "Honolulu (Hawaii)", value: "Pacific/Honolulu" },
    { label: "Anchorage (Alaska)", value: "America/Anchorage" },
    { label: "UTC", value: "UTC" },
  ];

  useEffect(() => {
    setTimezones(curatedTimezones);
  }, []);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (tzDropdownRef.current && !tzDropdownRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTzOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Helper: get "UTC±HH:MM"
  const getUtcOffsetLabel = (tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "shortOffset",
      }).formatToParts(new Date());
      let tzn = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
      tzn = tzn.replace("GMT", "UTC");
      if (!tzn.startsWith("UTC")) {
        const now = new Date();
        const utcStr = now.toLocaleString("en-US", { timeZone: "UTC" });
        const tzStr = now.toLocaleString("en-US", { timeZone: tz });
        const utcDate = new Date(utcStr);
        const tzDate = new Date(tzStr);
        const diffMin = Math.round(
          (tzDate.getTime() - utcDate.getTime()) / 60000
        );
        const sign = diffMin >= 0 ? "+" : "-";
        const abs = Math.abs(diffMin);
        const hh = String(Math.floor(abs / 60)).padStart(2, "0");
        const mm = String(abs % 60).padStart(2, "0");
        return `UTC${sign}${hh}:${mm}`;
      }
      return tzn.replace("GMT", "UTC");
    } catch {
      return "UTC";
    }
  };

  // Helper: friendly label for a tz value
  const getFriendlyPlaceLabel = (tzValue: string) => {
    const item = timezones.find((t) => t.value === tzValue);
    return item?.label ?? tzValue.replace(/_/g, " ");
  };

  // Helper: final display text
  const getTzDisplay = (tzValue: string) => {
    const offset = getUtcOffsetLabel(tzValue);
    const place = getFriendlyPlaceLabel(tzValue);
    const idText = tzValue.replace(/_/g, " ");
    return `${offset} — ${place} • ${idText}`;
  };

  // Filtered timezones based on search input
  const filteredTimezones = timezones.filter((tz) => {
    const searchable = `${getTzDisplay(tz.value)} ${tz.label} ${tz.value}`.toLowerCase();
    return searchable.includes(timezonesSearch.toLowerCase());
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingStudentInfo(true);
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
        
        // Set initial student info from user data
        setStudentInfo({
          username: userData.user?.username || '',
          email: userData.user?.email || '',
          phone: userData.user?.contact || '',
          address: userData.user?.address || '',
          age: userData.user?.age?.toString() || '',
          city: userData.user?.city || '',
          timezone: userData.user?.timezone || deviceTimeZone
        });

        // Set courses from user data
        if (userData.courseDetails && Array.isArray(userData.courseDetails)) {
          setCourses(userData.courseDetails);
        }

        // Fetch policies if student has academyId
        if (userData.user?.academyId) {
          setIsLoadingPolicies(true);
          try {
            const policiesResponse = await fetch("/Api/student/policies");
            if (policiesResponse.ok) {
              const policiesData = await policiesResponse.json();
              if (policiesData.success && policiesData.policies) {
                setPolicies(policiesData.policies);
              }
            }
          } catch (error) {
            console.error("Error fetching policies:", error);
          } finally {
            setIsLoadingPolicies(false);
          }

          // Fetch pricing settings
          setIsLoadingPricing(true);
          try {
            const pricingResponse = await fetch("/Api/student/packagePricing");
            if (pricingResponse.ok) {
              const pricingData = await pricingResponse.json();
              if (pricingData.success && pricingData.packagePricingSettings) {
                setPricingSettings(pricingData.packagePricingSettings);
                // Set initial selected model based on academy's active model
                if (pricingData.packagePricingSettings.pricingModel) {
                  setSelectedPricingModel(pricingData.packagePricingSettings.pricingModel as 'Monthly Subscription' | 'Package');
                }
              }
            }
          } catch (error) {
            console.error("Error fetching pricing settings:", error);
          } finally {
            setIsLoadingPricing(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load student information');
      } finally {
        setIsLoadingStudentInfo(false);
      }
    };

    fetchData();
  }, [deviceTimeZone]);

  const handleSaveStudentInfo = async () => {
    // Validate required fields
    if (!studentInfo.username || !studentInfo.email) {
      toast.error('Username and email are required');
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
          username: studentInfo.username,
          email: studentInfo.email,
          phone: studentInfo.phone,
          address: studentInfo.address,
          age: studentInfo.age ? parseInt(studentInfo.age) : undefined,
          city: studentInfo.city,
          timezone: studentInfo.timezone
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
    { id: 'student', label: '👤 Student Info', section: 'General' },
    { id: 'courses', label: '📚 Enrolled Courses', section: 'General' },
    ...(userData?.academyId ? [
      { id: 'pricing', label: '💰 Pricing & Models', section: 'Academy' },
      { id: 'policies', label: '📋 Policies', section: 'Academy' }
    ] : [])
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
                    {/* Form Fields Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      {/* Username */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={studentInfo.username}
                          onChange={(e) => setStudentInfo({ ...studentInfo, username: e.target.value })}
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
                          placeholder="Enter username"
                        />
                      </div>

                      {/* Email */}
                      <div>
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
                    </div>

                    {/* Age and Phone Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      {/* Age */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          Age
                        </label>
                        <input
                          type="number"
                          value={studentInfo.age}
                          onChange={(e) => setStudentInfo({ ...studentInfo, age: e.target.value })}
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
                          placeholder="Enter age"
                          min="1"
                          max="120"
                        />
                      </div>

                      {/* Phone */}
                      <div>
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
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={studentInfo.city}
                        onChange={(e) => setStudentInfo({ ...studentInfo, city: e.target.value })}
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
                        placeholder="Enter city"
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
                        Timezone
                      </label>
                      <div style={{ position: 'relative' }} ref={tzDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setTzOpen((v) => !v)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'border-color 0.3s',
                            fontFamily: 'inherit',
                            textAlign: 'left'
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#6200EA'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                        >
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}>
                            {studentInfo.timezone
                              ? getTzDisplay(studentInfo.timezone)
                              : "Select your time zone"}
                          </span>
                          <svg
                            style={{
                              width: '16px',
                              height: '16px',
                              transition: 'transform 0.3s',
                              transform: tzOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              marginLeft: '8px',
                              flexShrink: 0
                            }}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.116l3.71-3.885a.75.75 0 111.08 1.04l-4.24 4.44a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {tzOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              zIndex: 50,
                              marginTop: '8px',
                              width: '100%',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                              background: 'white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              maxHeight: '70vh',
                              overflowY: 'auto',
                              overscrollBehavior: 'contain'
                            }}
                          >
                            <div style={{ 
                              padding: '8px', 
                              borderBottom: '1px solid #e0e0e0', 
                              position: 'sticky', 
                              top: 0, 
                              background: 'white', 
                              zIndex: 10 
                            }}>
                              <input
                                autoFocus
                                type="text"
                                placeholder="Search timezone (city, country, UTC)..."
                                value={timezonesSearch}
                                onChange={(e) => setTimezonesSearch(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px',
                                  fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                              />
                            </div>

                            <ul style={{ padding: '4px 0', margin: 0, listStyle: 'none' }}>
                              {deviceTimeZone && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStudentInfo((p) => ({
                                        ...p,
                                        timezone: deviceTimeZone,
                                      }));
                                      setTzOpen(false);
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '8px 16px',
                                      fontSize: '14px',
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontFamily: 'inherit'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f7'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    Use device time zone ({getTzDisplay(deviceTimeZone)})
                                  </button>
                                </li>
                              )}
                              <li style={{ padding: '4px 16px', fontSize: '12px', color: '#999' }}>
                                ──────────
                              </li>

                              {(filteredTimezones.length ? filteredTimezones : timezones)
                                .filter((tz) => tz.value !== deviceTimeZone)
                                .map((tz) => (
                                  <li key={tz.value}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStudentInfo((p) => ({
                                          ...p,
                                          timezone: tz.value,
                                        }));
                                        setTzOpen(false);
                                      }}
                                      style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        background: studentInfo.timezone === tz.value ? '#f3e8ff' : 'transparent',
                                        color: studentInfo.timezone === tz.value ? '#6200EA' : '#1a1a1a',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (studentInfo.timezone !== tz.value) {
                                          e.currentTarget.style.background = '#f5f5f7';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (studentInfo.timezone !== tz.value) {
                                          e.currentTarget.style.background = 'transparent';
                                        }
                                      }}
                                    >
                                      {getTzDisplay(tz.value)}
                                    </button>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
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

            {/* Enrolled Courses Section */}
            {activeSection === 'courses' && (
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
                  Enrolled Courses
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '25px'
                }}>
                  View all your enrolled courses
                </div>

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
                        Loading courses...
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {courses && courses.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {courses.map((course) => (
                          <div
                            key={course._id}
                            style={{
                              padding: '20px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '12px',
                              transition: 'all 0.3s',
                              background: 'white'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f9fafb';
                              e.currentTarget.style.borderColor = '#6200EA';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#e0e0e0';
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '24px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{
                                  fontSize: '18px',
                                  fontWeight: 600,
                                  color: '#1a1a1a',
                                  margin: 0,
                                  marginBottom: '8px'
                                }}>
                                  {course.title || 'Untitled Course'}
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#666',
                                  margin: 0,
                                  marginBottom: '12px',
                                  lineHeight: '1.5'
                                }}>
                                  {course.description || 'No description available'}
                                </p>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '16px',
                                  flexWrap: 'wrap'
                                }}>
                                  {course.category && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px',
                                      color: '#666'
                                    }}>
                                      <span style={{ fontWeight: 600 }}>Category:</span>
                                      <span>{course.category}</span>
                                    </div>
                                  )}
                                  {course.duration && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px',
                                      color: '#666'
                                    }}>
                                      <span style={{ fontWeight: 600 }}>Duration:</span>
                                      <span>{course.duration}</span>
                                    </div>
                                  )}
                                  {course.curriculum && Array.isArray(course.curriculum) && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px',
                                      color: '#666'
                                    }}>
                                      <span style={{ fontWeight: 600 }}>Sessions:</span>
                                      <span>{course.curriculum.length}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{
                                textAlign: 'right',
                                minWidth: '120px'
                              }}>
                                {course.price !== undefined && course.price !== null && (
                                  <div style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                    marginBottom: '4px'
                                  }}>
                                    ₹{typeof course.price === 'number' ? course.price.toLocaleString('en-IN') : course.price}
                                  </div>
                                )}
                                {course.duration && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#999',
                                    marginTop: '4px'
                                  }}>
                                    {course.duration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        <div style={{
                          fontSize: '48px',
                          marginBottom: '16px'
                        }}>
                          📚
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          No courses enrolled
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#999'
                        }}>
                          You haven't enrolled in any courses yet.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
          )}

          {/* Pricing & Models Section */}
          {activeSection === 'pricing' && (
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
                💰 Pricing & Revenue Models
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                View your academy's pricing and revenue model settings
              </div>

              {isLoadingPricing ? (
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
                      Loading pricing settings...
                    </div>
                  </div>
                </>
              ) : pricingSettings ? (
                <>
                  {/* Payment Model Selection - Tabbed Interface */}
                  <div style={{
                    background: '#fafafa',
                    borderLeft: '4px solid #6200EA',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      marginBottom: '16px'
                    }}>
                      Payment Model
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px'
                    }}>
                      <div
                        onClick={() => setSelectedPricingModel('Monthly Subscription')}
                        style={{
                          border: `2px solid ${selectedPricingModel === 'Monthly Subscription' ? '#6200EA' : '#ddd'}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: selectedPricingModel === 'Monthly Subscription' ? '#f5f0ff' : 'white',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPricingModel !== 'Monthly Subscription') {
                            e.currentTarget.style.borderColor = '#6200EA';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPricingModel !== 'Monthly Subscription') {
                            e.currentTarget.style.borderColor = '#ddd';
                          }
                        }}
                      >
                        {selectedPricingModel === 'Monthly Subscription' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '15px',
                            width: '24px',
                            height: '24px',
                            background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                        )}
                        <div style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          Monthly Subscription
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          lineHeight: '1.4'
                        }}>
                          Fixed monthly fee for unlimited sessions
                        </div>
                      </div>
                      <div
                        onClick={() => setSelectedPricingModel('Package')}
                        style={{
                          border: `2px solid ${selectedPricingModel === 'Package' ? '#6200EA' : '#ddd'}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: selectedPricingModel === 'Package' ? '#f5f0ff' : 'white',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPricingModel !== 'Package') {
                            e.currentTarget.style.borderColor = '#6200EA';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPricingModel !== 'Package') {
                            e.currentTarget.style.borderColor = '#ddd';
                          }
                        }}
                      >
                        {selectedPricingModel === 'Package' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '15px',
                            width: '24px',
                            height: '24px',
                            background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                        )}
                        <div style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: '#1a1a1a',
                          marginBottom: '8px'
                        }}>
                          Package
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          lineHeight: '1.4'
                        }}>
                          Bulk session packages at discounted rates
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Subscription Pricing Table - Only visible when Monthly Subscription model is selected */}
                  {selectedPricingModel === 'Monthly Subscription' && pricingSettings.monthlySubscriptionPricing && pricingSettings.monthlySubscriptionPricing.length > 0 && (
                    <div style={{
                      background: '#fafafa',
                      borderLeft: '4px solid #6200EA',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '16px'
                      }}>
                        Monthly Subscription Pricing (for Monthly Subscription Model)
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '14px'
                        }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Duration</th>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Discount %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricingSettings.monthlySubscriptionPricing.map((subscription: any, index: number) => (
                              <tr key={subscription.months} style={{ borderBottom: index < pricingSettings.monthlySubscriptionPricing.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                                <td style={{
                                  padding: '12px',
                                  fontWeight: 600
                                }}>
                                  {subscription.months} {subscription.months === 1 ? 'Month' : 'Months'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  {subscription.discount || 0}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Package Pricing Table - Only visible when Package model is selected */}
                  {selectedPricingModel === 'Package' && pricingSettings.packagePricing && pricingSettings.packagePricing.length > 0 && (
                    <div style={{
                      background: '#fafafa',
                      borderLeft: '4px solid #6200EA',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '16px'
                      }}>
                        Package Pricing (for Package Model)
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '14px'
                        }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Package</th>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Sessions</th>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Per Session Rate</th>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Total Price</th>
                              <th style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#1a1a1a'
                              }}>Discount %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricingSettings.packagePricing.map((pkg: any, index: number) => (
                              <tr key={index} style={{ borderBottom: index < pricingSettings.packagePricing.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                                <td style={{
                                  padding: '12px',
                                  fontWeight: 600
                                }}>
                                  {pkg.name}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  {pkg.sessions}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  ₹{pkg.perSessionRate?.toLocaleString('en-IN') || '0'}
                                </td>
                                <td style={{
                                  padding: '12px',
                                  fontWeight: 600
                                }}>
                                  ₹{pkg.totalPrice?.toLocaleString('en-IN') || '0'}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  {pkg.discount || 0}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    💰
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 500
                  }}>
                    No pricing settings available
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Policies Section */}
          {activeSection === 'policies' && (
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
                  Payment Policies & Rules
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '25px'
                }}>
                  View your academy's payment policies and rules
                </div>

                {isLoadingPolicies ? (
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
                        Loading policies...
                      </div>
                    </div>
                  </>
                ) : policies ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    {/* Late Fee Policy */}
                    <div style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      background: '#f9fafb'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Late Fee Policy (Per Day)
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: 500
                      }}>
                        {policies.lateFeePolicy || 'Not set'}
                      </div>
                    </div>

                    {/* Days Until Overdue */}
                    <div style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      background: '#f9fafb'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Days Until Overdue
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: 500
                      }}>
                        {policies.daysUntilOverdue !== undefined ? `${policies.daysUntilOverdue} days` : 'Not set'}
                      </div>
                    </div>

                    {/* Early Payment Discount */}
                    <div style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      background: '#f9fafb'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Early Payment Discount
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: 500
                      }}>
                        {policies.earlyPaymentDiscount !== undefined ? `${policies.earlyPaymentDiscount}%` : 'Not set'}
                      </div>
                    </div>

                    {/* Auto Suspend After */}
                    <div style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      background: '#f9fafb'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Auto Suspend After
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#1a1a1a',
                        fontWeight: 500
                      }}>
                        {policies.autoSuspendAfter !== undefined ? `${policies.autoSuspendAfter} days` : 'Not set'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px'
                    }}>
                      📋
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#1a1a1a',
                      marginBottom: '8px'
                    }}>
                      No policies available
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#999'
                    }}>
                      Policies have not been set by your academy yet.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

