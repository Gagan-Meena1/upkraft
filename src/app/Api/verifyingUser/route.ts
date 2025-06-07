// app/api/verifyingUser/route.ts
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import { sendEmail } from "@/helper/mailer";


// GET - Fetch all Tutors separated by verification status
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Execute both queries in parallel for better performance
    const [verifiedTutors, unverifiedTutors] = await Promise.all([
      User.find({ category: "Tutor", isVerified: true }),
      User.find({ category: "Tutor", isVerified: { $ne: true } })
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
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.category !== "Tutor") {
      return NextResponse.json({ error: "User is not a Tutor" }, { status: 400 });
    }

    user.isVerified = true;
    // sending email to the user for confirmation
    await sendEmail({
            email:user.email,
            emailType: "REQUEST_APPROVVED",
            username:user.username,
            category:user.category,
          }); 

    await user.save();

    return NextResponse.json(
      { 
        message: "Tutor approved successfully",
        data: user
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving Tutor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Reject a Tutor (delete from database)
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.category !== "Tutor") {
      return NextResponse.json({ error: "User is not a Tutor" }, { status: 400 });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      { 
        message: "Tutor rejected and deleted successfully",
        data: { deletedUserId: userId }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting Tutor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}