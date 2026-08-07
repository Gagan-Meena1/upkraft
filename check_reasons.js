const mongoose = require('mongoose');
const User = require('./src/models/userModel').default;
require('dotenv').config({ path: '.env.local' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const students = await User.find({ category: "Student", hideFromRenewalDashboard: { $ne: true } }).lean();
    
    let count = 0;
    for (const student of students) {
        for (const course of (student.creditsPerCourse || [])) {
            const entries = course.startTime || [];
            if (entries.length === 0) continue;
            
            let latest = entries[0];
            for (let i = 1; i < entries.length; i++) {
                if (new Date(entries[i].date || 0) > new Date(latest.date || 0)) {
                    latest = entries[i];
                }
            }
            
            if (latest.renewalStatus === 'Dropped') {
                const dropR = (latest.dropReason || "").trim();
                if (!dropR) {
                    console.log(`Student: ${student.username}, dropReason: "${latest.dropReason}", notes: "${latest.notes}", renewalNotes: "${latest.renewalNotes}"`);
                    count++;
                }
            }
        }
    }
    console.log(`Total dropped with no dropReason: ${count}`);
    process.exit(0);
}
check();
