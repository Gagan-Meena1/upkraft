import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";

connect();

export async function POST(req: NextRequest) {
  try {
    // Fetch all students who have creditsPerCourse
    const students = await User.find({
      "creditsPerCourse.0": { $exists: true },
      category: "Student",
    }).lean();

    console.log(`[migrateEndDate] Found ${students.length} students with creditsPerCourse`);

    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const student of students) {
      try {
        let studentModified = false;

        for (let courseIdx = 0; courseIdx < (student.creditsPerCourse || []).length; courseIdx++) {
          const courseEntry = (student.creditsPerCourse as any[])[courseIdx];

          if (!courseEntry.startTime?.length) continue;

          for (let timeIdx = 0; timeIdx < courseEntry.startTime.length; timeIdx++) {
            const entry = courseEntry.startTime[timeIdx];

            // ✅ Skip if endDate already exists
            if (entry.endDate) {
              totalSkipped++;
              continue;
            }

            const classIds = entry.classIds || [];
            if (classIds.length === 0) {
              totalSkipped++;
              continue;
            }

            // ✅ Find all classes for this entry and get the latest startTime
            const classes = await Class.find(
              { _id: { $in: classIds } },
              { startTime: 1 }
            ).lean();

            if (!classes.length) {
              totalSkipped++;
              continue;
            }

            // Same logic as getEndDateForAssignment in addClass.tsx
            const lastClass = classes.reduce((latest: any, cls: any) => {
              return new Date(cls.startTime) > new Date(latest.startTime) ? cls : latest;
            });

            const endDate = new Date(lastClass.startTime);

            // ✅ Update just this specific entry using positional path
            await User.updateOne(
              { _id: student._id },
              {
                $set: {
                  [`creditsPerCourse.${courseIdx}.startTime.${timeIdx}.endDate`]: endDate,
                },
              }
            );

            console.log(
              `[migrateEndDate] Student ${student._id} | course ${courseIdx} | entry ${timeIdx} → endDate: ${endDate.toISOString()}`
            );

            totalUpdated++;
            studentModified = true;
          }
        }

        if (studentModified) {
          console.log(`[migrateEndDate] ✅ Student ${student._id} updated`);
        }
      } catch (err: any) {
        console.error(`[migrateEndDate] ❌ Error for student ${student._id}:`, err.message);
        totalErrors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration complete",
      stats: {
        studentsProcessed: students.length,
        entriesUpdated: totalUpdated,
        entriesSkipped: totalSkipped,
        errors: totalErrors,
      },
    });
  } catch (error: any) {
    console.error("[migrateEndDate] Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}