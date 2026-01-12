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
// ADD these imports
import * as dateFnsTz from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { sendEmail } from "@/helper/mailer";
// import { getServerSession } from 'next-auth/next'; // If using next-auth

await connect();

export async function POST(request: NextRequest) {
  try {
    console.log(
      "1111111111111111111111111111111111111111111111111111111111111111111"
    );
        console.log("date-fns-tz exports:", Object.keys(dateFnsTz));


    const referer = request.headers.get("referer");

    console.log("Full Referer:", referer);

    // Parse the courseId from the Referer URL
    let courseId = null;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        courseId = refererUrl.searchParams.get("courseId");

        console.log("Extracted CourseId:", courseId);
      } catch (error) {
        console.error("Error parsing Referer URL:", error);
      }
    }

    // NOTE: Do not validate courseId here yet — we may get it from formData below (copy requests)

     const uploadDir = path.join(process.cwd(), "public/uploads");

     // Ensure upload directory exists
     if (!existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
     }

     // Parse the FormData in App Router
     const formData = await request.formData();

     // Extract form fields
     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const date = formData.get("date") as string;
     const startTime = formData.get("startTime") as string;
     const endTime = formData.get("endTime") as string;
     const timezone = formData.get("timezone") as string; // Get timezone from frontend

    // Accept courseId from referer OR formData OR query param (covers client copy flows)
    if (!courseId) {
      const url = new URL(request.url);
      const courseIdFromQuery = url.searchParams.get("courseId");
      const courseFromForm = (formData.get("course") as string) || (formData.get("courseId") as string);
      courseId = courseFromForm || courseIdFromQuery || null;
    }

    // Validate courseId after parsing FormData / query fallback
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

     console.log("Received data:", {
       title,
       description,
       date,
       startTime,
       endTime,
       timezone,
     });
 
    // Convert time from user's timezone to UTC for storage
    // Parse the date and time components
    // const [year, month, day] = date.split("-").map(Number);
    // const [startHour, startMinute] = startTime.split(":").map(Number);
    // const [endHour, endMinute] = endTime.split(":").map(Number);

    // Function to convert a time in user's timezone to UTC
    // This properly handles the conversion by calculating the timezone offset
    // const convertToUTC = (y: number, m: number, d: number, h: number, min: number, tz: string): Date => {
    //   if (!tz || tz === "UTC") {
    //     // If no timezone or UTC, treat as UTC
    //     return new Date(Date.UTC(y, m - 1, d, h, min, 0));
    //   }

    //   // Calculate the offset by comparing what a known UTC time shows in the timezone
    //   // Use a known UTC time (midnight UTC on the target date)
    //   const formatter = new Intl.DateTimeFormat("en-US", {
    //     timeZone: tz,
    //     year: "numeric",
    //     month: "2-digit",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: false,
    //   });
      
    //   const knownUTC = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    //   const knownParts = formatter.formatToParts(knownUTC);
    //   const knownTzHour = parseInt(knownParts.find(p => p.type === "hour")?.value || "0");
    //   const knownTzMin = parseInt(knownParts.find(p => p.type === "minute")?.value || "0");
      
    //   // If midnight UTC shows as X:Y in timezone, then the offset is X:Y hours
    //   // For IST (UTC+5:30), midnight UTC = 5:30 AM IST, so offset = +5:30
    //   // To convert local to UTC: UTC = Local - Offset
    //   // So: UTC = 18:30 - 5:30 = 13:00 (1 PM)
      
    //   const offsetHours = knownTzHour;
    //   const offsetMinutes = knownTzMin;
    //   const totalOffsetMinutes = offsetHours * 60 + offsetMinutes;
      
    //   // Convert desired local time to UTC
    //   // UTC = Local - Offset
    //   const desiredTotalMinutes = h * 60 + min;
    //   const utcTotalMinutes = desiredTotalMinutes - totalOffsetMinutes;
      
    //   // Handle date rollover
    //   let utcHours = Math.floor(utcTotalMinutes / 60);
    //   let utcMins = utcTotalMinutes % 60;
    //   let utcYear = y;
    //   let utcMonth = m - 1; // 0-indexed
    //   let utcDay = d;
      
    //   // Handle negative minutes (borrow from hours)
    //   if (utcMins < 0) {
    //     utcMins += 60;
    //     utcHours--;
    //   }
      
    //   // Handle negative hours (previous day)
    //   if (utcHours < 0) {
    //     utcHours += 24;
    //     utcDay--;
    //     if (utcDay < 1) {
    //       utcMonth--;
    //       if (utcMonth < 0) {
    //         utcMonth = 11;
    //         utcYear--;
    //       }
    //       utcDay = new Date(utcYear, utcMonth + 1, 0).getDate();
    //     }
    //   }
      
    //   // Handle hours >= 24 (next day)
    //   if (utcHours >= 24) {
    //     utcHours -= 24;
    //     utcDay++;
    //     const daysInMonth = new Date(utcYear, utcMonth + 1, 0).getDate();
    //     if (utcDay > daysInMonth) {
    //       utcDay = 1;
    //       utcMonth++;
    //       if (utcMonth > 11) {
    //         utcMonth = 0;
    //         utcYear++;
    //       }
    //     }
    //   }
      
    //   return new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHours, utcMins, 0));
    // };

