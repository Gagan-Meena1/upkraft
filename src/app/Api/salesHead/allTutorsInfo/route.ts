import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import Society from "@/models/society";
import Class from "@/models/Class";

await connect();

export async function GET(request: NextRequest) {
  try {
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || request.nextUrl?.pathname?.startsWith("/Api/tutor");
      return (isTutorContext && request.cookies.get("impersonate_token")?.value)
        ? request.cookies.get("impersonate_token")?.value
        : request.cookies.get("token")?.value;
    })();

    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decodedToken = jwt.decode(token);
    const userId = decodedToken && typeof decodedToken === "object" && "id" in decodedToken
      ? decodedToken.id : null;

    if (!userId) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const tutors = await User.find(
      { category: "Tutor" },
      { _id: 1, username: 1, email: 1, timezone: 1, demoSlotsAvailable: 1, profileImage: 1, societies: 1, classes: 1 }
    ).sort({ username: 1 });

    const tutorsFormatted = await Promise.all(
      tutors.map(async (tutor) => {
        // Collect ALL unique societyIds (from slots + tutor.societies)
        const slotSocietyIds = (tutor.demoSlotsAvailable || [])
          .flatMap((s) => (s.societyIds || []).map((id: any) => id.toString()))
          .filter(Boolean);

        const tutorSocietyIds = (tutor.societies || [])
          .map((s: any) => s.societyId?.toString())
          .filter(Boolean);

        const allSocietyIds = [...new Set([...slotSocietyIds, ...tutorSocietyIds])];

        const societies = await Society.find(
          { _id: { $in: allSocietyIds } },
          { _id: 1, name: 1, city: 1 }
        ).lean();

        const societyMap = Object.fromEntries(
          societies.map((s) => [s._id.toString(), s])
        );

        return {
          _id: tutor._id,
          username: tutor.username,
          email: tutor.email,
          timezone: tutor.timezone || "UTC",
          profileImage: tutor.profileImage,
          societies: (tutor.societies || []).map((s: any) => {
            const id = s.societyId?.toString() || "";
            const soc = societyMap[id];
            return {
              _id: id,
              name: soc?.name || "",
              city: soc?.city || "",
            };
          }),
          slotsAvailable: (tutor.demoSlotsAvailable || []).map((slot) => ({
            _id: slot._id?.toString(),
            startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : slot.startTime,
            endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : slot.endTime,
            societyIds: (slot.societyIds || []).map((id: any) => id.toString()),
            societyNames: (slot.societyIds || [])
              .map((id: any) => societyMap[id.toString()]?.name || null)
              .filter(Boolean),
            societyCities: (slot.societyIds || [])
              .map((id: any) => societyMap[id.toString()]?.city || null)
              .filter(Boolean),
          })),
          // Populate classes from class IDs
          classes: await (async () => {
            const classIds = tutor.classes || [];
            if (classIds.length === 0) return [];
            const classData = await Class.find(
              { _id: { $in: classIds } },
              { _id: 1, title: 1, description: 1, startTime: 1, endTime: 1, status: 1, classType: 1 }
            ).lean();
            return classData.map((c: any) => ({
              _id: c._id.toString(),
              title: c.title,
              description: c.description || "",
              startTime: c.startTime instanceof Date ? c.startTime.toISOString() : c.startTime,
              endTime: c.endTime instanceof Date ? c.endTime.toISOString() : c.endTime,
              status: c.status || "scheduled",
              classType: c.classType || "regular",
            }));
          })(),
        };
      })
    );

    return NextResponse.json({ success: true, tutors: tutorsFormatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}