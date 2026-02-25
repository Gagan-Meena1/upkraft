import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get tutor user from token
    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    const tutorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!tutorId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get tutor with payout settings
    const tutor = await User.findById(tutorId)
      .select("tutorPayoutSettings studentSpecificPayoutSettings academyId category")
      .lean();

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    if (tutor.category !== "Tutor") {
      return NextResponse.json({ error: "Only tutors can access this endpoint" }, { status: 403 });
    }

    // Check if tutor is academy-created
    if (!tutor.academyId) {
      return NextResponse.json({ 
        success: true, 
        payoutSettings: null,
        message: "Payout settings are only available for academy-created tutors"
      });
    }

    console.log('GET /Api/tutor/payoutSettings - Tutor ID:', tutorId);
    console.log('GET /Api/tutor/payoutSettings - Raw tutor data:', JSON.stringify(tutor, null, 2));
    console.log('GET /Api/tutor/payoutSettings - tutorPayoutSettings:', tutor.tutorPayoutSettings);
    console.log('GET /Api/tutor/payoutSettings - Type of tutorPayoutSettings:', typeof tutor.tutorPayoutSettings);
    console.log('GET /Api/tutor/payoutSettings - Is tutorPayoutSettings null/undefined?', tutor.tutorPayoutSettings == null);

    // Return payout settings or default values
    let payoutSettings;
    if (tutor.tutorPayoutSettings && typeof tutor.tutorPayoutSettings === 'object') {
      payoutSettings = tutor.tutorPayoutSettings;
      console.log('GET /Api/tutor/payoutSettings - Using saved settings from DB');
    } else {
      payoutSettings = {
        commissionModel: 'Percentage of Course Fee',
        commissionPercentage: 70,
        payoutFrequency: 'Monthly',
        minimumPayoutAmount: '₹1,000'
      };
      console.log('GET /Api/tutor/payoutSettings - Using default settings (field not found in DB)');
    }

    console.log('GET /Api/tutor/payoutSettings - Returning:', payoutSettings);

    // Process student-specific payout settings if they exist
    let studentSpecificSettings = [];
    if (tutor.studentSpecificPayoutSettings && typeof tutor.studentSpecificPayoutSettings === 'object') {
      console.log('GET /Api/tutor/payoutSettings - Found student-specific settings');
      
      // Get student IDs that have custom settings
      const studentIds = Object.keys(tutor.studentSpecificPayoutSettings);
      
      if (studentIds.length > 0) {
        // Fetch student details
        const students = await User.find({
          _id: { $in: studentIds },
          category: "Student"
        })
        .select("_id username email")
        .lean();
        
        // Map student info with their payout settings
        studentSpecificSettings = students.map(student => ({
          studentId: student._id.toString(),
          studentName: student.username,
          studentEmail: student.email,
          payoutSettings: tutor.studentSpecificPayoutSettings![student._id.toString()]
        }));
      }
    }

    return NextResponse.json({
      success: true,
      payoutSettings,
      studentSpecificSettings
    });

  } catch (error: any) {
    console.error("Error fetching tutor payout settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payout settings" },
      { status: 500 }
    );
  }
}

