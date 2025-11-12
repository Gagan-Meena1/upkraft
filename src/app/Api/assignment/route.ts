// app/api/assignments/create/route.js
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import Assignment from '@/models/assignment';
import Class from '@/models/Class';
import { connect } from '@/dbConnection/dbConfic';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Parse the FormData
    const formData = await request.formData();
    
    // Extract data from the form
    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const classId = formData.get('classId');
    const courseId = formData.get('courseId');
    const assignmentFile = formData.get('assignmentFile');
    
    // Extract new fields
    const songName = formData.get('songName');
    const practiceStudio = formData.get('practiceStudio') === 'true';
    const speed = formData.get('speed');
    const metronome = formData.get('metronome');
    
    // Validate required fields
    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Find all users who have this courseId
    // const userWithCourse = await User.find({
    //   courses: courseId 
    // }).select('_id');

    // const UserIds = userWithCourse.map(student => student._id);
    // Get student IDs from request
const studentIdsJson = formData.get('studentIds');
let UserIds = [];

if (studentIdsJson) {
  try {
    UserIds = JSON.parse(studentIdsJson as string);
    console.log("Received student IDs from frontend:", UserIds.length);
  } catch (error) {
    console.error("Error parsing studentIds:", error);
    return NextResponse.json({
      success: false,
      message: 'Invalid student IDs format'
    }, { status: 400 });
  }
} else {
  return NextResponse.json({
    success: false,
    message: 'No students selected'
  }, { status: 400 });
}
    // ADD THIS SECTION - Get instructor ID from JWT token and add to UserIds
const token = request.cookies.get("token")?.value;
const decodedToken = token ? jwt.decode(token) : null;
const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

