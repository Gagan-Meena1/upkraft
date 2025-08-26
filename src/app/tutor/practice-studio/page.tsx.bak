"use client";

import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Script from "next/script";

export default function PracticeStudio() {
  // Add preload link for AlphaTab
  useEffect(() => {
    const preloadLink = document.createElement('link');
    preloadLink.href = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js';
    preloadLink.rel = 'preload';
    preloadLink.as = 'script';
    document.head.appendChild(preloadLink);
    
    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

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
    
    // Initialize AlphaTab
    const settings = {
      player: {
        enablePlayer: true,
        soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/soundfont/sonivox.sf2",
        scrollElement: window,
        enableCursor: true,
        enableUserInteraction: true,
        enableScrolling: true,
      },
      display: {
        layoutMode: 'page',
        scale: 0.8,
      },
    };
    
    // @ts-ignore - Globally loaded via CDN
    const api = new window.alphaTab.AlphaTabApi(alphaTabRef.current, settings);
    setAlphaTabApi(api);
    
    // Set up event handlers
    api.playerStateChanged.on((args: any) => {
      setIsPlaying(args.state === 1);
    });
    
    api.playerPositionChanged.on((args: any) => {
      const currentTime = formatDuration(args.currentTime);
      const totalTime = formatDuration(args.endTime);
      
      setCurrentSong(prev => ({
        ...prev,
        currentTime,
        totalTime
      }));
    });
    
    api.scoreLoaded.on((score: any) => {
      // Extract and format track info
      const tracksData = score.tracks.map((t: any) => ({
        name: t.name,
        instrumentName: getInstrumentName(t.playbackInfo.program),
        isPercussion: t.playbackInfo.isPercussion,
        isSolo: false,
        isMuted: false,
      }));
      
      setTracks(tracksData);
      
      // Update song info in React state
      setCurrentSong(prev => ({
        ...prev,
        title: score.title || 'Untitled',
        artist: score.artist || 'Unknown'
      }));
      
      setIsLoaded(true);
    });

    // Set up track state handlers
    api.renderStarted.on(() => {
      // This event is fired when the rendering of the whole music sheet starts
      console.log('Rendering started');
    });
    
    api.renderFinished.on(() => {
      // This event is fired when the rendering of the whole music sheet was finished
      console.log('Rendering finished');
    });
    
    // Clean up when component unmounts
    return () => {
      if (api) {
        api.destroy();
      }
    };
  }, [isScriptsLoaded]);
  
  // Format time duration from seconds to MM:SS
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Map MIDI program number to instrument name
  const getInstrumentName = (program: number): string => {
    const instruments = [
      "Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano", 
      "Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet", 
      "Celesta", "Glockenspiel", "Music Box", "Vibraphone", 
      "Marimba", "Xylophone", "Tubular Bells", "Dulcimer", 
      "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", 
      "Reed Organ", "Accordion", "Harmonica", "Tango Accordion", 
      "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)", 
      "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar harmonics", 
      "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", 
      "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", 
      "Violin", "Viola", "Cello", "Contrabass", 
      "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani", 
      "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", 
      "Choir Aahs", "Voice Oohs", "Synth Voice", "Orchestra Hit", 
      "Trumpet", "Trombone", "Tuba", "Muted Trumpet", 
      "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2", 
      "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", 
      "Oboe", "English Horn", "Bassoon", "Clarinet", 
      "Piccolo", "Flute", "Recorder", "Pan Flute", 
      "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina", 
      "Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 (chiff)", 
      "Lead 5 (charang)", "Lead 6 (voice)", "Lead 7 (fifths)", "Lead 8 (bass + lead)", 
      "Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)", 
      "Pad 5 (bowed)", "Pad 6 (metallic)", "Pad 7 (halo)", "Pad 8 (sweep)", 
      "FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", 
      "FX 5 (brightness)", "FX 6 (goblins)", "FX 7 (echoes)", "FX 8 (sci-fi)", 
      "Sitar", "Banjo", "Shamisen", "Koto", 
      "Kalimba", "Bag pipe", "Fiddle", "Shanai", 
      "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", 
      "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal", 
      "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", 
      "Telephone Ring", "Helicopter", "Applause", "Gunshot"
    ];
    
    return program >= 0 && program < instruments.length ? instruments[program] : "Unknown";
  };
  
  // Handle file upload
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !alphaTabApi) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        alphaTabApi.load(arrayBuffer, [0]);
        setHasFile(true);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
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
  
  // Toggle metronome
  const toggleMetronome = () => {
    if (!alphaTabApi) return;
    
    const newState = !metronomeActive;
    setMetronomeActive(newState);
    alphaTabApi.metronomeVolume = newState ? 1 : 0;
  };
  
  // Toggle count-in
  const toggleCountIn = () => {
    if (!alphaTabApi) return;
    
    const newState = !countInActive;
    setCountInActive(newState);
    alphaTabApi.countInVolume = newState ? 1 : 0;
  };
  
  // Set A/B loop markers
  const setA = () => {
    if (!alphaTabApi) return;
    
    const tick = alphaTabApi.playerState.currentTick;
    setATick(tick);
    
    if (bTick !== null && tick <= bTick) {
      alphaTabApi.playerState.loopRange = { 
        startTick: tick, 
        endTick: bTick 
      };
    }
  };
  
  const setB = () => {
    if (!alphaTabApi) return;
    
    const tick = alphaTabApi.playerState.currentTick;
    setBTick(tick);
    
    if (aTick !== null && tick >= aTick) {
      alphaTabApi.playerState.loopRange = { 
        startTick: aTick, 
        endTick: tick 
      };
    }
  };
  
  const clearAB = () => {
    if (!alphaTabApi) return;
    
    setATick(null);
    setBTick(null);
    alphaTabApi.playerState.loopRange = null;
  };
  
  // Track rendering and playback controls
  const handleTrackRenderToggle = (trackIndex: number) => {
    if (!alphaTabApi) return;
    
    // Toggle track visibility in score
    const currentTracks = alphaTabApi.tracks.map((t: any, i: number) => i === trackIndex ? !t : t);
    alphaTabApi.renderTracks(currentTracks);
  };
  
  const handleSolo = (trackIndex: number) => {
    if (!alphaTabApi) return;
    
    setTracks(prevTracks => {
      const newTracks = [...prevTracks];
      const isCurrentlySolo = newTracks[trackIndex].isSolo;
      
      // If this track is already solo, un-solo it and unmute all tracks
      if (isCurrentlySolo) {
        newTracks.forEach((t, i) => {
          t.isSolo = false;
          t.isMuted = false;
          if (alphaTabApi.playerState) {
            alphaTabApi.changeTrackSolo(i, false);
            alphaTabApi.changeTrackMute(i, false);
          }
        });
      } 
      // Otherwise, solo this track and mute all others
      else {
        newTracks.forEach((t, i) => {
          if (i === trackIndex) {
            t.isSolo = true;
            t.isMuted = false;
            if (alphaTabApi.playerState) {
              alphaTabApi.changeTrackSolo(i, true);
              alphaTabApi.changeTrackMute(i, false);
            }
          } else {
            t.isSolo = false;
            t.isMuted = true;
            if (alphaTabApi.playerState) {
              alphaTabApi.changeTrackSolo(i, false);
              alphaTabApi.changeTrackMute(i, true);
            }
          }
        });
      }
      
      return newTracks;
    });
  };
  
  const handleMute = (trackIndex: number) => {
    if (!alphaTabApi) return;
    
    setTracks(prevTracks => {
      const newTracks = [...prevTracks];
      const track = newTracks[trackIndex];
      track.isMuted = !track.isMuted;
      
      if (alphaTabApi.playerState) {
        alphaTabApi.changeTrackMute(trackIndex, track.isMuted);
      }
      
      return newTracks;
    });
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
        <div className="bg-[#0f1a2f] border-b border-[#1d2946] px-3 py-2.5 flex items-center flex-wrap gap-2 overflow-x-auto sticky top-0 z-10">
          <h2 className="text-[#e7f0ff] font-bold mr-2">Upkraft</h2>
          
          <div className="relative">
            <label className="bg-white text-[#0b1220] hover:bg-gray-100 px-3 py-1 rounded cursor-pointer text-sm font-medium">
              Choose File
              <input 
                type="file" 
                id="fileInput" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInputChange}
                accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.xml,.mid,.midi"
              />
            </label>
            <span className="ml-2 text-[#a6b7d1] text-sm">
              {hasFile ? 'File selected' : 'no file selected'}
            </span>
          </div>
          
          {!isPlaying ? (
            <button 
              onClick={handlePlayPause}
              disabled={!hasFile}
              className="border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm bg-[#172544] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶ Play
            </button>
          ) : (
            <button 
              onClick={handlePlayPause}
              className="border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm bg-[#7BD88F] text-[#08101f]"
            >
              ⏸ Pause
            </button>
          )}
          
          <button 
            onClick={handleStop}
            disabled={!hasFile}
            className="bg-[#172544] border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏹ Stop
          </button>
          
          <label className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            Speed
            <select 
              onChange={changePlaybackSpeed}
              disabled={!hasFile}
              className="bg-[#0f1a2f] text-[#e7f0ff] ml-2 border border-[#1d2946] rounded disabled:opacity-50"
              defaultValue="1"
            >
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="1">100%</option>
              <option value="1.25">125%</option>
              <option value="1.5">150%</option>
            </select>
          </label>
          
          <label className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            <input 
              type="checkbox" 
              checked={autoScroll} 
              onChange={toggleAutoScroll}
              disabled={!hasFile}
              className="mr-1 disabled:opacity-50" 
            />
            Auto-Scroll
          </label>
          
          <button 
            className={`border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm ${countInActive ? 'bg-[#7BD88F] text-[#08101f]' : 'bg-[#172544]'}`}
            onClick={toggleCountIn}
            disabled={!hasFile}
          >
            Count-In
          </button>
          
          <button 
            className={`border border-[#1d2946] text-[#e7f0ff] px-3 py-1 rounded-lg hover:bg-[#213251] text-sm ${metronomeActive ? 'bg-[#7BD88F] text-[#08101f]' : 'bg-[#172544]'}`}
            onClick={toggleMetronome}
            disabled={!hasFile}
          >
            Metronome
          </button>
          
          <div className="flex items-center bg-[#0f203b] border border-[#1d2946] text-[#a6b7d1] rounded-full px-3 py-1 text-sm">
            Loop A/B:
            <button onClick={setA} className="text-[#9ecbff] mx-1 bg-transparent border-none cursor-pointer" disabled={!hasFile}>Set A</button> •
            <button onClick={setB} className="text-[#9ecbff] mx-1 bg-transparent border-none cursor-pointer" disabled={!hasFile}>Set B</button> •
            <button onClick={clearAB} className="text-[#9ecbff] mx-1 bg-transparent border-none cursor-pointer" disabled={!hasFile}>Clear</button>
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
            
            {!hasFile ? (
              <div className="p-4 text-center text-[#a6b7d1] text-sm">
                <p>No instruments to display.</p>
                <p className="mt-2">Upload a file to view and control instruments.</p>
              </div>
            ) : (
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
                        className={`solo-btn text-xs px-3 py-1 bg-[#172544] hover:bg-[#213251] text-[#e7f0ff] border border-[#1d2946] rounded-lg ${track.isSolo ? 'active' : ''}`}
                        onClick={() => handleSolo(idx)}
                      >
                        Solo
                      </button>
                      <button 
                        className={`mute-btn text-xs px-3 py-1 bg-[#172544] hover:bg-[#213251] text-[#e7f0ff] border border-[#1d2946] rounded-lg ${track.isMuted ? 'active' : ''}`}
                        onClick={() => handleMute(idx)}
                      >
                        Mute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area - 9 columns */}
          <div className="col-span-9 bg-[#0f1a2f] flex flex-col h-full">
            {!hasFile ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-24 h-24 mb-6 opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e7f0ff">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#e7f0ff] mb-3">Upload a music file to begin</h3>
                <p className="text-[#a6b7d1] mb-6 max-w-md">
                  Upload a Guitar Pro file (.gp, .gp3, .gp4, .gp5, .gpx), MusicXML (.musicxml, .xml), or MIDI file (.mid, .midi) to view and play it.
                </p>
                <label className="bg-white text-[#0b1220] hover:bg-gray-100 px-6 py-3 rounded-lg cursor-pointer text-base font-medium transition-colors">
                  Choose File
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInputChange}
                    accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.xml,.mid,.midi"
                  />
                </label>
              </div>
            ) : (
              /* AlphaTab container - white background for notation */
              <div id="alphaTab" ref={alphaTabRef} className="w-full h-full overflow-auto bg-white">
                {!isScriptsLoaded && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading music visualizer...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AlphaTab Scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js"
        onLoad={handleScriptLoad}
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/build/Midi.js"
        strategy="beforeInteractive"
      />
      
      {/* Custom CSS for AlphaTab */}
      <style jsx global>{`
        :root {
          --bg: #0b1220;
          --fg: #e7f0ff;
          --muted: #a6b7d1;
          --panel: #101a2a;
          --panel2: #0e1830;
          --border: #1d2946;
          --accent: #4aa3ff;
          --accent2: #7bd88f;
        }
        
        .at-cursor-bar{background:rgba(255,242,0,.22)}
        .at-cursor-beat{background:rgba(64,255,160,.95);width:5px}
        .at-highlight *{fill:#00a2ff;stroke:#00a2ff}
        .at-selection *{fill:#ffd166;stroke:#ffd166}
        
        /* Highlight instruments currently sounding */
        .track.playing {
          background: rgba(123,216,143,0.12) !important;
          box-shadow: 0 0 0 1px var(--accent2) inset, 0 0 6px rgba(123,216,143,.25) !important;
          border-radius: 12px;
          transition: background .15s ease, box-shadow .15s ease;
        }
        
        /* Active button highlight */
        .solo-btn.active,
        .mute-btn.active {
          background: var(--accent2);
          color: #08101f;
          box-shadow: 0 0 0 2px var(--accent2) inset, 0 0 8px rgba(123,216,143,.35);
        }
        
        /* Keep header visible and controls clear */
        #alphaTab {
          padding-top: 76px;
        }
        #alphaTab * {
          scroll-margin-top: 76px;
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
      `}</style>
    </>
  );
}
