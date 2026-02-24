// app/api/assignment/route.ts - OPTIMIZED VERSION WITH PAGINATION & COUNTS
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import Assignment from '@/models/assignment';
import Class from '@/models/Class';
import { connect } from '@/dbConnection/dbConfic';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==================== POST - CREATE ASSIGNMENT ====================
export async function POST(request: NextRequest) {
  try {
    await connect();

    const formData = await request.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const classId = formData.get('classId');
    const courseId = formData.get('courseId');
    const assignmentFile = formData.get('assignmentFile');

    const songName = formData.get('songName');
    const practiceStudio = formData.get('practiceStudio') === 'true';
    const speed = formData.get('speed');
    const metronome = formData.get('metronome');

    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const studentIdsJson = formData.get('studentIds');
    let UserIds = [];

    if (studentIdsJson) {
      try {
        UserIds = JSON.parse(studentIdsJson as string);
      } catch (error) {
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

    const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
    const decodedToken = token ? jwt.decode(token) : null;
    const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;

    if (!instructorId) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not authenticated'
      }, { status: 401 });
    }

    if (!UserIds.includes(instructorId)) {
      UserIds.push(instructorId);
    }

    const assignmentData: any = {
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

    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      try {
        const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "assignments",
              public_id: `${Date.now()}-${assignmentFile.name.split('.')[0]}`,
              use_filename: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(fileBuffer);
        });

        assignmentData.fileUrl = uploadResult.secure_url;
        assignmentData.fileName = assignmentFile.name;
        assignmentData.cloudinaryPublicId = uploadResult.public_id;

      } catch (uploadError) {
        return NextResponse.json({
          success: false,
          message: 'File upload failed. Please try again.'
        }, { status: 500 });
      }
    }

    const assignment = await Assignment.create(assignmentData);
    const assignmentId = assignment._id;

    const instructorPromise = User.findById(instructorId).select('academyId').lean();

    const [userUpdateResult, classUpdateResult, instructor] = await Promise.all([
      User.updateMany(
        { _id: { $in: UserIds } },
        { $push: { assignment: assignmentId } }
      ),
      Class.findByIdAndUpdate(
        classId,
        { assignmentId: assignmentId },
        { new: true, lean: true }
      ),
      instructorPromise
    ]);

    const bulkOps = UserIds
      .filter((userId: any) => userId !== instructorId)
      .map((studentId: any) => ({
        updateOne: {
          filter: {
            _id: instructorId,
            'pendingAssignments.studentId': studentId
          },
          update: {
            $push: {
              'pendingAssignments.$.assignmentIds': assignmentId
            }
          }
        }
      }));

    if (bulkOps.length > 0) {
      const bulkResult = await User.bulkWrite(bulkOps, { ordered: false });
      const updatedCount = bulkResult.modifiedCount;
      const totalStudents = UserIds.filter((id: any) => id !== instructorId).length;

      if (updatedCount < totalStudents) {
        const newStudents = UserIds.filter((id: any) => id !== instructorId);

        await User.findByIdAndUpdate(
          instructorId,
          {
            $push: {
              pendingAssignments: {
                $each: newStudents.map((studentId: any) => ({
                  studentId: studentId,
                  assignmentIds: [assignmentId]
                }))
              }
            }
          },
          { new: true }
        );
      }
    } else {
      const newStudents = UserIds.filter((id: any) => id !== instructorId);

      if (newStudents.length > 0) {
        await User.findByIdAndUpdate(
          instructorId,
          {
            $push: {
              pendingAssignments: {
                $each: newStudents.map((studentId: any) => ({
                  studentId: studentId,
                  assignmentIds: [assignmentId]
                }))
              }
            }
          },
          { new: true }
        );
      }
    }

    if (instructor && instructor.academyId) {
      await User.findByIdAndUpdate(
        instructor.academyId,
        { $push: { assignment: assignmentId } },
        { new: true }
      );
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

// ==================== GET - FETCH ASSIGNMENTS WITH PAGINATION ====================
export async function GET(request: NextRequest) {
  try {
    await connect();

    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');

    // PAGINATION PARAMETERS
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100000');
    const statusFilter = url.searchParams.get('status'); // 'pending' | 'completed' | null
    const searchQuery = url.searchParams.get('search'); // search term

    let userId;
    if (userIdParam) {
      userId = userIdParam;
    } else {
      const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
      const decodedToken = token ? jwt.decode(token) : null;
      userId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID format"
      }, { status: 400 });
    }

    const user = await User.findById(userId).select('username email assignment category');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    if (!user.assignment || user.assignment.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No assignments found",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: 0,
          pendingCount: 0,
          completedCount: 0,
          assignments: [],
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // Build filter query
    const filterQuery: any = {
      _id: { $in: user.assignment }
    };

    // STATUS FILTER
    if (statusFilter === 'pending') {
      filterQuery.status = { $ne: true };
    } else if (statusFilter === 'completed') {
      filterQuery.status = true;
    }

    // SEARCH FILTER
    if (searchQuery && searchQuery.trim()) {
      filterQuery.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const totalAssignments = await Assignment.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalAssignments / limit);

    // ==================== STUDENT CATEGORY ====================
    if (user.category.toLowerCase() === 'student') {
      // Get counts for pending and completed assignments
      const baseCountQuery = {
        _id: { $in: user.assignment }
      };

      const pendingCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: { $ne: true }
      });

      const completedCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: true
      });

      const assignments = await Assignment.find(filterQuery)
        .populate('classId', 'title description startTime endTime')
        .populate('courseId', 'title category')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        message: "Student assignments retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: totalAssignments,
          pendingCount: pendingCount,
          completedCount: completedCount,
          assignments: assignments.map((assignment: any) => {
            const mySubmission = assignment.submissions?.find(
              (sub: any) => sub.studentId?.toString() === user._id.toString()
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
              correctionFileUrl: mySubmission?.correctionFileUrl || '',
              correctionFileName: mySubmission?.correctionFileName || '',
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
          }),
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    }
    // ==================== TUTOR CATEGORY ====================
    else if (user.category.toLowerCase() === 'tutor') {
      // Get counts for pending and completed assignments (TOTAL, not filtered)
      const baseCountQuery = {
        _id: { $in: user.assignment }
      };

      const pendingCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: { $ne: true }
      });

      const completedCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: true
      });

      let assignments = await Assignment.find(filterQuery)
        .populate('classId', 'title description startTime endTime')
        .populate('courseId', 'title category')
        .populate('userId', 'username email')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // POST-FILTER for student search
      let filteredAssignments = assignments;
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filteredAssignments = assignments.filter((assignment: any) => {
          const studentMatch = assignment.userId?.some((student: any) =>
            student.username?.toLowerCase().includes(searchLower) ||
            student.email?.toLowerCase().includes(searchLower)
          );

          const titleMatch = assignment.title?.toLowerCase().includes(searchLower);
          const descMatch = assignment.description?.toLowerCase().includes(searchLower);

          return titleMatch || descMatch || studentMatch;
        });
      }

      const assignmentsWithStudents = filteredAssignments.map((assignment: any) => {
        const studentsOnly = assignment.userId.filter((student: any) =>
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
          assignedStudents: studentsOnly.map((student: any) => {
            const studentSubmission = assignment.submissions?.find(
              (sub: any) => sub.studentId?.toString() === student._id.toString()
            );

            return {
              userId: student._id,
              username: student.username,
              email: student.email,
              submissionStatus: studentSubmission?.status || 'PENDING',
              submissionMessage: studentSubmission?.message || '',
              submissionFileUrl: studentSubmission?.fileUrl || '',
              submissionFileName: studentSubmission?.fileName || '',
              correctionFileUrl: studentSubmission?.correctionFileUrl || '',
              correctionFileName: studentSubmission?.correctionFileName || '',
              tutorRemarks: studentSubmission?.tutorRemarks || '',
              submittedAt: studentSubmission?.submittedAt || null
            };
          }),
          totalAssignedStudents: studentsOnly.length
        };
      });

      return NextResponse.json({
        success: true,
        message: "Tutor assignments retrieved successfully",
        data: {
          userId: user._id,
          username: user.username,
          userCategory: user.category,
          totalAssignments: user.assignment.length, // Total across all filters
          pendingCount: pendingCount,
          completedCount: completedCount,
          assignments: assignmentsWithStudents,
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    }
    // ==================== ACADEMIC CATEGORY ====================
    else if (user.category.toLowerCase() === 'academic') {
      const tutors = await User.find({
        category: "Tutor",
        academyId: userId
      }).select('_id username email');

      const tutorIds = tutors.map(tutor => tutor._id.toString());

      if (tutorIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No tutors found",
          data: {
            userId: user._id,
            username: user.username,
            userCategory: user.category,
            totalAssignments: 0,
            pendingCount: 0,
            completedCount: 0,
            assignments: [],
            currentPage: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }

      // Get counts for pending and completed assignments
      const baseCountQuery = {
        _id: { $in: user.assignment }
      };

      const pendingCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: { $ne: true }
      });

      const completedCount = await Assignment.countDocuments({
        ...baseCountQuery,
        status: true
      });

      const assignments = await Assignment.find(filterQuery)
        .populate('classId', 'title description startTime endTime')
        .populate('courseId', 'title category')
        .populate('userId', 'username email')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const assignmentsWithDetails = assignments.map((assignment: any) => {
        const tutorInAssignment = assignment.userId.find((u: any) =>
          tutorIds.includes(u._id.toString())
        );

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
          totalAssignments: user.assignment.length,
          pendingCount: pendingCount,
          completedCount: completedCount,
          assignments: assignmentsWithDetails,
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid user category"
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error"
    }, { status: 500 });
  }
}

