// app/api/verifyingUser/route.ts
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { sendEmail } from "@/helper/mailer";
import { getDataFromToken } from "@/helper/getDataFromToken";

async function requireAdmin(request: NextRequest) {
  const callerId = getDataFromToken(request);
  if (!callerId) return { error: "Unauthorized", status: 401 };
  const caller = await User.findById(callerId).select("category");
  if (!caller || caller.category !== "Admin") return { error: "Forbidden", status: 403 };
  return null;
}

// GET - Fetch all Tutors separated by verification status
export async function GET(request: NextRequest) {
  try {
    await connect();
    const authError = await requireAdmin(request);
    if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });
    
    // Execute both queries in parallel for better performance
    const [verifiedTutors, unverifiedTutors] = await Promise.all([
      User.find({ 
        category: { $in: ["Tutor", "Admin", "Student", "Academic", "TeamLead", "Relationship Manager"] }, 
        isVerified: true 
      }),

      User.find({ 
        category: { $in: ["Tutor", "Admin", "Student", "Academic", "TeamLead", "Relationship Manager"] }, 
        isVerified: { $ne: true } 
      })
    ]);
console.log("Verified Tutors:", verifiedTutors.length);
console.log("Unverified Tutors:", unverifiedTutors.length);


    return NextResponse.json(
      { 
        message: "Tutors fetched successfully",
        data: {
          verifiedTutors,
          unverifiedTutors,
          totalTutors: verifiedTutors.length + unverifiedTutors.length,
          verifiedCount: verifiedTutors.length,
          unverifiedCount: unverifiedTutors.length
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Tutors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Approve a Tutor (set isVerified to true)
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const authError = await requireAdmin(request);
    if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

   

    user.isVerified = true;
    // sending email to the user for confirmation
    await sendEmail({
            email:user.email,
            emailType: "REQUEST_APPROVED",
            username:user.username,
            category:user.category,
          }); 

    await user.save();

    return NextResponse.json(
      { 
        message: `${user.category} approved successfully`,
        data: user
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving Tutor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Reject Tutor (delete from database)
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const authError = await requireAdmin(request);
    if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

  

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { 
        message: `${user.category} rejected and deleted successfully`,
        data: { deletedUserId: userId }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting Tutor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}