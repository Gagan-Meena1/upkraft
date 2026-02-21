// pages/api/practice/save-results.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PianoResult, GuitarResult } from '@/models/practiceResult';
import { connect } from '@/dbConnection/dbConfic';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to add field only if it exists
const addIfExists = (target, source, fieldName) => {
  if (source && source[fieldName] !== undefined && source[fieldName] !== null) {
    target[fieldName] = source[fieldName];
  }
};

export async function POST(request) {
  try {
    // Connect to database
    await connect();

    // Get user ID from JWT token
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    const decodedToken = token ? jwt.decode(token) : null;
    const userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      instrument,
      analysisResults,
      cloudinaryPublicId,
      audioFileUrl,
      shouldSave = true
    } = body;

    // Validate required fields
    if (!instrument) {
      return NextResponse.json({ 
        error: 'Missing required field: instrument' 
      }, { status: 400 });
    }

    // If user doesn't want to save, delete the Cloudinary file
    if (!shouldSave) {
      if (cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(cloudinaryPublicId);
          return NextResponse.json({ 
            message: 'Practice session discarded and file deleted successfully' 
          });
        } catch (cloudinaryError) {
          console.error('Error deleting Cloudinary file:', cloudinaryError);
          return NextResponse.json({ 
            error: 'Failed to delete audio file' 
          }, { status: 500 });
        }
      }
      return NextResponse.json({ 
        message: 'Practice session discarded' 
      });
    }

    // Get current practice count for this user to generate title
    const Model = instrument.toLowerCase() === 'piano' ? PianoResult : GuitarResult;
    const existingCount = await Model.countDocuments({ userId });
    const practiceNumber = existingCount + 1;
    
    // Generate title
    const title = `Practice Session ${practiceNumber} - ${new Date().toLocaleDateString()}`;

    // Prepare the base data structure
    let practiceData = {
      userId,
      title,
      instrument: instrument.toLowerCase(),
    };

    // Add optional fields only if they exist
    if (audioFileUrl) practiceData.audioFileUrl = audioFileUrl;
    if (cloudinaryPublicId) practiceData.cloudinaryPublicId = cloudinaryPublicId;

    // Add analysisResults only if present
    if (analysisResults) {
      practiceData.analysisResults = {};
      addIfExists(practiceData.analysisResults, analysisResults, 'overall_rating');
      addIfExists(practiceData.analysisResults, analysisResults, 'places_to_improve');
    }

    // Add instrument-specific analysis only if analysisResults exists
    if (analysisResults) {
      if (instrument.toLowerCase() === 'piano') {
        practiceData.pianoAnalysis = {};
        
        // FUNDAMENTAL TECHNIQUE
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'scales_major_minor_pentatonic');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'chords_and_arpeggios');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'arpeggiated_patterns');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'hanon_czerny_exercises');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'octave_jumps');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'timing_metronome_practice');
        
        // EXPRESSION & ARTICULATION
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'legato_staccato_dynamics');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'articulation_and_phrasing');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'right_hand_ornamentation');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'trills_and_fast_alternations');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'tempo_rubato_control');
        
        // MUSICAL APPLICATION
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'melody_playing_riffs');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'genre_specific_riffs');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'chord_progressions');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'left_hand_accompaniment_styles');
        
        // ADVANCED MUSICIANSHIP
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'sight_reading_with_known_midi');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'polyphonic_counterpoint');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'voice_leading');
        
        // ADDITIONAL PERFORMANCE VIEW
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'dynamic_control');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'fluency_and_sync');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'understanding_of_the_style_matching_the_genre');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'qulaity_of_sound_basis_instrument_sound');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'note_accuracy');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'song_identification');
        addIfExists(practiceData.pianoAnalysis, analysisResults, 'timestamp_improvements');

        // Remove pianoAnalysis if empty
        if (Object.keys(practiceData.pianoAnalysis).length === 0) {
          delete practiceData.pianoAnalysis;
        }
        
      } else if (instrument.toLowerCase() === 'guitar') {
        practiceData.guitarAnalysis = {};
        
        // TECHNICAL FOUNDATION
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'scales_major_minor_pentatonic');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'chords_and_arpeggios');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'strumming_patterns');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'chord_progressions');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'hammer_ons_pull_offs_slides_bends_combined');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'hammer_ons');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'pull_offs');
        
        // LEAD GUITAR TECHNIQUES
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'slides');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'bends');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'pre_bends');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'vibrato_control');
        
        // MUSICAL EXPRESSION & PERFORMANCE
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'melody_playing_riffs');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'improvisation_with_midi_backing');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'improvisation_freeform');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'genre_specific_riffs');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'articulation_and_phrasing');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'expressive_intent_musicality');
        
        // READING & INTERPRETATION SKILLS
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'sight_reading_with_known_midi');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'sight_reading_unseen_piece');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'reading_notation_tabs');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'palm_muting');
        
        // ADVANCED TECHNIQUES
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'sweep_picking');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'pinch_harmonics');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'natural_harmonics');
        
        // ADDITIONAL PERFORMANCE VIEW
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'dynamic_control');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'fluency');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'genre');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'quality');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'note_accuracy');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'sound');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'song_identification');
        addIfExists(practiceData.guitarAnalysis, analysisResults, 'timestamp_improvements');

        // Remove guitarAnalysis if empty
        if (Object.keys(practiceData.guitarAnalysis).length === 0) {
          delete practiceData.guitarAnalysis;
        }
      }
    }

    // Remove analysisResults if empty
    if (practiceData.analysisResults && Object.keys(practiceData.analysisResults).length === 0) {
      delete practiceData.analysisResults;
    }

    // Save to database
    const savedResult = await Model.create(practiceData);

    return NextResponse.json({
      message: 'Practice results saved successfully',
      practiceId: savedResult._id,
      title: savedResult.title
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving practice results:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// API endpoint to delete unsaved practice audio
export async function DELETE(request) {
  try {
    await connect();
    const body = await request.json();
    const { cloudinaryPublicId } = body;

    if (!cloudinaryPublicId) {
      return NextResponse.json({ 
        error: 'Missing cloudinaryPublicId' 
      }, { status: 400 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(cloudinaryPublicId);

    return NextResponse.json({ 
      message: 'Audio file deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting audio file:', error);
    return NextResponse.json({ 
      error: 'Failed to delete audio file',
      details: error.message 
    }, { status: 500 });
  }
}

// ✅ NEW: PUT handler for updating existing results with AI analysis
export async function PUT(request) {
  try {
    await connect();

    // Get user ID from JWT token
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    const decodedToken = token ? jwt.decode(token) : null;
    const userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      resultId,
      instrument,
      analysisData
    } = body;

    // Validate required fields
    if (!resultId || !instrument || !analysisData) {
      return NextResponse.json({ 
        error: 'Missing required fields: resultId, instrument, or analysisData' 
      }, { status: 400 });
    }

    // Select the correct model
    const Model = instrument.toLowerCase() === 'piano' ? PianoResult : GuitarResult;

    // Prepare update data
    const updateData = {};

    // Add analysisResults
    updateData.analysisResults = {};
    addIfExists(updateData.analysisResults, analysisData, 'overall_rating');
    addIfExists(updateData.analysisResults, analysisData, 'places_to_improve');

    // Add instrument-specific analysis
    if (instrument.toLowerCase() === 'piano') {
      updateData.pianoAnalysis = {};
      
      // FUNDAMENTAL TECHNIQUE
      addIfExists(updateData.pianoAnalysis, analysisData, 'scales_major_minor_pentatonic');
      addIfExists(updateData.pianoAnalysis, analysisData, 'chords_and_arpeggios');
      addIfExists(updateData.pianoAnalysis, analysisData, 'arpeggiated_patterns');
      addIfExists(updateData.pianoAnalysis, analysisData, 'hanon_czerny_exercises');
      addIfExists(updateData.pianoAnalysis, analysisData, 'octave_jumps');
      addIfExists(updateData.pianoAnalysis, analysisData, 'timing_metronome_practice');
      
      // EXPRESSION & ARTICULATION
      addIfExists(updateData.pianoAnalysis, analysisData, 'legato_staccato_dynamics');
      addIfExists(updateData.pianoAnalysis, analysisData, 'articulation_and_phrasing');
      addIfExists(updateData.pianoAnalysis, analysisData, 'right_hand_ornamentation');
      addIfExists(updateData.pianoAnalysis, analysisData, 'trills_and_fast_alternations');
      addIfExists(updateData.pianoAnalysis, analysisData, 'tempo_rubato_control');
      
      // MUSICAL APPLICATION
      addIfExists(updateData.pianoAnalysis, analysisData, 'melody_playing_riffs');
      addIfExists(updateData.pianoAnalysis, analysisData, 'genre_specific_riffs');
      addIfExists(updateData.pianoAnalysis, analysisData, 'chord_progressions');
      addIfExists(updateData.pianoAnalysis, analysisData, 'left_hand_accompaniment_styles');
      
      // ADVANCED MUSICIANSHIP
      addIfExists(updateData.pianoAnalysis, analysisData, 'sight_reading_with_known_midi');
      addIfExists(updateData.pianoAnalysis, analysisData, 'polyphonic_counterpoint');
      addIfExists(updateData.pianoAnalysis, analysisData, 'voice_leading');
      
      // ADDITIONAL PERFORMANCE VIEW
      addIfExists(updateData.pianoAnalysis, analysisData, 'dynamic_control');
      addIfExists(updateData.pianoAnalysis, analysisData, 'fluency_and_sync');
      addIfExists(updateData.pianoAnalysis, analysisData, 'understanding_of_the_style_matching_the_genre');
      addIfExists(updateData.pianoAnalysis, analysisData, 'qulaity_of_sound_basis_instrument_sound');
      addIfExists(updateData.pianoAnalysis, analysisData, 'note_accuracy');
      // addIfExists(updateData.pianoAnalysis, analysisData, 'song_identification');
      addIfExists(updateData.pianoAnalysis, analysisData, 'timestamp_improvements');

    } else if (instrument.toLowerCase() === 'guitar') {
      updateData.guitarAnalysis = {};
      
      // TECHNICAL FOUNDATION
      addIfExists(updateData.guitarAnalysis, analysisData, 'scales_major_minor_pentatonic');
      addIfExists(updateData.guitarAnalysis, analysisData, 'chords_and_arpeggios');
      addIfExists(updateData.guitarAnalysis, analysisData, 'strumming_patterns');
      addIfExists(updateData.guitarAnalysis, analysisData, 'chord_progressions');
      addIfExists(updateData.guitarAnalysis, analysisData, 'hammer_ons_pull_offs_slides_bends');
      addIfExists(updateData.guitarAnalysis, analysisData, 'hammer_ons');
      addIfExists(updateData.guitarAnalysis, analysisData, 'pull_offs');
      
      // LEAD GUITAR TECHNIQUES
      addIfExists(updateData.guitarAnalysis, analysisData, 'slides');
      addIfExists(updateData.guitarAnalysis, analysisData, 'bends');
      addIfExists(updateData.guitarAnalysis, analysisData, 'pre_bends');
      addIfExists(updateData.guitarAnalysis, analysisData, 'vibrato_control');
      
      // MUSICAL EXPRESSION & PERFORMANCE
      addIfExists(updateData.guitarAnalysis, analysisData, 'melody_playing_riffs');
      addIfExists(updateData.guitarAnalysis, analysisData, 'improvisation_with_midi_backing');
      addIfExists(updateData.guitarAnalysis, analysisData, 'improvisation_freeform');
      addIfExists(updateData.guitarAnalysis, analysisData, 'genre_specific_riffs');
      addIfExists(updateData.guitarAnalysis, analysisData, 'articulation_and_phrasing');
      addIfExists(updateData.guitarAnalysis, analysisData, 'expressive_intent_musicality');
      
      // READING & INTERPRETATION SKILLS
      addIfExists(updateData.guitarAnalysis, analysisData, 'sight_reading_with_known_midi');
      addIfExists(updateData.guitarAnalysis, analysisData, 'sight_reading_unseen_piece');
      addIfExists(updateData.guitarAnalysis, analysisData, 'reading_notation_tabs');
      addIfExists(updateData.guitarAnalysis, analysisData, 'palm_muting');
      
      // ADVANCED TECHNIQUES
      addIfExists(updateData.guitarAnalysis, analysisData, 'sweep_picking');
      addIfExists(updateData.guitarAnalysis, analysisData, 'pinch_harmonics');
      addIfExists(updateData.guitarAnalysis, analysisData, 'natural_harmonics');
      
      // ADDITIONAL PERFORMANCE VIEW
      addIfExists(updateData.guitarAnalysis, analysisData, 'dynamic_control');
      addIfExists(updateData.guitarAnalysis, analysisData, 'fluency_and_sync');
      addIfExists(updateData.guitarAnalysis, analysisData, 'understanding_of_the_style_matching_the_genre');
      addIfExists(updateData.guitarAnalysis, analysisData, 'qulaity_of_sound_basis_instrument_sound');
      addIfExists(updateData.guitarAnalysis, analysisData, 'note_accuracy');
      // addIfExists(updateData.guitarAnalysis, analysisData, 'song_identification');
      addIfExists(updateData.guitarAnalysis, analysisData, 'timestamp_improvements');
    }

    // Update the document
    const updatedResult = await Model.findOneAndUpdate(
      { _id: resultId, userId }, // Ensure the result belongs to the user
      updateData,
      { new: true, runValidators: false } // Don't validate required fields on update
    );

    if (!updatedResult) {
      return NextResponse.json({ 
        error: 'Result not found or unauthorized' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'AI analysis updated successfully',
      practiceId: updatedResult._id,
      title: updatedResult.title
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating AI analysis:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}