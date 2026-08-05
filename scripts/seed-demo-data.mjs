/**
 * Seeds a realistic local dataset: 5 tutors, 5 students, 5 courses, and regular
 * weekly classes across the current week.
 *
 * Closest Django analogue: a `loaddata` fixture, except the relationships are
 * denormalised (arrays of ObjectIds on both sides), so every link has to be
 * written on BOTH documents — there is no ORM to maintain the reverse side.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-demo-data.mjs
 *
 * Idempotent: re-running wipes anything previously seeded (matched by the
 * @demo.upkraft.local email domain) and rebuilds it. Your admin user and any
 * data you created by hand are left untouched.
 */
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set. Run with: node --env-file=.env.local ...");
  process.exit(1);
}

const DEMO_DOMAIN = "@demo.upkraft.local";
const PASSWORD = "Test@123";
const TZ_OFFSET_MIN = 330; // Asia/Calcutta = UTC+5:30, no DST

// Loose schemas against the app's real collections. The app's own models
// (src/models/*.js) are ESM with extensionless imports and only resolve through
// Next's bundler, so they can't be imported from a plain node script.
const loose = (collection) =>
  new mongoose.Schema({}, { strict: false, timestamps: true, collection });

const User = mongoose.model("users", loose("users"));
const Course = mongoose.model("courseName", loose("coursenames"));
const Class = mongoose.model("Class", loose("classes"));

/** Build a UTC Date from an IST wall-clock time. */
const istToUtc = (day, hour, minute = 0) => {
  const d = new Date(day);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hour, minute) -
      TZ_OFFSET_MIN * 60 * 1000
  );
};

/** Monday 00:00 UTC of the week containing `ref`. */
const mondayOf = (ref) => {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const dow = d.getUTCDay(); // 0=Sun
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1));
  return d;
};

const addDays = (d, n) => {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
};

// weekday: 0=Mon .. 6=Sun
const TUTORS = [
  { username: "Ravi Sharma",    email: `ravi.sharma${DEMO_DOMAIN}`,    instrument: "Guitar", city: "Bengaluru", experience: 8,  skills: "Acoustic & Electric Guitar, Music Theory" },
  { username: "Ananya Iyer",    email: `ananya.iyer${DEMO_DOMAIN}`,    instrument: "Piano",  city: "Chennai",   experience: 12, skills: "Classical Piano, Western Vocals" },
  { username: "Vikram Nair",    email: `vikram.nair${DEMO_DOMAIN}`,    instrument: "Drums",  city: "Mumbai",    experience: 6,  skills: "Drum Kit, Rhythm Training, Percussion" },
  { username: "Priya Deshmukh", email: `priya.deshmukh${DEMO_DOMAIN}`, instrument: "Vocal",  city: "Pune",      experience: 10, skills: "Hindustani Classical, Playback Singing" },
  { username: "Arjun Menon",    email: `arjun.menon${DEMO_DOMAIN}`,    instrument: "Violin", city: "Kochi",     experience: 9,  skills: "Carnatic Violin, Western Classical" },
];

// Each student maps to one tutor, with two fixed weekly slots (IST).
const STUDENTS = [
  { username: "Aarav Gupta",   email: `aarav.gupta${DEMO_DOMAIN}`,   tutor: 0, age: 12, city: "Bengaluru", slots: [{ weekday: 0, hour: 17 }, { weekday: 3, hour: 17 }] },
  { username: "Diya Reddy",    email: `diya.reddy${DEMO_DOMAIN}`,    tutor: 1, age: 15, city: "Chennai",   slots: [{ weekday: 1, hour: 18 }, { weekday: 4, hour: 18 }] },
  { username: "Kabir Singh",   email: `kabir.singh${DEMO_DOMAIN}`,   tutor: 2, age: 10, city: "Mumbai",    slots: [{ weekday: 2, hour: 16 }, { weekday: 5, hour: 11 }] },
  { username: "Meera Joshi",   email: `meera.joshi${DEMO_DOMAIN}`,   tutor: 3, age: 17, city: "Pune",      slots: [{ weekday: 0, hour: 19 }, { weekday: 4, hour: 19 }] },
  { username: "Rohan Krishna", email: `rohan.krishna${DEMO_DOMAIN}`, tutor: 4, age: 13, city: "Kochi",     slots: [{ weekday: 2, hour: 18 }, { weekday: 6, hour: 10 }] },
];

const CURRICULUM = (instrument) => [
  { sessionNo: "1", topic: `${instrument} fundamentals & posture`, tangibleOutcome: "Correct hand position held for a full 10-minute exercise" },
  { sessionNo: "2", topic: "Scales and warm-up routine",           tangibleOutcome: "Two major scales played cleanly at 80bpm" },
  { sessionNo: "3", topic: "Rhythm and timing",                    tangibleOutcome: "Keeps time with a metronome across 4 bars" },
  { sessionNo: "4", topic: "First full piece",                     tangibleOutcome: "Performs a short piece end to end from memory" },
];

