/**
 * Seeds a small, self-contained music library for local testing.
 *
 * Three rows, chosen to exercise both players the mobile app ships with:
 *
 *   1. "Open String Reference"  — audio, and the one to play out loud while the
 *                                 tuner is open: it walks the six open strings
 *                                 of standard tuning, so the needle should land
 *                                 dead centre on each.
 *   2. "A Major Scale"          — audio, for the 0.5×–1.5× practice speed
 *                                 control (the pitch must not move with it).
 *   3. A Guitar Pro score       — tablature, which routes to the AlphaTab
 *                                 player instead. Reuses a .gp5 already sitting
 *                                 in public/uploads/music.
 *
 * The two audio tracks are synthesised here rather than shipped as binaries:
 * a plucked-string tone is a few lines of arithmetic, and generating them keeps
 * the repo free of media blobs whose provenance nobody can check later.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-music-library.mjs
 *
 * Idempotent: rows carry the `local-test` tag and are deleted and rebuilt on
 * every run. Nothing without that tag is touched, so a shared database keeps
 * its real catalogue.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set. Run with: node --env-file=.env.local ...");
  process.exit(1);
}

const MUSIC_DIR = path.join(process.cwd(), "public", "uploads", "music");
/** Marks rows this script owns, so re-running cannot touch anything else. */
const TAG = "local-test";
const SAMPLE_RATE = 44100;

// Equal temperament, A4 = 440 Hz.
const NOTES = {
  E2: 82.41, A2: 110.0, D3: 146.83, G3: 196.0, B3: 246.94, E4: 329.63,
  A3: 220.0, B3_: 246.94, "C#4": 277.18, D4: 293.66, "F#4": 369.99,
  "G#4": 415.3, A4: 440.0,
};

// ─── WAV synthesis ────────────────────────────────────────────────────────────

/**
 * One plucked note.
 *
 * A bare sine reads as a test tone and, more importantly, gives a pitch
 * detector nothing to lock onto but the fundamental. Stacking a few harmonics
 * under an exponential decay produces something string-like that both the
 * tuner and a human ear treat as a real note.
 */
function pluck(frequency, seconds, gain = 0.6) {
  const total = Math.floor(SAMPLE_RATE * seconds);
  const samples = new Float32Array(total);
  const decay = 3.2 / seconds;
  // A hard start would click; 8 ms of ramp is inaudible but removes it.
  const attack = Math.floor(SAMPLE_RATE * 0.008);

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-decay * t) * (i < attack ? i / attack : 1);

    let value = 0;
    for (let harmonic = 1; harmonic <= 6; harmonic++) {
      // Upper partials both start quieter and die faster, as they do on a real
      // string — without this the tone stays buzzy all the way through.
      const amplitude = 1 / Math.pow(harmonic, 1.6);
      const harmonicDecay = Math.exp(-decay * 0.45 * (harmonic - 1) * t);
      value += amplitude * harmonicDecay * Math.sin(2 * Math.PI * frequency * harmonic * t);
    }
    samples[i] = value * envelope * gain * 0.5;
  }
  return samples;
}

/** Concatenate notes, each padded to its slot so the timing stays even. */
function sequence(notes, secondsPerNote) {
  const slot = Math.floor(SAMPLE_RATE * secondsPerNote);
  const out = new Float32Array(slot * notes.length);
  notes.forEach((frequency, index) => {
    // Ring on a touch past the slot so notes overlap rather than gate off.
    const note = pluck(frequency, secondsPerNote * 1.15);
    const start = index * slot;
    for (let i = 0; i < note.length && start + i < out.length; i++) {
      out[start + i] += note[i];
    }
  });
  return out;
}

