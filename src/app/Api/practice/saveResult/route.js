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

export async function POST(request) {
  try {
    // Connect to database
    await connect();

    // Get user ID from JWT token
    const token = request.cookies.get("token")?.value;
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
    if (!instrument || !analysisResults ) {
      return NextResponse.json({ 
        error: 'Missing required fields: instrument, analysisResults, cloudinaryPublicId, audioFileUrl' 
      }, { status: 400 });
    }

    // If user doesn't want to save, delete the Cloudinary file
    if (!shouldSave) {
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

    // Get current practice count for this user to generate title
    const Model = instrument.toLowerCase() === 'piano' ? PianoResult : GuitarResult;
    const existingCount = await Model.countDocuments({ userId });
    const practiceNumber = existingCount + 1;
    
    // Generate title
    const title = `Practice Session ${practiceNumber} - ${new Date().toLocaleDateString()}`;

    // Prepare the data structure based on instrument
    let practiceData = {
      userId,
      title,
      instrument: instrument.toLowerCase(),
      audioFileUrl,
      cloudinaryPublicId,
      analysisResults: {
        overall_rating: analysisResults.overall_rating,
        places_to_improve: analysisResults.places_to_improve
      }
    };

    // Add instrument-specific analysis
    if (instrument.toLowerCase() === 'piano') {
      practiceData.pianoAnalysis = {
        // FUNDAMENTAL TECHNIQUE
        scales_major_minor_pentatonic: analysisResults.scales_major_minor_pentatonic,
        chords_and_arpeggios: analysisResults.chords_and_arpeggios,
        arpeggiated_patterns: analysisResults.arpeggiated_patterns,
        hanon_czerny_exercises: analysisResults.hanon_czerny_exercises,
        octave_jumps: analysisResults.octave_jumps,
        timing_metronome_practice: analysisResults.timing_metronome_practice,
        
        // EXPRESSION & ARTICULATION
        legato_staccato_dynamics: analysisResults.legato_staccato_dynamics,
        articulation_and_phrasing: analysisResults.articulation_and_phrasing,
        right_hand_ornamentation: analysisResults.right_hand_ornamentation,
        trills_and_fast_alternations: analysisResults.trills_and_fast_alternations,
        tempo_rubato_control: analysisResults.tempo_rubato_control,
        
        // MUSICAL APPLICATION
        melody_playing_riffs: analysisResults.melody_playing_riffs,
        genre_specific_riffs: analysisResults.genre_specific_riffs,
        chord_progressions: analysisResults.chord_progressions,
        left_hand_accompaniment_styles: analysisResults.left_hand_accompaniment_styles,
        
        // ADVANCED MUSICIANSHIP
        sight_reading_with_known_midi: analysisResults.sight_reading_with_known_midi,
        polyphonic_counterpoint: analysisResults.polyphonic_counterpoint,
        voice_leading: analysisResults.voice_leading,
        
        // ADDITIONAL PERFORMANCE VIEW
        dynamic_control: analysisResults.dynamic_control,
        fluency_and_sync: analysisResults.fluency_and_sync,
        understanding_of_the_style_matching_the_genre: analysisResults.understanding_of_the_style_matching_the_genre,
        qulaity_of_sound_basis_instrument_sound: analysisResults.qulaity_of_sound_basis_instrument_sound,
        note_accuracy: analysisResults.note_accuracy
      };
    } else if (instrument.toLowerCase() === 'guitar') {
      practiceData.guitarAnalysis = {
        // TECHNICAL FOUNDATION
        scales_major_minor_pentatonic: analysisResults.scales_major_minor_pentatonic,
        chords_and_arpeggios: analysisResults.chords_and_arpeggios,
        strumming_patterns: analysisResults.strumming_patterns,
        chord_progressions: analysisResults.chord_progressions,
        hammer_ons_pull_offs_slides_bends_combined: analysisResults.hammer_ons_pull_offs_slides_bends_combined,
        hammer_ons: analysisResults.hammer_ons,
        pull_offs: analysisResults.pull_offs,
        
        // LEAD GUITAR TECHNIQUES
        slides: analysisResults.slides,
        bends: analysisResults.bends,
        pre_bends: analysisResults.pre_bends,
        vibrato_control: analysisResults.vibrato_control,
        
        // MUSICAL EXPRESSION & PERFORMANCE
        melody_playing_riffs: analysisResults.melody_playing_riffs,
        improvisation_with_midi_backing: analysisResults.improvisation_with_midi_backing,
        improvisation_freeform: analysisResults.improvisation_freeform,
        genre_specific_riffs: analysisResults.genre_specific_riffs,
        articulation_and_phrasing: analysisResults.articulation_and_phrasing,
        expressive_intent_musicality: analysisResults.expressive_intent_musicality,
        
        // READING & INTERPRETATION SKILLS
        sight_reading_with_known_midi: analysisResults.sight_reading_with_known_midi,
        sight_reading_unseen_piece: analysisResults.sight_reading_unseen_piece,
        reading_notation_tabs: analysisResults.reading_notation_tabs,
        palm_muting: analysisResults.palm_muting,
        
        // ADVANCED TECHNIQUES
        sweep_picking: analysisResults.sweep_picking,
        pinch_harmonics: analysisResults.pinch_harmonics,
        natural_harmonics: analysisResults.natural_harmonics,
        
        // ADDITIONAL PERFORMANCE VIEW
        dynamic_control: analysisResults.dynamic_control,
        fluency: analysisResults.fluency,
        genre: analysisResults.genre,
        quality: analysisResults.quality,
        note_accuracy: analysisResults.note_accuracy,
        sound: analysisResults.sound
      };
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