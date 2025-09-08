// src/app/api/bulkUpdate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Song } from '@/models/Songs';
import { connect } from '@/dbConnection/dbConfic';

// Spreadsheet data
// Spreadsheet data
const spreadsheetData = [
  {
    song: "As it Was",
    artist: "Harry Styles",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Back in Black (Ver 3)",
    artist: "AC/DC",
    primaryInstrumentFocus: "Guitar",
    genre: "Hard Rock",
    difficulty: "Intermediate",
    year: 1980,
    notes: "Riffs, palm muting, timing",
    skills: "Chord Melody, Slides, Pull-offs"
  },
  {
    song: "Bad Habit",
    artist: "Steve Lacy",
    primaryInstrumentFocus: "",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Bad Liar",
    artist: "Imagine Dragons",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop/Rock",
    difficulty: "Beginner–Intermediate",
    year: 2018,
    notes: "Easy chord set; dynamic build.",
    skills: "Open chords, crescendo control, palm mutes"
  },
  {
    song: "Be Alright",
    artist: "Dean Lewis",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Easy",
    year: 2018,
    notes: "Beginner friendly",
    skills: "open chords"
  },
  {
    song: "Be Yourself",
    artist: "Audioslave",
    primaryInstrumentFocus: "Guitar/vocal → Piano (arr.)",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 2005,
    notes: "Simple progression; strong hook; easy to arrange solo",
    skills: "Block→broken chords, chorus lift, pedal control"
  },
  {
    song: "Beautiful People",
    artist: "Ed Sheeran feat. Khalid",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner–Intermediate",
    year: 2019,
    notes: "Beginner pop progression; singable.",
    skills: "Open chords, strumming patterns, groove"
  },
  {
    song: "Before You Go",
    artist: "Lewis Capaldi",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Easy",
    year: 2019,
    notes: "Power chorus",
    skills: "strumming control"
  },
  {
    song: "Believer",
    artist: "Imagine Dragons",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Alternative Rock",
    difficulty: "Intermediate",
    year: 2017,
    notes: "Strong accents",
    skills: "power chords, palm muting"
  },
  {
    song: "Between Angels and Insects",
    artist: "Papa Roach",
    primaryInstrumentFocus: "Guitar",
    genre: "Nu Metal",
    difficulty: "Intermediate",
    year: 2001,
    notes: "Groove-centric; repetitive patterns",
    skills: "RH riff accuracy, LH pulse, accent placement"
  },
  {
    song: "Black Bird",
    artist: "The Beatles",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Black Smoke Rising",
    artist: "Greta Van Fleet",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Hard Rock",
    difficulty: "Advanced",
    year: 2017,
    notes: "Riff-based",
    skills: "bends, vibrato"
  },
  {
    song: "Blinding Lights",
    artist: "The Weeknd",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Synth-pop",
    difficulty: "Beginner",
    year: 2019,
    notes: "Driving 4/4",
    skills: "eighth-note strum, steady tempo"
  },
  {
    song: "Boulevard of Broken Dreams (Ver 1)",
    artist: "Green Day",
    primaryInstrumentFocus: "Guitar",
    genre: "Punk Rock",
    difficulty: "Beginner",
    year: 2004,
    notes: "Power chords, strumming",
    skills: "Hammer-ons, Alternate Picking, Open Chords"
  },
  {
    song: "Break My Heart",
    artist: "Dua Lipa",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop‑Rock",
    difficulty: "Intermediate",
    year: 2020,
    notes: "INXS‑inspired guitar groove.",
    skills: "Funk strumming, chord stabs, syncopation"
  },
  {
    song: "Budapest",
    artist: "George Ezra",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2018,
    notes: "Beginner version",
    skills: "open chords"
  },
  {
    song: "Californication (Ver 1)",
    artist: "Red Hot Chili Peppers",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 1999,
    notes: "Hammer-ons, clean tone",
    skills: "Chord Melody, Palm Muting, Open Chords"
  },
  {
    song: "Californication (Ver 3)",
    artist: "Red Hot Chili Peppers",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 1999,
    notes: "Hammer-ons, clean tone",
    skills: "Pull-offs, Travis Picking, Fingerpicking"
  },
  {
    song: "Cant Feel My Face",
    artist: "The Weeknd",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop",
    difficulty: "Intermediate",
    year: 2015,
    notes: "Funky feel",
    skills: "syncopated strum, 7th chords"
  },
  {
    song: "Chemical",
    artist: "Post Malone",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop",
    difficulty: "Easy",
    year: 2023,
    notes: "Upbeat",
    skills: "power chords, rhythm"
  },
  {
    song: "Cocaine",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Guitar riff → Piano (arr.)",
    genre: "Rock/Blues",
    difficulty: "Intermediate",
    year: 1977,
    notes: "Driving mid-tempo groove; simple riff adapts to LH ostinato",
    skills: "LH ostinato, syncopation, riff articulation"
  },
  {
    song: "Come As You Are (Ver 1)",
    artist: "Nirvana",
    primaryInstrumentFocus: "Guitar",
    genre: "Grunge",
    difficulty: "Beginner",
    year: 1991,
    notes: "Simple riff with chorus",
    skills: "Strumming Patterns, Fingerpicking, Alternate Picking"
  },
  {
    song: "Comfortably Numb (Ver 1)",
    artist: "Pink Floyd",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Advanced",
    year: 1979,
    notes: "Lead phrasing, bends, tone",
    skills: "Open Chords, Barre Chords, Power Chords"
  },
  {
    song: "Deja Vu",
    artist: "Olivia Rodrigo",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Easy",
    year: 2021,
    notes: "Mid-tempo",
    skills: "open chords"
  },
  {
    song: "Enter Sandman (Ver 1)",
    artist: "Metallica",
    primaryInstrumentFocus: "Guitar",
    genre: "Metal",
    difficulty: "Intermediate",
    year: 1991,
    notes: "Riff discipline, palm muting",
    skills: "Power Chords, Open Chords, Hammer-ons"
  },
  {
    song: "Enter Sandman (Ver 3)",
    artist: "Metallica",
    primaryInstrumentFocus: "Guitar",
    genre: "Metal",
    difficulty: "Intermediate",
    year: 1991,
    notes: "Riff discipline, palm muting",
    skills: "Palm Muting, Slides, Open Chords"
  },
  {
    song: "Every Breath You Take (Ver 3)",
    artist: "The Police",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1983,
    notes: "Add9 shapes, right-hand control",
    skills: "Strumming Patterns, Power Chords, Capo Use"
  },
  {
    song: "Everybody Hurts (Ver 1)",
    artist: "R.E.M.",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Beginner",
    year: 1992,
    notes: "Arpeggios; 6/8 feel",
    skills: "Slides, Chord Melody, Palm Muting"
  },
  {
    song: "Everybody Hurts (Ver 2)",
    artist: "R.E.M.",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Beginner",
    year: 1992,
    notes: "Arpeggios; 6/8 feel",
    skills: "Capo Use, Palm Muting, Fingerpicking"
  },
  {
    song: "Fancy Like",
    artist: "Walker Hayes",
    primaryInstrumentFocus: "Guitar",
    genre: "Country‑Pop",
    difficulty: "Beginner–Intermediate",
    year: 2021,
    notes: "Country strum fun; easy chords.",
    skills: "Boom‑chick strum, open chords, groove"
  },
  {
    song: "Fast Car",
    artist: "Luke Combs (Tracy Chapman cover)",
    primaryInstrumentFocus: "Guitar",
    genre: "Country/Folk",
    difficulty: "Beginner–Intermediate",
    year: 2023,
    notes: "Modern cover of a guitar classic.",
    skills: "Travis‑style picking, chord changes, dynamics"
  },
  {
    song: "For Whom The Bell Tolls",
    artist: "Metallica",
    primaryInstrumentFocus: "Guitar",
    genre: "Heavy Metal",
    difficulty: "Intermediate",
    year: 1984,
    notes: "Iconic ostinato riff adapts to LH",
    skills: "LH ostinato, staccato precision, power-interval voicing"
  },
  {
    song: "Game of Thrones- Main Theme",
    artist: "Game of Thrones",
    primaryInstrumentFocus: "Guitar",
    genre: "TV/Score",
    difficulty: "Intermediate",
    year: 2011,
    notes: "Ostinato patterns with bold melody",
    skills: "LH ostinato, octave melody, marcato articulation"
  },
  {
    song: "Good Riddance (Time of Your Life) (Ver 1)",
    artist: "Green Day",
    primaryInstrumentFocus: "Guitar",
    genre: "Punk/Folk",
    difficulty: "Beginner",
    year: 1997,
    notes: "Basic strum, capo",
    skills: "Strumming Patterns, Open Chords, Capo Use"
  },
  {
    song: "Gravity (Ver 3)",
    artist: "John Mayer",
    primaryInstrumentFocus: "Guitar",
    genre: "Blues",
    difficulty: "Intermediate",
    year: 2006,
    notes: "Bends, vibrato, feel",
    skills: "Slides, Chord Melody, Travis Picking"
  },
  {
    song: "Grenade",
    artist: "Bruno Mars",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop Ballad",
    difficulty: "Beginner",
    year: 2010,
    notes: "Piano-led ballad; steady broken-chord patterns work well for learners",
    skills: "Broken-chord LH, pedaling, dynamic phrasing"
  },
  {
    song: "Hallelujah (Buckley version) (Ver 1)",
    artist: "Jeff Buckley",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Rock",
    difficulty: "Intermediate",
    year: 1994,
    notes: "Fingerpicking, dynamics",
    skills: "Power Chords, Strumming Patterns, Alternate Picking"
  },
  {
    song: "Hallelujah (Ver 3)",
    artist: "Leonard Cohen",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk",
    difficulty: "Beginner",
    year: 1984,
    notes: "I-vi-IV-V, fingerpicking option",
    skills: "Palm Muting, Bends, Hammer-ons"
  },
  {
    song: "Happier",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2017,
    notes: "Ballad feel",
    skills: "open chords, arpeggio picking"
  },
  {
    song: "Heat Waves",
    artist: "Glass Animals",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Pop",
    difficulty: "Beginner–Intermediate",
    year: 2020,
    notes: "Laid‑back groove; easy shapes.",
    skills: "Muted strums, chord timing, groove"
  },
  {
    song: "Heather",
    artist: "Conan Gray",
    primaryInstrumentFocus: "Piano + Voice (arr.)",
    genre: "Indie Pop",
    difficulty: "Beginner–Intermediate",
    year: 2020,
    notes: "Viral ballad; sparse texture suits solo piano",
    skills: "Soft dynamics, melody voicing, rubato timing"
  },
  {
    song: "Hello – Adele",
    artist: "Adele",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2015,
    notes: "Em, G, D, C",
    skills: "Open chords, emotional strumming"
  },
  {
    song: "Hey Hey",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Acoustic blues guitar → Piano (arr.)",
    genre: "Blues",
    difficulty: "Intermediate",
    year: 1992,
    notes: "",
    skills: "12-bar form, shuffle feel, turnaround licks"
  },
  {
    song: "Hey There Delilah (Ver 1)",
    artist: "Plain White T's",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2006,
    notes: "Arpeggios; steady tempo",
    skills: "Palm Muting, Fingerpicking, Hammer-ons"
  },
  {
    song: "Hey, Soul Sister (Ver 3)",
    artist: "Train",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2009,
    notes: "Uke-style strum translated",
    skills: "Power Chords, Alternate Picking, Capo Use"
  },
  {
    song: "High and Dry (Ver 1)",
    artist: "Radiohead",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 1995,
    notes: "Syncopated strum, voicings",
    skills: "Alternate Picking, Palm Muting, Slides"
  },
  {
    song: "Highway to Hell (Ver 1)",
    artist: "AC/DC",
    primaryInstrumentFocus: "Guitar",
    genre: "Hard Rock",
    difficulty: "Intermediate",
    year: 1979,
    notes: "Power chords, groove",
    skills: "Strumming Patterns, Capo Use, Pull-offs"
  },
  {
    song: "Highway to Hell (Ver 3)",
    artist: "AC/DC",
    primaryInstrumentFocus: "Guitar",
    genre: "Hard Rock",
    difficulty: "Intermediate",
    year: 1979,
    notes: "Power chords, groove",
    skills: "Pull-offs, Hammer-ons, Slides"
  },
  {
    song: "Ho Hey (Ver 3)",
    artist: "The Lumineers",
    primaryInstrumentFocus: "Guitar",
    genre: "Indie Folk",
    difficulty: "Beginner",
    year: 2012,
    notes: "Backbeat claps, open chords",
    skills: "Barre Chords, Travis Picking, Fingerpicking"
  },
  {
    song: "Hotel California (Ver 1)",
    artist: "Eagles",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1976,
    notes: "Arpeggios, barre chords, solos",
    skills: "Strumming Patterns, Pull-offs, Travis Picking"
  },
  {
    song: "Hotel California (Ver 3)",
    artist: "Eagles",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1976,
    notes: "Arpeggios, barre chords, solos",
    skills: "Hammer-ons, Chord Melody, Power Chords"
  },
  {
    song: "House of the Rising Sun (Ver 7)",
    artist: "The Animals",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Rock",
    difficulty: "Beginner",
    year: 1964,
    notes: "Arpeggios, 6/8 feel",
    skills: "Hammer-ons, Palm Muting, Alternate Picking"
  },
  {
    song: "Hurt (Ver 1)",
    artist: "Johnny Cash",
    primaryInstrumentFocus: "Guitar",
    genre: "Country/Folk",
    difficulty: "Beginner",
    year: 2002,
    notes: "Simple picking, dynamics",
    skills: "Alternate Picking, Palm Muting, Power Chords"
  },
  {
    song: "Hurt (Ver 3)",
    artist: "Johnny Cash",
    primaryInstrumentFocus: "Guitar",
    genre: "Country/Folk",
    difficulty: "Beginner",
    year: 2002,
    notes: "Simple picking, dynamics",
    skills: "Palm Muting, Open Chords, Alternate Picking"
  },
  {
    song: "Hysteria",
    artist: "Def Leppard",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop/Hard Rock",
    difficulty: "Intermediate",
    year: 1987,
    notes: "Lyrical hook with steady groove",
    skills: "Chord inversions, groove consistency, melody balance"
  },
  {
    song: "I Ain't Worried",
    artist: "OneRepublic",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner–Intermediate",
    year: 2022,
    notes: "Upbeat acoustic strum; easy chords.",
    skills: "Open chords, percussive strum, timing"
  },
  {
    song: "I M Yours",
    artist: "Jason Mraz",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "I M Yours (Ver 1)",
    artist: "Jason Mraz",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Jolene (Ver 1)",
    artist: "Dolly Parton",
    primaryInstrumentFocus: "Guitar",
    genre: "Country",
    difficulty: "Beginner",
    year: 1973,
    notes: "Simple riff; storytelling",
    skills: "Power Chords, Alternate Picking, Hammer-ons"
  },
  {
    song: "Knockin' on Heaven's Door (Ver 1)",
    artist: "Bob Dylan",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Rock",
    difficulty: "Beginner",
    year: 1973,
    notes: "G-D-Am7-C loop",
    skills: "Open Chords, Capo Use, Travis Picking"
  },
  {
    song: "Landslide (Ver 1)",
    artist: "Fleetwood Mac",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Rock",
    difficulty: "Intermediate",
    year: 1975,
    notes: "Travis picking",
    skills: "Pull-offs, Bends, Chord Melody"
  },
  {
    song: "Landslide (Ver 3)",
    artist: "Fleetwood Mac",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Rock",
    difficulty: "Intermediate",
    year: 1975,
    notes: "Travis picking",
    skills: "Power Chords, Open Chords, Fingerpicking"
  },
  {
    song: "Last Resort",
    artist: "Papa Roach",
    primaryInstrumentFocus: "Guitar",
    genre: "Nu Metal",
    difficulty: "Intermediate",
    year: 2000,
    notes: "Percussive RH riffs; tight rhythm",
    skills: "Syncopation, staccato control, steady tempo"
  },
  {
    song: "Layla (Unplugged) (Ver 1)",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Guitar",
    genre: "Blues/Rock",
    difficulty: "Intermediate",
    year: 1992,
    notes: "Acoustic riffing, fills",
    skills: "Hammer-ons, Open Chords, Alternate Picking"
  },
  {
    song: "Leaving on a Jet Plane – John Denver",
    artist: "John Denver",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1966,
    notes: "G, C, D",
    skills: "Basic open chords, folk strumming"
  },
  {
    song: "Let Her Go (Ver 1)",
    artist: "Passenger",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Pop",
    difficulty: "Beginner",
    year: 2012,
    notes: "Fingerpicked arpeggios",
    skills: "Capo Use, Open Chords, Alternate Picking"
  },
  {
    song: "Let Her Go (Ver 3)",
    artist: "Passenger",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Pop",
    difficulty: "Beginner",
    year: 2012,
    notes: "Fingerpicked arpeggios",
    skills: "Alternate Picking, Hammer-ons, Slides"
  },
  {
    song: "Let It Be – The Beatles",
    artist: "The Beatles",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1970,
    notes: "C, G, Am, F",
    skills: "Open chords, F barre chord (can substitute)"
  },
  {
    song: "Like a Stone",
    artist: "Audioslave",
    primaryInstrumentFocus: "Guitar/vocal → Piano (arr.)",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 2003,
    notes: "Lyrical melody over arpeggiated chords; works well as a ballad",
    skills: "Arpeggios, rubato phrasing, dynamic swells"
  },
  {
    song: "Losing My Religion (Ver 2)",
    artist: "R.E.M.",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 1991,
    notes: "Arpeggiated mandolin-to-guitar",
    skills: "Travis Picking, Barre Chords, Hammer-ons"
  },
  {
    song: "Love Me Do – The Beatles",
    artist: "The Beatles",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1962,
    notes: "G, C, D",
    skills: "Basic open chords, simple rhythm"
  },
  {
    song: "Love Yourself – Justin Bieber",
    artist: "Justin Bieber",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2015,
    notes: "C, G, Am, F",
    skills: "Open chords, simple progression"
  },
  {
    song: "Make You Feel My Love",
    artist: "Adele",
    primaryInstrumentFocus: "Piano + Voice",
    genre: "Pop Ballad",
    difficulty: "Beginner–Intermediate",
    year: 2008,
    notes: "Staple learner ballad",
    skills: "Ballad voicing, expressive pedaling, phrasing"
  },
  {
    song: "Master Of Puppets",
    artist: "Metallica",
    primaryInstrumentFocus: "Guitar",
    genre: "Thrash Metal",
    difficulty: "Intermediate",
    year: 1986,
    notes: "Fast tempo; aggressive RH patterns",
    skills: "Fast even 8ths/16ths, stamina, tight staccato"
  },
  {
    song: "More Than Words (Ver 1)",
    artist: "Extreme",
    primaryInstrumentFocus: "Guitar",
    genre: "Acoustic Rock",
    difficulty: "Intermediate",
    year: 1990,
    notes: "Right-hand patterns",
    skills: "Strumming Patterns, Chord Melody, Hammer-ons"
  },
  {
    song: "My Sacrifice",
    artist: "Creed",
    primaryInstrumentFocus: "Guitar",
    genre: "Post-Grunge",
    difficulty: "Intermediate",
    year: 2001,
    notes: "Simple chord cycles; big chorus voicings",
    skills: "Block → broken chords, octave LH, chorus build"
  },
  {
    song: "Nothing Else Matters (Ver 1)",
    artist: "Metallica",
    primaryInstrumentFocus: "Guitar",
    genre: "Metal/Ballad",
    difficulty: "Intermediate",
    year: 1991,
    notes: "Arpeggios, fingerstyle",
    skills: "Barre Chords, Chord Melody, Fingerpicking"
  },
  {
    song: "Old Town Road",
    artist: "Lil Nas X",
    primaryInstrumentFocus: "Guitar",
    genre: "Country‑Pop",
    difficulty: "Beginner",
    year: 2019,
    notes: "Capo‑friendly 3–4 chord song; huge hit.",
    skills: "Open chords, simple strum, song form"
  },
  {
    song: "One Last Breath",
    artist: "Creed",
    primaryInstrumentFocus: "Guitar",
    genre: "Post-Grunge",
    difficulty: "Intermediate",
    year: 2002,
    notes: "Arpeggiated textures translate nicely",
    skills: "Arpeggios, pedaling control, dynamic swells"
  },
  {
    song: "Patience (Ver 1)",
    artist: "Guns N' Roses",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1988,
    notes: "Whistles aside, arpeggios",
    skills: "Power Chords, Barre Chords, Fingerpicking"
  },
  {
    song: "Perfect – Ed Sheeran",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2017,
    notes: "G, Em, C, D",
    skills: "Open chords, gentle strumming"
  },
  {
    song: "Photograph – Ed Sheeran",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2014,
    notes: "E, C#m, A, B",
    skills: "Open chords (capo recommended)"
  },
  {
    song: "Photograph (Ver 1)",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2014,
    notes: "Simple picking pattern",
    skills: "Pull-offs, Strumming Patterns, Fingerpicking"
  },
  {
    song: "Photograph (Ver 3)",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2014,
    notes: "Simple picking pattern",
    skills: "Alternate Picking, Pull-offs, Fingerpicking"
  },
  {
    song: "Radioactive",
    artist: "Imagine Dragons",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock / Electropop",
    difficulty: "Intermediate",
    year: 2012,
    notes: "Percussive feel; ostinato patterns translate cleanly",
    skills: "LH ostinato, off-beat accents, steady tempo control"
  },
  {
    song: "Redemption Song – Bob Marley",
    artist: "Bob Marley",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1980,
    notes: "G, Em, C, D",
    skills: "Fingerpicking, open chords"
  },
  {
    song: "Ring of Fire (Ver 1)",
    artist: "Johnny Cash",
    primaryInstrumentFocus: "Guitar",
    genre: "Country",
    difficulty: "Beginner",
    year: 1963,
    notes: "Boom-chick rhythm",
    skills: "Chord Melody, Bends, Hammer-ons"
  },
  {
    song: "Riptide (Ver 3)",
    artist: "Vance Joy",
    primaryInstrumentFocus: "Guitar",
    genre: "Indie Folk",
    difficulty: "Beginner",
    year: 2013,
    notes: "Uke-to-guitar strum pattern",
    skills: "Capo Use, Chord Melody, Slides"
  },
  {
    song: "Roadhouse Blues",
    artist: "The Doors",
    primaryInstrumentFocus: "Guitar",
    genre: "Blues Rock",
    difficulty: "Intermediate",
    year: 1970,
    notes: "Shuffle feel; classic 12-bar form",
    skills: "12-bar blues form, swing shuffle, turnaround licks"
  },
  {
    song: "Rolling in the Deep – Adele",
    artist: "Adele",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2010,
    notes: "C, G, Bb, F",
    skills: "Open chords, some barre chords"
  },
  {
    song: "Saturday Nights",
    artist: "Khalid",
    primaryInstrumentFocus: "Guitar",
    genre: "R&B/Pop",
    difficulty: "Beginner–Intermediate",
    year: 2018,
    notes: "Laid‑back acoustic vibe.",
    skills: "Basic fingerpicking, chord transitions, timing"
  },
  {
    song: "Savage Love",
    artist: "Jawsh 685 & Jason Derulo",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2020,
    notes: "Two‑to‑three chord vamp; easy singalong.",
    skills: "Chord loop, timing, form"
  },
  {
    song: "Save your tears",
    artist: "The Weeknd",
    primaryInstrumentFocus: "Piano",
    genre: "Synth-Pop",
    difficulty: "Intermediate",
    year: 2020,
    notes: "Works well as mid-tempo piano cover with steady groove",
    skills: "RH riff consistency, chord inversions, syncopated comping"
  },
  {
    song: "Say You Won't Let Go (Ver 1)",
    artist: "James Arthur",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2016,
    notes: "Capo, easy shapes",
    skills: "Alternate Picking, Chord Melody, Fingerpicking"
  },
  {
    song: "Say You Won't Let Go (Ver 3)",
    artist: "James Arthur",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2016,
    notes: "Capo, easy shapes",
    skills: "Palm Muting, Slides, Fingerpicking"
  },
  {
    song: "Señorita",
    artist: "Shawn Mendes & Camila Cabello",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop/Latin",
    difficulty: "Intermediate",
    year: 2019,
    notes: "Latin groove",
    skills: "syncopation, chord embellishments"
  },
  {
    song: "Senorita – Shawn Mendes & Camila Cabello",
    artist: "Shawn Mendes",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2019,
    notes: "Am, C, F, G",
    skills: "Open chords, Latin-influenced rhythm"
  },
  {
    song: "Seven Nation Army (Ver 12)",
    artist: "The White Stripes",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Beginner",
    year: 2003,
    notes: "Single-note riff",
    skills: "Strumming Patterns, Power Chords, Pull-offs"
  },
  {
    song: "Shape of You – Ed Sheeran",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2017,
    notes: "Am, C, F, G",
    skills: "Open chords, rhythmic strumming"
  },
  {
    song: "She Will Be Loved",
    artist: "Maroon 5",
    primaryInstrumentFocus: "Guitar/vocal → Piano (arr.)",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2004,
    notes: "Gentle ballad; great for singing + playing",
    skills: "LH root-5, legato pedal, melody balance"
  },
  {
    song: "Shivers",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop",
    difficulty: "Intermediate",
    year: 2021,
    notes: "Driving rhythm",
    skills: "muted strums, syncopation"
  },
  {
    song: "Shy Away",
    artist: "Twenty One Pilots",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Intermediate",
    year: 2021,
    notes: "Up‑tempo; palm‑muted riffing.",
    skills: "Palm muting, power chords, precision"
  },
  {
    song: "Skinny Love (Ver 1)",
    artist: "Bon Iver",
    primaryInstrumentFocus: "Guitar",
    genre: "Indie Folk",
    difficulty: "Intermediate",
    year: 2007,
    notes: "Alternate tunings common",
    skills: "Hammer-ons, Pull-offs, Barre Chords"
  },
  {
    song: "Skyfall",
    artist: "Adele",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Slow Dancing in a Burning Room (Ver 2)",
    artist: "John Mayer",
    primaryInstrumentFocus: "Guitar",
    genre: "Blues/Pop",
    difficulty: "Advanced",
    year: 2006,
    notes: "Riffs, timing, phrasing",
    skills: "Palm Muting, Open Chords, Power Chords"
  },
  {
    song: "Smells Like Teen Spirit (Ver 1)",
    artist: "Nirvana",
    primaryInstrumentFocus: "Guitar",
    genre: "Grunge",
    difficulty: "Beginner",
    year: 1991,
    notes: "Power chords, dynamics",
    skills: "Bends, Slides, Capo Use"
  },
  {
    song: "Smoke on the Water – Deep Purple",
    artist: "Deep Purple",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Beginner",
    year: 1972,
    notes: "G5, Bb5, C5, G5, Bb5, Db5, C5",
    skills: "Power chords, iconic riff, palm muting"
  },
  {
    song: "Sofia",
    artist: "Clairo",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Indie Pop",
    difficulty: "Easy",
    year: 2019,
    notes: "Simple progression",
    skills: "down-up strum"
  },
  {
    song: "Someone Like You – Adele",
    artist: "Adele",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2011,
    notes: "G, D, Em, C",
    skills: "Open chords, ballad strumming"
  },
  {
    song: "Stairway to Heaven (Ver 1)",
    artist: "Led Zeppelin",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Advanced",
    year: 1971,
    notes: "Arpeggios, solo, dynamics",
    skills: "Palm Muting, Travis Picking, Capo Use"
  },
  {
    song: "Stairway to Heaven (Ver 3)",
    artist: "Led Zeppelin",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Advanced",
    year: 1971,
    notes: "Arpeggios, solo, dynamics",
    skills: "Slides, Strumming Patterns, Travis Picking"
  },
  {
    song: "Stand By Me",
    artist: "Ben E King",
    primaryInstrumentFocus: "Guitar",
    genre: "",
    difficulty: "",
    year: null,
    notes: "",
    skills: ""
  },
  {
    song: "Stick Season",
    artist: "Noah Kahan",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Indie",
    difficulty: "Intermediate",
    year: 2022,
    notes: "Acoustic storytelling; capo usage.",
    skills: "Capo shapes, narrative pacing, dynamics"
  },
  {
    song: "Stitches – Shawn Mendes",
    artist: "Shawn Mendes",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2015,
    notes: "Am, C, F, G",
    skills: "Open chords, steady strumming"
  },
  {
    song: "Stressed Out",
    artist: "Twenty One Pilots",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Alternative",
    difficulty: "Easy",
    year: 2015,
    notes: "Simple progression",
    skills: "down-up strum, dynamics"
  },
  {
    song: "Sultans of Swing",
    artist: "Dire Straits",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Rock",
    difficulty: "Intermediate",
    year: 1978,
    notes: "Transcribe guitar licks to RH; swing/laid-back groove",
    skills: "Swing feel, RH embellishments, syncopation"
  },
  {
    song: "Summer of '69 (Ver 1)",
    artist: "Bryan Adams",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1984,
    notes: "Riffs, power chords",
    skills: "Strumming Patterns, Chord Melody, Hammer-ons"
  },
  {
    song: "Summer of '69 (Ver 3)",
    artist: "Bryan Adams",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 1984,
    notes: "Riffs, power chords",
    skills: "Palm Muting, Fingerpicking, Barre Chords"
  },
  {
    song: "Sweet Child O' Mine (full version) – Guns N' Roses",
    artist: "Guns N' Roses",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Beginner",
    year: 1987,
    notes: "D, C, G, D (intro riff)",
    skills: "Single note picking, timing, open chords"
  },
  {
    song: "Sweet Home Alabama – Lynyrd Skynyrd",
    artist: "Lynyrd Skynyrd",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1974,
    notes: "D, C, G",
    skills: "Basic open chords, steady strumming"
  },
  {
    song: "Sweet Home Alabama (Ver 5)",
    artist: "Lynyrd Skynyrd",
    primaryInstrumentFocus: "Guitar",
    genre: "Southern Rock",
    difficulty: "Intermediate",
    year: 1974,
    notes: "Riffs, alternate picking",
    skills: "Slides, Fingerpicking, Chord Melody"
  },
  {
    song: "Take Me Home, Country Roads (Ver 6)",
    artist: "John Denver",
    primaryInstrumentFocus: "Guitar",
    genre: "Country",
    difficulty: "Beginner",
    year: 1971,
    notes: "Open chords",
    skills: "Capo Use, Hammer-ons, Power Chords"
  },
  {
    song: "Tears in Heaven (Ver 1)",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Guitar",
    genre: "Soft Rock",
    difficulty: "Intermediate",
    year: 1992,
    notes: "Fingerpicking, chord melody",
    skills: "Power Chords, Travis Picking, Palm Muting"
  },
  {
    song: "Tears in Heaven (Ver 3)",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Guitar",
    genre: "Soft Rock",
    difficulty: "Intermediate",
    year: 1992,
    notes: "Fingerpicking, chord melody",
    skills: "Pull-offs, Chord Melody, Power Chords"
  },
  {
    song: "Teeth",
    artist: "5 Seconds of Summer",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Rock",
    difficulty: "Intermediate",
    year: 2019,
    notes: "Heavy groove",
    skills: "drop-D optional, riffs"
  },
  {
    song: "Tennessee Whiskey",
    artist: "Chris Stapleton",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Country",
    difficulty: "Intermediate",
    year: 2015,
    notes: "12/8 feel",
    skills: "bluesy bends, slow strum"
  },
  {
    song: "The A Team (Ver 2)",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Folk/Pop",
    difficulty: "Beginner",
    year: 2011,
    notes: "Arpeggios, capo",
    skills: "Strumming Patterns, Pull-offs, Capo Use"
  },
  {
    song: "There's Nothing Holdin' Me Back",
    artist: "Shawn Mendes",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop Rock",
    difficulty: "Intermediate",
    year: 2017,
    notes: "Upbeat",
    skills: "power chords, palm muting"
  },
  {
    song: "Thinking Out Loud – Ed Sheeran",
    artist: "Ed Sheeran",
    primaryInstrumentFocus: "Guitar",
    genre: "Easy Pop",
    difficulty: "Beginner",
    year: 2014,
    notes: "D, G, Em, C",
    skills: "Open chords, fingerpicking optional"
  },
  {
    song: "Three Little Birds – Bob Marley",
    artist: "Bob Marley",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1977,
    notes: "A, D, G",
    skills: "Open chords, reggae strumming pattern"
  },
  {
    song: "Thunder",
    artist: "Imagine Dragons",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop Rock",
    difficulty: "Beginner",
    year: 2017,
    notes: "Driving beat",
    skills: "eighth-note strum"
  },
  {
    song: "Too Good at Goodbyes",
    artist: "Sam Smith",
    primaryInstrumentFocus: "Guitar (Acoustic)",
    genre: "Pop",
    difficulty: "Easy",
    year: 2017,
    notes: "Ballad",
    skills: "open chords, arpeggios"
  },
  {
    song: "Twist and Shout – The Beatles",
    artist: "The Beatles",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1963,
    notes: "D, G, A",
    skills: "Basic open chords, energetic strumming"
  },
  {
    song: "Under the Bridge (Ver 1)",
    artist: "Red Hot Chili Peppers",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Advanced",
    year: 1991,
    notes: "Chord embellishments",
    skills: "Fingerpicking, Pull-offs, Hammer-ons"
  },
  {
    song: "Under the Bridge (Ver 3)",
    artist: "Red Hot Chili Peppers",
    primaryInstrumentFocus: "Guitar",
    genre: "Alt Rock",
    difficulty: "Advanced",
    year: 1991,
    notes: "Chord embellishments",
    skills: "Slides, Bends, Power Chords"
  },
  {
    song: "Watermelon Sugar",
    artist: "Harry Styles",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop Rock",
    difficulty: "Easy",
    year: 2019,
    notes: "Upbeat",
    skills: "power chords, rhythm accents"
  },
  {
    song: "Wish You Were Here – Pink Floyd",
    artist: "Pink Floyd",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1975,
    notes: "G, D, Am, C, Em",
    skills: "Open chords, fingerpicking intro, strumming"
  },
  {
    song: "With Arms Wide Open",
    artist: "Creed",
    primaryInstrumentFocus: "Guitar",
    genre: "Post-Grunge",
    difficulty: "Intermediate",
    year: 2000,
    notes: "Slow tempo; emotive ballad style",
    skills: "LH octaves, chord inversions, legato pedaling"
  },
  {
    song: "Wonderful Tonight",
    artist: "Eric Clapton",
    primaryInstrumentFocus: "Guitar/vocal → Piano (arr.)",
    genre: "Soft Rock",
    difficulty: "Beginner",
    year: 1977,
    notes: "Slow romantic ballad; easy to reharmonize for solo piano",
    skills: "Broken-chord LH, tasteful pedal, melody voicing"
  },
  {
    song: "Wonderwall (Ver 1)",
    artist: "Oasis",
    primaryInstrumentFocus: "Guitar",
    genre: "Britpop/Rock",
    difficulty: "Beginner",
    year: 1995,
    notes: "Open chords, strumming patterns",
    skills: "Alternate Picking, Travis Picking, Power Chords"
  },
  {
    song: "Yellow Submarine – The Beatles",
    artist: "The Beatles",
    primaryInstrumentFocus: "Guitar",
    genre: "Classic Beginner",
    difficulty: "Beginner",
    year: 1966,
    notes: "G, D, C, Em",
    skills: "Open chords, sing-along rhythm"
  },
  {
    song: "You're Beautiful",
    artist: "James Blunt",
    primaryInstrumentFocus: "Guitar",
    genre: "Pop",
    difficulty: "Beginner",
    year: 2005,
    notes: "Popular learner ballad; straightforward harmony",
    skills: "LH root-5 / octaves, melody voicing, pedal"
  },
  {
    song: "Youngblood",
    artist: "5 Seconds of Summer",
    primaryInstrumentFocus: "Guitar (Electric)",
    genre: "Pop Rock",
    difficulty: "Intermediate",
    year: 2018,
    notes: "Driving rhythm",
    skills: "power chords"
  },
  {
    song: "Zombie – The Cranberries",
    artist: "The Cranberries",
    primaryInstrumentFocus: "Guitar",
    genre: "Rock",
    difficulty: "Beginner",
    year: 1994,
    notes: "Em, C, G, D",
    skills: "Open chords, alternative rock strumming"
  }
];

