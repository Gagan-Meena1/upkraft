"use client"
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Inline API utilities - no external dependency needed
const getApiBaseUrl = () => {
  // Check both Next.js and React environment variable patterns
  return process.env.NEXT_PUBLIC_API_BASE_URL || 
         process.env.REACT_APP_API_BASE_URL || 
         "";
};

const apiUrl = (path) => {
  const base = (getApiBaseUrl() || "").replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};

/** @typedef {import('@/types/tutor/studio').StudioRatingsResponse} StudioRatingsResponse */

const GUITAR_GROUPS = {
  "TECHNICAL FOUNDATION": [
    "scales_major_minor_pentatonic",
    "chords_and_arpeggios",
    "strumming_patterns",
    "chord_progressions",
  ],
  "LEAD GUITAR TECHNIQUES": [
    "hammer_ons_pull_offs_slides_bends",
    "hammer_ons",
    "pull_offs",
    "slides",
    "bends",
    "pre_bends",
    "vibrato_control",
  ],
  "MUSICAL EXPRESSION & PERFORMANCE": [
    "melody_playing_riffs",
    "improvisation_with_midi_backing",
    "improvisation_freeform",
    "genre_specific_riffs",
    "articulation_and_phrasing",
    "expressive_intent_musicality",
  ],
  "READING & INTERPRETATION SKILLS": [
    "sight_reading_with_known_midi",
    "sight_reading_unseen_piece",
    "reading_notation_tabs",
  ],
  "ADVANCED TECHNIQUES": [
    "palm_muting",
    "sweep_picking",
    "pinch_harmonics",
    "natural_harmonics",
  ],
  "ADDITIONAL PERFORMANCE VIEW": [
    "dynamic_control",
    "fluency_and_sync",
    "understanding_of_the_style_matching_the_genre",
    "note_accuracy",
    "qulaity_of_sound_basis_instrument_sound",
  ],
};

// Piano grouping aligned with studio.d.ts keys and provided spec
const PIANO_GROUPS = {
  "FUNDAMENTAL TECHNIQUE": [
    "scales_major_minor_pentatonic",
    "chords_and_arpeggios",
    "arpeggiated_patterns",
    "hanon_czerny_exercises",
    "octave_jumps",
    "timing_metronome_practice",
  ],
  "EXPRESSION & ARTICULATION": [
    "legato_staccato_dynamics",
    "articulation_and_phrasing",
    "right_hand_ornamentation",
    "trills_and_fast_alternations",
    "tempo_rubato_control",
  ],
  "MUSICAL APPLICATION": [
    "melody_playing_riffs",
    "genre_specific_riffs",
    "chord_progressions",
    "left_hand_accompaniment_styles",
    "sight_reading_with_known_midi",
  ],
  "ADVANCED MUSICIANSHIP": ["polyphonic_counterpoint", "voice_leading"],
  "ADDITIONAL PERFORMANCE VIEW": [
    "dynamic_control",
    "fluency_and_sync",
    "understanding_of_the_style_matching_the_genre",
    "note_accuracy",
    "qulaity_of_sound_basis_instrument_sound",
  ],
};

const getGroups = (instrument) => {
  return instrument === "piano" ? PIANO_GROUPS : GUITAR_GROUPS;
};

const LABELS = {
  scales_major_minor_pentatonic: "Scales (Major/Minor/Pentatonic)",
  chords_and_arpeggios: "Chords & Arpeggios",
  strumming_patterns: "Strumming Patterns",
  chord_progressions: "Chord Progressions",
  hammer_ons_pull_offs_slides_bends:
    "Hammer‑ons, Pull‑offs, Slides, Bends (Combined)",
  hammer_ons: "Hammer‑ons",
  pull_offs: "Pull‑offs",
  slides: "Slides",
  bends: "Bends",
  pre_bends: "Pre‑bends",
  vibrato_control: "Vibrato Control",
  melody_playing_riffs: "Melody Playing / Riffs",
  improvisation_with_midi_backing: "Improvisation with MIDI Backing",
  improvisation_freeform: "Improvisation (Freeform)",
  genre_specific_riffs: "Genre‑Specific Riffs",
  articulation_and_phrasing: "Articulation & Phrasing",
  expressive_intent_musicality: "Expressive Intent / Musicality",
  sight_reading_with_known_midi: "Sight Reading (with known MIDI)",
  sight_reading_unseen_piece: "Sight Reading (unseen piece)",
  reading_notation_tabs: "Reading Notation / Tabs",
  palm_muting: "Palm Muting",
  sweep_picking: "Sweep Picking",
  pinch_harmonics: "Pinch Harmonics",
  natural_harmonics: "Natural Harmonics",
  dynamic_control: "Dynamic Control",
  fluency_and_sync: "Fluency",
  understanding_of_the_style_matching_the_genre: "Genre / Style Match",
  note_accuracy: "Note Accuracy",
  qulaity_of_sound_basis_instrument_sound: "Sound Quality",
  overall_rating: "Overall Rating",
  places_to_improve: "Places to Improve",
  // Piano-specific labels
  legato_staccato_dynamics: "Legato / Staccato / Dynamics",
  timing_metronome_practice: "Timing & Metronome Practice",
  polyphonic_counterpoint: "Polyphonic Counterpoint",
  arpeggiated_patterns: "Arpeggiated Patterns",
  hanon_czerny_exercises: "Hanon / Czerny Exercises",
  octave_jumps: "Octave Jumps",
  voice_leading: "Voice Leading",
  left_hand_accompaniment_styles: "Left‑hand Accompaniment Styles",
  right_hand_ornamentation: "Right‑hand Ornamentation",
  trills_and_fast_alternations: "Trills & Fast Alternations",
  tempo_rubato_control: "Tempo / Rubato Control",
};

