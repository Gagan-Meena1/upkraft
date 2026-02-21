import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";

export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Get academy user from token
    const token = ((request.headers.get("referer")?.includes("/tutor") || request.headers.get("referer")?.includes("/Api/tutor")) && request.cookies.get("impersonate_token")?.value ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value);
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    
    if (!academyId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the user is an Academy
    const academy = await User.findById(academyId).lean();
    if (!academy || academy.category !== "Academic") {
      return NextResponse.json({ error: "Only academies can access this endpoint" }, { status: 403 });
    }

    const body = await request.json();
    const { payoutSettings, applyToAll, selectedTutorIds, tutorWithStudents } = body;

    if (!payoutSettings) {
      return NextResponse.json({ error: "Payout settings are required" }, { status: 400 });
    }

    // Validate payout settings
    const { commissionModel, commissionPercentage, payoutFrequency, minimumPayoutAmount } = payoutSettings;
    
    if (!commissionModel || commissionPercentage === undefined || !payoutFrequency || !minimumPayoutAmount) {
      return NextResponse.json({ error: "All payout settings fields are required" }, { status: 400 });
    }

    let tutorIds: string[] = [];
    let isStudentSpecific = false;
    let studentIds: string[] = [];

    if (applyToAll) {
      // Get all academy-created tutors
      const tutors = await User.find({
        category: "Tutor",
        academyId: academyId
      }).select("_id").lean();
      
      tutorIds = tutors.map(t => t._id.toString());
    } else if (tutorWithStudents) {
      // Apply to specific tutor for specific students
      if (!tutorWithStudents.tutorId || !tutorWithStudents.studentIds || tutorWithStudents.studentIds.length === 0) {
        return NextResponse.json({ error: "Tutor ID and student IDs are required" }, { status: 400 });
      }
      tutorIds = [tutorWithStudents.tutorId];
      studentIds = tutorWithStudents.studentIds;
      isStudentSpecific = true;
    } else {
      // Use selected tutor IDs
      if (!selectedTutorIds || !Array.isArray(selectedTutorIds) || selectedTutorIds.length === 0) {
        return NextResponse.json({ error: "Selected tutor IDs are required when not applying to all" }, { status: 400 });
      }
      tutorIds = selectedTutorIds;
    }

    if (tutorIds.length === 0) {
      return NextResponse.json({ error: "No tutors found to apply settings to" }, { status: 400 });
    }

    // Get the native MongoDB collection
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    const usersCollection = db.collection('users');
    
    let updatedCount = 0;
    
    if (isStudentSpecific) {
      // Handle student-specific payout settings
      const tutorId = tutorIds[0];
      console.log(`Applying student-specific payout settings for tutor ${tutorId} and students:`, studentIds);
      
      // Prepare the payout settings object with student information
      const payoutSettingsObj = {
        commissionModel: String(commissionModel),
        commissionPercentage: parseInt(commissionPercentage.toString(), 10),
        payoutFrequency: String(payoutFrequency),
        minimumPayoutAmount: String(minimumPayoutAmount),
        updatedAt: new Date()
      };
      
      // Get current tutor payout settings
      const objectId = new mongoose.default.Types.ObjectId(tutorId);
      const tutor = await usersCollection.findOne(
        { _id: objectId },
        { projection: { tutorPayoutSettings: 1, studentSpecificPayoutSettings: 1 } }
      );
      
      // Create or update student-specific payout settings
      const studentSpecificSettings = tutor?.studentSpecificPayoutSettings || {};
      
      // Add settings for each student
      for (const studentId of studentIds) {
        studentSpecificSettings[studentId] = payoutSettingsObj;
      }
      
      // Update tutor with student-specific settings
      const updateResult = await usersCollection.updateOne(
        { _id: objectId },
        { $set: { studentSpecificPayoutSettings: studentSpecificSettings } }
      );
      
      if (updateResult.modifiedCount > 0 || updateResult.matchedCount > 0) {
        updatedCount = 1;
        console.log(`Updated student-specific payout settings for tutor ${tutorId}`);
      }
    } else {
      // Handle regular payout settings (apply to all students of selected tutors)
      const payoutSettingsObj = {
        commissionModel: String(commissionModel),
        commissionPercentage: parseInt(commissionPercentage.toString(), 10),
        payoutFrequency: String(payoutFrequency),
        minimumPayoutAmount: String(minimumPayoutAmount),
        updatedAt: new Date()
      };

      console.log('Saving payout settings:', JSON.stringify(payoutSettingsObj, null, 2));
      console.log('Tutor IDs to update:', tutorIds);
      
      // Update each tutor using native MongoDB update
      for (const tutorId of tutorIds) {
        try {
          console.log(`Updating tutor ${tutorId} using native MongoDB`);
          
          // Convert string ID to ObjectId
          const objectId = new mongoose.default.Types.ObjectId(tutorId);
          
          // Use native MongoDB update
          const updateResult = await usersCollection.updateOne(
            { _id: objectId },
            { $set: { tutorPayoutSettings: payoutSettingsObj } }
          );
          
          console.log(`Tutor ${tutorId} - Native MongoDB update result:`, {
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount,
            acknowledged: updateResult.acknowledged
          });
          
          if (updateResult.modifiedCount > 0 || updateResult.matchedCount > 0) {
            updatedCount++;
            
            // Verify using native MongoDB find
            const verifyDoc = await usersCollection.findOne(
              { _id: objectId },
              { projection: { tutorPayoutSettings: 1 } }
            );
            
            console.log(`Tutor ${tutorId} - Verification (native MongoDB):`, verifyDoc?.tutorPayoutSettings);
          }
        } catch (error) {
          console.error(`Error updating tutor ${tutorId}:`, error);
        }
      }

      console.log(`Updated ${updatedCount} out of ${tutorIds.length} tutors`);
    }

    // Wait a moment to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the update using native MongoDB
    if (tutorIds.length > 0 && updatedCount > 0) {
      const mongoose = await import('mongoose');
      const db = mongoose.default.connection.db;
      const usersCollection = db.collection('users');
      const objectId = new mongoose.default.Types.ObjectId(tutorIds[0]);
      
      const verifyDoc = await usersCollection.findOne(
        { _id: objectId },
        { projection: { tutorPayoutSettings: 1 } }
      );
      
      console.log('Final Verification (native MongoDB) - Tutor payout settings:', verifyDoc?.tutorPayoutSettings);
      console.log('Final Verification - Full document:', JSON.stringify(verifyDoc, null, 2));
    }

    const message = isStudentSpecific 
      ? `Payout settings saved for ${studentIds.length} student(s) of selected tutor`
      : `Payout settings saved for ${updatedCount} tutor(s)`;
    
    return NextResponse.json({
      success: true,
      message: message,
      tutorsUpdated: updatedCount,
      studentsUpdated: isStudentSpecific ? studentIds.length : undefined
    });

  } catch (error: any) {
    console.error("Error saving tutor payout settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save tutor payout settings" },
      { status: 500 }
    );
  }
}

