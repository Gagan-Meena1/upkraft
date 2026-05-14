"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './book-slot.css';
import { HOBBIES, TUTORS, WEEK, buildSlots, generateWeek } from './data';

type ScreenType = 'home' | 'categories' | 'slots' | 'confirm';
type TimeFilterType = 'all' | 'morning' | 'afternoon' | 'evening';

export default function BookSlotPage() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [society, setSociety] = useState<any>(null);
  const [city, setCity] = useState('Bengaluru');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [hobby, setHobby] = useState<any>(null);
  const [day, setDay] = useState<number>(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const currentWeek = generateWeek(weekOffset);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  
  const [allSocieties, setAllSocieties] = useState<any[]>([]);
  const [citySocieties, setCitySocieties] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [catFilter, setCatFilter] = useState('Music');
  
  const [formOpen, setFormOpen] = useState(false);
  const [formTutor, setFormTutor] = useState('');
  const [formSlotTime, setFormSlotTime] = useState('');
  const [formRawSlotTime, setFormRawSlotTime] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', pname: '', age: '', notes: '', consent: false
  });
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [initialFormOpen, setInitialFormOpen] = useState(true);
  
  const initialSubmitDisabled = !(
    formData.name.trim().length >= 2 &&
    formData.phone.trim().length === 10 &&
    formData.pname.trim().length >= 2 &&
    Number(formData.age) > 0 &&
    /^\S+@\S+\.\S+$/.test(formData.email)
  );
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [confirmName, setConfirmName] = useState('');
  const [showCustomSocietyModal, setShowCustomSocietyModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch("/Api/salesHead/society");
        const data = await res.json();
        if (data.success && data.societies) {
          const mapped = data.societies.map((s: any) => ({
            id: s._id,
            name: s.name,
            city: s.city,
            isPopular: s.isPopular,
            tutors: s.tutors || [],
            hobbies: Math.floor(Math.random() * 5) + 3,
            units: 1000,
          }));
          setAllSocieties(mapped);
        }
      } catch (err) {
        console.error("Error fetching societies:", err);
      }
    };
    fetchSocieties();
  }, []);

  useEffect(() => {
    const filtered = allSocieties.filter((s) => {
      const sCity = s.city.toLowerCase();
      if (city === 'Bengaluru') {
        return sCity.includes('bengaluru') || sCity.includes('bangalore');
      } else if (city === 'Gurugram') {
        return sCity.includes('gurugram') || sCity.includes('gurgaon');
      }
      return false;
    });
    setCitySocieties(filtered);
  }, [allSocieties, city]);

  useEffect(() => {
    const ok = formData.name.trim().length >= 2 &&
               formData.phone.trim().length === 10 &&
               formData.pname.trim().length >= 2 &&
               Number(formData.age) > 0 &&
               formData.consent;
    setSubmitDisabled(!ok);
  }, [formData]);

  const showToastMsg = (msg: string, type: string = '') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const goTo = (s: ScreenType) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setShowSuggestions(false);
      return;
    }
    const hits = citySocieties.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
    setSuggestions(hits);
    setShowSuggestions(true);
  };

  const selectSociety = (soc: any) => {
    setSociety(soc);
    setSearchQuery('');
    setShowSuggestions(false);
    setCatFilter('Music');
    goTo('categories');
  };

  const selectHobby = (h: any) => {
    setHobby(h);
    setDay(0);
    setTimeFilter('all');
    
    if (society && typeof society.id === 'string' && society.id.startsWith('custom-')) {
      setShowCustomSocietyModal(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      return;
    }

    goTo('slots');
  };

  const openForm = (tutorName: string, slotTime: string, rawSlotStartTime: Date) => {
    setFormTutor(tutorName);
    setFormSlotTime(slotTime);
    setFormRawSlotTime(rawSlotStartTime);
    setFormOpen(true);
  };

  const submitForm = async () => {
    try {
      setSubmitDisabled(true);
      const tutor = society.tutors.find((t: any) => t.username === formTutor || t.name === formTutor);
      
      // Store the details for future requirement
      const bookingDetails = {
        ...formData,
        society,
        hobby,
        tutorId: tutor?._id,
        tutorName: formTutor,
        date: formRawSlotTime?.toISOString(),
        slotTime: formSlotTime
      };
      
      console.log('Booking details stored for future requirement:', bookingDetails);

      // Simulate a successful API response
      setTimeout(() => {
        setConfirmName(formData.name.split(' ')[0]);
        setFormOpen(false);
        goTo('confirm');
        showToastMsg('🎉 Slot blocked successfully!', 'ok');
      }, 300);

    } catch (err) {
      showToastMsg('Network error while booking slot', 'err');
      setSubmitDisabled(false);
    }
  };

  const filteredHobbies = catFilter === 'All' ? HOBBIES : HOBBIES.filter(h => h.cat === catFilter);
  const activeStep = { home: 1, categories: 2, slots: 3, confirm: 4 }[screen];

  const activeTutors = (() => {
    if (society && society.tutors && society.tutors.length > 0 && typeof society.tutors[0] === 'object') {
      return society.tutors.map((t: any) => ({
        id: t._id,
        name: t.username || "Tutor",
        emoji: "👨‍🏫",
        profileImage: t.profileImage || null,
        exp: (t.experience || 5) + " yrs",
        rating: "4.8",
        bio: t.aboutMyself || t.skills || "Certified UpKraft tutor",
        demoSlotsAvailable: t.demoSlotsAvailable || [],
        classes: t.classes || []
      }));
    }
    return [];
  })();

  const getDynamicSlots = (tutor: any, dayIdx: number, currentSocietyId: string) => {
    const dayDate = currentWeek[dayIdx].date;
    const targetDateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

    const slotsForDay = tutor.demoSlotsAvailable.filter((slot: any) => {
      if (!slot.startTime) return false;
      const st = new Date(slot.startTime);
      const slotDateStr = `${st.getFullYear()}-${String(st.getMonth() + 1).padStart(2, '0')}-${String(st.getDate()).padStart(2, '0')}`;
      return slotDateStr === targetDateStr;
    });

    const bands = [
      { band: "Morning", slots: [] as any[] },
      { band: "Afternoon", slots: [] as any[] },
      { band: "Evening", slots: [] as any[] }
    ];

    slotsForDay.forEach((slot: any) => {
      const st = new Date(slot.startTime);
      const et = new Date(slot.endTime);

      let currentSt = new Date(st);
      while (currentSt.getTime() + 45 * 60000 <= et.getTime()) {
        const hours = currentSt.getHours();
        
        let bandIdx = 0;
        if (hours >= 12 && hours < 17) bandIdx = 1;
        else if (hours >= 17) bandIdx = 2;

        const timeStr = currentSt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const slotStartMs = currentSt.getTime();
        const slotEndMs = slotStartMs + 45 * 60000;
        
        let type = "avail";
        let label = "Available";
        if (slot.societyId === currentSocietyId) {
          type = "soc";
          label = "Your society";
        }

        // Check for overlap with existing classes
        const isBlocked = tutor.classes?.some((cls: any) => {
          if (cls.status === 'canceled' || cls.status === 'rescheduled') return false;
          const clsStart = new Date(cls.startTime).getTime();
          const clsEnd = new Date(cls.endTime).getTime();
          return (slotStartMs < clsEnd && slotEndMs > clsStart);
        });

        if (isBlocked) {
          type = "blocked";
          label = "Booked";
        }

        bands[bandIdx].slots.push({
          time: timeStr,
          type: type,
          label: label,
          rawSlotStartTime: new Date(currentSt)
        });

        // advance by 60 minutes (45 min class + 15 min buffer)
        currentSt = new Date(currentSt.getTime() + 60 * 60000);
      }
    });

    bands.forEach(b => b.slots.sort((a, b) => a.rawSlotStartTime.getTime() - b.rawSlotStartTime.getTime()));

    return bands.filter(b => b.slots.length > 0);
  };

  const getDayAvailability = (dayIdx: number) => {
    let a=0,s=0;
    activeTutors.forEach((t: any) => {
      const bands = getDynamicSlots(t, dayIdx, society?.id);
      bands.forEach(band => {
        band.slots.forEach(sl => {
          if(sl.type === "avail") a++;
          if(sl.type === "soc")   s++;
        });
      });
    });
    return { avail: a, soc: s, total: a + s };
  };

  const renderTutors = () => {
    if (!hobby) return null;
    
    if (activeTutors.length === 0) {
      return (
        <div className="empty-day" style={{ padding: '40px 20px' }}>
          <div className="em-icon">😔</div>
          <p><strong>Right now any tutor is not available.</strong><br/>
             Please contact our support directly.<br/>
             Support email: <a href="mailto:support@upkraft.in" style={{color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none'}}>support@upkraft.in</a></p>
        </div>
      );
    }

    const { total } = getDayAvailability(day);

    if (total === 0) {
      return (
        <div className="empty-day">
          <div className="em-icon">📅</div>
          <p><strong>No classes on {currentWeek[day].full}</strong><br/>
             Tutors are not visiting your society on this day.<br/>
             Try selecting another day for the most availability.</p>
        </div>
      );
    }

    return activeTutors.map((t, tidx) => {
      const bands = getDynamicSlots(t, day, society?.id);
      const isVisiting = bands.length > 0;
      
      const bandMap: Record<string, string[]> = {
        morning: ['Morning'], afternoon: ['Afternoon'], evening: ['Evening'], all: ['Morning','Afternoon','Evening']
      };
      const visibleBands = bandMap[timeFilter] || bandMap.all;
      const filteredBands = bands.filter(b => visibleBands.includes(b.band));

      const bandHtml = filteredBands.length === 0
        ? <div className="empty-day" style={{ margin: 12 }}><p>No slots in this time range. Try a different filter.</p></div>
        : filteredBands.map((band, bidx) => (
            <div className="slots-time-band" key={bidx}>
              <div className="slots-band-label">{band.band}</div>
              <div className="slots-grid">
                {band.slots.map((sl, slidx) => {
                  if (sl.type === 'buf') return <div key={slidx} className="slot-pill buf"><span className="stime">—</span><span className="slabel">{sl.label}</span></div>;
                  if (sl.type === 'blocked') return <div key={slidx} className="slot-pill blocked"><span className="stime">{sl.time}</span></div>;
                  if (sl.type === 'soc') return (
                    <div key={slidx} className="slot-pill soc" role="button" tabIndex={0} onClick={() => openForm(t.name, sl.time, sl.rawSlotStartTime)}>
                      <span className="stime">{sl.time}</span>
                    </div>
                  );
                  return (
                    <div key={slidx} className="slot-pill avail" role="button" tabIndex={0} onClick={() => openForm(t.name, sl.time, sl.rawSlotStartTime)}>
                      <span className="stime">{sl.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ));

      return (
        <div className="tutor-block" key={tidx}>
          <div className="tutor-top">
            <div className="tutor-ava">
              {t.profileImage ? <img src={t.profileImage} alt={t.name} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} /> : t.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tutor-name">{t.name}</div>
              <div className="tutor-detail"><span className="stars">★★★★★</span><span>{t.rating} rating</span><span style={{ opacity: .3 }}>·</span><span>{t.exp} exp.</span></div>
              <div className="tutor-bio">{t.bio}</div>
            </div>
            <div className="tutor-right">
              <div className="tutor-verify">✔ Verified</div>
              {isVisiting
                ? <div className="tutor-visit-badge">📍 Visiting your<br/>society today</div>
                : <div className="tutor-not-visiting">Not visiting<br/>this day</div>}
            </div>
          </div>
          <div className="slots-wrap">{bandHtml}</div>
        </div>
      );
    });
  };

  return (
    <div className="book-slot-container">
      {/* TOPBAR */}
      <nav className="topbar">
        <Link className="upkraft-logo" href="/" aria-label="UpKraft home">
          <span className="uk-logo-pill">
            <img src="/logo.png" alt="UpKraft" className="uk-img" style={{ height: '34px' }} />
          </span>
        </Link>
        <div className="topbar-steps">
          <div className={`step ${activeStep > 1 ? 'done' : activeStep === 1 ? 'active' : ''}`}><span className="step-dot"></span>Find Society</div>
          <div className="step-sep"></div>
          <div className={`step ${activeStep > 2 ? 'done' : activeStep === 2 ? 'active' : ''}`}><span className="step-dot"></span>Hobby</div>
          <div className="step-sep"></div>
          <div className={`step ${activeStep > 3 ? 'done' : activeStep === 3 ? 'active' : ''}`}><span className="step-dot"></span>Pick Slot</div>
          <div className="step-sep"></div>
          <div className={`step ${activeStep === 4 ? 'active' : ''}`}><span className="step-dot"></span>Confirm</div>
        </div>
        <div className="topbar-city" style={{ position: 'relative' }} onClick={() => setShowCityDropdown(!showCityDropdown)}>
          📍 <span>{city}</span> ▾
          {showCityDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff', border: '1px solid var(--border2)', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
              <div style={{ padding: '6px 16px', cursor: 'pointer', borderRadius: '8px', ...(city === 'Bengaluru' ? { background: 'var(--primary-lite)', color: 'var(--primary)', fontWeight: '600' } : {}) }} onClick={() => setCity('Bengaluru')}>Bengaluru</div>
              <div style={{ padding: '6px 16px', cursor: 'pointer', borderRadius: '8px', ...(city === 'Gurugram' ? { background: 'var(--primary-lite)', color: 'var(--primary)', fontWeight: '600' } : {}) }} onClick={() => setCity('Gurugram')}>Gurugram</div>
            </div>
          )}
        </div>
      </nav>

      {/* SCREEN 1: HOME */}
      {screen === 'home' && (
        <div className="screen active">
          <section className="hero-section">
            <div className="hero-glow"></div>
            <div className="hero-eyebrow">✦ Skills At Your Doorstep ✦</div>
            <h1 className="hero-h1">UpKraft your skills,<br/><em>right in your society</em></h1>
            <p className="hero-sub">Discover certified tutors at your society, pick a slot &amp; lock your free trial — just like booking a movie!</p>
            <div className="search-wrap" ref={searchRef}>
              <span className="search-ico">🏢</span>
              <input 
                className="search-box" 
                type="text" 
                placeholder="Search your society name…" 
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                }}
                autoComplete="off"
              />
              <button 
                className={`search-clear ${searchQuery ? 'show' : ''}`} 
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
              >✕</button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions" style={{ display: 'block' }}>
                  {suggestions.map((s: any) => (
                    <div 
                      key={s.id} 
                      className="sug-item" 
                      onClick={() => selectSociety(s)}
                      role="button"
                      tabIndex={0}
                    >
                      <span style={{ color: 'var(--red)', fontSize: '16px' }}>🏢</span>
                      <span><strong>{s.name}</strong></span>
                      <span className="sug-meta">{s.city} · {s.hobbies} hobbies</span>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="suggestions" style={{ display: 'block' }}>
                  <div 
                    className="sug-item" 
                    style={{ cursor: 'pointer', color: 'var(--text)' }}
                    onClick={() => selectSociety({ id: 'custom-' + Date.now(), name: searchQuery, city: city, isPopular: false, tutors: [], hobbies: 5, units: 1000 })}
                    role="button"
                    tabIndex={0}
                  >
                    <span>😕</span><span>No societies found! <strong style={{ color: 'var(--primary)' }}>Add Yours</strong></span>
                  </div>
                </div>
              )}
            </div>
          </section>
          <div className="home-body">
            <div className="promo-banner">
              <div className="promo-badge">NEW</div>
              <p><strong>More societies & Hobbies</strong> are coming soon ! </p>
            </div>
            <div className="section-head">Popular Societies</div>
            <div className="chips">
              {(() => {
                const popular = citySocieties.filter(s => s.isPopular);
                const displaySocieties = popular.length > 0 ? popular.slice(0, 5) : citySocieties.slice(0, 5);
                return displaySocieties.map(s => (
                  <button key={s.id} className="chip" onClick={() => selectSociety(s)}>{s.name}</button>
                ));
              })()}
            </div>
            <div className="section-head">Other Societies</div>
            <div className="chips">
              {(() => {
                const popular = citySocieties.filter(s => s.isPopular);
                const hasPopular = popular.length > 0;
                const others = citySocieties.filter(s => hasPopular ? !s.isPopular : false);
                // If there are no popular ones explicitly, we already showed the first 5 as popular. 
                // So 'others' would be the rest.
                const displayOthers = hasPopular ? others : citySocieties.slice(5);
                
                if (displayOthers.length === 0) {
                  return <div style={{ fontSize: 13, color: 'var(--muted)' }}>No other societies found in this city.</div>;
                }
                
                return displayOthers.map(s => (
                  <button key={s.id} className="chip" style={{ background: '#f8f9fa' }} onClick={() => selectSociety(s)}>{s.name}</button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: CATEGORIES */}
      {screen === 'categories' && society && (
        <div className="screen active">
          <div className="page-header">
            <button className="back-btn" onClick={() => goTo('home')}>←</button>
            <div className="page-hinfo">
              <h2>{society.name}</h2>
              <p className="breadcrumb">Home › <strong>{society.name}</strong></p>
            </div>
          </div>
          <div className="filter-bar">
            {['Music'].map(f => (
              <button key={f} className={`fbtn ${catFilter === f ? 'active' : ''}`} onClick={() => setCatFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="movies-grid">
            {filteredHobbies.map(h => (
              <div className="movie-card" key={h.id} onClick={() => selectHobby(h)}>
                <div className="movie-poster" style={{ background: `linear-gradient(145deg,${h.col[0]},${h.col[1]})` }}>
                  {h.new && <div className="poster-new">NEW</div>}
                  {h.hot && !h.new && <div className="poster-hot">🔥 HOT</div>}
                  <span style={{ fontSize: 52 }}>{h.emoji}</span>
                  <div className="poster-rating">⭐ {h.rating}</div>
                  <div className="poster-slots">{h.slots} slots</div>
                </div>
                <div className="movie-info">
                  <div className="movie-title">{h.name}</div>
                  <div className="movie-cat">{h.cat} · {h.tutors} tutor{h.tutors > 1 ? 's' : ''}</div>
                  <div className="tag-row">
                    <span className="tag">{h.age}</span>
                    <span className="tag green">Free trial</span>
                    {h.new && <span className="tag blue">New</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 3: SLOTS */}
      {screen === 'slots' && society && hobby && (
        <div className="screen active">
          <div className="page-header">
            <button className="back-btn" onClick={() => goTo('categories')}>←</button>
            <div className="page-hinfo">
              <h2>{hobby.name}</h2>
              <p className="breadcrumb">Home › {society.name} › <strong>{hobby.name}</strong></p>
            </div>
          </div>
          <div className="movie-hero-bar">
            <div className="mh-poster" style={{ background: `linear-gradient(145deg,${hobby.col[0]},${hobby.col[1]})` }}>{hobby.emoji}</div>
            <div className="mh-info">
              <h2>{hobby.name}</h2>
              <p className="mh-meta">{hobby.desc}</p>
              <div className="mh-tags">
                <span className="mh-tag age">{hobby.age}</span>
                <span className="mh-tag lang">English / Hindi</span>
                <span className="mh-tag loc">In-Society</span>
              </div>
              <div className="mh-avail"><span></span> Slots available this week</div>
            </div>
          </div>

          <div className="week-tabs-wrapper">
            <div className="week-tabs-label">Select a day to view slots</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setDay(0); }} 
                disabled={weekOffset === 0}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border2)', 
                  borderRadius: '50%', width: 36, height: 36, cursor: weekOffset === 0 ? 'not-allowed' : 'pointer',
                  opacity: weekOffset === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, padding: 0
                }}
              >
                ←
              </button>
              <div className="week-tabs-grid" style={{ flex: 1 }}>
                {currentWeek.map((d, i) => {
                  const { avail, soc, total } = getDayAvailability(i);
                  const hasSlots = total > 0;
                  let pillClass = 'none', pillText = 'No slots';
                  if (soc > 0) { pillClass = 'soc'; pillText = `${soc} priority`; }
                  else if (avail > 0) { pillClass = 'has'; pillText = `${avail} open`; }

                  return (
                    <div key={i} className={`wday ${i === day ? 'active' : ''} ${!hasSlots ? 'no-slots' : ''}`}
                      onClick={() => { if (hasSlots) setDay(i); else showToastMsg('No slots on this day', 'err'); }}>
                      {i === 0 && weekOffset === 0 && <div className="wday-today-dot"></div>}
                      <span className="wday-name">{d.short}</span>
                      <span className="wday-num">{d.num}</span>
                      <span className="wday-mon">{d.mon}</span>
                      <span className={`wday-slots ${pillClass}`}>{pillText}</span>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => { setWeekOffset(w => w + 1); setDay(0); }} 
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border2)', 
                  borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, padding: 0
                }}
              >
                →
              </button>
            </div>
          </div>

          <div className="selected-day-bar">
            <span className="sdb-date">{currentWeek[day].label}</span>
            {(() => {
              const { avail, soc } = getDayAvailability(day);
              if (soc > 0) return <span className="sdb-pill soc">{soc} priority slots for your society</span>;
              if (avail > 0) return <span className="sdb-pill">{avail} slots available</span>;
              return <span className="sdb-pill empty">No slots this day</span>;
            })()}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>Tap a slot to book your free trial</span>
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 22px 0', margin: 0 }}>Slots not working? Request a callback</p>
          <div className="slot-filters" style={{ flexWrap: 'wrap' }}>
            <span className="sf-label">Filter</span>
            <div className="sf-chips" style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button className={`sf-chip ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>All Times</button>
              <button className={`sf-chip ${timeFilter === 'morning' ? 'active' : ''}`} onClick={() => setTimeFilter('morning')}>🌅 Morning (10am–12pm)</button>
              <button className={`sf-chip ${timeFilter === 'afternoon' ? 'active' : ''}`} onClick={() => setTimeFilter('afternoon')}>☀️ Afternoon (12pm–5pm)</button>
              <button className={`sf-chip ${timeFilter === 'evening' ? 'active' : ''}`} onClick={() => setTimeFilter('evening')}>🌆 Evening (5pm–9pm)</button>
              <button className="sf-chip" style={{ marginLeft: 'auto', background: 'var(--primary-lite)', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }} onClick={() => { setShowCallbackModal(true); setTimeout(() => setShowCallbackModal(false), 3000); }}>📞 Request A Call</button>
            </div>
          </div>

          <div className="tutors-area">{renderTutors()}</div>

          <div className="legend-bar">
            <div className="leg"><div className="leg-box a"></div>Available</div>
            <div className="leg"><div className="leg-box s"></div>Priority — your society</div>
            <div className="leg"><div className="leg-box b"></div>Booked</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>Tap a slot to block your free trial</div>
          </div>
        </div>
      )}

      {/* SCREEN 4: CONFIRM */}
      {screen === 'confirm' && (
        <div className="screen active">
          <div className="confirm-wrap">
            <div className="confirm-anim">🎉</div>
            <div className="confirm-title">All set, <span>{confirmName}</span>!</div>
            <p className="confirm-sub">Your free trial slot is blocked. Our team will call within <strong style={{ color: 'var(--text)' }}>24 hours</strong> to confirm the session.</p>
            <div className="confirm-card">
              <div className="confirm-card-head">Booking Summary</div>
              <div id="confirm-rows">
                <div className="cr"><span className="k">Society</span><span className="v">{society?.name}</span></div>
                <div className="cr"><span className="k">Hobby</span><span className="v">{hobby?.emoji} {hobby?.name}</span></div>
                <div className="cr"><span className="k">Tutor</span><span className="v">{formTutor}</span></div>
                <div className="cr"><span className="k">Date &amp; Slot</span><span className="v">{currentWeek[day]?.label} · <span className="green">{formSlotTime}</span></span></div>
                <div className="cr"><span className="k">Participant</span><span className="v">{formData.pname} ({formData.age} yrs)</span></div>
                <div className="cr"><span className="k">Contact</span><span className="v">+91 {formData.phone}</span></div>
              </div>
            </div>
            <div className="confirm-note"><span style={{ fontSize: 16, flexShrink: 0 }}>💡</span><div>This is a free trial enquiry — no payment required. A team member will confirm the slot and share class details with you.</div></div>
            <button className="home-btn" onClick={() => goTo('home')}>Explore More Classes →</button>
            <button className="home-btn secondary" onClick={() => goTo('categories')}>Back to Hobbies</button>
          </div>
        </div>
      )}

      {/* INITIAL FORM OVERLAY */}
      {initialFormOpen && (
        <div className="overlay show" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="sheet" style={{ maxWidth: '500px', margin: 'auto' }}>
            <div className="sheet-head">
              <span className="sheet-title">Enter Details</span>
            </div>
            <p className="sheet-sub">Please fill in your details to continue.</p>
            
            <div className="form-row">
              <div className="flabel">Your Name <span className="req">*</span></div>
              <input className="finput" placeholder="Full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-row two">
              <div>
                <div className="flabel">Mobile <span className="req">*</span></div>
                <input className="finput" placeholder="10-digit number" maxLength={10} inputMode="numeric" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <div className="flabel">Email <span className="req">*</span></div>
                <input className="finput" placeholder="your@email.com" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="form-row two">
              <div>
                <div className="flabel">Participant Name <span className="req">*</span></div>
                <input className="finput" placeholder="Who will attend?" value={formData.pname} onChange={e => setFormData({ ...formData, pname: e.target.value })} />
              </div>
              <div>
                <div className="flabel">Age <span className="req">*</span></div>
                <input className="finput" placeholder="e.g. 10" type="number" min={1} max={99} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="flabel">City <span className="req">*</span></div>
              <select className="finput" value={city} onChange={e => setCity(e.target.value)}>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Gurugram">Gurugram</option>
              </select>
            </div>
            <div className="form-row">
              <div className="flabel">Notes</div>
              <textarea className="finput ta" rows={2} placeholder="Special requirements? (optional)" maxLength={250} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="submit-btn" style={{ background: '#f5f5fa', color: 'var(--muted)', border: '1px solid var(--border2)' }} onClick={() => window.location.href = '/'}>Cancel</button>
              <button className="submit-btn" disabled={initialSubmitDisabled} onClick={() => setInitialFormOpen(false)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL BOOKING FORM OVERLAY */}
      {formOpen && society && hobby && (
        <div className="overlay show" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="sheet" style={{ maxWidth: '500px', margin: 'auto' }}>
            <div className="sheet-handle"></div>
            <div className="sheet-head">
              <span className="sheet-title">Block Free Trial Slot</span>
              <button className="sheet-close" onClick={() => setFormOpen(false)}>✕</button>
            </div>
            <p className="sheet-sub">Reserving {formSlotTime} at {society.name}</p>
            <div className="booking-pill">
              <div className="bp-item"><div className="bpl">Hobby</div><div className="bpv">{hobby.emoji} {hobby.name}</div></div>
              <div className="bp-item"><div className="bpl">Tutor</div><div className="bpv">{formTutor}</div></div>
              <div className="bp-item"><div className="bpl">Day &amp; Date</div><div className="bpv">{currentWeek[day].label}</div></div>
              <div className="bp-item"><div className="bpl">Slot Time</div><div className="bpv green">{formSlotTime}</div></div>
            </div>
            
            <div className="consent-row">
              <input type="checkbox" id="f-consent" checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} />
              <label htmlFor="f-consent">I agree to be contacted by the UpKraft team for trial class confirmation and updates.</label>
            </div>
            <button className="submit-btn" disabled={submitDisabled} onClick={submitForm}>Confirm Free Trial →</button>
          </div>
        </div>
      )}

      {/* CUSTOM SOCIETY SUCCESS MODAL */}
      {showCustomSocietyModal && (
        <div className="overlay show" style={{ backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px 24px', borderRadius: '24px', textAlign: 'center', maxWidth: '320px', width: '90%', animation: 'popIn 0.4s ease', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😀</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>We Received your details!</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5', margin: 0 }}>Our Team will get back to you shortly.</p>
          </div>
        </div>
      )}

      {/* CALLBACK SUCCESS MODAL */}
      {showCallbackModal && (
        <div className="overlay show" style={{ backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '32px 24px', borderRadius: '24px', textAlign: 'center', maxWidth: '320px', width: '90%', animation: 'popIn 0.4s ease', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>We Received your details!</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5', margin: 0 }}>Our Team will call you shortly.</p>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`} role="alert">{toast.message}</div>
    </div>
  );
}