// NEW: Simple timezone conversion using date-fns-tz
const convertToUTC = (dateStr: string, timeStr: string, timezone: string): Date => {
  const dateTimeStr = `${dateStr} ${timeStr}`;
  return dateFnsTz.fromZonedTime(dateTimeStr, timezone);
};
   const startDateTime = convertToUTC(date, startTime, timezone || "UTC");
const endDateTime = convertToUTC(date, endTime, timezone || "UTC");

    // Verify the conversion by formatting back
    // const verifyStart = new Intl.DateTimeFormat("en-US", {
    //   timeZone: timezone || "UTC",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // }).format(startDateTime);
    
    // const verifyEnd = new Intl.DateTimeFormat("en-US", {
    //   timeZone: timezone || "UTC",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // }).format(endDateTime);
// AFTER conversion, verify by converting back to user's timezone
console.log("Timezone conversion:", {
  input: `${date} ${startTime}-${endTime} in ${timezone}`,
  storedUTC_Start: startDateTime.toISOString(),
  storedUTC_End: endDateTime.toISOString(),
  verifyStart: format(dateFnsTz.toZonedTime(startDateTime, timezone || "UTC"), 'HH:mm'),
  verifyEnd: format(dateFnsTz.toZonedTime(endDateTime, timezone || "UTC"), 'HH:mm')
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
    }).select("-description -evaluation").lean();

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
    console.log("Updating class...");

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

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

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime, timezone ,reasonForReschedule} = body;

    console.log("RECEIVED:", { title, description, date, startTime, endTime, timezone,reasonForReschedule });

    if (!title || !description || !date || !startTime || !endTime ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const dateTimeStr = `${date}T${startTime}:00`;
const endDateTimeStr = `${date}T${endTime}:00`;

const userTz = timezone || 'UTC';
const startDateTime = dateFnsTz.fromZonedTime(dateTimeStr, userTz);
const endDateTime = dateFnsTz.fromZonedTime(endDateTimeStr, userTz);

    console.log("STORING IN UTC:", {
  inputTime: `${startTime} - ${endTime}`,
  userTimezone: userTz,
  storedStartUTC: startDateTime.toISOString(),
  storedEndUTC: endDateTime.toISOString(),
});

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        title,
        description,
        startTime: startDateTime, // Store in UTC
        endTime: endDateTime, // Store in UTC
        reasonForReschedule:reasonForReschedule,
        status:'rescheduled'
      },
      { new: true, runValidators: true }
    );

    console.log("STORED SUCCESSFULLY IN UTC");

    // Send reschedule emails to all enrolled students
