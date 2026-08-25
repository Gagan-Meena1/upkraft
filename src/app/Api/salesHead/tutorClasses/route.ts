import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import courseName from "@/models/courseName";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";

await connect();

// ─── Types ──────────────────────────────────────────────────────────────────

interface MonthlyCount {
  month: string;   // "2026-08"
  label: string;   // "Aug 2026"
  count: number;
}

interface TutorResult {
  _id: string;
  username: string;
  totalClasses: number;
  monthlyClasses: MonthlyCount[];
  totalRevenue: number;
  totalPackageClasses: number;
  studentCount: number;
  pricePerClass: number;
  pricePerClassPerStudent: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08" → "Aug 2026" */
function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

/** Given a Date, return "YYYY-MM" */
function toMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Check a student's attendance status for a specific class.
 * Returns the status string or "not_marked" when no record exists.
 */
function getAttendanceStatus(
  student: { attendance?: { classId: any; status: string }[] },
  classIdStr: string
): string {
  if (!student.attendance || student.attendance.length === 0) return "not_marked";
  const rec = student.attendance.find(
    (a) => a.classId?.toString() === classIdStr
  );
  return rec ? rec.status : "not_marked";
}

function isCanceledStatus(status: string): boolean {
  return status === "canceled" || status === "cancelled";
}

// ─── Route handler ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const decoded = jwt.decode(token);
    const userId =
      decoded && typeof decoded === "object" && "id" in decoded
        ? decoded.id
        : null;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ── 1. Parallel bulk fetches ──────────────────────────────────────────

    const [allTutors, allStudents] = await Promise.all([
      User.find({ category: "Tutor" })
        .select("_id username courses")
        .lean(),
      User.find({ category: "Student" })
        .select("_id courses classes attendance creditsPerCourse")
        .lean(),
    ]);

    // Collect every course ID referenced by any tutor
    const allCourseIdSet = new Set<string>();
    for (const tutor of allTutors) {
      for (const cid of tutor.courses || []) {
        allCourseIdSet.add(cid.toString());
      }
    }
    const allCourseIds = [...allCourseIdSet];

    // Fetch courses (only the ones tutors reference)
    const allCourses = await courseName
      .find({ _id: { $in: allCourseIds } })
      .select("_id class title category")
      .lean();

    // courseId → class ID[]  map
    const courseClassIdsMap = new Map<string, string[]>();
    const allClassIdSet = new Set<string>();
    for (const course of allCourses) {
      const classIds = (course.class || []).map((c: any) => c.toString());
      courseClassIdsMap.set(course._id.toString(), classIds);
      classIds.forEach((id: string) => allClassIdSet.add(id));
    }

    // ── Class status/date resolution (two narrow, DB-filtered queries) ────
    const now = new Date();

    // Past, non-canceled classes only — "this class genuinely happened
    // globally." Used for both classes-count and pricing.
    const validClasses = await Class.find({
      _id: { $in: [...allClassIdSet] },
      status: { $nin: ["canceled", "cancelled"] },
      startTime: { $lt: now },
    })
      .select("_id startTime")
      .lean();

    const classStartMap = new Map<string, Date>();
    for (const cls of validClasses) {
      classStartMap.set(cls._id.toString(), cls.startTime);
    }

    // Just the IDs of globally canceled classes — used to exclude them
    // from package/pricing counts regardless of date.
    const canceledClassDocs = await Class.find({
      _id: { $in: [...allClassIdSet] },
      status: { $in: ["canceled", "cancelled"] },
    })
      .select("_id")
      .lean();

    const canceledClassIds = new Set<string>(
      canceledClassDocs.map((c) => c._id.toString())
    );

    // ── 2. Index students ─────────────────────────────────────────────────

    // courseId → student[]  (quick lookup)
    const studentsByCourse = new Map<string, any[]>();
    for (const stu of allStudents) {
      const stuCourses = (stu.courses || []).map((c: any) => c.toString());
      for (const cid of stuCourses) {
        if (!studentsByCourse.has(cid)) studentsByCourse.set(cid, []);
        studentsByCourse.get(cid)!.push(stu);
      }
    }

    // ── 3. Per-tutor computation ──────────────────────────────────────────

    const results: TutorResult[] = [];