await mongoose.connect(MONGO_URL);
console.log(`Connected to ${MONGO_URL}\n`);

// src/models/courseName.js declares index({ _id: 1, class: 1, students: 1 }).
// `class` and `students` are both arrays, and MongoDB refuses to index parallel
// arrays — so once mongoose autoIndex builds it on an empty collection, EVERY
// insert into `coursenames` fails with code 171. On Atlas the collection already
// had documents when the index was added, so the build failed and the index was
// never created, which is why production never hit this. Drop it here so a fresh
// local DB behaves like production. The real fix is to delete that line.
const courseIndexes = await Course.collection.indexes().catch(() => []);
for (const idx of courseIndexes) {
  if (idx.key?.class && idx.key?.students) {
    await Course.collection.dropIndex(idx.name);
    console.log(`Dropped parallel-array index '${idx.name}' on coursenames (see src/models/courseName.js)\n`);
  }
}

// ── Clean out any previous seed run ──────────────────────────────────────────
const stale = await User.find({ email: new RegExp(`${DEMO_DOMAIN}$`, "i") }, { _id: 1 }).lean();
if (stale.length) {
  const staleIds = stale.map((u) => u._id);
  const staleCourses = await Course.find({ instructorId: { $in: staleIds } }, { _id: 1 }).lean();
  const staleCourseIds = staleCourses.map((c) => c._id);
  const del = await Promise.all([
    Class.deleteMany({ course: { $in: staleCourseIds } }),
    Course.deleteMany({ _id: { $in: staleCourseIds } }),
    User.deleteMany({ _id: { $in: staleIds } }),
  ]);
  console.log(`Cleared previous seed: ${del[2].deletedCount} users, ${del[1].deletedCount} courses, ${del[0].deletedCount} classes\n`);
}

const hashedPassword = await bcryptjs.hash(PASSWORD, await bcryptjs.genSalt(10));

const baseUser = (extra) => ({
  password: hashedPassword,
  isVerified: true, // else login is blocked by the "not approved" gate
  isAdmin: false,
  address: "",
  contact: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
  credits: 0,
  creditsPerCourse: [],
  courses: [],
  classes: [],
  instructorId: [],
  assignment: [],
  pendingAssignments: [],
  likedSongs: [],
  state: "active",
  timezone: "Asia/Calcutta",
  ...extra,
});

// ── Tutors ───────────────────────────────────────────────────────────────────
const tutorDocs = await User.insertMany(
  TUTORS.map((t) =>
    baseUser({
      username: t.username,
      email: t.email,
      category: "Tutor",
      age: 30,
      city: t.city,
      skills: t.skills,
      experience: t.experience,
      education: "B.A. Music Performance",
      teachingMode: "Online",
      studentsCoached: 20 + t.experience,
      aboutMyself: `${t.experience} years teaching ${t.instrument.toLowerCase()} to school-age learners.`,
      instruments: [t.instrument],
      students: [],
      tutors: [],
    })
  )
);
console.log(`Created ${tutorDocs.length} tutors`);

// ── Courses (one per tutor) ──────────────────────────────────────────────────
const courseDocs = await Course.insertMany(
  TUTORS.map((t, i) => ({
    title: `${t.instrument} — Beginner Track`,
    category: "Music",
    subCategory: t.instrument,
    tag: t.instrument.toLowerCase(),
    description: `Weekly one-on-one ${t.instrument.toLowerCase()} coaching covering technique, theory and repertoire.`,
    duration: "3 months",
    price: 6000,
    credits: 12,
    maxStudentCount: 10,
    studentEnrolledCount: 0,
    instructorId: tutorDocs[i]._id,
    academyInstructorId: [],
    students: [],
    class: [],
    curriculum: CURRICULUM(t.instrument),
    performanceScores: [],
  }))
);
console.log(`Created ${courseDocs.length} courses`);

// Tutors hold their own course id — the classes POST route relies on
// { courses: courseId, category: "Tutor" } to fan class ids out to tutors.
await Promise.all(
  tutorDocs.map((t, i) => User.updateOne({ _id: t._id }, { $addToSet: { courses: courseDocs[i]._id } }))
);

// ── Students ─────────────────────────────────────────────────────────────────
const studentDocs = await User.insertMany(
  STUDENTS.map((s) =>
    baseUser({
      username: s.username,
      email: s.email,
      category: "Student",
      age: s.age,
      city: s.city,
      instructorId: [tutorDocs[s.tutor]._id],
      courses: [courseDocs[s.tutor]._id],
      attendance: [],
      studentSociety: "Demo Society",
      renewalStatus: "YTR",
    })
  )
);
console.log(`Created ${studentDocs.length} students`);

