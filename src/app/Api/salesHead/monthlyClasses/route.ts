// /Api/salesHead/monthlyClasses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";

await connect();

interface ClassDetail {
    classId: string;
    startTime: string;
    courseName: string;
    tutorName: string;
    tutorEmail: string;
    studentName: string;
    attendanceStatus: string;
}

interface MonthlyCount {
    month: string;
    label: string;
    count: number;
    classes: ClassDetail[];
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// the real data. Every class under any course these tutors teach is excluded.
const EXCLUDED_TUTOR_IDS = new Set<string>([
    "685a89686d200c28041c6d4c",
    "682c1039fc93ce1442bb6a40",
    "68ff42d78e4a0dbf08a5dcc4",
    "6903b5ee069de7ee67c56c91",
    "6908ed18b24005ca72d15577",
    "693aac7279d69c8147e67564",
    "692f200a1c1d025e3507548f",
    "694a44bce93fe5e771d7f8f9",
    "694a4ab59f06fdd65f0aca6f",
    "692840c363a4bda16a8d0708",
    "69293d643cc4c335fa2f7cba",
    "6985d6fc0c5fdc2990344753",
    "6a64de5a669d3a19974c1bcb",
    "6a6d029c565939e896f7ac94",
    "690cd76723b078f7ad8cceb4",
    "68c82be760b116ca93b42a5f",
    "68ece15d152756811c9dfd03",
    "690d1eb650f7abf0a869bcc9",
    "690f6d829531ed69785fce27", "68df833a979c5977fdf5ddf4", "690c8aba6c16d8688e21efdc",
    "68c8289860b116ca93b42a33", "68d3793913a2ff977dbfcd85", "68d4a146871c9bc1a14d183f", "68de7e7e18c1fee566d0b5de", "68e66ad8aa59022e0277025b", "68faf97088256666df5ee86c", "68cc42520a4205a03405232b", "68f9b0b98f3be7a40f63c394", "690c9bb856ccb03045761cd6", "690cd76723b078f7ad8cceb4", "68d3797413a2ff977dbfcd8f", "68e7ed36e19c8df0eb76e80f", "690c4d0393ff1a4514ce7a25", "68d378cf13a2ff977dbfcd77", "68d851addfe106de56aeacd4", "68db7c51dd91ec55c7145c43",
    "68dfda3cc06d70152f6d49c6", "68e0dfe1d9c4c117f53a4eb3", "68e360e39898c29d954538f8",
    "68e668b842f77adcca6a7f46", "6901b0b786d0f8b34747fd26", "690cb9f424ffce2abe5033c9",
    "682f74aaab7916ac27603943", "68cec9bd24cbb5bfa3721e3b", "68d509d814a97fa51c292fa3",
    "68e662fa8ed0a5a9efb405bb", "68fafb14a8b8795da794b80b", "6908d294d5803c7bda6554dc",
    "685a89686d200c28041c6d4c", "68d5297307230030a1fa9f3f", "68dfdc506fa4b6e8fae5f4c7",
    "68f2545516af6dcf91852433", "68fa1bd77097efc855fa48e2", "69036de604ab202b5c1a6a0d",
    "690cb405edd0b182bad3c8ae", "68d8d9cd3cda3a08cbd97c73", "69005c5cd1ee5a6cd7bce191",
    "690c9e5019511dd90e0b2963", "690ce0399570845bb0e563a9", "690e159960041e6207e462f7", "68d0e4d114df83a34cb7afab", "68ff211cbb2bf76d03fe69f3", "68ff42d78e4a0dbf08a5dcc4", "690c395f3df775ecf256971a", "690c8a236c16d8688e21ec9e", "68c11972329415ef857c609d", "68c79b366182ec58bc609007", "68d224279e81c57b2048487b", "68d268024eb6f6f52f4e3f5d", "68d379fc13a2ff977dbfcda3", "68f88fdd7ad9734aa71231b7", "6903b5ee069de7ee67c56c91", "690cd6789f1b54a12bfe211b", "682c1039fc93ce1442bb6a40", "68cbcb56c06d7da78a003cc4", "68e64489a47716f5c2edc8a4", "68ecdcd57e41dac0ace36a95", "68f34064c66a67acc602380d", "67f125828e946f26bd0357b0", "68c8ee055601192f18db1f45", "68d379b613a2ff977dbfcd99", "68dc09f0f1656df2a30fe6b4", "6901dcf632ada6ad0b3d8938", "69088009741f50753261f0fa", "68708a290a44626446647e51", "68cae4ed763d8609e0443355", "68d508d114a97fa51c292f99", "68dd07b2c66cdc42f0ed4cab", "69006533f88c6fc2247e8d3b", "68ceca1a24cbb5bfa3721e49", "68db7d82dd91ec55c7145dc1", "68ff47692ea3de1d2eb1cbf1", "6908ed18b24005ca72d15577", "68c938131a7af63e904fe329", "68e50bdbfb62c37dfd0777d5", "68edf6f73b0f6725f01795bb", "690bfb7f62cb12dbe5712c45", "69145abf91b08a2c2fa925a6", "692e88f4f07cbb6e4ea87607", "691ff485093a49531987c26e", "693aac7279d69c8147e67564", "6911d494927e87672388d987", "691d4f827cc6787da4c54171", "6932b1a043885dfdd21d5d85", "6916f7e1de8a7c0222eae09e", "691dd1f4834d7c8ac930fa52", "692f200a1c1d025e3507548f", "693a7c3ef766f4f8868a55ac", "694a44bce93fe5e771d7f8f9", "694a4ab59f06fdd65f0aca6f", "694e965fee1d0cea7fa5b0fd", "692d9b8e9fb4a4ac261ca32b", "691dd83580a5ca80b311259a", "692840c363a4bda16a8d0708", "69293d643cc4c335fa2f7cba", "69579edb8e65285f24184776", "6958dbc9cf6726f7533bc7a2", "69590ca2a9eab50b0e85ae36", "6965d3c70d9ea108f263767f", "6985d6fc0c5fdc2990344753", "698701e2bd4a260eb3748d06", "69abbe94614f5e45708ac378", "69db507d1926f0e647f7788e", "69ef0b412c6a42c8e7717b38", "69f96a3eafe83983b04cd85f", "6a18417cb5f1f67e0cc8e68f", "6a64de5a669d3a19974c1bcb", "6a6a38a1b64c403f38ccbb44", "6a6d029c565939e896f7ac94", "6a6d7b5fce52eaf6aed0efd1"
]);

// Add this set near EXCLUDED_TUTOR_IDS
const EXCLUDED_STUDENT_IDS = new Set<string>([
    "694a678f5d6d626e20d56ce6",
    // add more here as needed
]);

function monthLabel(key: string): string {
    const [year, month] = key.split("-");
    return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function toMonthKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function toIST(d: Date): string {
    return new Date(d.getTime() + 5.5 * 60 * 60 * 1000)
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

        const decoded = jwt.decode(token);
        const userId = decoded && typeof decoded === "object" && "id" in decoded ? decoded.id : null;
        if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        // 1. Excluded tutor courses → excluded class IDs (same logic as before)
        const excludedTutors = await User.find({
            _id: { $in: [...EXCLUDED_TUTOR_IDS] },
            category: "Tutor",
        }).select("_id courses").lean();

        const excludedCourseIds = new Set<string>();
        for (const tutor of excludedTutors) {
            for (const cid of tutor.courses || []) excludedCourseIds.add(cid.toString());
        }

        const excludedClassIds = new Set<string>();
        if (excludedCourseIds.size > 0) {
            const courseName = (await import("@/models/courseName")).default;
            const excludedCourses = await courseName
                .find({ _id: { $in: [...excludedCourseIds] } })
                .select("_id class").lean();
            for (const course of excludedCourses) {
                for (const clsId of course.class || []) excludedClassIds.add(clsId.toString());
            }
        }

        // 2. Pull students with attendance + basic info
        // 2. Pull students with attendance + basic info + their classes array
        const allStudents = await User.find({ category: "Student" })
            .select("_id username attendance classes")
            .lean();

        // 3. Collect attendance records with student info
        interface AttRecord {
            classId: string;
            studentName: string;
            attendanceStatus: string;
        }
        const attendanceRecords: AttRecord[] = [];
        const referencedClassIdSet = new Set<string>();

        for (const stu of allStudents) {
            // Build a lookup of this student's own classes array
            if (EXCLUDED_STUDENT_IDS.has(stu._id.toString())) continue; // ← add this line

            const stuClassSet = new Set(
                (stu.classes || []).map((c: any) => c.toString())
            );

            for (const att of stu.attendance || []) {
                if (!att.classId) continue;
                const classIdStr = att.classId.toString();
                if (excludedClassIds.has(classIdStr)) continue;
                if (!stuClassSet.has(classIdStr)) continue; // must also be in this student's own classes array
                if (att.status === "present" || att.status === "absent") {
                    attendanceRecords.push({
                        classId: classIdStr,
                        studentName: stu.username || "Unknown",
                        attendanceStatus: att.status,
                    });
                    referencedClassIdSet.add(classIdStr);
                }
            }
        }

        // 4. Fetch class docs — now with course + instructor too
        const classDocs = await Class.find({ _id: { $in: [...referencedClassIdSet] } })
            .select("_id startTime course instructor")
            .lean();

        const classMap = new Map<string, { startTime: Date; courseId: string; instructorId: string }>();
        const courseIdSet = new Set<string>();
        const instructorIdSet = new Set<string>();

        for (const cls of classDocs) {
            const cId = cls.course?.toString() || "";
            const iId = cls.instructor?.toString() || "";
            classMap.set(cls._id.toString(), {
                startTime: cls.startTime,
                courseId: cId,
                instructorId: iId,
            });
            if (cId) courseIdSet.add(cId);
            if (iId) instructorIdSet.add(iId);
        }

        // 5. Fetch course names
        const courseName = (await import("@/models/courseName")).default;
        const courseDocs = await courseName
            .find({ _id: { $in: [...courseIdSet] } })
            .select("_id title").lean();
        const courseMap = new Map<string, string>();
        for (const c of courseDocs) courseMap.set(c._id.toString(), c.title || "Unknown");

        // 6. Fetch tutor names
        const tutorDocs = await User.find({ _id: { $in: [...instructorIdSet] } })
            .select("_id username email").lean();
        const tutorMap = new Map<string, { name: string; email: string }>();
        for (const t of tutorDocs) {
            tutorMap.set(t._id.toString(), { name: t.username || "Unknown", email: t.email || "" });
        }

        // 7. Group by month — with full class detail
        const monthMap = new Map<string, { count: number; classes: ClassDetail[] }>();
        let totalClasses = 0;

        for (const record of attendanceRecords) {
            const cls = classMap.get(record.classId);
            if (!cls?.startTime) continue;

            const key = toMonthKey(new Date(cls.startTime));
            const tutor = tutorMap.get(cls.instructorId);
            const detail: ClassDetail = {
                classId: record.classId,
                startTime: toIST(new Date(cls.startTime)),
                courseName: courseMap.get(cls.courseId) || "Unknown",
                tutorName: tutor?.name || "Unknown",
                tutorEmail: tutor?.email || "",
                studentName: record.studentName,
                attendanceStatus: record.attendanceStatus,
            };

            const existing = monthMap.get(key);
            if (existing) {
                existing.count++;
                existing.classes.push(detail);
            } else {
                monthMap.set(key, { count: 1, classes: [detail] });
            }
            totalClasses++;
        }

        const monthlyClasses: MonthlyCount[] = [...monthMap.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, { count, classes }]) => ({
                month,
                label: monthLabel(month),
                count,
                classes,
            }));

        return NextResponse.json({ success: true, totalClasses, monthlyClasses });
    } catch (error: any) {
        console.error("Error in monthlyClasses API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}