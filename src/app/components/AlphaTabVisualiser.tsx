import React, { useState, useRef, useEffect } from 'react';
import { PianoKeyboard } from './PianoKeyboard';

// Add this at the top for TypeScript compatibility
declare global {
  interface Window {
    alphaTab?: any;
  }
}

const KEY_OPTIONS = [
  { key: 'C', label: 'C Major' },
  { key: 'G', label: 'G Major' },
  { key: 'D', label: 'D Major' },
  { key: 'A', label: 'A Major' },
  { key: 'E', label: 'E Major' },
  { key: 'B', label: 'B Major' },
  { key: 'F', label: 'F Major' },
  { key: 'Bb', label: 'Bb Major' },
  { key: 'Eb', label: 'Eb Major' },
  { key: 'Ab', label: 'Ab Major' },
  { key: 'Db', label: 'Db Major' },
  { key: 'Gb', label: 'Gb Major' },
  { key: 'Cb', label: 'Cb Major' },
];

const AlphaTabVisualiser = () => {
  // State for all controls
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [speed, setSpeed] = useState('1');
  const [autoScroll, setAutoScroll] = useState(true);
  const [countIn, setCountIn] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [currentKey, setCurrentKey] = useState('C');
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [transpose, setTranspose] = useState(false);
  const [ab, setAB] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [meta, setMeta] = useState('No score loaded');
  const [tracks, setTracks] = useState<any[]>([]);
  const [soloState, setSoloState] = useState<{ [idx: number]: boolean }>({});
  const [muteState, setMuteState] = useState<{ [idx: number]: boolean }>({});
  const [time, setTime] = useState('00:00 / 00:00');
  const alphaTabRef = useRef<HTMLDivElement>(null);
  const [atApi, setAtApi] = useState<any>(null);
  const [isAlphaTabReady, setIsAlphaTabReady] = useState(false);

  // Dynamically load AlphaTab script and initialize API
  useEffect(() => {
    let alphaTabScript: HTMLScriptElement | null = null;
    let alphaTabCss: HTMLLinkElement | null = null;
    let api: any = null;
    let initialized = false;
    function setupAlphaTab() {
      if (!alphaTabRef.current || !(window as any).alphaTab) return;
      if (initialized) return;
      initialized = true;
      api = new (window as any).alphaTab.AlphaTabApi(alphaTabRef.current, {
        player: {
          enablePlayer: true,
          enableCursor: true,
          enableScrolling: true,
          soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/soundfont/sonivox.sf2"
        },
        display: {
          staveProfile: (window as any).alphaTab.StaveProfile.ScoreTab,
          layoutMode: (window as any).alphaTab.LayoutMode.Page,
          enableCursorHighlight: true,
          enableSelectionHighlight: true
        },
        notation: {
          displayTranspositionPitches: [],
        }
      });
      setAtApi(api);
      setIsAlphaTabReady(true);
      // Listen for score loaded event
      api.scoreLoaded.on((score: any) => {
        setMeta(`${score.title || 'Untitled'} — ${score.artist || 'Unknown'} (${score.tracks?.length || 0} tracks)`);
        setTracks(score.tracks || []);
      });
      // Listen for time update
      api.playerPositionChanged.on((e: any) => {
        const fmt = (ms: number) => {
          const s = Math.floor(ms / 1000), m = (s / 60 | 0), ss = String(s % 60).padStart(2, '0');
          return `${m}:${ss}`;
        };
        setTime(`${fmt(e.currentTime)} / ${fmt(e.endTime)}`);
      });
      // Highlight current note/element in real time (yellow mark)
      if ((window as any).alphaTab.midi && api.midiEventsPlayed) {
        api.midiEventsPlayedFilter = [(window as any).alphaTab.midi.MidiEventType.NoteOn];
        api.midiEventsPlayed.on((ev: any) => {
          const el = ev?.events?.[0]?.element;
          if (el && api.setSelection) {
            try {
              api.setSelection([el]);
            } catch { /* ignore if not supported */ }
          }
        });
      }
    }
    // Load AlphaTab CSS
    alphaTabCss = document.createElement('link');
    alphaTabCss.rel = 'stylesheet';
    alphaTabCss.href = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.css';
    document.head.appendChild(alphaTabCss);
    // Load AlphaTab JS
    if (!(window as any).alphaTab) {
      alphaTabScript = document.createElement('script');
      alphaTabScript.src = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js';
      alphaTabScript.onload = setupAlphaTab;
      document.body.appendChild(alphaTabScript);
    } else {
      setupAlphaTab();
    }
    return () => {
      if (alphaTabScript) document.body.removeChild(alphaTabScript);
      if (alphaTabCss) document.head.removeChild(alphaTabCss);
    };
  }, []);

  // Button handlers wired to AlphaTab API
  const handlePlay = () => { if (atApi) { atApi.play(); } };
  const handlePause = () => { if (atApi) { atApi.pause(); } };
  const handleStop = () => { if (atApi) { atApi.stop(); } };
  const handleSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(e.target.value);
    if (atApi) { atApi.playbackSpeed = parseFloat(e.target.value); }
  };
  const handleAutoScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoScroll(e.target.checked);
    if (atApi) {
      atApi.settings.player.enableScrolling = e.target.checked;
      atApi.updateSettings();
    }
  };
  const handleCountIn = () => {
    setCountIn(v => !v);
    if (atApi) {
      atApi.settings.player.countIn = !countIn;
      atApi.updateSettings();
    }
  };
  const handleMetronome = () => {
    setMetronome(v => !v);
    if (atApi) {
      atApi.settings.player.metronome = !metronome;
      atApi.updateSettings();
    }
  };
  const handleSetA = () => {
    if (atApi) {
      atApi.setLoopStart();
      setAB(ab => ({ ...ab, a: atApi.playerPosition }));
    }
  };
  const handleSetB = () => {
    if (atApi) {
      atApi.setLoopEnd();
      setAB(ab => ({ ...ab, b: atApi.playerPosition }));
    }
  };
  const handleClearAB = () => {
    if (atApi) {
      atApi.clearLoop();
      setAB({ a: null, b: null });
    }
  };
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : '');
    if (!f || !atApi) return;
    try {
      await atApi.load(await f.arrayBuffer());
      if (typeof atApi.render === 'function') atApi.render();
      setMeta('Loaded: ' + f.name);
    } catch (err: any) {
      setMeta('Load error: ' + (err?.message || err));
    }
  };
  // Key change and transpose
  useEffect(() => {
    if (atApi) {
      atApi.settings.notation.key = currentKey;
      atApi.settings.notation.transposePitches = transpose;
      atApi.updateSettings();
    }
  }, [currentKey, transpose, atApi]);
  // Track solo/mute
  const handleSolo = (idx: number) => {
    if (atApi && tracks[idx]) {
      const newSolo = !soloState[idx];
      setSoloState(s => ({ ...s, [idx]: newSolo }));
      atApi.soloTrack(idx, newSolo);
    }
  };
  const handleMute = (idx: number) => {
    if (atApi && tracks[idx]) {
      const newMute = !muteState[idx];
      setMuteState(s => ({ ...s, [idx]: newMute }));
      atApi.muteTrack(idx, newMute);
    }
  };

  // UI rendering
  return (
    <div style={{ background: theme === 'dark' ? '#0b1428' : '#f9f9f9', minHeight: '100vh', color: theme === 'dark' ? '#fff' : '#222' }}>
      {/* Top Bar Controls */}
      <div className="upkraft-topbar">
        <span style={{ fontWeight: 700, fontSize: 18, marginRight: 16 }}>Upkraft</span>
        <input type="file" accept=".gp,.gp3,.gp4,.gp5,.gp6,.gp7,.gp8,.gpx,.xml,.musicxml,.mxl,.cap,.capx,.mid,.midi" onChange={handleFileInput} style={{ marginRight: 8 }} />
        <span style={{ minWidth: 120 }}>{fileName ? fileName : 'no file selected'}</span>
        <button onClick={handlePlay}>▶ Play</button>
        <button onClick={handlePause}>⏸ Pause</button>
        <button onClick={handleStop}>⏹ Stop</button>
        <label style={{ marginLeft: 8 }}>Speed
          <select value={speed} onChange={handleSpeed} style={{ marginLeft: 4 }}>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
          </select>
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={autoScroll} onChange={handleAutoScroll} /> Auto-Scroll
        </label>
        <button style={{ marginLeft: 8 }} onClick={handleCountIn}>{countIn ? 'Count-In On' : 'Count-In'}</button>
        <button style={{ marginLeft: 8 }} onClick={handleMetronome}>{metronome ? 'Metronome On' : 'Metronome'}</button>
        <span style={{ marginLeft: 8 }}>Loop A/B:
          <a href="#" style={{ marginLeft: 4 }} onClick={e => { e.preventDefault(); handleSetA(); }}>Set A</a> •
          <a href="#" style={{ marginLeft: 4 }} onClick={e => { e.preventDefault(); handleSetB(); }}>Set B</a> •
          <a href="#" style={{ marginLeft: 4 }} onClick={e => { e.preventDefault(); handleClearAB(); }}>Clear</a>
        </span>
        <span style={{ marginLeft: 8 }}>A: {ab.a ?? '—'} | B: {ab.b ?? '—'}</span>
        <span style={{ marginLeft: 8 }}>{time}</span>
        <span style={{ marginLeft: 8 }}>{meta}</span>
        <button style={{ marginLeft: 8 }} onClick={() => setKeyboardVisible(v => !v)}>{`Keyboard: ${keyboardVisible ? 'On' : 'Off'}`}</button>
        <button style={{ marginLeft: 8 }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}</button>
        {/* Key selector */}
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: 8 }}>
          <button onClick={() => setShowKeyDropdown(v => !v)}>{`Key: ${currentKey}`}</button>
          {showKeyDropdown && (
            <div style={{ position: 'absolute', zIndex: 1000, background: '#222', color: '#fff', borderRadius: 4, padding: 4 }}>
              {KEY_OPTIONS.map(opt => (
                <div key={opt.key} style={{ padding: 4, cursor: 'pointer', background: opt.key === currentKey ? '#444' : 'none' }} onClick={() => { setCurrentKey(opt.key); setShowKeyDropdown(false); }}>{opt.label}</div>
              ))}
              <label style={{ display: 'block', marginTop: 4 }}><input type="checkbox" checked={!transpose} onChange={e => setTranspose(!e.target.checked)} /> Rewrite key only</label>
              <label style={{ display: 'block' }}><input type="checkbox" checked={transpose} onChange={e => setTranspose(e.target.checked)} /> Transpose pitches</label>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', minHeight: '80vh' }}>
        {/* Sidebar: Instruments */}
        <aside className="upkraft-instruments" style={{ background: '#101a36', color: '#fff', minWidth: 240, padding: '18px 0 0 0', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>
          <h4 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 14px 28px', letterSpacing: 1 }}>Instruments</h4>
          <div style={{ paddingLeft: 28 }}>
            {tracks.length === 0 ? (
              <div style={{ color: '#b0b8c9', fontSize: 14 }}>No instruments to display</div>
            ) : (
              tracks.map((t, idx) => (
                <div key={idx} className="instrument-row" style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px 56px 56px', alignItems: 'center', marginBottom: 12, gap: 0 }}>
                  <input type="checkbox" checked={soloState[idx] || false} onChange={() => handleSolo(idx)} style={{ accentColor: '#2e5fff', width: 18, height: 18, margin: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>{t.name || `Track ${idx + 1}`}</span>
                  <span style={{ fontSize: 13, color: '#b0b8c9', margin: 0 }}>Instrument</span>
                  <button className={`solo-btn${soloState[idx] ? ' active' : ''}`} onClick={() => handleSolo(idx)} style={{ background: soloState[idx] ? '#2e5fff' : '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 0', fontWeight: 500, fontSize: 13, cursor: 'pointer', minWidth: 48, margin: 0 }}>Solo</button>
                  <button className={`mute-btn${muteState[idx] ? ' active' : ''}`} onClick={() => handleMute(idx)} style={{ background: muteState[idx] ? '#ff2e2e' : '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 0', fontWeight: 500, fontSize: 13, cursor: 'pointer', minWidth: 48, margin: 0 }}>Mute</button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Visualiser Area */}
        <main style={{ flex: 1, position: 'relative', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
          {/* AlphaTab visualiser with required className */}
          <div ref={alphaTabRef} className="at-content">
            {!isAlphaTabReady && 'Loading music visualizer...'}
            {/* Fallback message if AlphaTab fails to render */}
            {isAlphaTabReady && alphaTabRef.current && alphaTabRef.current.childNodes.length === 0 && (
              <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
                Music sheet not visible. Please check AlphaTab CSS and file format.
              </div>
            )}
          </div>
          {/* Piano keyboard */}
          {keyboardVisible && (
            <div style={{ margin: '24px 0' }}>
              <PianoKeyboard pressedKeys={{}} showLabels={true} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AlphaTabVisualiser;