// ==================== PUT - UPDATE ASSIGNMENT ====================
export async function PUT(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    const formData = await request.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const classId = formData.get('classId');
    const courseId = formData.get('courseId');
    const assignmentFile = formData.get('assignmentFile');

    const songName = formData.get('songName');
    const practiceStudio = formData.get('practiceStudio') === 'true';
    const speed = formData.get('speed');
    const metronome = formData.get('metronome');
    const loop = formData.get('loop');

    if (!title || !description || !deadline || !classId || !courseId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const existingAssignment = await Assignment.findById(assignmentId);

    if (!existingAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    const updateData: any = {
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

    if (assignmentFile instanceof File && assignmentFile.size > 0) {
      try {
        if (existingAssignment.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(existingAssignment.cloudinaryPublicId, {
              resource_type: "raw"
            });
          } catch (deleteError) {
            console.error('Error deleting old file:', deleteError);
          }
        }

        const fileBuffer = Buffer.from(await assignmentFile.arrayBuffer());

        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "assignments",
              public_id: `${Date.now()}-${assignmentFile.name.split('.')[0]}`,
              use_filename: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(fileBuffer);
        });

        updateData.fileUrl = uploadResult.secure_url;
        updateData.fileName = assignmentFile.name;
        updateData.cloudinaryPublicId = uploadResult.public_id;

      } catch (uploadError) {
        return NextResponse.json({
          success: false,
          message: 'File upload failed'
        }, { status: 500 });
      }
    }

    const studentIdsJson = formData.get('studentIds');
    let newStudentIds: string[] = [];

    if (studentIdsJson) {
      try {
        newStudentIds = JSON.parse(studentIdsJson as string);
      } catch (error) {
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

    const oldStudentIds = existingAssignment.userId || [];

    const studentsToRemove = oldStudentIds.filter(
      (id: any) => !newStudentIds.includes(id.toString())
    );

    const studentsToAdd = newStudentIds.filter(
      (id: string) => !oldStudentIds.some((oldId: any) => oldId.toString() === id)
    );

    updateData.userId = newStudentIds;

    if (studentsToRemove.length > 0) {
      await User.updateMany(
        { _id: { $in: studentsToRemove } },
        { $pull: { assignment: assignmentId } }
      );
    }

    if (studentsToAdd.length > 0) {
      await User.updateMany(
        { _id: { $in: studentsToAdd } },
        { $push: { assignment: assignmentId } }
      );
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    );

    if (classId !== existingAssignment.classId.toString()) {
      await Class.updateOne(
        { assignmentId: assignmentId },
        { $unset: { assignmentId: "" } }
      );

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
    console.error('Error updating assignment:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating assignment'
    }, { status: 500 });
  }
}

// ==================== DELETE - DELETE ASSIGNMENT ====================
export async function DELETE(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assignment ID is required'
      }, { status: 400 });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 });
    }

    if (assignment.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(assignment.cloudinaryPublicId, {
          resource_type: "raw"
        });
      } catch (cloudinaryError) {
        console.error('Error deleting file:', cloudinaryError);
      }
    }

    await User.updateMany(
      { assignment: assignmentId },
      { $pull: { assignment: assignmentId } }
    );

    await Class.updateOne(
      { assignmentId: assignmentId },
      { $unset: { assignmentId: "" } }
    );

    await Assignment.findByIdAndDelete(assignmentId);

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting assignment'
    }, { status: 500 });
  }
}