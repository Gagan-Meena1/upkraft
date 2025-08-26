"use client";

import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Script from "next/script";

export default function PracticeStudio() {
  // State for UI
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "No score loaded",
    artist: "",
    currentTime: "0:00",
    totalTime: "0:00"
  });
  
  // Refs and core state
  const alphaTabRef = useRef<HTMLDivElement>(null);
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [aTick, setATick] = useState<number | null>(null);
  const [bTick, setBTick] = useState<number | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [alphaTabApi, setAlphaTabApi] = useState<any>(null);
  
  // Control states
  const [countInActive, setCountInActive] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Handle script loading
  const handleScriptLoad = () => {
    setIsScriptsLoaded(true);
  };
  
  // Set up core AlphaTab functionality
  useEffect(() => {
    if (!isScriptsLoaded || !alphaTabRef.current) return;
    
    try {
      // Access alphaTab from window
      const windowWithAlphaTab = window as any;
      const at = new windowWithAlphaTab.alphaTab.AlphaTabApi(alphaTabRef.current, {
        player: {
          enablePlayer: true,
          enableCursor: true,
          enableScrolling: true,
          soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/soundfont/sonivox.sf2"
        },
        display: {
          staveProfile: windowWithAlphaTab.alphaTab.StaveProfile.ScoreTab, // notation + TAB
          layoutMode: windowWithAlphaTab.alphaTab.LayoutMode.Page,
          resources: {
            // Dark blue theme styling
            mainGradient: ['#0a1428', '#162848'],
            scoreInfoColor: '#ffffff',
            barNumberColor: '#4a88db',
            barSeparatorColor: '#2a3a58',
            selectionColor: '#7BD88F',
            noteHeadColor: '#4a88db',
            noteRestColor: '#4a88db',
            noteEffectColor: '#7BD88F',
            tabNoteColor: '#4a88db',
          }
        }
      });
      
      setAlphaTabApi(at);
      windowWithAlphaTab.at = at; // For debugging

      // Time display
      at.playerPositionChanged.on((e: any) => {
        const formatTime = (ms: number) => { 
          const s = Math.floor(ms/1000); 
          const m = Math.floor(s/60);
          const ss = String(s % 60).padStart(2,'0'); 
          return `${m}:${ss}`; 
        };
        
        // Update React state
        setCurrentSong(prev => ({
          ...prev,
          currentTime: formatTime(e.currentTime),
          totalTime: formatTime(e.endTime)
        }));
      });
      
      // Player state change handler
      at.playerStateChanged.on((e: any) => {
        setIsPlaying(e.state === 1); // 1 = Playing
      });

      // Track highlighting for currently playing instruments
      at.midiEventsPlayedFilter = [windowWithAlphaTab.alphaTab.midi.MidiEventType.NoteOn];
      at.midiEventsPlayed.on((ev: any) => {
        // Update playing status for tracks
        const trackElements = document.querySelectorAll('.track');
        trackElements.forEach(el => {
          el.classList.remove('playing');
        });
        
        if (ev?.events?.length > 0) {
          const track = ev.events[0]?.track;
          if (track) {
            const trackElement = document.querySelector(`.track[data-track-index="${track.index}"]`);
            if (trackElement) {
              trackElement.classList.add('playing');
            }
          }
        }
      });

      // Score loaded handling
      at.scoreLoaded.on((score: any) => {
        // Update track list
        if (score.tracks) {
          setTracks(score.tracks);
          setHasFile(true);
          
          // Default to rendering the first track
          if (score.tracks.length > 0) {
            setTimeout(() => {
              at.renderTracks([score.tracks[0]]);
            }, 100);
          }
        }
        
        // Update song info in React state
        setCurrentSong(prev => ({
          ...prev,
          title: score.title || 'Untitled',
          artist: score.artist || 'Unknown'
        }));
        
        setIsLoaded(true);
      });

    } catch (error) {
      console.error("Error initializing AlphaTab:", error);
    }
  }, [isScriptsLoaded]);
  
  // File input handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !alphaTabApi) return;
    
    const reader = new FileReader();
    reader.onload = function(e: ProgressEvent<FileReader>) {
      try {
        if (e.target && e.target.result) {
          alphaTabApi.load(e.target.result);
        }
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };
    reader.onerror = function() {
      console.error("Error reading file");
    };
    reader.readAsArrayBuffer(file);
  };
  
  // Play/Pause toggle
  const handlePlayPause = () => {
    if (!alphaTabApi) return;
    
    if (isPlaying) {
      alphaTabApi.pause();
    } else {
      alphaTabApi.play();
    }
  };
  
  // Stop playback
  const handleStop = () => {
    if (!alphaTabApi) return;
    alphaTabApi.stop();
  };
  
  // Toggle track rendering
  const handleTrackRenderToggle = (trackIndex: number) => {
    if (!alphaTabApi || !alphaTabApi.score) return;
    
    // Get currently rendered tracks
    const trackElements = document.querySelectorAll('.render:checked');
    const currentTracks: any[] = [];
    
    trackElements.forEach(el => {
      const trackEl = el.closest('.track') as HTMLElement;
      if (trackEl) {
        const idx = parseInt(trackEl.getAttribute('data-track-index') || '0');
        if (!isNaN(idx) && alphaTabApi.score.tracks[idx]) {
          currentTracks.push(alphaTabApi.score.tracks[idx]);
        }
      }
    });
    
    // Check if the current track is already rendered
    const isCurrentlyRendered = currentTracks.some(t => t.index === trackIndex);
    
    let tracksToRender: any[];
    if (isCurrentlyRendered) {
      tracksToRender = currentTracks.filter(t => t.index !== trackIndex);
    } else {
      tracksToRender = [...currentTracks, alphaTabApi.score.tracks[trackIndex]];
    }
    
    // Always render at least one track
    if (tracksToRender.length === 0 && alphaTabApi.score.tracks.length > 0) {
      tracksToRender.push(alphaTabApi.score.tracks[0]);
    }
    
    // Apply the change
    alphaTabApi.renderTracks(tracksToRender);
  };
  
  // Handle solo toggle
  const handleSolo = (trackIndex: number) => {
    if (!alphaTabApi || !alphaTabApi.score) return;
    
    const track = alphaTabApi.score.tracks[trackIndex];
    if (!track) return;
    
    // Get the solo button for this track
    const trackElement = document.querySelector(`.track[data-track-index="${trackIndex}"]`);
    const soloBtn = trackElement?.querySelector('.solo-btn');
    
    if (soloBtn) {
      const isSolo = soloBtn.classList.contains('active');
      
      // Clear all solos first
      document.querySelectorAll('.solo-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Reset all track solos
      alphaTabApi.score.tracks.forEach((t: any) => {
        alphaTabApi.changeTrackSolo(t, false);
      });
      
      if (!isSolo) {
        // Set this track as solo
        soloBtn.classList.add('active');
        alphaTabApi.changeTrackSolo(track, true);
      }
    }
  };
  
  // Handle mute toggle
  const handleMute = (trackIndex: number) => {
    if (!alphaTabApi || !alphaTabApi.score) return;
    
    const track = alphaTabApi.score.tracks[trackIndex];
    if (!track) return;
    
    // Get the mute button for this track
    const trackElement = document.querySelector(`.track[data-track-index="${trackIndex}"]`);
    const muteBtn = trackElement?.querySelector('.mute-btn');
    
    if (muteBtn) {
      const isMuted = muteBtn.classList.contains('active');
      
      if (isMuted) {
        // Unmute this track
        muteBtn.classList.remove('active');
        alphaTabApi.changeTrackMute([track], false);
      } else {
        // Mute this track
        muteBtn.classList.add('active');
        alphaTabApi.changeTrackMute([track], true);
      }
    }
  };
  
  // Handle count-in toggle
  const toggleCountIn = () => {
    if (!alphaTabApi) return;
    
    const newState = !countInActive;
    setCountInActive(newState);
    alphaTabApi.countInVolume = newState ? 1 : 0;
  };
  
  // Handle metronome toggle
  const toggleMetronome = () => {
    if (!alphaTabApi) return;
    
    const newState = !metronomeActive;
    setMetronomeActive(newState);
    alphaTabApi.metronomeVolume = newState ? 1 : 0;
  };
  
  // A/B Loop functions
  const setA = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!alphaTabApi) return;
    
    setATick(alphaTabApi.tickPosition);
    updateABLoop();
  };
  
  const setB = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!alphaTabApi) return;
    
    setBTick(alphaTabApi.tickPosition);
    updateABLoop();
  };
  
  const clearAB = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!alphaTabApi) return;
    
    setATick(null);
    setBTick(null);
    alphaTabApi.playerLoopRange = null;
  };
  
  const updateABLoop = () => {
    if (!alphaTabApi) return;
    
    // If both A and B are set, enable looping
    if (aTick !== null && bTick !== null) {
      alphaTabApi.playerLoopRange = {
        startTick: Math.min(aTick, bTick),
        endTick: Math.max(aTick, bTick)
      };
    } else if (aTick !== null && alphaTabApi.tickPosition !== null) {
      // If only A is set, use current position as B
      alphaTabApi.playerLoopRange = {
        startTick: Math.min(aTick, alphaTabApi.tickPosition),
        endTick: Math.max(aTick, alphaTabApi.tickPosition)
      };
    }
  };

  const formatTick = (tick: number | null) => {
    if (tick === null) return '—';
    
    const quarters = tick / 960;
    const bars = Math.floor(quarters / 4) + 1;
    const beats = Math.floor(quarters % 4) + 1;
    return `${bars}.${beats}`;
  };

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    if (!alphaTabApi) return;
    
    const newState = !autoScroll;
    setAutoScroll(newState);
    alphaTabApi.settings.player.enableScrolling = newState;
  };
  
  // Change playback speed
  const changePlaybackSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!alphaTabApi) return;
    
    const speed = parseFloat(e.target.value);
    if (!isNaN(speed)) {
      alphaTabApi.playbackSpeed = speed;
    }
  };

  return (
    <>
      <Head>
        <title>Practice Studio | Upkraft</title>
      </Head>
      
      <div className="flex flex-col h-full bg-[#0b1220]">
        {/* Main Header - Dark Blue Theme */}
        <div className="bg-[#0f1a2f] border-b border-[#1d2946] p-2 flex items-center flex-wrap gap-2 overflow-x-auto sticky top-0 z-10">
          <h2 className="text-[#e7f0ff] font-bold mr-2">Upkraft</h2>
          
          <input 
            type="file" 
            id="fileInput" 
            className="text-[#e7f0ff] text-sm bg-[#101a2a] border border-[#1d2946] rounded px-2 py-1"
            onChange={handleFileInputChange}
            accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.xml,.mid,.midi"
          />
          
          <button 
            onClick={handlePlayPause}
            className={`border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm ${isPlaying ? 'bg-[#7BD88F] text-[#08101f]' : 'bg-[#172544]'}`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <button 
            onClick={handleStop}
            className="bg-[#172544] border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm"
          >
            ⏹ Stop
          </button>
          
          <div className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            Speed
            <select 
              onChange={changePlaybackSpeed}
              className="bg-[#0f1a2f] text-[#e7f0ff] ml-2 border border-[#1d2946] rounded"
              defaultValue="1"
            >
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="1">100%</option>
              <option value="1.25">125%</option>
              <option value="1.5">150%</option>
            </select>
          </div>
          
          <label className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            <input 
              type="checkbox" 
              checked={autoScroll} 
              onChange={toggleAutoScroll} 
              className="mr-1" 
            />
            Auto-Scroll
          </label>
          
          <button 
            className={`border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm ${countInActive ? 'bg-[#7BD88F] text-[#08101f]' : 'bg-[#172544]'}`}
            onClick={toggleCountIn}
          >
            Count-In
          </button>
          
          <button 
            className={`border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm ${metronomeActive ? 'bg-[#7BD88F] text-[#08101f]' : 'bg-[#172544]'}`}
            onClick={toggleMetronome}
          >
            Metronome
          </button>
          
          <div className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            Loop A/B:
            <a href="#" onClick={setA} className="text-[#9ecbff] mx-1">Set A</a> •
            <a href="#" onClick={setB} className="text-[#9ecbff] mx-1">Set B</a> •
            <a href="#" onClick={clearAB} className="text-[#9ecbff] mx-1">Clear</a>
          </div>
          
          <div className="bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            A: {formatTick(aTick)} | B: {formatTick(bTick)}
          </div>
          
          <div className="bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            {currentSong.currentTime} / {currentSong.totalTime}
          </div>
          
          <div className="bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis" style={{maxWidth: '300px'}}>
            {hasFile ? `${currentSong.title} — ${currentSong.artist}` : 'No score loaded'}
          </div>
        </div>

        {/* Main content area with sidebar and visualizer */}
        <div className="grid grid-cols-12 h-full">
          {/* Left sidebar - Instruments */}
          <div className="col-span-3 bg-[#0b1220] border-r border-[#1d2946]">
            <h3 className="p-3 text-sm font-medium text-[#a6b7d1]">Instruments</h3>
            <div>
              {tracks.map((track, idx) => (
                <div 
                  key={idx} 
                  className="track border-b border-[#15264a] flex items-center gap-3 p-2 hover:bg-[#101a2a]" 
                  data-track-index={idx}
                >
                  <input 
                    type="checkbox" 
                    className="render"
                    onChange={() => handleTrackRenderToggle(idx)}
                    defaultChecked={idx === 0}
                  />
                  <div className="name">
                    <span className="text-[#e7f0ff] font-medium">{track.name || "Track " + (idx + 1)}</span>
                    <small className="block text-[#8ea1c5] font-medium">{track.isPercussion ? "Percussion" : track.instrumentName || "Instrument"}</small>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <button 
                      className="solo-btn text-xs px-3 py-1 bg-[#172544] hover:bg-[#213251] text-[#e7f0ff] border border-[#1d2946] rounded-lg"
                      onClick={() => handleSolo(idx)}
                    >
                      Solo
                    </button>
                    <button 
                      className="mute-btn text-xs px-3 py-1 bg-[#172544] hover:bg-[#213251] text-[#e7f0ff] border border-[#1d2946] rounded-lg"
                      onClick={() => handleMute(idx)}
                    >
                      Mute
                    </button>
                  </div>
                </div>
              ))}
              {!hasFile && (
                <div className="p-4 text-[#8ea1c5] text-sm font-medium text-center border border-dashed border-[#1d2946] rounded-md m-2">
                  No tracks loaded yet
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area - 9 columns */}
          <div className="col-span-9 bg-white flex flex-col h-full">
            {/* AlphaTab container - white background for notation */}
            <div id="alphaTab" ref={alphaTabRef} className="w-full h-full overflow-auto"></div>
          </div>
        </div>
      </div>
      
      {/* AlphaTab Scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/build/Midi.js"
        strategy="afterInteractive"
      />
      
      {/* Custom CSS for AlphaTab */}
      <style jsx global>{`
        .at-cursor-bar{background:rgba(255,242,0,.22)}
        .at-cursor-beat{background:rgba(64,255,160,.95);width:5px}
        .at-highlight *{fill:#00a2ff;stroke:#00a2ff}
        .at-selection *{fill:#ffd166;stroke:#ffd166}
        
        /* Highlight instruments currently sounding */
        .track.playing {
          background: rgba(123,216,143,0.12) !important;
          box-shadow: 0 0 0 1px #7bd88f inset, 0 0 6px rgba(123,216,143,.25) !important;
          border-radius: 12px;
          transition: background .15s ease, box-shadow .15s ease;
        }
        
        /* Active button highlight */
        .solo-btn.active,
        .mute-btn.active {
          background: #7bd88f;
          color: #08101f;
          box-shadow: 0 0 0 2px #7bd88f inset, 0 0 8px rgba(123,216,143,.35);
        }
        
        /* Hide AlphaTab brand watermark */
        #alphaTab .at-brand,
        #alphaTab text.at-brand,
        #alphaTab g.at-brand,
        #alphaTab [class*="at-brand"],
        #alphaTab [data-brand],
        #alphaTab [data-alpha-tab-brand] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Provide headroom so autoscroll can't tuck staves under the sticky header */
        #alphaTab {
          padding-top: 76px;
        }
        #alphaTab * {
          scroll-margin-top: 76px;
        }
      `}</style>
    </>
  );
}
