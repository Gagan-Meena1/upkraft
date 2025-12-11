"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface UserData {
  _id: string;
  username: string;
  email: string;
  category: string;
  contact?: string;
  address?: string;
  city?: string;
  skills?: string;
  experience?: number;
  teachingMode?: string;
  timezone?: string;
  courses: any[];
  createdAt: string;
  profileImage?: string;
}

export default function TutorSettingsPage() {
  const [activeSection, setActiveSection] = useState('tutor');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tutorInfo, setTutorInfo] = useState({
    tutorName: '',
    email: '',
    contactNumber: '',
    address: '',
    city: '',
    skills: '',
    teachingExperience: '',
    teachingMode: '',
    timezone: ''
  });
  const [isSavingTutorInfo, setIsSavingTutorInfo] = useState(false);
  const [isLoadingTutorInfo, setIsLoadingTutorInfo] = useState(true);
  const [timezones, setTimezones] = useState<{ label: string; value: string }[]>([]);
  const [timezonesSearch, setTimezonesSearch] = useState<string>("");
  const [tzOpen, setTzOpen] = useState<boolean>(false);
  const tzDropdownRef = useRef<HTMLDivElement | null>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [payoutSettings, setPayoutSettings] = useState<any>(null);
  const [isLoadingPayout, setIsLoadingPayout] = useState(false);
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
      setIsLoadingTutorInfo(true);
      try {
        const userResponse = await fetch("/Api/users/user");
        const userData = await userResponse.json();
        setUserData(userData.user);
        
        // Map teachingMode from database to display value
        const teachingModeMap: Record<string, string> = {
          'Online': 'online',
          'In-person': 'offline',
          'Both': 'both',
          'Hybrid': 'both'
        };
        const dbTeachingMode = userData.user?.teachingMode || '';
        const displayTeachingMode = teachingModeMap[dbTeachingMode] || dbTeachingMode.toLowerCase() || '';

        // Set initial tutor info from user data
        setTutorInfo({
          tutorName: userData.user?.username || '',
          email: userData.user?.email || '',
          contactNumber: userData.user?.contact || '',
          address: userData.user?.address || '',
          city: userData.user?.city || '',
          skills: userData.user?.skills || '',
          teachingExperience: userData.user?.experience?.toString() || '',
          teachingMode: displayTeachingMode,
          timezone: userData.user?.timezone || deviceTimeZone
        });

        // Fetch policies and payout settings if tutor has academyId
        if (userData.user?.academyId) {
          setIsLoadingPolicies(true);
          try {
            const policiesResponse = await fetch("/Api/tutor/policies");
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

          // Fetch payout settings
          setIsLoadingPayout(true);
          try {
            const payoutResponse = await fetch("/Api/tutor/payoutSettings");
            if (payoutResponse.ok) {
              const payoutData = await payoutResponse.json();
              if (payoutData.success && payoutData.payoutSettings) {
                setPayoutSettings(payoutData.payoutSettings);
              }
            }
          } catch (error) {
            console.error("Error fetching payout settings:", error);
          } finally {
            setIsLoadingPayout(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error('Failed to load tutor information');
      } finally {
        setIsLoadingTutorInfo(false);
      }
    };

    fetchData();
  }, [deviceTimeZone]);

  const handleSaveTutorInfo = async () => {
    // Validate required fields
    if (!tutorInfo.tutorName || !tutorInfo.email) {
      toast.error('Tutor name and email are required');
      return;
    }

    setIsSavingTutorInfo(true);
    try {
      const response = await fetch('/Api/tutor/updateInfo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorName: tutorInfo.tutorName,
          email: tutorInfo.email,
          contactNumber: tutorInfo.contactNumber,
          address: tutorInfo.address,
          city: tutorInfo.city,
          skills: tutorInfo.skills,
          teachingExperience: tutorInfo.teachingExperience ? parseInt(tutorInfo.teachingExperience) : undefined,
          teachingMode: tutorInfo.teachingMode,
          timezone: tutorInfo.timezone
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tutor information');
      }

      // Show success message
      toast.success('Tutor information saved successfully!');
      
      // Reload the page after a short delay to show the toast message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving tutor info:', error);
      toast.error(error.message || 'Failed to save tutor information');
      setIsSavingTutorInfo(false);
    }
  };

  const settingsNavItems = [
    { id: 'tutor', label: '👤 Tutor Info', section: 'General' },
    ...(userData?.academyId ? [
      { id: 'policies', label: '📋 Policies', section: 'Academy' },
      { id: 'payout', label: '💰 Your Payout', section: 'Academy' }
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
          {/* Tutor Info Section */}
          {activeSection === 'tutor' && (
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
                Tutor Information
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                Update your tutor details
              </div>

              {/* Loader */}
              {isLoadingTutorInfo ? (
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
                      Loading tutor information...
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
                    {/* Tutor Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Tutor Name
                      </label>
                      <input
                        type="text"
                        value={tutorInfo.tutorName}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, tutorName: e.target.value })}
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
                        placeholder="Enter tutor name"
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
                        value={tutorInfo.email}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, email: e.target.value })}
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

                  {/* Contact Number and City Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Contact Number */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={tutorInfo.contactNumber}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, contactNumber: e.target.value })}
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
                        placeholder="Enter contact number"
                      />
                    </div>

                    {/* City */}
                    <div>
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
                        value={tutorInfo.city}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, city: e.target.value })}
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
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: '20px' }}>
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
                      value={tutorInfo.address}
                      onChange={(e) => setTutorInfo({ ...tutorInfo, address: e.target.value })}
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

                  {/* Skills and Teaching Experience Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Skills */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Skills
                      </label>
                      <input
                        type="text"
                        value={tutorInfo.skills}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, skills: e.target.value })}
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
                        placeholder="Enter skills"
                      />
                    </div>

                    {/* Teaching Experience */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Teaching Experience (Years)
                      </label>
                      <input
                        type="number"
                        value={tutorInfo.teachingExperience}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, teachingExperience: e.target.value })}
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
                        placeholder="Enter years of experience"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>

                  {/* Teaching Mode and Timezone Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Teaching Mode */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}>
                        Teaching Mode
                      </label>
                      <select
                        value={tutorInfo.teachingMode}
                        onChange={(e) => setTutorInfo({ ...tutorInfo, teachingMode: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s',
                          fontFamily: 'inherit',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#6200EA'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      >
                        <option value="">Select teaching mode</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
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
                            {tutorInfo.timezone
                              ? getTzDisplay(tutorInfo.timezone)
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
                                      setTutorInfo((p) => ({
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
                                        setTutorInfo((p) => ({
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
                                        background: tutorInfo.timezone === tz.value ? '#f3e8ff' : 'transparent',
                                        color: tutorInfo.timezone === tz.value ? '#6200EA' : '#1a1a1a',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (tutorInfo.timezone !== tz.value) {
                                          e.currentTarget.style.background = '#f5f5f7';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (tutorInfo.timezone !== tz.value) {
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
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <button
                      onClick={handleSaveTutorInfo}
                      disabled={isSavingTutorInfo}
                      style={{
                        padding: '12px 24px',
                        background: isSavingTutorInfo 
                          ? '#ccc' 
                          : 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isSavingTutorInfo ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: isSavingTutorInfo ? 'none' : '0 4px 12px rgba(98, 0, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSavingTutorInfo) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(98, 0, 234, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSavingTutorInfo) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(98, 0, 234, 0.3)';
                        }
                      }}
                    >
                      {isSavingTutorInfo ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
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

          {/* Payout Settings Section */}
          {activeSection === 'payout' && (
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
                Your Payout Settings
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px'
              }}>
                View your payout settings configured by your academy
              </div>

              {isLoadingPayout ? (
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
                      Loading payout settings...
                    </div>
                  </div>
                </>
              ) : payoutSettings ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Commission Model */}
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
                      Commission Model
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: 500
                    }}>
                      {payoutSettings.commissionModel || 'Not set'}
                    </div>
                  </div>

                  {/* Commission Percentage */}
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
                      Commission Percentage
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: 500
                    }}>
                      {payoutSettings.commissionPercentage !== undefined ? `${payoutSettings.commissionPercentage}%` : 'Not set'}
                    </div>
                    {payoutSettings.commissionPercentage !== undefined && (
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px'
                      }}>
                        You get {payoutSettings.commissionPercentage}%, Academy gets {100 - payoutSettings.commissionPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Payout Frequency */}
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
                      Payout Frequency
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: 500
                    }}>
                      {payoutSettings.payoutFrequency || 'Not set'}
                    </div>
                  </div>

                  {/* Minimum Payout Amount */}
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
                      Minimum Payout Amount
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: 500
                    }}>
                      {payoutSettings.minimumPayoutAmount || 'Not set'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#999'
                }}>
                  <p>No payout settings found. Please contact your academy administrator.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

