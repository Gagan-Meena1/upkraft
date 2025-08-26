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
    
    // Create custom CSS for vertical line visibility (added to ensure green lines are visible)
    const style = document.createElement('style');
    style.textContent = `
      /* Force beat cursor visibility - enhanced for better visibility */
      .at-cursor-beat {
        background: rgba(0, 180, 80, 1) !important;
        width: 7px !important;
        box-shadow: 0 0 8px rgba(0, 180, 80, 0.7) !important;
        z-index: 9999 !important;
        pointer-events: none !important;
      }
      
      /* Force first bar separator to be green */
      #alphaTab .at-viewport .at-bar-separator:first-child,
      #alphaTab svg line.at-bar-separator:first-of-type,
      #alphaTab .at-measure:first-child .at-bar-separator {
        background-color: #00CC00 !important;
        stroke: #00CC00 !important;
        stroke-width: 3px !important;
        width: 3px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(preloadLink);
      document.head.removeChild(style);
    };
  }, []);

  // State for UI
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "No score loaded",
    artist: "",
    currentTime: "00:00",
    totalTime: "00:00"
  });
  const [playingTrackIds, setPlayingTrackIds] = useState({});
  
  // Refs and core state
  const alphaTabRef = useRef(null);
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [aTick, setATick] = useState(null);
  const [bTick, setBTick] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [alphaTabApi, setAlphaTabApi] = useState(null);
  
  // Control states
  const [countInActive, setCountInActive] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [speed, setSpeed] = useState("100%");
  
  // Handle script loading
  const handleScriptLoad = () => {
    setIsScriptsLoaded(true);
  };
  
  // Set up core AlphaTab functionality
  useEffect(() => {
    if (!isScriptsLoaded || !alphaTabRef.current) return;
    
    // Initialize AlphaTab - exact match to HTML version
    const settings = {
      core: {
        engine: "html5",
        logLevel: "debug"
      },
      display: {
        staveProfile: "ScoreTab", // notation + TAB
        layoutMode: 'page',
        scale: 0.8,
        resources: {
          // Custom font for lyrics and text
          copyrightFont: "12px Arial",
          titleFont: "24px Arial bold",
          subTitleFont: "18px Arial",
          wordsFont: "16px Arial",
          effectFont: "12px Arial italic",
          tempoFont: "14px Arial bold italic",
        },
        // Make sure bar numbers are shown
        barCountPerLine: 4,
        barNumberInterval: 1
      },
      notation: {
        elements: {
          scoreTitle: true,
          scoreSubTitle: true,
          scoreArtist: true,
          scoreAlbum: true,
          scoreWords: true,
          scoreMusic: true,
          scoreWordsAndMusic: false,
          scoreCopyright: true
        },
        // Display measure numbers in red
        measureNumberInterval: 1,
        measureNumberFormat: "%d",
        measureNumberColor: "#ff0000"
      },
      player: {
        enablePlayer: true,
        enableUserInteraction: true,
        enableCursor: true,
        enableScrolling: true,
        soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/soundfont/sonivox.sf2",
        scrollMode: 'continuous',
        scrollSpeed: 2,
        
                // Enhanced cursor settings for improved visibility
        cursorAlpha: 1,
        cursorColor: "rgba(0, 180, 80, 1)", // Darker, more vivid green
        cursorWidth: 7, // Wider for better visibility
        
        // Enable auto-scrolling by default
        autoScroll: true,
      },
      logging: false
    };
    
    // @ts-ignore - Globally loaded via CDN
    const api = new window.alphaTab.AlphaTabApi(alphaTabRef.current, settings);
    setAlphaTabApi(api);
    
    // Add a custom rendering hook to track all measure positions
    api.postRenderFinished.on(() => {
      // This runs after each render - good place to map all the measures
      setTimeout(() => {
        try {
          // Get viewport reference for position calculations
          const viewport = document.querySelector('#alphaTab .at-viewport');
          if (!viewport) return;
          const viewportRect = viewport.getBoundingClientRect();
          
          // Find all measures
          const measures = document.querySelectorAll('.at-measure');
          if (measures && measures.length) {
            // Store positions of all measures
            const positions = Array.from(measures).map((measure, index) => {
              const rect = measure.getBoundingClientRect();
              // Calculate position relative to viewport
              return {
                index,
                left: rect.left - viewportRect.left,
                width: rect.width,
                top: rect.top - viewportRect.top,
                height: rect.height,
                element: measure,
                // Extract measure number if available
                measureNumber: measure.getAttribute('data-measure') || (index + 1).toString()
              };
            });
            
            console.log(`Mapped ${positions.length} measure positions`);
            setMeasurePositions(positions);
            
            // Let AlphaTab handle cursor positioning and highlighting
            // No need to manually highlight the first measure
          }
        } catch (e) {
          console.error('Error in post-render hook:', e);
        }
      }, 500);
    });
    
    // Set up event handlers
    api.playerStateChanged.on((args) => {
      setIsPlaying(args.state === 1);
    });
    
    api.playerPositionChanged.on((args) => {
      const currentTime = formatDuration(args.currentTime);
      const totalTime = formatDuration(args.endTime);
      
      setCurrentSong(prev => ({
        ...prev,
        currentTime,
        totalTime
      }));
      
      // Track current measure during playback
      if (args.currentMeasure !== undefined) {
        setCurrentMeasure(args.currentMeasure);
      }
    });
    
  // Use AlphaTab's built-in cursor and highlighting system with improved configuration
  
    // Configure cursor appearance with enhanced visibility
  api.settings.player.enableCursor = true;
  api.settings.player.cursorColor = "rgba(0, 180, 80, 1)"; // Darker, more vivid green
  api.settings.player.cursorAlpha = 1; // Fully opaque
  api.settings.player.cursorWidth = 7; // Slightly wider for better visibility
  
  // Track beat change events to match HTML version
  try {
    // In AlphaTab 1.6.1, beat changes are tracked via the playerPositionChanged event
    api.playerPositionChanged.on((args) => {
      // Update current measure for any UI that needs to know
      if (args.currentMeasure !== undefined) {
        setCurrentMeasure(args.currentMeasure);
      }
      
      // The cursor will be updated automatically by AlphaTab
    });
  } catch (e) {
    console.error('Error setting up beat tracking:', e);
  }
  
  // Extra highlighting of current element like in HTML version
  api.midiEventsPlayedFilter = ["NoteOn"];
  api.midiEventsPlayed.on(ev => {
    const el = ev?.events?.[0]?.element;
    if (el && api.renderer) {
      try { 
        // Add highlight to currently played notes
        api.renderer.highlightElements([el]); 
      } catch (e) { 
        console.error('Error highlighting element:', e);
      }
    }
  });    // Track which instruments are currently playing via MIDI events
    api.midiEventsPlayedFilter = ["NoteOn"];
    api.midiEventsPlayed.on((ev) => {
      
      // Track which instruments are currently playing (like in HTML version)
      if (ev && ev.events && ev.events.length > 0) {
        const trackIds = {};
        
        ev.events.forEach(midiEvent => {
          const track = midiEvent.track;
          if (track) {
            // Mark this track as playing
            trackIds[track.index] = true;
            
            // Set a timeout to clear the highlight after a short delay
            setTimeout(() => {
              setPlayingTrackIds(prev => {
                const updated = {...prev};
                delete updated[track.index];
                return updated;
              });
            }, 150);
          }
        });
        
        setPlayingTrackIds(prev => ({...prev, ...trackIds}));
      }
    });
    
    api.scoreLoaded.on((score) => {
      // Extract and format track info
      const tracksData = score.tracks.map((t) => ({
        name: t.name,
        instrumentName: getInstrumentName(t.playbackInfo.program),
        isPercussion: t.playbackInfo.isPercussion,
        isSolo: false,
        isMuted: false,
        isPlaying: false,
      }));
      
      setTracks(tracksData);
      
      // Update song info in React state
      setCurrentSong(prev => ({
        ...prev,
        title: score.title || 'Untitled',
        artist: score.artist || 'Unknown'
      }));
      
      // Force a layout update to ensure proper rendering
      setTimeout(() => {
        if (api && api.renderer) {
          api.updateSettings({
            display: {
              layoutMode: "page"
            },
            player: {
              enableCursor: true,
              enablePlayer: true,
              enableUserInteraction: true,
              enableScrolling: autoScroll
            }
          });
          api.render();
        }
        setIsLoaded(true);
        setHasFile(true);
      }, 300);
    });

    // Clean up when component unmounts
    return () => {
      if (api) {
        api.destroy();
      }
    };
  }, [isScriptsLoaded]);
  
  // Format time duration from seconds to MM:SS
  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Map MIDI program number to instrument name
  const getInstrumentName = (program) => {
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
  
  // Handle file upload - improved version to match HTML functionality
  const handleFileInputChange = async (e) => {
    if (!e.target.files || !e.target.files[0] || !alphaTabApi) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    // Show loading indicator
    setIsLoaded(false);
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        try {
          const arrayBuffer = event.target.result;
          
          // Load all tracks initially
          alphaTabApi.load(arrayBuffer);
          setHasFile(true);
          
          // Parse file name for display
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
          setCurrentSong(prev => ({
            ...prev,
            title: fileName || 'Untitled'
          }));
          
          // Reset player controls
          alphaTabApi.renderMode = 0;  // ScoreTab
          alphaTabApi.metronomeVolume = metronomeActive ? 1 : 0;
          alphaTabApi.countInVolume = countInActive ? 1 : 0;
          
          // Focus on the score area
          if (alphaTabRef.current) {
            alphaTabRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (err) {
          console.error('Error loading file:', err);
          alert('Error loading the music file. Please try another file format.');
        }
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setIsLoaded(true);
      alert('Error reading the music file.');
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Play/Pause toggle
  const handlePlay = () => {
    if (!alphaTabApi) return;
    alphaTabApi.play();
  };
  
  const handlePause = () => {
    if (!alphaTabApi) return;
    alphaTabApi.pause();
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
  const handleTrackRenderToggle = (trackIndex) => {
    if (!alphaTabApi) return;
    
    // Toggle track visibility in score
    const currentTracks = alphaTabApi.tracks.map((t, i) => i === trackIndex ? !t : t);
    alphaTabApi.renderTracks(currentTracks);
  };
  
  const handleSolo = (trackIndex) => {
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
  
  const handleMute = (trackIndex) => {
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

  const formatTick = (tick) => {
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
  
  // Update track playing status when playingTrackIds changes
  useEffect(() => {
    if (!tracks.length) return;
    
    setTracks(prevTracks => {
      return prevTracks.map((track, idx) => ({
        ...track,
        isPlaying: !!playingTrackIds[idx]
      }));
    });
  }, [playingTrackIds, tracks.length]);
  
  // Change playback speed
  const changePlaybackSpeed = (e) => {
    if (!alphaTabApi) return;
    
    const speed = parseFloat(e.target.value);
    if (!isNaN(speed)) {
      alphaTabApi.playbackSpeed = speed;
      setSpeed(`${speed * 100}%`);
    }
  };

  // State to track the current measure during playback
  const [currentMeasure, setCurrentMeasure] = useState(0);
  
  // State to store measure positions for reference (used by other components)
  const [measurePositions, setMeasurePositions] = useState([]);
  
  // Add cursor tracking reference for cleanup
  const cursorTrackingRef = useRef(null);
  
  // Effect to enhance cursor tracking after the component is mounted
  useEffect(() => {
    if (!alphaTabApi || !isScriptsLoaded) return;
    
    // This effect runs after AlphaTab is initialized to ensure cursor tracking works
    const enhanceCursorTracking = () => {
      try {
        // Add additional viewport scroll handler for keeping the cursor visible
        const viewport = document.querySelector('#alphaTab .at-viewport');
        if (viewport && autoScroll) {
          const handleScroll = () => {
            const cursor = document.querySelector('.at-cursor-beat');
            if (!cursor) return;
            
            // Keep cursor in view with a reasonable margin
            const viewportRect = viewport.getBoundingClientRect();
            const cursorRect = cursor.getBoundingClientRect();
            
            // Calculate if cursor is visible with proper margin
            const isVisible = 
              cursorRect.top >= viewportRect.top + 50 && 
              cursorRect.bottom <= viewportRect.bottom - 50;
            
            if (!isVisible && isPlaying) {
              // Scroll to make cursor visible with margin
              cursor.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
              });
            }
          };
          
          // Set interval for periodic checking
          const intervalId = setInterval(handleScroll, 500);
          cursorTrackingRef.current = intervalId;
          
          return () => {
            clearInterval(intervalId);
          };
        }
      } catch (e) {
        console.error('Error setting up cursor tracking:', e);
      }
    };
    
    // Apply cursor tracking when autoScroll changes
    enhanceCursorTracking();
    
    return () => {
      if (cursorTrackingRef.current) {
        clearInterval(cursorTrackingRef.current);
      }
    };
  }, [alphaTabApi, isScriptsLoaded, autoScroll, isPlaying]);
  
  // We'll now rely on AlphaTab's native cursor and scrolling system with our enhancements
  
  // Using exact CSS from the HTML reference for the cursor

  return (
    <div className="flex flex-col h-screen bg-[#010d1f]">
      {/* Custom CSS for styling - matching HTML version */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #010d1f;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .at-cursor-bar {
          background: rgba(255,242,0,.22);
        }
        .at-cursor-beat {
          background: rgba(0, 180, 80, 1) !important; /* Darker, more vivid green */
          width: 7px !important; /* Slightly wider for more visibility */
          box-shadow: 0 0 8px rgba(0, 180, 80, 0.7) !important; /* Add glow effect */
          z-index: 9999 !important; /* Ensure it's on top */
        }
        
        .at-highlight * {
          fill: #00a2ff;
          stroke: #00a2ff;
        }
        
        .at-selection * {
          fill: #ffd166;
          stroke: #ffd166;
        }
        
        /* Track highlighting */
        .track.playing { 
          background: rgba(123,216,143,0.12);
          box-shadow: 0 0 0 1px var(--accent2) inset, 0 0 6px rgba(123,216,143,.25);
          border-radius: 12px;
          transition: background .15s ease, box-shadow .15s ease;
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
        
        /* Layout styles matching HTML version exactly */
        #alphaTab.at-content { 
          padding: 20px;
          background-color: #fff; 
          height: 100%;
          overflow: auto;
          touch-action: pan-y;
          overscroll-behavior: contain;
        }
        
        #alphaTab.at-content * {
          scroll-margin-top: 76px;
        }
        
        /* Song header styling - match HTML version */
        .at-song-title {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
          color: #000;
        }
        
        .at-song-subtitle {
          font-size: 20px;
          text-align: center;
          margin-bottom: 0;
          color: #000;
        }
        
        .at-song-artist {
          font-size: 20px;
          text-align: center;
          margin-bottom: 0;
          color: #000;
        }
        
        .at-song-words {
          font-size: 16px;
          text-align: left;
          margin-top: 20px;
          margin-bottom: 20px;
          color: #000;
          padding-left: 20px;
        }
        
        .at-song-copyright {
          font-size: 16px;
          text-align: right;
          margin-top: 20px;
          margin-bottom: 20px;
          color: #000;
          padding-right: 20px;
        }
        
        /* Score and tab layout - match HTML version */
        .at-viewport {
          background-color: white;
          padding: 0;
        }
        
        /* Cursor and highlighting - exact match from HTML version */
        .at-cursor-bar {
          background: rgba(255, 242, 0, .22) !important;
        }
        
          /* Beat cursor - this is the vertical green line that moves with playback - exact match from HTML */
        .at-cursor-beat {
          background: rgba(64,255,160,.95) !important; /* Exact color from HTML version */
          width: 5px !important; /* Exact width from HTML version */
          pointer-events: none;
        }        /* Ensure proper measure number styling */
        .at-measure-number {
          color: #ff0000 !important;
          font-weight: bold !important;
        }
        
        /* Note highlighting during playback */
        .at-highlight * {
          fill: #00a2ff !important;
          stroke: #00a2ff !important;
        }
        
          /* First bar styling */
        .at-measure-number[data-measure="1"] ~ .at-bar-separator,
        div[data-measure="1"] .at-bar-separator,
        svg g[data-measure="1"] line.at-bar-separator {
          background: #00CC00 !important;
          stroke: #00CC00 !important;
          fill: #00CC00 !important;
          width: 3px !important;
          stroke-width: 3px !important;
          opacity: 1 !important;
        }        /* Special CSS for SVG elements */
        svg line.at-bar-separator[data-index="0"],
        svg line.at-bar-separator:first-child,
        svg g[data-bar="0"] line.at-bar-separator,
        svg g:first-child line.at-bar-separator {
          stroke: #00CC00 !important;
          stroke-width: 3px !important;
        }
      `}</style>
      
      {/* Main Header - Exact match to HTML reference */}
      <div className="bg-[#010d1f] border-b border-[#102040] px-3 py-2 flex items-center flex-wrap gap-2 sticky top-0 z-10">
        <h2 className="text-white font-bold mr-4">Upkraft</h2>
        
        <div className="flex items-center relative">
          <button className="bg-white hover:bg-gray-100 text-[#010d1f] font-medium py-1 px-3 rounded mr-1">
            Choose File
          </button>
          <input 
            type="file" 
            id="fileInput" 
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
            accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.xml,.mid,.midi,.gp6,.gp7,.gp8,.capx,.cap"
          />
          <span className="text-[#a6b7d1] text-sm mr-4">
            {hasFile ? currentSong.title : 'no file selected'}
          </span>
        </div>
        
        <button 
          onClick={handlePlay}
          disabled={!hasFile || isPlaying}
          className="bg-[#102040] hover:bg-[#1b2c4f] border border-[#1d2946] text-white py-1 px-3 rounded mr-1 disabled:opacity-50"
        >
          ▶ Play
        </button>
        
        <button 
          onClick={handlePause}
          disabled={!hasFile || !isPlaying}
          className="bg-[#102040] hover:bg-[#1b2c4f] border border-[#1d2946] text-white py-1 px-3 rounded mr-1 disabled:opacity-50"
        >
          ⏸ Pause
        </button>
        
        <button 
          onClick={handleStop}
          disabled={!hasFile}
          className="bg-[#102040] hover:bg-[#1b2c4f] border border-[#1d2946] text-white py-1 px-3 rounded mr-4 disabled:opacity-50"
        >
          ⏹ Stop
        </button>
        
        <div className="flex items-center mr-4">
          <span className="text-[#a6b7d1] mr-2">Speed</span>
          <select 
            onChange={changePlaybackSpeed}
            disabled={!hasFile}
            className="bg-[#102040] text-white border border-[#1d2946] rounded p-1"
            defaultValue="1"
          >
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
          </select>
        </div>
        
        <div className="flex items-center mr-4">
          <input 
            type="checkbox" 
            checked={autoScroll} 
            onChange={toggleAutoScroll}
            disabled={!hasFile}
            className="mr-1" 
          />
          <span className="text-[#a6b7d1]">Auto-Scroll</span>
        </div>
        
        <button 
          className={`bg-[#102040] hover:bg-[#1b2c4f] border border-[#1d2946] text-white py-1 px-3 rounded mr-1 ${countInActive ? 'bg-[#294d7f]' : ''}`}
          onClick={toggleCountIn}
          disabled={!hasFile}
        >
          Count-In
        </button>
        
        <button 
          className={`bg-[#102040] hover:bg-[#1b2c4f] border border-[#1d2946] text-white py-1 px-3 rounded mr-4 ${metronomeActive ? 'bg-[#294d7f]' : ''}`}
          onClick={toggleMetronome}
          disabled={!hasFile}
        >
          Metronome
        </button>
        
        <div className="flex items-center mr-2 text-[#a6b7d1]">
          <span>Loop A/B:</span>
          <button onClick={setA} disabled={!hasFile} className="text-[#4a89dc] mx-1">Set A</button>
          <span>•</span>
          <button onClick={setB} disabled={!hasFile} className="text-[#4a89dc] mx-1">Set B</button>
          <span>•</span>
          <button onClick={clearAB} disabled={!hasFile} className="text-[#4a89dc] mx-1">Clear</button>
        </div>
        
        <div className="text-[#a6b7d1] mr-2">
          A: {formatTick(aTick)} | B: {formatTick(bTick)}
        </div>
        
        <div className="text-[#a6b7d1] mr-2">
          {currentSong.currentTime} / {currentSong.totalTime}
        </div>
        
        <div className="text-[#a6b7d1] overflow-hidden whitespace-nowrap text-ellipsis" style={{maxWidth: '200px'}}>
          {hasFile ? `${currentSong.title} — ${currentSong.artist}` : 'No score loaded'}
        </div>
      </div>

      {/* Main content area with sidebar and visualizer */}
      <div className="grid grid-cols-12 h-full">
        {/* Left sidebar - Instruments - Match HTML reference exactly */}
        <div className="col-span-3 lg:col-span-2 bg-[#010d1f] border-r border-[#102040]">
          <h3 className="p-3 text-sm font-medium text-[#a6b7d1]">Instruments</h3>
          {hasFile ? (
            <div>
              {tracks.map((track, idx) => (
                <div 
                  key={idx} 
                  className={`border-b border-[#102040] flex items-center gap-3 p-2 hover:bg-[#0f1a2a] ${track.isPlaying ? 'playing' : ''} track`}
                  id={`track-${idx}`}
                >
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-blue-500"
                    onChange={() => handleTrackRenderToggle(idx)}
                    defaultChecked={idx === 0}
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{track.name || `Track ${idx + 1}`}</div>
                    <small className="text-[#a6b7d1] block text-xs">instrument</small>
                    <small className="text-[#a6b7d1]">{track.isPercussion ? "Percussion" : track.instrumentName}</small>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className={`text-xs px-3 py-1 bg-[#0f1a2a] hover:bg-[#1b2c4f] text-white border border-[#1d2946] rounded-md ${track.isSolo ? 'bg-[#294d7f]' : ''}`}
                      onClick={() => handleSolo(idx)}
                    >
                      Solo
                    </button>
                    <button 
                      className={`text-xs px-3 py-1 bg-[#0f1a2a] hover:bg-[#1b2c4f] text-white border border-[#1d2946] rounded-md ${track.isMuted ? 'bg-[#294d7f]' : ''}`}
                      onClick={() => handleMute(idx)}
                    >
                      Mute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-[#a6b7d1]">
              No instruments to display
            </div>
          )}
        </div>

        {/* Main Content Area - AlphaTab container */}
        <div className="col-span-9 lg:col-span-10 bg-white relative">
          
          <div id="alphaTab" ref={alphaTabRef} className="w-full h-full overflow-auto at-content">
            {!hasFile && isScriptsLoaded && (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center text-gray-500">
                  {/* Deliberately left empty to match the HTML version */}
                </div>
              </div>
            )}
            {!isScriptsLoaded && (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-gray-500">Loading music visualizer...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AlphaTab Scripts - exact match to HTML version */}
      <Head>
        <link rel="preload" href="https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js" as="script" />
        {/* Add music font for proper tempo display */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Bravura';
            src: url('https://cdn.jsdelivr.net/npm/bravura@1.1.1/dist/Bravura.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
          }
          .at-tempo-sign {
            font-family: 'Bravura', serif;
            font-size: 18px;
          }
          
          /* Critical CSS for green line - will be applied immediately during page load */
          #alphaTab .at-viewport .at-bar-separator:first-child,
          #alphaTab svg line.at-bar-separator:first-of-type,
          #alphaTab .at-measure:first-child .at-bar-separator,
          #alphaTab svg g:first-child line.at-bar-separator {
            background-color: #009900 !important;
            stroke: #009900 !important;
            stroke-width: 5px !important;
            width: 5px !important;
            opacity: 1 !important;
            z-index: 9999 !important;
          }
          
          /* Green highlighting for the bar that's being played */
          .at-cursor-bar {
            background: rgba(255, 255, 0, 0.2) !important;
            opacity: 1 !important;
          }
          
          /* Enhanced green line for maximum visibility */
          .at-cursor-beat {
            background: rgba(0, 180, 80, 1) !important;
            width: 7px !important;
            box-shadow: 0 0 8px rgba(0, 180, 80, 0.7) !important;
            z-index: 9999 !important;
          }
          
          /* Extra targeting for first measure numbers to help locate the green line */
          #alphaTab .at-measure-number[data-index="0"],
          #alphaTab .at-measure-number:first-child {
            color: #ff0000 !important;
            font-weight: bold !important;
          }
        `}} />
      </Head>
      
      <Script 
        src="https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.6.1/dist/alphaTab.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      
      {/* Add additional MIDI library for better compatibility */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/build/Midi.js"
        strategy="afterInteractive"
      />
      
      {/* Add custom script for cursor enhancement */}
      <Script id="cursor-enhancements" strategy="afterInteractive">
        {`
          (function() {
            // Wait for AlphaTab to initialize
            function waitForAlphaTab() {
              if (window.alphaTab) {
                enhanceCursor();
              } else {
                setTimeout(waitForAlphaTab, 100);
              }
            }
            
            function enhanceCursor() {
              // Ensure cursor display properties are forcefully set
              const updateCursorStyles = () => {
                const beatCursors = document.querySelectorAll('.at-cursor-beat');
                beatCursors.forEach(cursor => {
                  cursor.style.background = '#00FF00'; // Bright green for maximum visibility
                  cursor.style.width = '7px'; // Extra wide for prominence
                  cursor.style.opacity = '1';
                  cursor.style.zIndex = '9999';
                  cursor.style.pointerEvents = 'none';
                  cursor.style.boxShadow = '0 0 8px #00FF00, 0 0 15px #00FF00'; // Enhanced glow effect
                });
                
                // Apply improved visibility to bar separators
                const firstBarSeps = document.querySelectorAll('svg line.at-bar-separator:first-of-type');
                firstBarSeps.forEach(sep => {
                  sep.setAttribute('stroke', 'rgba(0, 180, 80, 1)');
                  sep.setAttribute('stroke-width', '7');
                });
                
                // Handle first measure bar separators in HTML format
                const firstMeasures = document.querySelectorAll('.at-measure:first-child .at-bar-separator');
                firstMeasures.forEach(sep => {
                  sep.style.backgroundColor = '#009900';
                  sep.style.width = '5px';
                  sep.style.opacity = '1';
                });
                
                // Create custom cursor element as fallback
                createCustomCursor();
              };
              
              // Create a custom cursor div if one doesn't exist
              const createCustomCursor = () => {
                // Remove any existing custom cursors
                const existingCustomCursors = document.querySelectorAll('.custom-green-cursor');
                existingCustomCursors.forEach(c => c.remove());
                
                // If we don't find any AlphaTab cursor, create a custom one
                const container = document.querySelector('#alphaTab .at-viewport');
                if (!container) return;
                
                // Find the first measure or staff
                const firstStaff = container.querySelector('.at-staff') || 
                                   container.querySelector('.at-measure');
                
                if (firstStaff) {
                  const customCursor = document.createElement('div');
                  customCursor.className = 'custom-green-cursor';
                  customCursor.style.position = 'absolute';
                  customCursor.style.width = '5px';
                  customCursor.style.background = '#009900';
                  customCursor.style.top = '0';
                  customCursor.style.bottom = '0';
                  customCursor.style.left = firstStaff.getBoundingClientRect().left + 'px';
                  customCursor.style.zIndex = '9999';
                  customCursor.style.pointerEvents = 'none';
                  customCursor.style.boxShadow = '0 0 5px #009900';
                  
                  // Apply to relatively positioned parent
                  const parentRect = container.getBoundingClientRect();
                  customCursor.style.height = parentRect.height + 'px';
                  
                  container.style.position = 'relative';
                  container.appendChild(customCursor);
                }
              };
              
              // Add a mutation observer to apply styles to newly created cursors
              const observer = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                  updateCursorStyles();
                });
              });
              
              // Start observing the score area
              const scoreArea = document.querySelector('#alphaTab');
              if (scoreArea) {
                observer.observe(scoreArea, { 
                  childList: true, 
                  subtree: true 
                });
                
                // Initial styles update
                updateCursorStyles();
                
                // Periodically check to make sure cursor is visible
                setInterval(updateCursorStyles, 1000);
              }
            }
            
            // Start the enhancement process
            waitForAlphaTab();
            // Run on a delay to catch post-render
            setTimeout(waitForAlphaTab, 1000);
            setTimeout(waitForAlphaTab, 2000);
          })();
        `}
      </Script>
      
      {/* Add custom script for cursor tracking enhancement */}
      <Script id="cursor-enhancements" strategy="afterInteractive">
        {`
          (function() {
            // Wait for AlphaTab to initialize
            function waitForAlphaTab() {
              if (window.alphaTab) {
                enhanceCursor();
              } else {
                setTimeout(waitForAlphaTab, 100);
              }
            }
            
            function enhanceCursor() {
              // Ensure cursor display properties are forcefully set
              const updateCursorStyles = () => {
                const beatCursors = document.querySelectorAll('.at-cursor-beat');
                beatCursors.forEach(cursor => {
                  // Apply enhanced styles for better visibility
                  cursor.style.background = 'rgba(0, 180, 80, 1)';
                  cursor.style.width = '7px';
                  cursor.style.boxShadow = '0 0 8px rgba(0, 180, 80, 0.7)';
                  cursor.style.zIndex = '9999';
                  cursor.style.pointerEvents = 'none';
                });
                
                // Apply improved visibility to bar separators
                const firstBarSeps = document.querySelectorAll('svg line.at-bar-separator:first-of-type');
                firstBarSeps.forEach(sep => {
                  sep.setAttribute('stroke', '#00ff00');
                  sep.setAttribute('stroke-width', '3');
                });
              };
              
              // Add a mutation observer to apply styles to newly created cursors
              const observer = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                  updateCursorStyles();
                });
              });
              
              // Start observing the score area
              const scoreArea = document.querySelector('#alphaTab');
              if (scoreArea) {
                observer.observe(scoreArea, { 
                  childList: true, 
                  subtree: true 
                });
                
                // Initial styles update
                updateCursorStyles();
              }
            }
            
            // Start the enhancement process
            waitForAlphaTab();
          })();
        `}
      </Script>
    </div>
  );
}