const Results = () => {
  const [data, setData] = useState(
    /** @type {StudioRatingsResponse|null} */ (null)
  );
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render helper: support **bold** inside suggestion strings
  const renderSuggestion = (text) => {
    if (!text) return null;
    try {
      const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
      return parts.map((p, i) => {
        if (/^\*\*[^*]+\*\*$/.test(p)) {
          const inner = p.slice(2, -2);
          return <strong key={i}>{inner}</strong>;
        }
        // Preserve line breaks
        return p
          .split(/(\n)/)
          .map((seg, j) =>
            seg === "\n" ? (
              <br key={i + "-" + j} />
            ) : (
              <span key={i + "-" + j}>{seg}</span>
            )
          );
      });
    } catch (_) {
      return text;
    }
  };

  // Helper: hydrate from sessionStorage
  const loadData = () => {
    if (!mounted) return;
    try {
      const raw = sessionStorage.getItem("practiceAnalysisResults");
      if (raw) setData(JSON.parse(raw));
    } catch (_) {}
  };

  // Initial load
  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted]);

  // Refresh when storage changes (e.g., iframe writes results)
  useEffect(() => {
    if (!mounted) return;

    const onStorage = (e) => {
      if (e.key === "practiceAnalysisResults") loadData();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  // Refresh when iframe signals results are ready or when window focuses/visibility changes
  useEffect(() => {
    if (!mounted) return;

    const onMessage = (e) => {
      try {
        if (e?.data?.type === "upkraft:showResults") loadData();
      } catch (_) {}
    };
    const onFocus = () => loadData();
    const onVis = () => {
      if (!document.hidden) loadData();
    };
    
    window.addEventListener("message", onMessage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mounted]);

  const groups = useMemo(() => getGroups(data?.instrument), [data?.instrument]);

  const grouped = useMemo(() => {
    if (!data?.ratings) return {};
    const out = {};
    for (const [group, keys] of Object.entries(groups)) {
      out[group] = keys
        .filter((k) => data.ratings[k])
        .map((k) => ({ key: k, ...data.ratings[k] }));
    }
    return out;
  }, [data, groups]);

  const overall = data?.ratings?.overall_rating;
  const improvements = data?.ratings?.places_to_improve;

  const Toggle = ({ id, title }) => (
    <button
      type="button"
      className="btn btn-border btn-sm"
      onClick={() => setOpen((p) => ({ ...p, [id]: !p[id] }))}
    >
      {open[id] ? "Hide" : "Show"}
    </button>
  );

  const handleSave = async () => {
    if (!data || !mounted) return;

    try {
      setLoading(true);
      const res = await axios.post(
        apiUrl("Api/practiceStudio"),
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Practice results stored successfully");
      // Clear session storage after successful save
      try {
        sessionStorage.removeItem("practiceAnalysisResults");
        sessionStorage.removeItem("guitarAnalysisResults");
      } catch (_) {}
      setSaved(true); // Disable save button after success
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="results-sec">
        <div className="top-heading-box text-center">
          <h2 className="m-0">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="results-sec">
      <div className="top-heading-box text-center">
        <div className="mb-3 w-100 mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="m-0">Session Complete!</h2>
          <p className="m-0 text-muted">
            {data
              ? "AI feedback summary for your last recording"
              : "No recent analysis found"}
          </p>
        </div>
        {overall && (
          <div
            className="d-flex flex-column justify-content-center text-center p-3 rounded mx-auto"
            style={{ background: "rgba(110,9,189,0.06)", maxWidth: 900 }}
          >
            <h3 className="m-0" style={{ color: "#6E09BD" }}>
              {LABELS.overall_rating}
            </h3>
            <div className="small text-muted mt-1">{overall.feedback}</div>
            <div className="mt-2">{renderSuggestion(overall.suggestion)}</div>
          </div>
        )}

        {improvements && (
          <div
            className="d-flex flex-column justify-content-center text-center p-3 rounded mx-auto mt-3"
            style={{ background: "rgba(74,163,255,0.08)", maxWidth: 900 }}
          >
            <h3 className="m-0" style={{ color: "#4aa3ff" }}>
              {LABELS.places_to_improve}
            </h3>
            <div className="small text-muted mt-1">{improvements.feedback}</div>
            <div className="mt-2">
              {renderSuggestion(improvements.suggestion)}
            </div>
          </div>
        )}
      </div>

      <div className="results-table-sec mt-4">
        {Object.keys(groups).map((group) => (
          <div key={group} className="card-box mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <h4 className="m-0">{group}</h4>
              <Toggle id={group} title={group} />
            </div>
            <div className={`mt-3 ${open[group] ? "" : "d-none"}`}>
              <div className="table-responsive">
                <table className="table align-middle m-0">
                  <thead>
                    <tr>
                      <th style={{ width: "28%" }}>Aspect</th>
                      <th style={{ width: "22%" }}>Feedback</th>
                      <th>Suggestions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!grouped[group] || grouped[group].length === 0) && (
                      <tr>
                        <td colSpan={3} className="text-muted py-3">
                          No items
                        </td>
                      </tr>
                    )}
                    {grouped[group] &&
                      grouped[group].map((r) => (
                        <tr key={r.key}>
                          <td>{LABELS[r.key] || r.key}</td>
                          <td>{r.feedback}</td>
                          <td>{renderSuggestion(r.suggestion)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ul className="p-0 m-0 mt-md-4 mt-3 d-flex align-items-center gap-2 justify-content-end list-unstyled">
        <li>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading || saved}
          >
            {loading ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-border"
            onClick={handleBack}
          >
            Back
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Results;