// ── Classes: past week (completed) + current/next week (scheduled) ───────────
const now = new Date();
const thisMonday = mondayOf(now);
const lastMonday = addDays(thisMonday, -7);
const seriesEnd = addDays(thisMonday, 27); // recurrence horizon, ~4 weeks out

const classDocs = [];
const attendanceByStudent = new Map();
const classesByStudent = new Map();
const classesByCourse = new Map();

STUDENTS.forEach((s, si) => {
  const tutor = tutorDocs[s.tutor];
  const course = courseDocs[s.tutor];
  const instrument = TUTORS[s.tutor].instrument;
  const student = studentDocs[si];

  s.slots.forEach((slot, slotIdx) => {
    // One recurrenceId per weekly slot — this is what groups a series in the UI.
    const recurrenceId = `demo-${student._id}-${slotIdx}`;

    [lastMonday, thisMonday].forEach((weekStart, weekIdx) => {
      const day = addDays(weekStart, slot.weekday);
      const startTime = istToUtc(day, slot.hour);
      const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);
      const isPast = startTime < now;

      const sessionNo = weekIdx * 2 + slotIdx + 1;
      const topic = CURRICULUM(instrument)[(sessionNo - 1) % 4];

      const doc = {
        _id: new mongoose.Types.ObjectId(),
        title: `${instrument} Session ${sessionNo} — ${s.username.split(" ")[0]}`,
        description: topic.topic,
        course: course._id,
        instructor: tutor._id,
        startTime,
        endTime,
        status: isPast ? "completed" : "scheduled",
        classType: "regular",
        recurrenceType: "weekly",
        recurrenceId,
        recurrenceUntil: seriesEnd,
        joinLink: null,
        csat: [],
        whatsappSentCount: 0,
      };
      classDocs.push(doc);

      if (!classesByStudent.has(si)) classesByStudent.set(si, []);
      classesByStudent.get(si).push(doc._id);

      const ck = course._id.toString();
      if (!classesByCourse.has(ck)) classesByCourse.set(ck, []);
      classesByCourse.get(ck).push(doc._id);

      if (!attendanceByStudent.has(si)) attendanceByStudent.set(si, []);
      attendanceByStudent.get(si).push({
        classId: doc._id,
        status: isPast ? "present" : "not_marked",
        reasonForCancellation: "",
        videoUrl: "",
        creditDeducted: isPast ? 1 : 0,
      });
    });
  });
});

await Class.insertMany(classDocs);
const completed = classDocs.filter((c) => c.status === "completed").length;
console.log(`Created ${classDocs.length} classes (${completed} completed, ${classDocs.length - completed} scheduled)`);

// ── Wire up both sides of every relationship ─────────────────────────────────
await Promise.all(
  courseDocs.map((c, i) =>
    Course.updateOne(
      { _id: c._id },
      {
        $set: {
          class: classesByCourse.get(c._id.toString()) || [],
          students: studentDocs.filter((_, si) => STUDENTS[si].tutor === i).map((s) => s._id),
          studentEnrolledCount: STUDENTS.filter((s) => s.tutor === i).length,
        },
      }
    )
  )
);

await Promise.all(
  studentDocs.map((s, si) => {
    const classIds = classesByStudent.get(si) || [];
    const courseId = courseDocs[STUDENTS[si].tutor]._id;
    return User.updateOne(
      { _id: s._id },
      {
        $set: {
          classes: classIds,
          attendance: attendanceByStudent.get(si) || [],
          credits: 12,
          // Mirrors the shape written by Api/addStudentToCourse
          creditsPerCourse: [
            {
              courseId,
              credits: 12,
              startTime: [
                {
                  date: lastMonday,
                  message: "Seeded enrolment",
                  classIds,
                  endDate: seriesEnd,
                  renewalStatus: "YTR",
                  renewalNotes: "",
                  notes: "",
                  amount: 6000,
                  renewalClasses: 0,
                  renewalFrequency: "",
                  renewalAmount: 0,
                  frequency: "Twice a week",
                  classesPaid: 12,
                  dropReason: "",
                },
              ],
            },
          ],
        },
      }
    );
  })
);

await Promise.all(
  tutorDocs.map((t, i) => {
    const myStudents = studentDocs.filter((_, si) => STUDENTS[si].tutor === i).map((s) => s._id);
    const myClasses = classesByCourse.get(courseDocs[i]._id.toString()) || [];
    return User.updateOne({ _id: t._id }, { $set: { students: myStudents, classes: myClasses } });
  })
);

console.log("\nLinked courses ↔ classes ↔ tutors ↔ students");
console.log(`\nAll demo accounts use password: ${PASSWORD}`);
console.log("Tutors:   " + TUTORS.map((t) => t.email).join("\n          "));
console.log("Students: " + STUDENTS.map((s) => s.email).join("\n          "));

await mongoose.disconnect();
