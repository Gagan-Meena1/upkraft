import { NextResponse } from "next/server";
import User from "@/models/userModel";
import Class from "@/models/Class";
import { connect } from "@/dbConnection/dbConfic";
import jwt from "jsonwebtoken";
import courseName from "@/models/courseName";

// Add caching for 60 seconds
export const revalidate = 60;

export async function GET(request) {
  try {
    // Connect to DB once
    await connect();

    // Get and verify token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Verify token (use verify instead of decode for security)
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    // OPTIMIZATION 1: Super-optimized single aggregation query
    const [result] = await User.aggregate([
      // Match the user
      { $match: { _id: userId } },
      
      // Lookup courses with nested class lookup
      {
        $lookup: {
          from: "coursenames",
          localField: "courses",
          foreignField: "_id",
          as: "courseDetails",
          pipeline: [
            { $project: { _id: 1, category: 1, class: 1 } },
            // Nested lookup for classes
            {
              $lookup: {
                from: "classes", // Your Class collection name
                localField: "class",
                foreignField: "_id",
                as: "classData",
                pipeline: [
                  { $project: { _id: 1, name: 1, description: 1, schedule: 1 } }
                ]
              }
            }
          ]
        }
      },
      
      // Add student count as a facet
      {
        $facet: {
          userData: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                category: 1,
                profileImage: 1,
                courses: 1,
                courseDetails: 1
              }
            }
          ],
          studentCount: [
            {
              $lookup: {
                from: "users",
                let: { userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$instructorId", "$userId"] },
                          { $eq: ["$category", "Student"] }
                        ]
                      }
                    }
                  },
                  { $count: "count" }
                ],
                as: "studentCountData"
              }
            },
            { $unwind: { path: "$studentCountData", preserveNullAndEmptyArrays: true } },
            { $project: { count: { $ifNull: ["$studentCountData.count", 0] } } }
          ]
        }
      },
      
      // Reshape the output
      {
        $project: {
          user: { $arrayElemAt: ["$userData", 0] },
          studentCount: { $ifNull: [{ $arrayElemAt: ["$studentCount.count", 0] }, 0] }
        }
      }
    ]);

    if (!result || !result.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract and deduplicate class details
    const allClassData = result.user.courseDetails
      .flatMap(course => course.classData || []);
    
    // Deduplicate classes by ID
    const classMap = new Map();
    allClassData.forEach(cls => {
      classMap.set(cls._id.toString(), cls);
    });
    const classDetails = Array.from(classMap.values());

    // Clean up courseDetails (remove nested classData)
    const courseDetails = result.user.courseDetails.map(({ classData, ...course }) => course);
    const { courseDetails: _, ...userData } = result.user;

    return NextResponse.json({
      success: true,
      message: "Sent user successfully",
      user: userData,
      courseDetails: courseDetails,
      classDetails: classDetails,
      studentCount: result.studentCount
    }, {
      // OPTIMIZATION 4: Add cache headers
      headers: {
        'Cache-Control': 'private, max-age=60',
      }
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}