    for (const tutor of allTutors) {
      const tutorId = tutor._id.toString();
      const tutorCourseIds = (tutor.courses || []).map((c: any) => c.toString());

      if (tutorCourseIds.length === 0) {
        results.push({
          _id: tutorId,
          username: tutor.username,
          totalClasses: 0,
          monthlyClasses: [],
          totalRevenue: 0,
          totalPackageClasses: 0,
          studentCount: 0,
          pricePerClass: 0,
          pricePerClassPerStudent: 0,
        });
        continue;
      }

      // Union of all class IDs across this tutor's courses
      const tutorClassIdSet = new Set<string>();
      for (const cid of tutorCourseIds) {
        const classIds = courseClassIdsMap.get(cid);
        if (classIds) classIds.forEach((id) => tutorClassIdSet.add(id));
      }

      // ══════════════════════════════════════════════════════════════════
      // SECTION A — Classes count
      // A class counts if it's matched to at least one student, it's
      // globally valid (past + not canceled), and NOT every matched
      // student has a canceled attendance status for it.
      // ══════════════════════════════════════════════════════════════════
      const classNonCanceled = new Set<string>();
      const processedForClasses = new Set<string>();

      for (const cid of tutorCourseIds) {
        const students = studentsByCourse.get(cid);
        if (!students) continue;

        for (const stu of students) {
          const stuId = stu._id.toString();
          if (processedForClasses.has(stuId)) continue;
          processedForClasses.add(stuId);

          const stuClassSet = new Set(
            (stu.classes || []).map((c: any) => c.toString())
          );

          for (const classId of tutorClassIdSet) {
            if (!stuClassSet.has(classId)) continue;    // must be matched to this student
            if (!classStartMap.has(classId)) continue;  // must be past + not globally canceled

            const attStatus = getAttendanceStatus(stu, classId);
            if (!isCanceledStatus(attStatus)) {
              classNonCanceled.add(classId);
            }
          }
        }
      }

      const verifiedClassIds = classNonCanceled;

      // Group verified classes by month
      const monthCounts = new Map<string, number>();
      for (const classId of verifiedClassIds) {
        const startTime = classStartMap.get(classId)!;
        const key = toMonthKey(new Date(startTime));
        monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
      }
      const monthlyClasses: MonthlyCount[] = [...monthCounts.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, count]) => ({
          month,
          label: monthLabel(month),
          count,
        }));

      // ══════════════════════════════════════════════════════════════════
      // SECTION B — Price / class / student (weighted, aggregate-then-divide)
      // A package's class counts toward the denominator only if it's not
      // globally canceled AND this specific student's own attendance for
      // it isn't canceled. Revenue and class counts are summed across all
      // students, then divided once at the end.
      // ══════════════════════════════════════════════════════════════════
      let tutorRevenue = 0;
      let tutorPackageClasses = 0;
      const revenueStudentIds = new Set<string>();
      const processedForPricing = new Set<string>();

      for (const cid of tutorCourseIds) {
        const students = studentsByCourse.get(cid);
        if (!students) continue;

        for (const stu of students) {
          const stuId = stu._id.toString();
          if (processedForPricing.has(stuId)) continue;
          processedForPricing.add(stuId);

          const stuCourseIds = new Set(
            (stu.courses || []).map((c: any) => c.toString())
          );
          let studentHasPricingData = false;

          // Check every course this student shares with this tutor
          for (const tcid of tutorCourseIds) {
            if (!stuCourseIds.has(tcid)) continue;
            const courseEntry = (stu.creditsPerCourse || []).find(
              (cpc: any) => cpc.courseId?.toString() === tcid
            );
            if (!courseEntry) continue;
            studentHasPricingData = true;

            for (const pkg of courseEntry.startTime || []) {
              if (pkg.show === false) continue; // skip removed/hidden packages
              tutorRevenue += pkg.amount || 0;

              for (const clsId of pkg.classIds || []) {
                const clsIdStr = clsId.toString();

                // Skip if globally canceled
                if (canceledClassIds.has(clsIdStr)) continue;
                // Skip if THIS student's own attendance for it is canceled
                const attStatus = getAttendanceStatus(stu, clsIdStr);
                if (isCanceledStatus(attStatus)) continue;

                tutorPackageClasses += 1;
              }
            }
          }

          if (studentHasPricingData) revenueStudentIds.add(stuId);
        }
      }

      const pricePerClass = tutorPackageClasses > 0 ? tutorRevenue / tutorPackageClasses : 0;
      const studentCount = revenueStudentIds.size;
      const pricePerClassPerStudent = studentCount > 0 ? pricePerClass / studentCount : 0;

      results.push({
        _id: tutorId,
        username: tutor.username,
        totalClasses: verifiedClassIds.size,
        monthlyClasses,
        totalRevenue: tutorRevenue,
        totalPackageClasses: tutorPackageClasses,
        studentCount,
        pricePerClass: parseFloat(pricePerClass.toFixed(2)),
        pricePerClassPerStudent: parseFloat(pricePerClassPerStudent.toFixed(2)),
      });
    }

    // Sort tutors by name
    results.sort((a, b) => a.username.localeCompare(b.username));

    return NextResponse.json({ success: true, tutors: results });
  } catch (error: any) {
    console.error("Error in tutorClasses API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}