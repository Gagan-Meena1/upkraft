"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './book-slot.css';
import { SOCIETIES, HOBBIES, TUTORS, WEEK, buildSlots, countAvailForDay } from './data';

type ScreenType = 'home' | 'categories' | 'slots' | 'confirm';
type TimeFilterType = 'all' | 'morning' | 'afternoon' | 'evening';

export default function BookSlotPage() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [society, setSociety] = useState<any>(null);
  const [city, setCity] = useState('Bengaluru');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [hobby, setHobby] = useState<any>(null);
  const [day, setDay] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [catFilter, setCatFilter] = useState('All');
  
  const [formOpen, setFormOpen] = useState(false);
  const [formTutor, setFormTutor] = useState('');
  const [formSlotTime, setFormSlotTime] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', pname: '', age: '', notes: '', consent: false
  });
  const [submitDisabled, setSubmitDisabled] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [confirmName, setConfirmName] = useState('');

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
    const hits = SOCIETIES.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
    setSuggestions(hits);
    setShowSuggestions(true);
  };

  const selectSociety = (soc: any) => {
    setSociety(soc);
    setSearchQuery('');
    setShowSuggestions(false);
    setCatFilter('All');
    goTo('categories');
  };

  const selectHobby = (h: any) => {
    setHobby(h);
    setDay(0);
    setTimeFilter('all');
    goTo('slots');
  };

  const openForm = (tutorName: string, slotTime: string) => {
    setFormTutor(tutorName);
    setFormSlotTime(slotTime);
    setFormData({ name: '', phone: '', email: '', pname: '', age: '', notes: '', consent: false });
    setFormOpen(true);
  };

  const submitForm = () => {
    setConfirmName(formData.name.split(' ')[0]);
    setFormOpen(false);
    goTo('confirm');
    showToastMsg('🎉 Slot blocked successfully!', 'ok');
  };

  const filteredHobbies = catFilter === 'All' ? HOBBIES : HOBBIES.filter(h => h.cat === catFilter);
  const activeStep = { home: 1, categories: 2, slots: 3, confirm: 4 }[screen];

  const renderTutors = () => {
    if (!hobby) return null;
    const tutors = TUTORS[hobby.id] || [];
    const { total } = countAvailForDay(hobby.id, day);

    if (total === 0) {
      return (
        <div className="empty-day">
          <div className="em-icon">📅</div>
          <p><strong>No classes on {WEEK[day].full}</strong><br/>
             Tutors are not visiting your society on this day.<br/>
             Try <strong>Mon, Wed or Fri</strong> for the most availability.</p>
        </div>
      );
    }

    return tutors.map((t, tidx) => {
      const isVisiting = t.visitDays.includes(day);
      const bands = buildSlots(t.visitDays, day);
      
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
                    <div key={slidx} className="slot-pill soc" role="button" tabIndex={0} onClick={() => openForm(t.name, sl.time)}>
                      <span className="stime">{sl.time}</span>
                    </div>
                  );
                  return (
                    <div key={slidx} className="slot-pill avail" role="button" tabIndex={0} onClick={() => openForm(t.name, sl.time)}>
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
            <div className="tutor-ava">{t.emoji}</div>
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
                onFocus={() => { if (searchQuery.length >= 2) setShowSuggestions(true); }}
              />
              {searchQuery && <button className="search-clear show" onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}>✕</button>}
              
              {showSuggestions && (
                <div className="suggestions" style={{ display: 'block' }}>
                  {suggestions.length === 0 ? (
                    <div className="sug-item" style={{ color: 'var(--muted)' }}><span>😕</span><span>No societies found.</span></div>
                  ) : (
                    suggestions.map(s => (
                      <div className="sug-item" key={s.id} onClick={() => selectSociety(s)}>
                        <span style={{ color: 'var(--red)', fontSize: 16 }}>🏢</span>
                        <span><strong>{s.name}</strong></span>
                        <span className="sug-meta">{s.city} · {s.hobbies} hobbies</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>
          <div className="home-body">
            <div className="promo-banner">
              <div className="promo-badge">NEW</div>
              <p><strong>12 societies</strong> now have Yoga &amp; Mindfulness — grab a free trial slot this week!</p>
            </div>
            <div className="section-head">Popular Societies</div>
            <div className="chips">
              {SOCIETIES.slice(0, 5).map(s => (
                <button key={s.id} className="chip" onClick={() => selectSociety(s)}>{s.name}</button>
              ))}
            </div>
            <div className="section-head">Browse by Category</div>
            <div className="categories-row">
              {[{n:"Performing Arts",e:"🎭"},{n:"Music",e:"🎵"},{n:"Fitness",e:"💪"},{n:"Visual Arts",e:"🎨"},{n:"Language",e:"📚"}].map(c => (
                <div className="cat-pill" key={c.n} onClick={() => {
                  if(!society) { showToastMsg('Please select your society first 👆', 'err'); return; }
                  setCatFilter(c.n); goTo('categories');
                }}>
                  <span className="cat-em">{c.e}</span>{c.n}
                </div>
              ))}
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
            {['All', 'Performing Arts', 'Fitness', 'Visual Arts', 'Music', 'Language'].map(f => (
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
            <div className="week-tabs-grid">
              {WEEK.map((d, i) => {
                const { avail, soc, total } = countAvailForDay(hobby.id, i);
                const hasSlots = total > 0;
                let pillClass = 'none', pillText = 'No slots';
                if (soc > 0) { pillClass = 'soc'; pillText = `${soc} priority`; }
                else if (avail > 0) { pillClass = 'has'; pillText = `${avail} open`; }

                return (
                  <div key={i} className={`wday ${i === day ? 'active' : ''} ${!hasSlots ? 'no-slots' : ''}`}
                    onClick={() => { if (hasSlots) setDay(i); else showToastMsg('No slots on this day', 'err'); }}>
                    {i === 0 && <div className="wday-today-dot"></div>}
                    <span className="wday-name">{d.short}</span>
                    <span className="wday-num">{d.num}</span>
                    <span className="wday-mon">{d.mon}</span>
                    <span className={`wday-slots ${pillClass}`}>{pillText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="selected-day-bar">
            <span className="sdb-date">{WEEK[day].label}</span>
            {(() => {
              const { avail, soc } = countAvailForDay(hobby.id, day);
              if (soc > 0) return <span className="sdb-pill soc">{soc} priority slots for your society</span>;
              if (avail > 0) return <span className="sdb-pill">{avail} slots available</span>;
              return <span className="sdb-pill empty">No slots this day</span>;
            })()}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>Tap a slot to book your free trial</span>
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 22px 0', margin: 0 }}>Each class is 45 minutes long.</p>
          <div className="slot-filters">
            <span className="sf-label">Filter</span>
            <div className="sf-chips">
              <button className={`sf-chip ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>All Times</button>
              <button className={`sf-chip ${timeFilter === 'morning' ? 'active' : ''}`} onClick={() => setTimeFilter('morning')}>🌅 Morning (10am–12pm)</button>
              <button className={`sf-chip ${timeFilter === 'afternoon' ? 'active' : ''}`} onClick={() => setTimeFilter('afternoon')}>☀️ Afternoon (12pm–5pm)</button>
              <button className={`sf-chip ${timeFilter === 'evening' ? 'active' : ''}`} onClick={() => setTimeFilter('evening')}>🌆 Evening (5pm–9pm)</button>
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
                <div className="cr"><span className="k">Date &amp; Slot</span><span className="v">{WEEK[day]?.label} · <span className="green">{formSlotTime}</span></span></div>
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

      {/* FORM OVERLAY */}
      {formOpen && society && hobby && (
        <div className="overlay show" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-head">
              <span className="sheet-title">Block Free Trial Slot</span>
              <button className="sheet-close" onClick={() => setFormOpen(false)}>✕</button>
            </div>
            <p className="sheet-sub">Reserving {formSlotTime} at {society.name}</p>
            <div className="booking-pill">
              <div className="bp-item"><div className="bpl">Hobby</div><div className="bpv">{hobby.emoji} {hobby.name}</div></div>
              <div className="bp-item"><div className="bpl">Tutor</div><div className="bpv">{formTutor}</div></div>
              <div className="bp-item"><div className="bpl">Day &amp; Date</div><div className="bpv">{WEEK[day].label}</div></div>
              <div className="bp-item"><div className="bpl">Slot Time</div><div className="bpv green">{formSlotTime}</div></div>
            </div>
            
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
                <div className="flabel">Email</div>
                <input className="finput" placeholder="Optional" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
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
            <div className="form-row two">
              <div>
                <div className="flabel">Society</div>
                <input className="finput" readOnly value={society.name} />
              </div>
              <div>
                <div className="flabel">Hobby</div>
                <input className="finput" readOnly value={hobby.name} />
              </div>
            </div>
            <div className="form-row two">
              <div>
                <div className="flabel">Tutor</div>
                <input className="finput" readOnly value={formTutor} />
              </div>
              <div>
                <div className="flabel">Slot</div>
                <input className="finput" readOnly value={`${WEEK[day].label} · ${formSlotTime}`} />
              </div>
            </div>
            <div className="form-row">
              <div className="flabel">Notes</div>
              <textarea className="finput ta" rows={2} placeholder="Special requirements? (optional)" maxLength={250} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
            </div>
            <div className="consent-row">
              <input type="checkbox" id="f-consent" checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} />
              <label htmlFor="f-consent">I agree to be contacted by the UpKraft team for trial class confirmation and updates.</label>
            </div>
            <button className="submit-btn" disabled={submitDisabled} onClick={submitForm}>Confirm Free Trial →</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`} role="alert">{toast.message}</div>
    </div>
  );
}
