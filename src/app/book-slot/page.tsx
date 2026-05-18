"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './book-slot.css';
import { HOBBIES, TUTORS, WEEK, buildSlots, generateWeek } from './data';
import LogoHeader from '@/assets/LogoHeader copy.png';

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
      if (city === 'Bengaluru') return sCity.includes('bengaluru') || sCity.includes('bangalore');
      if (city === 'Gurugram') return sCity.includes('gurugram') || sCity.includes('gurgaon');
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

  const showToastMsg = (msg: string, type = '') => {
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
    if (q.trim().length < 2) { setShowSuggestions(false); return; }
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
      setTimeout(() => { window.location.href = '/'; }, 3000);
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
      const bookingDetails = {
        ...formData,
        society,
        hobby,
        tutorId: tutor?._id || tutor?.id,
        tutorName: formTutor,
        date: formRawSlotTime?.toISOString(),
        slotTime: formSlotTime
      };
      const res = await fetch('/Api/public/bookTrial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDetails)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmName(formData.name.split(' ')[0]);
        setFormOpen(false);
        goTo('confirm');
        showToastMsg('🎉 Slot blocked successfully!', 'ok');
      } else {
        showToastMsg(data.message || 'Error booking slot', 'err');
        setSubmitDisabled(false);
      }
    } catch (err) {
      showToastMsg('Network error while booking slot', 'err');
      setSubmitDisabled(false);
    }
  };

  const filteredHobbies = catFilter === 'All' ? HOBBIES : HOBBIES.filter(h => h.cat === catFilter);
  const activeStep = { home: 1, categories: 2, slots: 3, confirm: 4 }[screen];

  // Map hobby names to instrument values
  const HOBBY_TO_INSTRUMENT: Record<string, string> = {
    'Guitar': 'Guitar',
    'Keyboard & Piano': 'Piano',
    'Vocals': 'Vocals',
    'Violin': 'Violin',
    'Drum': 'Drum',
  };

  const activeTutors = (() => {
    if (society && society.tutors && society.tutors.length > 0 && typeof society.tutors[0] === 'object') {
      const allTutors = society.tutors.map((t: any) => {
        const idStr = (t._id || '').toString();
        const seed = idStr.split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
        const rating = (4.5 + (seed % 6) * 0.1).toFixed(1);
        return {
          id: t._id,
          name: t.username || "Tutor",
          emoji: "👨‍🏫",
          profileImage: t.profileImage || null,
          exp: (t.experience || 8) + " yrs",
          rating,
          bio: t.aboutMyself || t.skills || "Certified UpKraft tutor",
          demoSlotsAvailable: t.demoSlotsAvailable || [],
          classes: t.classes || [],
          instruments: t.instruments || [],
        };
      });

      // Filter by hobby's mapped instrument (if applicable)
      const requiredInstrument = hobby ? HOBBY_TO_INSTRUMENT[hobby.name] : null;
      if (requiredInstrument) {
        return allTutors.filter((t: any) => t.instruments.includes(requiredInstrument));
      }
      return allTutors;
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

        let type = "avail", label = "Available";
        if (slot.societyId === currentSocietyId) { type = "soc"; label = "Your society"; }

        const isBlocked = tutor.classes?.some((cls: any) => {
          if (cls.status === 'canceled' || cls.status === 'rescheduled') return false;
          const clsStart = new Date(cls.startTime).getTime();
          const clsEnd = new Date(cls.endTime).getTime();
          return (slotStartMs < clsEnd && slotEndMs > clsStart);
        });

        if (isBlocked) { type = "blocked"; label = "Booked"; }

        bands[bandIdx].slots.push({ time: timeStr, type, label, rawSlotStartTime: new Date(currentSt) });
        currentSt = new Date(currentSt.getTime() + 60 * 60000);
      }
    });

    bands.forEach(b => b.slots.sort((a, b) => a.rawSlotStartTime.getTime() - b.rawSlotStartTime.getTime()));
    return bands.filter(b => b.slots.length > 0);
  };

  const getDayAvailability = (dayIdx: number) => {
    let a = 0, s = 0;
    activeTutors.forEach((t: any) => {
      getDynamicSlots(t, dayIdx, society?.id).forEach(band =>
        band.slots.forEach(sl => { if (sl.type === "avail") a++; if (sl.type === "soc") s++; })
      );
    });
    return { avail: a, soc: s, total: a + s };
  };

  const renderTutors = () => {
    if (!hobby) return null;
    if (activeTutors.length === 0) {
      return (
        <div className="bsp-empty-day">
          <div className="bsp-em-icon">😔</div>
          <p><strong>No tutors available right now.</strong><br />
            Contact: <a href="mailto:support@upkraft.in" style={{ color: 'var(--bsp-primary)', fontWeight: 700 }}>support@upkraft.in</a></p>
        </div>
      );
    }
    const { total } = getDayAvailability(day);
    if (total === 0) {
      return (
        <div className="bsp-empty-day">
          <div className="bsp-em-icon">📅</div>
          <p><strong>No classes on {currentWeek[day].full}</strong><br />Try a different day.</p>
        </div>
      );
    }

    return activeTutors.map((t, tidx) => {
      const bands = getDynamicSlots(t, day, society?.id);
      const isVisiting = bands.length > 0;
      const bandMap: Record<string, string[]> = {
        morning: ['Morning'], afternoon: ['Afternoon'], evening: ['Evening'], all: ['Morning', 'Afternoon', 'Evening']
      };
      const filteredBands = bands.filter(b => (bandMap[timeFilter] || bandMap.all).includes(b.band));

      const bandHtml = filteredBands.length === 0
        ? <div className="bsp-empty-day" style={{ margin: '8px 0' }}><p>No slots in this time range.</p></div>
        : filteredBands.map((band, bidx) => (
          <div className="bsp-slots-band" key={bidx}>
            <div className="bsp-slots-band-label">{band.band}</div>
            <div className="bsp-slots-grid">
              {band.slots.map((sl, slidx) => {
                if (sl.type === 'blocked') return (
                  <div key={slidx} className="bsp-slot-pill blocked"><span>{sl.time}</span></div>
                );
                if (sl.type === 'soc') return (
                  <div key={slidx} className="bsp-slot-pill soc" role="button" tabIndex={0}
                    onClick={() => openForm(t.name, sl.time, sl.rawSlotStartTime)}>
                    <span>{sl.time}</span>
                  </div>
                );
                return (
                  <div key={slidx} className="bsp-slot-pill avail" role="button" tabIndex={0}
                    onClick={() => openForm(t.name, sl.time, sl.rawSlotStartTime)}>
                    <span>{sl.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ));

      return (
        <div className="bsp-tutor-block" key={tidx}>
          <div className="bsp-tutor-top">
            <div className="bsp-tutor-ava">
              {t.profileImage
                ? <img src={t.profileImage} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                : t.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bsp-tutor-name">{t.name}</div>
              <div className="bsp-tutor-detail">
                <span className="bsp-stars">★★★★★</span>
                <span>{t.rating}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span>{t.exp} exp.</span>
              </div>
              <div className="bsp-tutor-bio">{t.bio}</div>
            </div>
            <div className="bsp-tutor-right">
              <div className="bsp-tutor-verify">✔ Verified</div>
              {isVisiting
                ? <div className="bsp-tutor-visit-badge">📍 Visiting<br />your society</div>
                : <div className="bsp-tutor-not-visiting">Not visiting<br />this day</div>}
            </div>
          </div>
          <div className="bsp-slots-wrap">{bandHtml}</div>
        </div>
      );
    });
  };

  return (
    <div className="bsp-root">

      {/* ── TOPBAR ── */}
      <nav className="bsp-topbar">
        <Link className="bsp-logo-wrap" href="/" aria-label="UpKraft home">
          <img src={LogoHeader.src} alt="UpKraft" />
        </Link>

        <div className="bsp-steps">
          {(['Find Society', 'Hobby', 'Pick Slot', 'Confirm'] as const).map((label, i) => {
            const n = i + 1;
            const cls = activeStep > n ? 'done' : activeStep === n ? 'active' : '';
            return (
              <React.Fragment key={label}>
                {i > 0 && <div className="bsp-step-sep" />}
                <div className={`bsp-step ${cls}`}>
                  <span className="bsp-step-dot" />
                  {label}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <button className="bsp-city-btn" onClick={() => setShowCityDropdown(v => !v)}>
            📍 {city} ▾
          </button>
          {showCityDropdown && (
            <div className="bsp-city-dropdown">
              {['Bengaluru', 'Gurugram'].map(c => (
                <div key={c} className={`bsp-city-option ${city === c ? 'sel' : ''}`}
                  onClick={() => { setCity(c); setShowCityDropdown(false); }}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── SCREEN 1: HOME ── */}
      {screen === 'home' && (
        <div className="bsp-screen">
          <section className="bsp-hero">
            <div className="bsp-hero-glow" />
            <div className="bsp-eyebrow">✦ Skills At Your Doorstep ✦</div>
            <h1 className="bsp-hero-h1">UpKraft your skills,<br /><em>right in your society</em></h1>
            <p className="bsp-hero-sub">Step 2: Find certified tutors at your society, pick a slot &amp; lock your free trial — just like booking a movie!</p>

            <div className="bsp-search-wrap" ref={searchRef}>
              <div className="bsp-search-inner">
                <span className="bsp-search-ico">🏢</span>
                <input
                  className="bsp-search-input"
                  type="text"
                  placeholder="Search your society name…"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => { if (searchQuery.trim().length >= 2) setShowSuggestions(true); }}
                  autoComplete="off"
                />
                <button className={`bsp-search-clear ${searchQuery ? 'show' : ''}`}
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}>✕</button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="bsp-suggestions">
                  {suggestions.map((s: any) => (
                    <div key={s.id} className="bsp-sug-item" onClick={() => selectSociety(s)} role="button" tabIndex={0}>
                      <span style={{ color: '#FF4757', fontSize: 16 }}>🏢</span>
                      <span><strong>{s.name}</strong></span>
                      <span className="bsp-sug-meta">{s.city} · {s.hobbies} hobbies</span>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="bsp-suggestions">
                  <div className="bsp-sug-item" style={{ cursor: 'pointer' }}
                    onClick={() => selectSociety({ id: 'custom-' + Date.now(), name: searchQuery, city, isPopular: false, tutors: [], hobbies: 5, units: 1000 })}
                    role="button" tabIndex={0}>
                    <span /><span><strong style={{ color: 'var(--bsp-primary)' }}>Add Your Society</strong></span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="bsp-home-body">
            <div className="bsp-promo">
              <div className="bsp-promo-badge">NEW</div>
              <p><strong>More societies &amp; Hobbies</strong> are coming soon!</p>
            </div>

            <div className="bsp-section-head">Popular Societies</div>
            <div className="bsp-chips">
              {(() => {
                const popular = citySocieties.filter(s => s.isPopular);
                const display = popular.length > 0 ? popular.slice(0, 5) : citySocieties.slice(0, 5);
                return display.map(s => (
                  <button key={s.id} className="bsp-chip" onClick={() => selectSociety(s)}>{s.name}</button>
                ));
              })()}
            </div>

            <div className="bsp-section-head">Other Societies</div>
            <div className="bsp-chips">
              {(() => {
                const popular = citySocieties.filter(s => s.isPopular);
                const hasPopular = popular.length > 0;
                const others = hasPopular ? citySocieties.filter(s => !s.isPopular) : citySocieties.slice(5);
                if (others.length === 0) return <div style={{ fontSize: 13, color: 'var(--bsp-muted)' }}>No other societies found.</div>;
                return others.map(s => (
                  <button key={s.id} className="bsp-chip" style={{ background: 'var(--bsp-bg)' }} onClick={() => selectSociety(s)}>{s.name}</button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 2: CATEGORIES ── */}
      {screen === 'categories' && society && (
        <div className="bsp-screen">
          <div className="bsp-page-header">
            <button className="bsp-back-btn" onClick={() => goTo('home')}>←</button>
            <div className="bsp-page-hinfo">
              <h2>{society.name}</h2>
              <p className="bsp-breadcrumb">Home › <strong>{society.name}</strong></p>
            </div>
          </div>

          <div className="bsp-filter-bar">
            {['Music'].map(f => (
              <button key={f} className={`bsp-fbtn ${catFilter === f ? 'active' : ''}`} onClick={() => setCatFilter(f)}>{f}</button>
            ))}
          </div>

          <div className="bsp-movies-grid">
            {filteredHobbies.map(h => (
              <div className="bsp-movie-card" key={h.id} onClick={() => selectHobby(h)}>
                <div className="bsp-movie-poster" style={{ background: `linear-gradient(145deg,${h.col[0]},${h.col[1]})` }}>
                  {h.new && <div className="bsp-poster-badge new">NEW</div>}
                  {h.hot && !h.new && <div className="bsp-poster-badge hot">🔥 HOT</div>}
                  <span style={{ fontSize: 52 }}>{h.emoji}</span>
                  <div className="bsp-poster-rating">⭐ {h.rating}</div>
                  <div className="bsp-poster-slots">{h.slots} slots</div>
                </div>
                <div className="bsp-movie-info">
                  <div className="bsp-movie-title">{h.name}</div>
                  <div className="bsp-movie-cat">{h.cat} · {h.tutors} tutor{h.tutors > 1 ? 's' : ''}</div>
                  <div className="bsp-tag-row">
                    <span className="bsp-tag">{h.age}</span>
                    <span className="bsp-tag green">Free trial</span>
                    {h.new && <span className="bsp-tag blue">New</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SCREEN 3: SLOTS ── */}
      {screen === 'slots' && society && hobby && (
        <div className="bsp-screen">
          <div className="bsp-page-header">
            <button className="bsp-back-btn" onClick={() => goTo('categories')}>←</button>
            <div className="bsp-page-hinfo">
              <h2>{hobby.name}</h2>
              <p className="bsp-breadcrumb">Home › {society.name} › <strong>{hobby.name}</strong></p>
            </div>
          </div>

          <div className="bsp-movie-hero-bar">
            <div className="bsp-mh-poster" style={{ background: `linear-gradient(145deg,${hobby.col[0]},${hobby.col[1]})` }}>
              {hobby.emoji}
            </div>
            <div className="bsp-mh-info">
              <h2>{hobby.name}</h2>
              <p className="bsp-mh-meta">{hobby.desc}</p>
              <div className="bsp-mh-tags">
                <span className="bsp-mh-tag age">{hobby.age}</span>
                <span className="bsp-mh-tag lang">English / Hindi</span>
                <span className="bsp-mh-tag loc">In-Society</span>
              </div>
              <div className="bsp-mh-avail">Slots available this week</div>
            </div>
          </div>

          {/* Week Picker */}
          <div className="bsp-week-tabs-wrapper">
            <div className="bsp-week-tabs-label">Select a day to view slots</div>
            <div className="bsp-week-nav-row">
              <button className="bsp-week-nav-btn"
                onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setDay(0); }}
                disabled={weekOffset === 0}>←</button>
              <div className="bsp-week-tabs-grid">
                {currentWeek.map((d, i) => {
                  const { avail, soc, total } = getDayAvailability(i);
                  const hasSlots = total > 0;
                  let pillClass = 'none', pillText = 'No slots';
                  if (soc > 0) { pillClass = 'soc'; pillText = `${soc} priority`; }
                  else if (avail > 0) { pillClass = 'has'; pillText = `${avail} open`; }
                  return (
                    <div key={i} className={`bsp-wday ${i === day ? 'active' : ''} ${!hasSlots ? 'no-slots' : ''}`}
                      onClick={() => { if (hasSlots) setDay(i); else showToastMsg('No slots on this day', 'err'); }}>
                      {i === 0 && weekOffset === 0 && <div className="bsp-wday-today-dot" />}
                      <span className="bsp-wday-name">{d.short}</span>
                      <span className="bsp-wday-num">{d.num}</span>
                      <span className="bsp-wday-mon">{d.mon}</span>
                      <span className={`bsp-wday-slots ${pillClass}`}>{pillText}</span>
                    </div>
                  );
                })}
              </div>
              <button className="bsp-week-nav-btn" onClick={() => { setWeekOffset(w => w + 1); setDay(0); }}>→</button>
            </div>
          </div>

          {/* Selected Day Info */}
          <div className="bsp-selected-day-bar">
            <span className="bsp-sdb-date">{currentWeek[day].label}</span>
            {(() => {
              const { avail, soc } = getDayAvailability(day);
              if (soc > 0) return <span className="bsp-sdb-pill soc">{soc} priority slots</span>;
              if (avail > 0) return <span className="bsp-sdb-pill">{avail} available</span>;
              return <span className="bsp-sdb-pill empty">No slots</span>;
            })()}
            <span className="bsp-sdb-hint">Tap a slot to book your free trial</span>
          </div>

          {/* Filters */}
          <div className="bsp-filters-panel">
            <div className="bsp-filters-row">
              <span className="bsp-filters-title">⏰ Filter by time</span>
              <div className="bsp-filters-chips">
                {(['all', 'morning', 'afternoon', 'evening'] as TimeFilterType[]).map(f => (
                  <button key={f} className={`bsp-sf-chip ${timeFilter === f ? 'active' : ''}`}
                    onClick={() => setTimeFilter(f)}>
                    {f === 'all' ? 'All' : f === 'morning' ? '🌅 Morning' : f === 'afternoon' ? '☀️ Afternoon' : '🌆 Evening'}
                  </button>
                ))}
              </div>
            </div>
            <div className="bsp-callback-banner"
              onClick={() => { setShowCallbackModal(true); setTimeout(() => setShowCallbackModal(false), 3000); }}>
              <span className="bsp-callback-icon">📞</span>
              <div className="bsp-callback-text">
                <span className="bsp-callback-title">Slots not working?</span>
                <span className="bsp-callback-sub">Tap here to request a callback</span>
              </div>
              <span className="bsp-callback-arrow">→</span>
            </div>
          </div>

          {/* Tutors */}
          <div className="bsp-tutors-area">{renderTutors()}</div>

          {/* Legend */}
          <div className="bsp-legend-bar">
            <div className="bsp-leg"><div className="bsp-leg-box a" />Available</div>
            <div className="bsp-leg"><div className="bsp-leg-box s" />Priority — your society</div>
            <div className="bsp-leg"><div className="bsp-leg-box b" />Booked</div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bsp-muted)' }}>Tap a slot to block free trial</span>
          </div>
        </div>
      )}

      {/* ── SCREEN 4: CONFIRM ── */}
      {screen === 'confirm' && (
        <div className="bsp-screen">
          <div className="bsp-confirm-wrap">
            <div className="bsp-confirm-anim">🎉</div>
            <div className="bsp-confirm-title">All set, <span>{confirmName}</span>!</div>
            <p className="bsp-confirm-sub">
              Your free trial slot is blocked. Our team will call within <strong style={{ color: 'var(--bsp-text)' }}>24 hours</strong> to confirm.
            </p>
            <div className="bsp-confirm-card">
              <div className="bsp-confirm-card-head">Booking Summary</div>
              <div className="bsp-cr"><span className="k">Society</span><span className="v">{society?.name}</span></div>
              <div className="bsp-cr"><span className="k">Hobby</span><span className="v">{hobby?.emoji} {hobby?.name}</span></div>
              <div className="bsp-cr"><span className="k">Tutor</span><span className="v">{formTutor}</span></div>
              <div className="bsp-cr"><span className="k">Date &amp; Slot</span><span className="v">{currentWeek[day]?.label} · <span className="green">{formSlotTime}</span></span></div>
              <div className="bsp-cr"><span className="k">Participant</span><span className="v">{formData.pname} ({formData.age} yrs)</span></div>
              <div className="bsp-cr"><span className="k">Contact</span><span className="v">+91 {formData.phone}</span></div>
            </div>
            <div className="bsp-confirm-note">
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div>This is a free trial enquiry — no payment required. A team member will confirm the slot and share class details with you.</div>
            </div>
            <button className="bsp-home-btn" onClick={() => goTo('home')}>Explore More Classes →</button>
            <button className="bsp-home-btn secondary" onClick={() => goTo('categories')}>Back to Hobbies</button>
          </div>
        </div>
      )}

      {/* ── INITIAL FORM OVERLAY ── */}
      {initialFormOpen && (
        <div className="bsp-overlay">
          <div className="bsp-sheet">
            <div className="bsp-sheet-head">
              <span className="bsp-sheet-title">Step 1 — Enter Your Details</span>
            </div>
            <p className="bsp-sheet-sub">Please fill in your details to get started. All fields marked * are required.</p>

            <div className="bsp-form-row">
              <div className="bsp-flabel">Your Name <span className="bsp-req">*</span></div>
              <input className="bsp-finput" placeholder="Full name" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="bsp-form-row two">
              <div>
                <div className="bsp-flabel">Mobile <span className="bsp-req">*</span></div>
                <input className="bsp-finput" placeholder="10-digit number" maxLength={10}
                  inputMode="numeric" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <div className="bsp-flabel">Email <span className="bsp-req">*</span></div>
                <input className="bsp-finput" placeholder="your@email.com" type="email"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div className="bsp-form-row two">
              <div>
                <div className="bsp-flabel">Participant Name <span className="bsp-req">*</span></div>
                <input className="bsp-finput" placeholder="Who will attend?" value={formData.pname}
                  onChange={e => setFormData({ ...formData, pname: e.target.value })} />
              </div>
              <div>
                <div className="bsp-flabel">Age <span className="bsp-req">*</span></div>
                <input className="bsp-finput" placeholder="e.g. 10" type="number" min={1} max={99}
                  value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
              </div>
            </div>

            <div className="bsp-form-row">
              <div className="bsp-flabel">City <span className="bsp-req">*</span></div>
              <select className="bsp-finput" value={city} onChange={e => setCity(e.target.value)}>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Gurugram">Gurugram</option>
              </select>
            </div>

            <div className="bsp-form-row">
              <div className="bsp-flabel">Notes</div>
              <textarea className="bsp-finput ta" rows={2} placeholder="Special requirements? (optional)"
                maxLength={250} value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>

            <div className="bsp-form-btns" style={{ marginTop: 24 }}>
              <button className="bsp-submit-btn ghost" onClick={() => window.location.href = '/'}>Cancel</button>
              <button className="bsp-submit-btn primary" disabled={initialSubmitDisabled}
                onClick={() => setInitialFormOpen(false)}>Next →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOOKING FORM OVERLAY ── */}
      {formOpen && society && hobby && (
        <div className="bsp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="bsp-sheet">
            <div className="bsp-sheet-handle" />
            <div className="bsp-sheet-head">
              <span className="bsp-sheet-title">Preview &amp; Book Slot</span>
              <button className="bsp-sheet-close" onClick={() => setFormOpen(false)}>✕</button>
            </div>
            <p className="bsp-sheet-sub">Review your details before confirming your free trial slot.</p>

            <div className="bsp-booking-pill">
              <div className="bsp-booking-grid">
                <div className="bsp-bp-item"><div className="bsp-bpl">Participant</div><div className="bsp-bpv">{formData.pname} ({formData.age} yrs)</div></div>
                <div className="bsp-bp-item"><div className="bsp-bpl">Your Name</div><div className="bsp-bpv">{formData.name}</div></div>
              </div>
              <div className="bsp-booking-grid">
                <div className="bsp-bp-item"><div className="bsp-bpl">Phone</div><div className="bsp-bpv">{formData.phone}</div></div>
                <div className="bsp-bp-item"><div className="bsp-bpl">Email</div><div className="bsp-bpv">{formData.email || '—'}</div></div>
              </div>
              <div className="bsp-booking-grid">
                <div className="bsp-bp-item"><div className="bsp-bpl">Location</div><div className="bsp-bpv">{society.name}, {city}</div></div>
                <div className="bsp-bp-item"><div className="bsp-bpl">Hobby</div><div className="bsp-bpv">{hobby.emoji} {hobby.name}</div></div>
              </div>
              <div className="bsp-booking-grid">
                <div className="bsp-bp-item"><div className="bsp-bpl">Tutor</div><div className="bsp-bpv">{formTutor}</div></div>
                <div className="bsp-bp-item"><div className="bsp-bpl">Time Slot</div><div className="bsp-bpv green">{currentWeek[day].label}<br />{formSlotTime}</div></div>
              </div>
              {formData.notes && (
                <div className="bsp-bp-item"><div className="bsp-bpl">Notes</div><div className="bsp-bpv" style={{ fontWeight: 400, fontSize: 12 }}>{formData.notes}</div></div>
              )}
            </div>

            <div className="bsp-consent-row">
              <input type="checkbox" id="bsp-consent" checked={formData.consent}
                onChange={e => setFormData({ ...formData, consent: e.target.checked })} />
              <label htmlFor="bsp-consent">I agree to be contacted by the UpKraft team for trial class confirmation and updates.</label>
            </div>

            <div className="bsp-form-btns">
              <button className="bsp-submit-btn ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="bsp-submit-btn primary" disabled={submitDisabled} onClick={submitForm}>Book Slot →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM SOCIETY MODAL ── */}
      {showCustomSocietyModal && (
        <div className="bsp-overlay">
          <div className="bsp-success-modal">
            <div className="bsp-success-modal-icon">😀</div>
            <h3>We received your details!</h3>
            <p>Our team will get back to you shortly.</p>
          </div>
        </div>
      )}

      {/* ── CALLBACK MODAL ── */}
      {showCallbackModal && (
        <div className="bsp-overlay">
          <div className="bsp-success-modal">
            <div className="bsp-success-modal-icon">📞</div>
            <h3>Request received!</h3>
            <p>Our team will call you shortly.</p>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`bsp-toast ${toast.type} ${toast.show ? 'show' : ''}`} role="alert">
        {toast.message}
      </div>
    </div>
  );
}