if (instructorId) {
  // Add instructor ID to the UserIds array if not already present
  if (!UserIds.includes(instructorId)) {
    UserIds.push(instructorId);
    console.log("Instructor ID added to assignment:", instructorId);
  }
}
    console.log("Found students with courseId:", UserIds.length);
    
    // Create assignment object (without file info initially)
    const assignmentData = {
      title,
      description,
      deadline: typeof deadline === 'string' ? new Date(deadline) : null,
      classId,
      courseId,
      userId: UserIds,
      songName: songName || '',
      practiceStudio,
      speed: speed || '100%',
      metronome: metronome || '100%'
    };
    
    // Handle file upload with Cloudinary if present
    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      try {
        console.log("Starting file upload to Cloudinary...");
        
        // Convert file to buffer
        const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw", // Use "raw" for non-image files like PDFs, docs, etc.
              folder: "assignments", // Optional: organize files in folders
              public_id: `${Date.now()}-${assignmentFile.name.split('.')[0]}`, // Generate unique filename
              use_filename: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(fileBuffer);
        });

        console.log("File uploaded to Cloudinary successfully");
        
        // Update assignment data with Cloudinary file info
        assignmentData.fileUrl = uploadResult.secure_url;
        assignmentData.fileName = assignmentFile.name;
        assignmentData.cloudinaryPublicId = uploadResult.public_id; // Store for potential deletion later
        
      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'File upload failed. Please try again.'
        }, { status: 500 });
      }
    }
    
    // Create new assignment in database
    const assignment = await Assignment.create(assignmentData);
    console.log("Assignment created successfully");
    
    // Update all users' assignment arrays with the new assignment ID
    if (UserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: UserIds } },
        { $push: { assignment: assignment._id } }
      );
      console.log(`Assignment ID added to ${UserIds.length} students' assignment arrays`);
    }
    
    // Update the Class document with the assignment ID
    await Class.findByIdAndUpdate(
      classId,
      { assignmentId: assignment._id },
      { new: true }
    );
    console.log("Assignment ID added to Class document");
    
    // Add assignment to academy's assignment array if tutor belongs to an academy
    if (instructorId) {
      const tutor = await User.findById(instructorId).select('academyId');
      if (tutor && tutor.academyId) {
        await User.findByIdAndUpdate(
          tutor.academyId,
          { $push: { assignment: assignment._id } },
          { new: true }
        );
        console.log(`Assignment ID added to academy's assignment array: ${tutor.academyId}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: assignment,
      studentsAssigned: UserIds.length
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error in assignment creation:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating assignment'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Extract user ID from URL query parameters
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    
    // Get userId from token if not provided in query parameters
    let userId;
    if (userIdParam) {
      userId = userIdParam;
    } else {
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }
    
    // Ensure we have a valid userId
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        message: "User ID is required. Please provide userId parameter or ensure you are logged in." 
      }, { status: 400 });
    }
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        success: false,
        message: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    // Find the user and get their assignment array and category
    const user = await User.findById(userId).select('username email assignment category');
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: "User not found" 
      }, { status: 404 });
    }
    
    // Check if user has any assignments
    if (!user.assignment || user.assignment.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No assignments found for this user",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          assignments: []
        }
      });
    }
    
    // Handle based on user category
    if (user.category.toLowerCase() === 'student') {
      // For Students: Get assignment details only
      const assignments = await Assignment.find({
        _id: { $in: user.assignment }
      })
      .populate('classId', 'title description startTime endTime')
      .populate('courseId', 'title category')
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)
      
      return NextResponse.json({
        success: true,
        message: "Student assignments retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: assignments.length,
          assignments: assignments.map(assignment => {
  // Find this student's submission for this assignment
  const mySubmission = assignment.submissions?.find(
    sub => sub.studentId?.toString() === user._id.toString()
  );

  return {
    _id: assignment._id,
    title: assignment.title,
    description: assignment.description,
    deadline: assignment.deadline,
    status: assignment.status,
    currentAssignmentStatus: mySubmission?.status || 'PENDING',
    studentSubmissionMessage: mySubmission?.message || '',
    tutorRemarks: mySubmission?.tutorRemarks || '',
    submissionFileUrl: mySubmission?.fileUrl || '',
    submissionFileName: mySubmission?.fileName || '',
    correctionFileUrl: mySubmission?.correctionFileUrl || '',      // ADD THIS
    correctionFileName: mySubmission?.correctionFileName || '',    // ADD THIS
    fileUrl: assignment.fileUrl,
    fileName: assignment.fileName,
    songName: assignment.songName,
    practiceStudio: assignment.practiceStudio,
    speed: assignment.speed,
    metronome: assignment.metronome,
    createdAt: assignment.createdAt,
    class: assignment.classId,
    course: assignment.courseId
  };
})
        }
      });
      
    } else if (user.category.toLowerCase() === 'tutor') {
      // For Tutors: Get assignment details with student information
      const assignments = await Assignment.find({
        _id: { $in: user.assignment }
      })
      .populate('classId', 'title description startTime endTime')
      .populate('courseId', 'title category')
      .populate('userId', 'username email')
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)
      
      // Transform the data to include student details for each assignment
      // Filter out the tutor from the student lists
      const assignmentsWithStudents = assignments.map(assignment => {
        // Filter out the tutor's ID from the assigned students
        const studentsOnly = assignment.userId.filter(student => 
          student._id.toString() !== userId.toString()
        );
        
        return {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline,
          status: assignment.status,
          fileUrl: assignment.fileUrl,
          fileName: assignment.fileName,
          songName: assignment.songName,
          practiceStudio: assignment.practiceStudio,
          speed: assignment.speed,
          metronome: assignment.metronome,
          createdAt: assignment.createdAt,
          class: assignment.classId,
          course: assignment.courseId,
          assignedStudents: studentsOnly.map(student => {
  const studentSubmission = assignment.submissions?.find(
    sub => sub.studentId?.toString() === student._id.toString()
  );

  return {
    userId: student._id,
    username: student.username,
    email: student.email,
    submissionStatus: studentSubmission?.status || 'PENDING',
    submissionMessage: studentSubmission?.message || '',
    submissionFileUrl: studentSubmission?.fileUrl || '',
    submissionFileName: studentSubmission?.fileName || '',
    correctionFileUrl: studentSubmission?.correctionFileUrl || '',      // ADD THIS
    correctionFileName: studentSubmission?.correctionFileName || '',    // ADD THIS
    tutorRemarks: studentSubmission?.tutorRemarks || '',
    submittedAt: studentSubmission?.submittedAt || null
  };
}),
          totalAssignedStudents: studentsOnly.length
        };
      });
      
      return NextResponse.json({
        success: true,
        message: "Tutor assignments with student details retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: assignmentsWithStudents.length,
          assignments: assignmentsWithStudents
        }
      });
      
    } else if (user.category.toLowerCase() === 'academic') {
      // For Academies: Get assignments from all tutors under this academy
      // First, get all tutors under this academy
      const tutors = await User.find({
        category: "Tutor",
        academyId: userId
      }).select('_id username email');
      
      const tutorIds = tutors.map(tutor => tutor._id.toString());
      
      if (tutorIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No tutors found under this academy",
          data: {
            userId: user._id,
            username: user.username,
            userCategory: user.category,
            totalAssignments: 0,
            assignments: []
          }
        });
      }
      
      // Get all assignments from tutors under this academy
      // We can either use the academy's assignment array or find assignments where the creator (instructorId) is in tutorIds
      // Using academy's assignment array is more efficient
      const assignments = await Assignment.find({
        _id: { $in: user.assignment || [] }
      })
      .populate('classId', 'title description startTime endTime')
      .populate('courseId', 'title category')
      .populate('userId', 'username email')
      .sort({ deadline: 1 });
      
      // Transform the data to include tutor and student information
      const assignmentsWithDetails = assignments.map(assignment => {
        // Find the tutor who created this assignment (first tutor in userId array)
        const tutorInAssignment = assignment.userId.find((u: any) => 
          tutorIds.includes(u._id.toString())
        );
        
        // Filter out tutors from the student list
        const studentsOnly = assignment.userId.filter((u: any) => 
          !tutorIds.includes(u._id.toString())
        );
        
        return {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline,
          status: assignment.status,
          fileUrl: assignment.fileUrl,
          fileName: assignment.fileName,
          songName: assignment.songName,
          practiceStudio: assignment.practiceStudio,
          speed: assignment.speed,
          metronome: assignment.metronome,
          createdAt: assignment.createdAt,
          class: assignment.classId,
          course: assignment.courseId,
          tutor: tutorInAssignment ? {
            userId: tutorInAssignment._id,
            username: tutorInAssignment.username,
            email: tutorInAssignment.email
          } : null,
          assignedStudents: studentsOnly.map((student: any) => ({
            userId: student._id,
            username: student.username,
            email: student.email
          })),
          totalAssignedStudents: studentsOnly.length
        };
      });
      
      return NextResponse.json({
        success: true,
        message: "Academy assignments retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: assignmentsWithDetails.length,
          assignments: assignmentsWithDetails
        }
      });
      
    } else {
      // Handle other categories if any
      return NextResponse.json({
        success: false,
        message: "Invalid user category. Must be either 'student', 'tutor', or 'academic'"
      }, { status: 400 });
    }
    
  } catch (error:any) {
    console.error("Error fetching user assignments:", error);
    return NextResponse.json({ 
      success: false,
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    // Get assignmentId from query parameters
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    
    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Parse the FormData
    const formData = await request.formData();
    
    // Extract data from the form
    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const classId = formData.get('classId');
    const courseId = formData.get('courseId');
    const assignmentFile = formData.get('assignmentFile');
    
    // Extract new fields
    const songName = formData.get('songName');
    const practiceStudio = formData.get('practiceStudio') === 'true';
    const speed = formData.get('speed');
    const metronome = formData.get('metronome');
    const loop = formData.get('loop');
    
    // Validate required fields
    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Find the existing assignment
    const existingAssignment = await Assignment.findById(assignmentId);
    
    if (!existingAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      title,
      description,
      deadline: typeof deadline === 'string' ? new Date(deadline) : null,
      classId,
      courseId,
      songName: songName || '',
      practiceStudio,
      speed: speed || '100%',
      metronome: metronome || '100%',
      loop: loop || 'Set A',
    };
    
    // Handle file upload with Cloudinary if a new file is provided
    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      try {
        console.log("Starting file upload to Cloudinary...");
        
        // Delete old file from Cloudinary if it exists
        if (existingAssignment.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(existingAssignment.cloudinaryPublicId, {
              resource_type: "raw"
            });
            console.log("Old file deleted from Cloudinary");
          } catch (deleteError) {
            console.error('Error deleting old file from Cloudinary:', deleteError);
          }
        }
        
        // Convert file to buffer
        const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "assignments",
              public_id: `${Date.now()}-${assignmentFile.name.split('.')[0]}`,
              use_filename: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(fileBuffer);
        });

        console.log("File uploaded to Cloudinary successfully");
        
        // Update assignment data with new Cloudinary file info
        updateData.fileUrl = uploadResult.secure_url;
        updateData.fileName = assignmentFile.name;
        updateData.cloudinaryPublicId = uploadResult.public_id;
        
      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'File upload failed. Please try again.'
        }, { status: 500 });
      }
    }
    
    const studentIdsJson = formData.get('studentIds');
let newStudentIds = [];

if (studentIdsJson) {
  try {
    newStudentIds = JSON.parse(studentIdsJson as string);
    console.log("Received student IDs from frontend:", newStudentIds.length);
  } catch (error) {
    console.error("Error parsing studentIds:", error);
    return NextResponse.json({
      success: false,
      message: 'Invalid student IDs format'
    }, { status: 400 });
  }
} else {
  return NextResponse.json({
    success: false,
    message: 'No students selected'
  }, { status: 400 });
}

// Get old student IDs from existing assignment
const oldStudentIds = existingAssignment.userId || [];

// Find students to remove (in old but not in new)
const studentsToRemove = oldStudentIds.filter(
  (id: any) => !newStudentIds.includes(id.toString())
);

// Find students to add (in new but not in old)
const studentsToAdd = newStudentIds.filter(
  (id: string) => !oldStudentIds.some((oldId: any) => oldId.toString() === id)
);

// Add userId to updateData
updateData.userId = newStudentIds;

// NOW Update assignment in database
// const updatedAssignment = await Assignment.findByIdAndUpdate(
//   assignmentId,
//   updateData,
//   { new: true }
// );

// console.log("Assignment updated successfully");

// Remove assignment from students who should no longer have it
if (studentsToRemove.length > 0) {
  await User.updateMany(
    { _id: { $in: studentsToRemove } },
    { $pull: { assignment: assignmentId } }
  );
  console.log(`Assignment removed from ${studentsToRemove.length} students`);
}

// Add assignment to new students
if (studentsToAdd.length > 0) {
  await User.updateMany(
    { _id: { $in: studentsToAdd } },
    { $push: { assignment: assignmentId } }
  );
  console.log(`Assignment added to ${studentsToAdd.length} students`);
}
    // Update assignment in database
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    );
    
    console.log("Assignment updated successfully");
    
   
    
    // Update the Class document if class changed
    if (classId !== existingAssignment.classId.toString()) {
      // Remove from old class
      await Class.updateOne(
        { assignmentId: assignmentId },
        { $unset: { assignmentId: "" } }
      );
      
      // Add to new class
      await Class.findByIdAndUpdate(
        classId,
        { assignmentId: assignmentId },
        { new: true }
      );
    }
    
   return NextResponse.json({
  success: true,
  data: updatedAssignment,
  studentsAssigned: newStudentIds.length,
  studentsAdded: studentsToAdd.length,
  studentsRemoved: studentsToRemove.length,
  message: 'Assignment updated successfully'
}, { status: 200 });
    
  } catch (error: any) {
    console.error('Error in assignment update:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating assignment'
    }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    // Get assignmentId from query parameters
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    
    // Validate assignmentId
    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    // Delete file from Cloudinary if it exists
    if (assignment.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(assignment.cloudinaryPublicId, {
          resource_type: "raw"
        });
        console.log("File deleted from Cloudinary successfully");
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
        // Continue with assignment deletion even if Cloudinary deletion fails
      }
    }

    // Remove assignment ID from all users' assignment arrays (including academy)
    await User.updateMany(
      { assignment: assignmentId },
      { $pull: { assignment: assignmentId } }
    );
    console.log("Assignment ID removed from users' assignment arrays");

    // Remove assignment ID from Class document
    await Class.updateOne(
      { assignmentId: assignmentId },
      { $unset: { assignmentId: "" } }
    );
    console.log("Assignment ID removed from Class document");

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);
    console.log("Assignment deleted successfully");

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in assignment deletion:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting assignment'
    }, { status: 500 });
  }
}