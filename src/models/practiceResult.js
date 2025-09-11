// schemas/PracticeResult.js
import mongoose from 'mongoose';

// Piano Practice Results Schema
const pianoResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instrument: {
    type: String,
    default: 'piano',
    required: true
  },
  audioFileUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  analysisResults: {
    overall_rating: {
      feedback: String,
      suggestion: String
    },
    places_to_improve: {
      feedback: String,
      suggestion: String
    }
  },
  pianoAnalysis: {
    // FUNDAMENTAL TECHNIQUE
    scales_major_minor_pentatonic: {
      feedback: String,
      suggestion: String
    },
    chords_and_arpeggios: {
      feedback: String,
      suggestion: String
    },
    arpeggiated_patterns: {
      feedback: String,
      suggestion: String
    },
    hanon_czerny_exercises: {
      feedback: String,
      suggestion: String
    },
    octave_jumps: {
      feedback: String,
      suggestion: String
    },
    timing_metronome_practice: {
      feedback: String,
      suggestion: String
    },
    
    // EXPRESSION & ARTICULATION
    legato_staccato_dynamics: {
      feedback: String,
      suggestion: String
    },
    articulation_and_phrasing: {
      feedback: String,
      suggestion: String
    },
    right_hand_ornamentation: {
      feedback: String,
      suggestion: String
    },
    trills_and_fast_alternations: {
      feedback: String,
      suggestion: String
    },
    tempo_rubato_control: {
      feedback: String,
      suggestion: String
    },
    
    // MUSICAL APPLICATION
    melody_playing_riffs: {
      feedback: String,
      suggestion: String
    },
    genre_specific_riffs: {
      feedback: String,
      suggestion: String
    },
    chord_progressions: {
      feedback: String,
      suggestion: String
    },
    left_hand_accompaniment_styles: {
      feedback: String,
      suggestion: String
    },
    
    // ADVANCED MUSICIANSHIP
    sight_reading_with_known_midi: {
      feedback: String,
      suggestion: String
    },
    polyphonic_counterpoint: {
      feedback: String,
      suggestion: String
    },
    voice_leading: {
      feedback: String,
      suggestion: String
    },
    
    // ADDITIONAL PERFORMANCE VIEW
    dynamic_control: {
      feedback: String,
      suggestion: String
    },
    fluency_and_sync: {
      feedback: String,
      suggestion: String
    },
    understanding_of_the_style_matching_the_genre: {
      feedback: String,
      suggestion: String
    },
    qulaity_of_sound_basis_instrument_sound: {
      feedback: String,
      suggestion: String
    },
    note_accuracy: {
      feedback: String,
      suggestion: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Guitar Practice Results Schema
const guitarResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instrument: {
    type: String,
    default: 'guitar',
    required: true
  },
  audioFileUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  analysisResults: {
    overall_rating: {
      feedback: String,
      suggestion: String
    },
    places_to_improve: {
      feedback: String,
      suggestion: String
    }
  },
  guitarAnalysis: {
    // TECHNICAL FOUNDATION
    scales_major_minor_pentatonic: {
      feedback: String,
      suggestion: String
    },
    chords_and_arpeggios: {
      feedback: String,
      suggestion: String
    },
    strumming_patterns: {
      feedback: String,
      suggestion: String
    },
    chord_progressions: {
      feedback: String,
      suggestion: String
    },
    hammer_ons_pull_offs_slides_bends_combined: {
      feedback: String,
      suggestion: String
    },
    hammer_ons: {
      feedback: String,
      suggestion: String
    },
    pull_offs: {
      feedback: String,
      suggestion: String
    },
    
    // LEAD GUITAR TECHNIQUES
    slides: {
      feedback: String,
      suggestion: String
    },
    bends: {
      feedback: String,
      suggestion: String
    },
    pre_bends: {
      feedback: String,
      suggestion: String
    },
    vibrato_control: {
      feedback: String,
      suggestion: String
    },
    
    // MUSICAL EXPRESSION & PERFORMANCE
    melody_playing_riffs: {
      feedback: String,
      suggestion: String
    },
    improvisation_with_midi_backing: {
      feedback: String,
      suggestion: String
    },
    improvisation_freeform: {
      feedback: String,
      suggestion: String
    },
    genre_specific_riffs: {
      feedback: String,
      suggestion: String
    },
    articulation_and_phrasing: {
      feedback: String,
      suggestion: String
    },
    expressive_intent_musicality: {
      feedback: String,
      suggestion: String
    },
    
    // READING & INTERPRETATION SKILLS
    sight_reading_with_known_midi: {
      feedback: String,
      suggestion: String
    },
    sight_reading_unseen_piece: {
      feedback: String,
      suggestion: String
    },
    reading_notation_tabs: {
      feedback: String,
      suggestion: String
    },
    palm_muting: {
      feedback: String,
      suggestion: String
    },
    
    // ADVANCED TECHNIQUES
    sweep_picking: {
      feedback: String,
      suggestion: String
    },
    pinch_harmonics: {
      feedback: String,
      suggestion: String
    },
    natural_harmonics: {
      feedback: String,
      suggestion: String
    },
    
    // ADDITIONAL PERFORMANCE VIEW
    dynamic_control: {
      feedback: String,
      suggestion: String
    },
    fluency: {
      feedback: String,
      suggestion: String
    },
    genre: {
      feedback: String,
      suggestion: String
    },
    quality: {
      feedback: String,
      suggestion: String
    },
    note_accuracy: {
      feedback: String,
      suggestion: String
    },
    sound: {
      feedback: String,
      suggestion: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const PianoResult = mongoose.models.PianoResult || mongoose.model('PianoResult', pianoResultSchema);
const GuitarResult = mongoose.models.GuitarResult || mongoose.model('GuitarResult', guitarResultSchema);

export { PianoResult, GuitarResult };