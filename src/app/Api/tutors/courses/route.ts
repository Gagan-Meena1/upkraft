// app/api/tutors/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import courseName from "@/models/courseName";
import { connect } from '@/dbConnection/dbConfic'
import User from "@/models/userModel"

// Migration function - run this separately or on app startup
async function migratePerformanceScores() {
  try {
    await connect();
    const result = await courseName.updateMany(
      { performanceScores: { $exists: false } },
      { $set: { performanceScores: [] } }
    );
    console.log(`Migration completed: ${result.modifiedCount} courses updated`);
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}


export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body
    await connect();
    const courseData = await request.json();
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const tutorId = url.searchParams.get('tutorId');

    // Check if this is a migration request
    if (courseData.action === 'migratePerformanceScores') {
      const result = await migratePerformanceScores();
      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully',
        modifiedCount: result.modifiedCount
      }, { status: 200 });
    }

    // Check if this is a performance score update request
    if (courseData.action === 'updatePerformanceScore') {
      const { courseId, studentId, overallScore } = courseData;
      
      // Validate input
      if (!courseId || !studentId || overallScore === undefined) {
        return NextResponse.json(
          { error: 'Course ID, Student ID, and overall score are required' },
          { status: 400 }
        );
      }

      // Validate score range (assuming 0-10 scale)
      if (overallScore < 0 || overallScore > 10) {
        return NextResponse.json(
          { error: 'Score must be between 0 and 10' },
          { status: 400 }
        );
      }

      // Check if course exists
      const existingCourse = await courseName.findById(courseId);
      
      if (!existingCourse) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      // Ensure performanceScores array exists (fallback migration for single course)
      if (!existingCourse.performanceScores) {
        await courseName.findByIdAndUpdate(courseId, {
          $set: { performanceScores: [] }
        });
      }

      // Check if score already exists for this student
      const existingScoreIndex = existingCourse.performanceScores?.findIndex(
        score => score.userId.toString() === studentId
      ) ?? -1;

      if (existingScoreIndex !== -1) {
        // Update existing score
        const updateResult = await courseName.findOneAndUpdate(
          { 
            _id: courseId,
            "performanceScores.userId": studentId 
          },
          {
            $set: {
              "performanceScores.$.score": overallScore,
              "performanceScores.$.dateRecorded": new Date()
            }
          },
          { new: true }
        );

        if (!updateResult) {
          return NextResponse.json(
            { error: 'Failed to update performance score' },
            { status: 500 }
          );
        }
      } else {
        // Add new performance score
        const updateResult = await courseName.findByIdAndUpdate(
          courseId,
          {
            $push: {
              performanceScores: {
                userId: studentId,
                score: overallScore,
                dateRecorded: new Date()
              }
            }
          },
          { new: true }
        );

        if (!updateResult) {
          return NextResponse.json(
            { error: 'Failed to add performance score' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Performance score saved successfully',
        data: {
          courseId,
          studentId,
          score: overallScore,
          dateRecorded: new Date()
        }
      }, { status: 200 });
    }

    // Original course creation logic
    if (!courseData.title || !courseData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    let instructorId;
    if (tutorId) {
      instructorId = tutorId;
    } else {
      const token = request.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication token not found' },
          { status: 401 }
        );
      }

      try {
        const decodedToken = jwt.decode(token);
        instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    }

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID not found' },
        { status: 401 }
      );
    }

    const user = await User.findById(instructorId);
    if (!user) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }

    console.log("Creating new course:", courseData);

    const newCourse = new courseName({
      title: courseData.title,
      description: courseData.description,
      instructorId: instructorId,
      duration: courseData.duration,
      price: courseData.price,
      curriculum: courseData.curriculum,
      category: courseData.category,
      performanceScores: [] // Initialize empty performance scores array
    });

    console.log("New course object:", newCourse);
    const savedNewCourse = await newCourse.save();
    
    // Update user's courses array
    await User.findByIdAndUpdate(
      instructorId, 
      { $addToSet: { courses: savedNewCourse._id } }, 
      { new: true }
    );

    // Fetch updated courses list
    const courses = await courseName.find({ instructorId });

    console.log("Course created successfully");

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: savedNewCourse,
      allCourses: courses
    }, { status: 201 });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: error.message },
      { status: 500 }
    );
  }
}

// Add GET method to fetch course data with performance scores
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const studentId = url.searchParams.get('studentId');
    const tutorId = url.searchParams.get('tutorId');

    if (courseId) {
      // Fetch specific course with performance scores
      const course = await courseName.findById(courseId)
        .populate('performanceScores.userId', 'name email')
        .populate('instructorId', 'name email');
      
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      // Ensure performanceScores array exists (fallback migration)
      if (!course.performanceScores) {
        await courseName.findByIdAndUpdate(courseId, {
          $set: { performanceScores: [] }
        });
        course.performanceScores = [];
      }

      // If studentId is provided, filter performance scores for that student
      if (studentId) {
        const studentScore = course.performanceScores.find(
          score => score.userId._id.toString() === studentId
        );
        
        return NextResponse.json({
          success: true,
          course: {
            ...course.toObject(),
            studentPerformanceScore: studentScore || null
          }
        }, { status: 200 });
      }

      return NextResponse.json({
        success: true,
        course: course
      }, { status: 200 });
    }

    // Fetch all courses for tutor
    let instructorId = tutorId;
    if (!instructorId) {
      const token = request.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication token not found' },
          { status: 401 }
        );
      }

      try {
        const decodedToken = jwt.decode(token);
        instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    }

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID not found' },
        { status: 401 }
      );
    }

    const courses = await courseName.find({ instructorId });

    // Ensure all courses have performanceScores array (fallback migration)
    const coursesToUpdate = courses.filter(course => !course.performanceScores);
    if (coursesToUpdate.length > 0) {
      await courseName.updateMany(
        { 
          _id: { $in: coursesToUpdate.map(c => c._id) },
          performanceScores: { $exists: false }
        },
        { $set: { performanceScores: [] } }
      );
    }

    return NextResponse.json({
      success: true,
      courses: courses
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    );
  }
}

// Export the migration function for use elsewhere
export { migratePerformanceScores };
// export async function GET(request: NextRequest) {
//   try {
//     connect();
//     const url = new URL(request.url);
//     const tutorId = url.searchParams.get('tutorId');
    
//     // Get instructorId from token if tutorId is not provided
//     let instructorId;
//     if (tutorId) {
//       instructorId = tutorId;
//     } else {
//       const token = request.cookies.get("token")?.value;
//       const decodedToken = token ? jwt.decode(token) : null;
//       instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
//     }

//     // Ensure we have a valid instructorId
//     if (!instructorId) {
//       return NextResponse.json(
//         { error: 'Instructor ID is required' }, 
//         { status: 400 }
//       );
//     }

//     const courses = await courseName.find({ instructorId });

//     return NextResponse.json({
//       message: 'Courses retrieved successfully',
//       course: courses
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Course retrieval error:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve courses' }, 
//       { status: 500 }
//     );
//   }
// }
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete the course
    const deletedCourse = await courseName.findByIdAndDelete(courseId);
    
    if (!deletedCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course is deleted'
    });
    
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}