// Helper function to normalize strings for comparison
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
}

// Helper function to find matching song
function findMatchingSong(dbSongs: any[], spreadsheetItem: any) {
  const normalizedSpreadsheetTitle = normalizeString(spreadsheetItem.song);
  const normalizedSpreadsheetArtist = normalizeString(spreadsheetItem.artist);
  
  return dbSongs.find(dbSong => {
    const normalizedDbTitle = normalizeString(dbSong.title);
    const normalizedDbArtist = normalizeString(dbSong.artist);
    
    // Check normal match: title matches title, artist matches artist
    const normalMatch = normalizedDbTitle === normalizedSpreadsheetTitle && 
                       normalizedDbArtist === normalizedSpreadsheetArtist;
    
    // Check swapped match: title matches artist, artist matches title
    const swappedMatch = normalizedDbTitle === normalizedSpreadsheetArtist && 
                        normalizedDbArtist === normalizedSpreadsheetTitle;
    
    return normalMatch || swappedMatch;
  });
}

// Helper function to convert difficulty
function convertDifficulty(difficulty: string): string {
  if (!difficulty) return '';
  
  const difficultyMap: { [key: string]: string } = {
    'easy': 'Easy',
    'beginner': 'Beginner',
    'beginner–intermediate': 'Beginner-Intermediate',
    'beginner-intermediate': 'Beginner-Intermediate',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert'
  };
  
  return difficultyMap[difficulty.toLowerCase()] || difficulty;
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get all songs from database
    const dbSongs = await Song.find({});
    
    let updatedCount = 0;
    let notFoundCount = 0;
    let errors: string[] = [];
    const updateResults: any[] = [];

    // Process each spreadsheet item
    for (const spreadsheetItem of spreadsheetData) {
      try {
        const matchingSong = findMatchingSong(dbSongs, spreadsheetItem);
        
        if (matchingSong) {
          // Prepare update data
          const updateData: any = {};
          
          if (spreadsheetItem.primaryInstrumentFocus) {
            updateData.primaryInstrumentFocus = spreadsheetItem.primaryInstrumentFocus;
          }
          if (spreadsheetItem.genre) {
            updateData.genre = spreadsheetItem.genre;
          }
          if (spreadsheetItem.difficulty) {
            updateData.difficulty = convertDifficulty(spreadsheetItem.difficulty);
          }
          if (spreadsheetItem.year) {
            updateData.year = spreadsheetItem.year;
          }
          if (spreadsheetItem.notes) {
            updateData.notes = spreadsheetItem.notes;
          }
          if (spreadsheetItem.skills) {
            updateData.skills = spreadsheetItem.skills;
          }

          // Only update if there's something to update
          if (Object.keys(updateData).length > 0) {
            const updatedSong = await Song.findByIdAndUpdate(
              matchingSong._id,
              updateData,
              { new: true, runValidators: true }
            );
            
            updatedCount++;
            updateResults.push({
              id: matchingSong._id,
              title: matchingSong.title,
              artist: matchingSong.artist,
              spreadsheetTitle: spreadsheetItem.song,
              spreadsheetArtist: spreadsheetItem.artist,
              updated: Object.keys(updateData),
              success: true
            });
          } else {
            updateResults.push({
              title: matchingSong.title,
              artist: matchingSong.artist,
              spreadsheetTitle: spreadsheetItem.song,
              spreadsheetArtist: spreadsheetItem.artist,
              updated: [],
              success: true,
              message: 'No fields to update'
            });
          }
        } else {
          notFoundCount++;
          updateResults.push({
            spreadsheetTitle: spreadsheetItem.song,
            spreadsheetArtist: spreadsheetItem.artist,
            success: false,
            message: 'No matching song found in database'
          });
        }
      } catch (error) {
        const errorMessage = `Error processing ${spreadsheetItem.song} by ${spreadsheetItem.artist}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        updateResults.push({
          spreadsheetTitle: spreadsheetItem.song,
          spreadsheetArtist: spreadsheetItem.artist,
          success: false,
          message: errorMessage
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk update completed',
      summary: {
        total: spreadsheetData.length,
        updated: updatedCount,
        notFound: notFoundCount,
        errors: errors.length
      },
      results: updateResults,
      errors: errors
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}