/** Float samples → a 16-bit mono PCM WAV file. */
function toWav(samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM header size
  buffer.writeUInt16LE(1, 20); // format: PCM
  buffer.writeUInt16LE(1, 22); // channels: mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i++) {
    // Clamp before scaling: summed harmonics can overshoot and would otherwise
    // wrap around into loud noise.
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const AUDIO_TRACKS = [
  {
    filename: "local-test-open-string-reference.wav",
    title: "Open String Reference — Standard Tuning",
    artist: "UpKraft Practice Lab",
    genre: "Reference",
    difficulty: "Beginner",
    primaryInstrumentFocus: "Guitar",
    year: 2026,
    institution: "UpKraft",
    skills: "Tuning by ear, string identification",
    notes:
      "Six open strings, low to high: E2 A2 D3 G3 B3 E4. Play this aloud with the tuner open — each note should read in tune.",
    samples: () => sequence([NOTES.E2, NOTES.A2, NOTES.D3, NOTES.G3, NOTES.B3, NOTES.E4], 2.0),
  },
  {
    filename: "local-test-a-major-scale.wav",
    title: "A Major Scale — Slow Practice",
    artist: "UpKraft Practice Lab",
    genre: "Exercise",
    difficulty: "Beginner-Intermediate",
    primaryInstrumentFocus: "Guitar",
    year: 2026,
    institution: "UpKraft",
    skills: "Major scale shapes, alternate picking, timing",
    notes:
      "A major, ascending then descending. Drop to 0.5× to check that the practice speed control holds pitch.",
    samples: () =>
      sequence(
        [
          NOTES.A3, NOTES.B3_, NOTES["C#4"], NOTES.D4,
          NOTES.E4, NOTES["F#4"], NOTES["G#4"], NOTES.A4,
          NOTES["G#4"], NOTES["F#4"], NOTES.E4, NOTES.D4,
          NOTES["C#4"], NOTES.B3_, NOTES.A3,
        ],
        0.55
      ),
  },
];

/** Metadata for the tablature row; the file itself is picked at runtime. */
const SCORE_TRACK = {
  title: "Guitar Pro Score — Tablature Test",
  artist: "UpKraft Practice Lab",
  genre: "Rock",
  difficulty: "Intermediate",
  primaryInstrumentFocus: "Guitar",
  year: 2026,
  // Tagged Trinity so the library's Trinity tab has something in it too.
  institution: "Trinity",
  skills: "Reading tablature, following a score",
  notes: "Opens in the AlphaTab score player rather than the audio player.",
};

const loose = (collection) => new mongoose.Schema({}, { strict: false, timestamps: true, collection });
const Song = mongoose.model("Song", loose("songs"));

/**
 * The app's own model builds this in a pre-save hook, which a loose schema
 * bypasses. Without it these rows are invisible to the library's search box.
 */
const searchTextFor = (song) =>
  [song.title, song.artist, song.genre, song.primaryInstrumentFocus, song.skills, song.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** An existing Guitar Pro file to point the tablature row at. */
function findExistingScore() {
  if (!fs.existsSync(MUSIC_DIR)) return null;
  const candidates = fs
    .readdirSync(MUSIC_DIR)
    .filter((name) => /\.gp[3-9]?$/i.test(name))
    .sort();
  return candidates[0] ?? null;
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected.\n");

  fs.mkdirSync(MUSIC_DIR, { recursive: true });

  const removed = await Song.deleteMany({ tags: TAG });
  if (removed.deletedCount) console.log(`Removed ${removed.deletedCount} previously seeded song(s).\n`);

  const rows = [];

  // ── Audio ──────────────────────────────────────────────────────────────────
  for (const track of AUDIO_TRACKS) {
    const buffer = toWav(track.samples());
    const filePath = path.join(MUSIC_DIR, track.filename);
    fs.writeFileSync(filePath, buffer);

    const seconds = (buffer.length - 44) / 2 / SAMPLE_RATE;
    console.log(`Wrote ${track.filename} (${(buffer.length / 1024).toFixed(0)} KB, ${seconds.toFixed(1)}s)`);

    const { samples, filename, ...meta } = track;
    rows.push({
      ...meta,
      filename,
      url: `/uploads/music/${filename}`,
      mimeType: "audio/wav",
      fileType: "audio",
      extension: ".wav",
      fileSize: buffer.length,
      duration: Math.round(seconds),
      uploadDate: new Date(),
      isActive: true,
      downloadCount: 0,
      tags: [TAG],
      searchText: searchTextFor(meta),
    });
  }

  // ── Tablature ──────────────────────────────────────────────────────────────
  const scoreFile = findExistingScore();
  if (scoreFile) {
    const filePath = path.join(MUSIC_DIR, scoreFile);
    console.log(`Linked ${scoreFile} for the tablature row`);
    rows.push({
      ...SCORE_TRACK,
      filename: scoreFile,
      url: `/uploads/music/${scoreFile}`,
      mimeType: "application/octet-stream",
      fileType: "tablature",
      extension: path.extname(scoreFile).toLowerCase(),
      fileSize: fs.statSync(filePath).size,
      tuning: "E A D G B E",
      uploadDate: new Date(),
      isActive: true,
      downloadCount: 0,
      tags: [TAG],
      searchText: searchTextFor(SCORE_TRACK),
    });
  } else {
    console.warn(
      "\nNo .gp5 file found in public/uploads/music — skipping the tablature row.\n" +
        "Drop a Guitar Pro file in there and re-run to test the score player."
    );
  }

  const inserted = await Song.insertMany(rows);
  console.log(`\nSeeded ${inserted.length} song(s):`);
  for (const row of inserted) {
    console.log(`  • ${row.title}  [${row.fileType}]  ${row.url}`);
  }

  console.log("\nOpen /student/musicLibrary on the web, or the Music library card on mobile.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("\nSeed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
