/**
 * Equivalent of Django's `manage.py createsuperuser`.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-admin.mjs <email> <password> [username] [category]
 *
 * Example:
 *   node --env-file=.env.local scripts/create-admin.mjs admin@upkraft.local Admin@123 "Local Admin" Admin
 *
 * Valid categories (they drive post-login routing in src/app/login/page.tsx):
 *   Admin | Academic | Tutor | Student | TeamLead | RelationshipManager | SalesHead
 *
 * Re-running with an existing email resets that user's password instead of
 * creating a duplicate.
 */
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const [, , email, password, username = "Admin", category = "Admin"] = process.argv;

if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [username] [category]");
  process.exit(1);
}

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is not set. Run with: node --env-file=.env.local ...");
  process.exit(1);
}

// The real schema lives in src/models/userModel.js, but that file is ESM-with-
// extensionless-imports and only resolvable through Next's bundler. A permissive
// schema against the same `users` collection is enough for seeding.
const User = mongoose.model("users", new mongoose.Schema({}, { strict: false, timestamps: true }));

await mongoose.connect(MONGO_URL);

const normalizedEmail = email.toLowerCase();
const hashedPassword = await bcryptjs.hash(password, await bcryptjs.genSalt(10));

const existing = await User.findOne({ email: normalizedEmail });

if (existing) {
  await User.updateOne(
    { _id: existing._id },
    { $set: { password: hashedPassword, isVerified: true, isAdmin: true, state: "active" } }
  );
  console.log(`Updated existing user ${normalizedEmail} (password reset, verified, isAdmin=true)`);
} else {
  const created = await User.create({
    username,
    email: normalizedEmail,
    password: hashedPassword,
    category,
    isVerified: true, // without this, login is blocked by the "not approved" check
    isAdmin: true,
    age: 1,
    address: "",
    contact: "",
    credits: 0,
    creditsPerCourse: [],
    courses: [],
    classes: [],
    instructorId: [],
    state: "active",
    timezone: "Asia/Calcutta",
  });
  console.log(`Created ${category} user ${normalizedEmail} (_id: ${created._id})`);
}

await mongoose.disconnect();
