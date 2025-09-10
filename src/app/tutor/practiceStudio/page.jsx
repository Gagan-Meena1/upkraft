"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRouter, useSearchParams } from "next/navigation";
import MyLibrary from "@/components/practiceStudio/MyLibrary";
import Results from "@/components/practiceStudio/Results";
import Achievements from "@/components/practiceStudio/Achievements";
import AIRecommendations from "@/components/practiceStudio/AIRecommendations";
import MusicLibraryTabs from "@/components/practiceStudio/MusicLibraryTabs";
import { getApiBaseUrl } from "@/utils/api";
import "@/components/practiceStudio/PracticeStudio.css";

const PracticeStudio = () => {
  const [activeKey, setActiveKey] = useState("Lessons");
  const [selectedSongUrl, setSelectedSongUrl] = useState("");
  const iframeRef = useRef(null);
  const fsWrapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure the iframe receives keyboard focus for shortcuts
  const focusIframe = () => {
    try {
      iframeRef.current?.focus?.();
      iframeRef.current?.contentWindow?.focus?.();
    } catch (_) {}
  };

  // Track fullscreen changes once
  useEffect(() => {
    if (!mounted) return;
    
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [mounted]);

  // Handle initial state from URL params or navigation state
  useEffect(() => {
    if (!mounted) return;

    // Check for songUrl in search params
    const songUrl = searchParams.get('songUrl');
    if (songUrl) {
      setSelectedSongUrl(songUrl);
      setActiveKey("Practice");
    }
  }, [mounted, searchParams]);

  // Switch tab based on URL hash like /practice-studio#Results
  useEffect(() => {
    if (!mounted) return;

    const pickFromHash = () => {
      const hash = window.location.hash?.replace('#', '');
      if (hash === 'Results' || hash === 'Lessons' || hash === 'Practice' || hash === 'MyLibrary') {
        setActiveKey(hash);
      }
    };
    
    pickFromHash();
    window.addEventListener('hashchange', pickFromHash);
    return () => window.removeEventListener('hashchange', pickFromHash);
  }, [mounted]);

  // Listen for messages from the visualizer iframe to switch tabs
  useEffect(() => {
    if (!mounted) return;

    function onMessage(e) {
      try {
        if (e?.data?.type === "upkraft:showResults") {
          setActiveKey("Results");
        }
      } catch (_) {}
    }
    
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mounted]);

  // If a songUrl is provided, switch to Practice tab
  useEffect(() => {
    if (selectedSongUrl) setActiveKey("Practice");
  }, [selectedSongUrl]);

  // Push selection into iframe if already mounted
  useEffect(() => {
    if (!mounted || !selectedSongUrl) return;
    
    const iframe = document.querySelector(
      'iframe[title="Practice Visualizer"]'
    );
    try {
      iframe?.contentWindow?.postMessage(
        { type: "upkraft:loadSong", url: selectedSongUrl },
        "*"
      );
    } catch (_) {}
  }, [mounted, selectedSongUrl]);

  // Whenever returning to the Practice tab, ensure the iframe regains focus
  useEffect(() => {
    if (!mounted) return;

    if (activeKey === "Practice") {
      // Small delay lets the tab content mount before focusing
      const t = setTimeout(() => {
        try {
          focusIframe();
        } catch (_) {}
      }, 50);
      return () => clearTimeout(t);
    }
  }, [mounted, activeKey]);

  const handlePracticeTabSelect = () => {
    const base = getApiBaseUrl();
    const params = new URLSearchParams();
    if (base) params.set("apiBase", base);
    if (selectedSongUrl) params.set("songUrl", selectedSongUrl);
    const url = `/visualizer.html${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    
    window.location.assign(url);
    return;
  };

  const handleOpenVisualizer = () => {
    const base = getApiBaseUrl();
    const params = new URLSearchParams();
    if (base) params.set("apiBase", base);
    if (selectedSongUrl) params.set("songUrl", selectedSongUrl);
    const url = `/visualizer.html${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    
    window.location.assign(url);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="row">
        <div
          className={`${activeKey === "Results" ? "col-md-12" : "col-md-12"}`}
        >
          <div
            className={`h-100 card-box position-relative practice-studio-sec ${
              activeKey === "Lessons" ? "active-first-tab" : ""
            }`}
          >
            <div className="tab-sec-music">
              <Tabs
                activeKey={activeKey}
                onSelect={(k) => {
                  if (k === "Practice") {
                    handlePracticeTabSelect();
                    return;
                  }
                  setActiveKey(k);
                }}
                id="uncontrolled-tab-example"
                className="mb-3"
              >
                <Tab eventKey="Lessons" title="Music Library">
                  <MusicLibraryTabs
                    onSelectSong={(url) => {
                      setSelectedSongUrl(url);
                    }}
                  />
                  <div className="search-box-sec">
                    <Form>
                      <div className="right-head d-flex align-items-center gap-2 flex-md-nowrap flex-wrap">
                        <div className="search-box w-100">
                          <Form.Group className="position-relative mb-0">
                            <Form.Label className="d-none">search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search here"
                            />
                            <Button
                              type="button"
                              className="btn btn-trans border-0 bg-transparent p-0 m-0 position-absolute"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M17.4995 17.5L13.8828 13.8833"
                                  stroke="#505050"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                                  stroke="#505050"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Button>
                          </Form.Group>
                        </div>
                      </div>
                    </Form>
                  </div>
                </Tab>
                <Tab eventKey="Practice" title="Practice">
                  <div className="w-100 py-4 text-center">
                    <p className="mb-3">Practice opens in a new tab.</p>
                    <Button
                      className="btn btn-primary"
                      onClick={handleOpenVisualizer}
                    >
                      Open Visualizer
                    </Button>
                  </div>
                </Tab>
                <Tab eventKey="Results" title="Results">
                  <Results />
                </Tab>
                <Tab eventKey="MyLibrary" title="My Library">
                  <MyLibrary />
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PracticeStudio;