try {
  // Find all users (students) who have this classId in their classes array
  const enrolledStudents = await User.find({
    classes: classId,
  }).select("email username timezone").lean();

  console.log(`Found ${enrolledStudents.length} students enrolled in this class`);

  if (enrolledStudents.length === 0) {
    console.log("No students enrolled in this class");
  } else {
    // Get course name from the class
    const course = await courseName.findById(existingClass.course);
    const courseTitle = course ? course.title : "Your Course";

    // Format date and time for email
    const formatDateTimeForEmail = (dateTime: Date, tz: string) => {
      try {
        // Convert UTC to user's timezone for display
        const zonedDate = dateFnsTz.toZonedTime(dateTime, tz);
        
        const dateStr = format(zonedDate, 'EEEE, MMMM d, yyyy'); // e.g., "Monday, January 15, 2024"
        const timeStr = format(zonedDate, 'h:mm a'); // e.g., "2:30 PM"
        
        return { date: dateStr, time: timeStr };
      } catch (error) {
        console.error("Error formatting date:", error);
        return { 
          date: dateTime.toLocaleDateString(), 
          time: dateTime.toLocaleTimeString() 
        };
      }
    };

    const { date: newDateFormatted, time: newTimeStart } = formatDateTimeForEmail(startDateTime, timezone || 'UTC');
    const { time: newTimeEnd } = formatDateTimeForEmail(endDateTime, timezone || 'UTC');
    const newTimeRange = `${newTimeStart} - ${newTimeEnd}`;

    // Send email to each enrolled student
    const emailPromises = enrolledStudents.map(async (student) => {
      try {
        console.log(`Attempting to send email to: ${student.email}, Username: ${student.username}`);
        
        await sendEmail({
          email: student.email,
          emailType: "CLASS_RESCHEDULED",
          username: student.username,
          courseName: courseTitle,
          className: title,
          newDate: newDateFormatted,
          newTime: newTimeRange,
          reasonForReschedule: reasonForReschedule,
        });
        
        console.log(`✅ Reschedule email sent successfully to: ${student.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${student.email}:`, emailError);
        // Don't throw - continue sending to other students
      }
    });

    await Promise.all(emailPromises);
    console.log("All reschedule notification emails processed");
  }
} catch (emailError) {
  console.error("Error in email sending process:", emailError);
  // Don't fail the entire request if emails fail
}

    return NextResponse.json(
      {
        message: "Class updated successfully",
        classData: updatedClass,
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

// DELETE - Delete existing class
export async function DELETE(request: NextRequest) {
  try {
    console.log("Cancelling class...");

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

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

    // Get class details before cancellation
    // const classToCancel = await Class.findById(classId);
    // if (!classToCancel) {
    //   return NextResponse.json({ error: "Class not found" }, { status: 404 });
    // }

    // Get request body for cancellation reason
    const body = await request.json();
    const { reasonForCancellation, timezone } = body;

    if (!reasonForCancellation) {
      return NextResponse.json(
        { error: "Reason for cancellation is required" },
        { status: 400 }
      );
    }

    // Mark class as cancelled (don't delete)
    const classToCancel = await Class.findByIdAndUpdate(classId, {
      status: 'canceled',
      reasonForCancelation: reasonForCancellation
    });

    // Remove class from students' classes array
    // await User.updateMany(
    //   { classes: classId },
    //   { $pull: { classes: classId } }
    // );

    // Send cancellation emails to all enrolled students
    try {
      const enrolledStudents = await User.find({
        classes: classId,
      });

      console.log(`Found ${enrolledStudents.length} students enrolled in this class`);

      if (enrolledStudents.length > 0) {
        const course = await courseName.findById(classToCancel.course);
        const courseTitle = course ? course.title : "Your Course";

        // Format date and time for email
        const formatDateTimeForEmail = (dateTime: Date, tz: string) => {
          try {
            const zonedDate = dateFnsTz.toZonedTime(dateTime, tz);
            const dateStr = format(zonedDate, 'EEEE, MMMM d, yyyy');
            const timeStr = format(zonedDate, 'h:mm a');
            return { date: dateStr, time: timeStr };
          } catch (error) {
            console.error("Error formatting date:", error);
            return { 
              date: dateTime.toLocaleDateString(), 
              time: dateTime.toLocaleTimeString() 
            };
          }
        };

        const { date: originalDate, time: originalTimeStart } = formatDateTimeForEmail(
          classToCancel.startTime, 
          timezone || 'UTC'
        );
        const { time: originalTimeEnd } = formatDateTimeForEmail(
          classToCancel.endTime, 
          timezone || 'UTC'
        );
        const originalTimeRange = `${originalTimeStart} - ${originalTimeEnd}`;

        // Send email to each enrolled student
        const emailPromises = enrolledStudents.map(async (student) => {
          try {
            console.log(`Attempting to send cancellation email to: ${student.email}`);
            
            await sendEmail({
              email: student.email,
              emailType: "CLASS_CANCELLED",
              username: student.username,
              courseName: courseTitle,
              className: classToCancel.title,
              originalDate: originalDate,
              originalTime: originalTimeRange,
              reasonForCancellation: reasonForCancellation,
            });
            
            console.log(`✅ Cancellation email sent successfully to: ${student.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${student.email}:`, emailError);
          }
        });

        await Promise.all(emailPromises);
        console.log("All cancellation notification emails processed");
      }
    } catch (emailError) {
      console.error("Error in email sending process:", emailError);
      // Continue with cancellation even if emails fail
    }

     // Remove class from students' classes array
    // await User.updateMany(
    //   { classes: classId },
    //   { $pull: { classes: classId } }
    // );

    console.log("Class cancelled successfully");



    return NextResponse.json(
      {
        message: "Class cancelled and students notified",
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