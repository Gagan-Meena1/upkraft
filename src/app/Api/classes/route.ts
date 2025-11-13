// src/app/Api/classes/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConnection/dbConfic";
import Class from "@/models/Class";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { log } from "console";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";
import User from "@/models/userModel";
// import { getServerSession } from 'next-auth/next'; // If using next-auth

await connect();

export async function POST(request: NextRequest) {
  try {
    console.log("1111111111111111111111111111111111111111111111111111111111111111111");

    const referer = request.headers.get("referer");
    console.log("Full Referer:", referer);

    // Parse the courseId from the Referer URL
    let courseId: string | null = null;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        // 1) Try query param first
        courseId = refererUrl.searchParams.get("courseId");
        console.log("Extracted CourseId (query):", courseId);

        // 2) Fallback: extract from pathname /tutor/courses/:courseId
        if (!courseId) {
          const match = refererUrl.pathname.match(/\/tutor\/courses\/([^/]+)/);
          if (match?.[1]) {
            courseId = match[1];
            console.log("Extracted CourseId (pathname):", courseId);
          }
        }
      } catch (error) {
        console.error("Error parsing Referer URL:", error);
      }
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Parse the FormData
    const formData = await request.formData();

    // 3) Final fallback: read from formData
    if (!courseId) {
      courseId = 
        (formData.get("courseId") as string) || 
        (formData.get("course") as string) || 
        null;
      console.log("Extracted CourseId (formData):", courseId);
    }

    // Validate courseId (after all fallbacks)
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const timezone = formData.get("timezone") as string; // Get timezone from frontend

    console.log("Received data:", {
      title,
      description,
      date,
      startTime,
      endTime,
      timezone,
    });

    // DIRECT UTC CONVERSION (same as PUT route)
    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Create UTC dates directly from the form values (no timezone conversion)
    const startDateTime = new Date(Date.UTC(year, month - 1, day, startHour, startMinute, 0));
    const endDateTime = new Date(Date.UTC(year, month - 1, day, endHour, endMinute, 0));

    console.log("POST - Storing UTC times:", {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    // Handle video upload
    let videoPath = null;
    const videoFile = formData.get("video") as File | null;

    if (videoFile && videoFile.size > 0) {
      const originalFilename = videoFile.name;
      const newFilename = `${Date.now()}-${originalFilename}`;
      const newPath = path.join(uploadDir, newFilename);

      // Convert file to ArrayBuffer, then Buffer
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file to disk
      await writeFile(newPath, buffer);

      // Store the relative path in the database
      videoPath = `/uploads/${newFilename}`;
    }

    // Create a new Class document
    console.log("222222222222222222222222222222222222222222222222222");

    const newClass = new Class({
      title,
      description,
      course: courseId,
      startTime: startDateTime,
      endTime: endDateTime,
      instructor: instructorId,
      recording: videoPath,
      recordingProcessed: videoPath ? 0 : null,
    });

    const savednewClass = await newClass.save();
    console.log("333333333333333333333333333333333333333333333333333333333333");
    console.log("Saved class:", savednewClass);

    const course = await courseName.findById(courseId);
    await courseName.findByIdAndUpdate(courseId, {
      $addToSet: { class: savednewClass._id },
    });

    // Update users enrolled in this course
    await User.updateMany(
      { courses: courseId },
      { $addToSet: { classes: savednewClass._id } }
    );

    console.log(newClass);

    return NextResponse.json(
      {
        message: "Session created successfully",
        classData: newClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching classes data...");

    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    let instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    // Check for userid query parameter
    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get("userid");

    // If userid query param exists, use it as the student ID
    if (userIdFromQuery) {
      instructorId = userIdFromQuery;
      console.log("Using userid from query param:", userIdFromQuery);
    }

    console.log("decodedToken : ", decodedToken);
    console.log("Final instructorId : ", instructorId);

    if (!instructorId) {
      return NextResponse.json(
        {
          message: "User ID not found",
          error: "No user ID provided",
        },
        { status: 400 }
      );
    }

    // Find the user and populate the classes array with actual class details
    const user = await User.findById(instructorId).populate({
      path: "classes",
      model: "Class", // Make sure this matches your Class model name
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
          error: "No user found with the provided ID",
        },
        { status: 404 }
      );
    }

    // Get the populated class data
    const classData = user.classes || [];

    console.log("Found classes:", classData.length);

    return NextResponse.json(
      {
        message: "Classes fetched successfully",
        classData: classData,
        totalClasses: classData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime, timezone } = body;

    console.log("PUT - Received data:", { date, startTime, endTime, timezone });

    // DIRECT UTC CONVERSION (no double conversion)
    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Create UTC dates directly from the form values
    const startDateTime = new Date(Date.UTC(year, month - 1, day, startHour, startMinute, 0));
    const endDateTime = new Date(Date.UTC(year, month - 1, day, endHour, endMinute, 0));

    console.log("PUT - Storing UTC times:", {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
      },
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Class updated successfully",
      classData: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE - Delete existing class
export async function DELETE(request: NextRequest) {
  try {
    console.log("Deleting class...");

    // Get classId from query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Get instructor ID from token
    const token = request.cookies.get("token")?.value;
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId =
      decodedToken && typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!instructorId) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Find the class and verify ownership
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    console.log("Found class to delete:", existingClass);

    // Remove class reference from course
    if (existingClass.course) {
      await courseName.findByIdAndUpdate(existingClass.course, {
        $pull: { class: classId },
      });
      console.log("Removed class reference from course");
    }

    // Remove class reference from users
    await User.updateMany(
      { classes: classId },
      { $pull: { classes: classId } }
    );
    console.log("Removed class reference from users");

    // Delete the class
    await Class.findByIdAndDelete(classId);
    console.log("Class deleted successfully");

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
