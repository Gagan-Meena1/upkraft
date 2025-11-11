// app/Api/assignment/route.js (modify your existing endpoint)
import { NextResponse } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Assignment from "@/models/assignment";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    // If assignmentId is provided, return single assignment details
    if (assignmentId) {
      // Validate assignment ID
      if (!assignmentId) {
        return NextResponse.json(
          { success: false, message: "Assignment ID is required" },
          { status: 400 }
        );
      }

      // Find assignment by ID and populate related data
      const assignment = await Assignment.findById(assignmentId)
        .populate({
          path: "classId",
          select: "title description startTime endTime",
        })
        .populate({
          path: "courseId",
          select: "title category",
        })
        .populate({
          path: "userId",
          select: "username email category",
        })
        .populate({
          path: "submissions.studentId",
          select: "username email",
        })
        .lean();

      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Assignment not found" },
          { status: 404 }
        );
      }

      // Transform the data to match your frontend interface
      const transformedAssignment = {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        status: assignment.status || false,
        currentAssignmentStatus:
          assignment.currentAssignmentStatus || "PENDING",
        tutorRemarks: assignment.tutorRemarks || "",
        studentSubmissionMessage: assignment.studentSubmissionMessage || "",
        fileUrl: assignment.fileUrl,
        fileName: assignment.fileName,
        songName: assignment.songName,
        practiceStudio: assignment.practiceStudio,
        speed: assignment.speed,
        metronome: assignment.metronome,
        createdAt: assignment.createdAt,
        class: {
          _id: assignment.classId?._id || "",
          title: assignment.classId?.title || "",
          description: assignment.classId?.description || "",
          startTime: assignment.classId?.startTime || "",
          endTime: assignment.classId?.endTime || "",
        },
        course: {
          _id: assignment.courseId?._id || "",
          title: assignment.courseId?.title || "",
          category: assignment.courseId?.category || "",
        },
        assignedStudents:
          assignment.userId
            ?.filter((user) => user.category !== "Tutor")
            .map((user) => {
              // Find this student's submission for this assignment
              const studentSubmission = assignment.submissions?.find(
                (sub) =>
                  sub.studentId?._id?.toString() === user._id.toString() ||
                  sub.studentId?.toString() === user._id.toString()
              );

              return {
                userId: user._id,
                username: user.username,
                email: user.email,
                submissionStatus: studentSubmission?.status || "PENDING",
                submissionMessage:
                  studentSubmission?.message ||
                  studentSubmission?.submissionMessage ||
                  "",
                submissionFileUrl: studentSubmission?.fileUrl || "",
                submissionFileName: studentSubmission?.fileName || "",
                tutorRemarks: studentSubmission?.tutorRemarks || "",
                submittedAt: studentSubmission?.submittedAt || null,
              };
            }) || [],
        totalAssignedStudents:
          assignment.userId?.filter((user) => user.category !== "Tutor")
            .length || 0,
        submissions: assignment.submissions || [], // Include raw submissions for debugging
      };

      console.log("Assignment submissions:", assignment.submissions);
      console.log("Transformed Assignment:", transformedAssignment);

      return NextResponse.json({
        success: true,
        message: "Assignment details fetched successfully",
        data: transformedAssignment,
      });
    }

    // If no assignmentId, return all assignments (your existing logic)
    // ... your existing code for fetching all assignments
  } catch (error) {
    console.error("Error fetching assignment details:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid assignment ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get user ID from token
    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const userId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User authentication required" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle JSON requests (for tutor actions)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { studentId, action, tutorRemarks } = body;

      if (!studentId || !["APPROVED", "CORRECTION"].includes(action)) {
        return NextResponse.json(
          { success: false, message: "Invalid tutor action data" },
          { status: 400 }
        );
      }

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Assignment not found" },
          { status: 404 }
        );
      }

      // Find and update the specific student's submission
      const submissionIndex = assignment.submissions.findIndex(
        (sub) => sub.studentId.toString() === studentId
      );

      if (submissionIndex === -1) {
        return NextResponse.json(
          { success: false, message: "Submission not found for this student" },
          { status: 404 }
        );
      }

      assignment.submissions[submissionIndex].status = action;
      if (tutorRemarks) {
        assignment.submissions[submissionIndex].tutorRemarks = tutorRemarks;
      }

      await assignment.save();

      return NextResponse.json({
        success: true,
        message: `Submission ${action.toLowerCase()} successfully`,
        data: assignment,
      });
    }

    // Handle FormData or JSON for student submissions
    let submissionMessage, submissionFile;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      submissionMessage =
        formData.get("submissionMessage") || formData.get("message");
      submissionFile = formData.get("submissionFile") || formData.get("file");
    } else {
      // Handle JSON
      const body = await request.json();
      submissionMessage =
        body.submissionMessage || body.message || body.studentSubmissionMessage;
      // File won't be available in JSON, that's okay
    }

    if (!submissionMessage || !submissionMessage.toString().trim()) {
      return NextResponse.json(
        { success: false, message: "Submission message is required" },
        { status: 400 }
      );
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Handle file upload if present
    let fileData = {};
    if (
      submissionFile &&
      submissionFile instanceof File &&
      submissionFile.size > 0
    ) {
      try {
        const fileBuffer = Buffer.from(await submissionFile.arrayBuffer());

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "raw",
                folder: "assignment-submissions",
                public_id: `${Date.now()}-${submissionFile.name.split(".")[0]}`,
                use_filename: true,
                unique_filename: false,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(fileBuffer);
        });

        fileData = {
          fileUrl: uploadResult.secure_url,
          fileName: submissionFile.name,
        };
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "File upload failed" },
          { status: 500 }
        );
      }
    }

    // Check if student already has a submission
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.studentId.toString() === userId
    );

    const submissionData = {
      studentId: userId,
      studentMessage: submissionMessage.toString(),
      status: "SUBMITTED",
      submittedAt: new Date(),
      ...fileData,
    };

    if (existingSubmissionIndex >= 0) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex] = {
        ...assignment.submissions[existingSubmissionIndex].toObject(),
        ...submissionData,
      };
    } else {
      // Add new submission
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
