// File: pages/api/admin/add-default-courses-to-tutors.js
// OR if using app directory: app/Api/admin/add-default-courses-to-tutors/route.js

import { connect } from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        console.log("[API/add-default-courses] Received POST request to add default courses to existing tutors.");
        
        // Connect to the database
        await connect();
        
        // Default course IDs that should be added to all tutors
        const defaultCourseIds = ['68d83ffadfe106de56ae841d', '68d8411fdfe106de56ae91cf'];
        
        console.log("[API/add-default-courses] Fetching all tutors...");
        
        // Find all users with category "Tutor"
        const tutors = await User.find({ category: "Tutor" });
        
        if (!tutors || tutors.length === 0) {
            console.log("[API/add-default-courses] No tutors found.");
            return NextResponse.json({
                success: true,
                message: "No tutors found in the system.",
                tutorsProcessed: 0,
                coursesAdded: 0
            });
        }
        
        console.log(`[API/add-default-courses] Found ${tutors.length} tutors.`);
        
        let tutorsProcessed = 0;
        let totalCoursesAdded = 0;
        const processingResults = [];
        
        // Process each tutor
        for (const tutor of tutors) {
            try {
                console.log(`[API/add-default-courses] Processing tutor: ${tutor.username} (${tutor._id})`);
                
                // Convert existing course IDs to strings for comparison
                const existingCourseIds = tutor.courses.map(courseId => courseId.toString());
                
                // Find which default courses are missing
                const missingCourseIds = defaultCourseIds.filter(courseId => 
                    !existingCourseIds.includes(courseId)
                );
                
                if (missingCourseIds.length === 0) {
                    console.log(`[API/add-default-courses] Tutor ${tutor.username} already has all default courses.`);
                    processingResults.push({
                        tutorId: tutor._id,
                        tutorName: tutor.username,
                        action: "No action needed",
                        coursesAdded: 0,
                        message: "Already has all default courses"
                    });
                    continue;
                }
                
                console.log(`[API/add-default-courses] Adding ${missingCourseIds.length} missing courses to ${tutor.username}`);
                
                // Create duplicated courses for this tutor
                let coursesAddedForThisTutor = 0;
                
                for (const courseId of missingCourseIds) {
                    try {
                        console.log(`[API/add-default-courses] Fetching course data for ID: ${courseId}`);
                        
                        // Fetch course data from the GET API
                        const baseUrl = request.nextUrl.origin;
                        const getCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses/${courseId}`);
                        
                        if (!getCourseResponse.ok) {
                            console.error(`[API/add-default-courses] Failed to fetch course ${courseId}:`, getCourseResponse.status);
                            continue;
                        }
                        
                        const courseResponse = await getCourseResponse.json();
                        const originalCourse = courseResponse.courseDetails;
                        
                        if (!originalCourse) {
                            console.error(`[API/add-default-courses] No course details found for ID: ${courseId}`);
                            continue;
                        }
                        
                        // Prepare course data for duplication
                        const duplicatedCourseData = {
                            title: originalCourse.title,
                            description: originalCourse.description,
                            duration: originalCourse.duration,
                            price: originalCourse.price,
                            curriculum: originalCourse.curriculum,
                            category: originalCourse.category
                        };
                        
                        console.log(`[API/add-default-courses] Duplicating course: ${originalCourse.title} for tutor: ${tutor.username}`);
                        
                        // Create the duplicated course via POST API
                        const createCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses?tutorId=${tutor._id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(duplicatedCourseData)
                        });
                        
                        if (!createCourseResponse.ok) {
                            const errorText = await createCourseResponse.text();
                            console.error(`[API/add-default-courses] Failed to create duplicated course ${originalCourse.title} for ${tutor.username}:`, errorText);
                            continue;
                        }
                        
                        const createResponse = await createCourseResponse.json();
                        console.log(`[API/add-default-courses] Successfully duplicated course: ${originalCourse.title} for tutor: ${tutor.username}`);
                        
                        coursesAddedForThisTutor++;
                        totalCoursesAdded++;
                        
                    } catch (courseError) {
                        console.error(`[API/add-default-courses] Error processing course ${courseId} for tutor ${tutor.username}:`, courseError);
                        continue;
                    }
                }
                
                processingResults.push({
                    tutorId: tutor._id,
                    tutorName: tutor.username,
                    action: "Processed",
                    coursesAdded: coursesAddedForThisTutor,
                    message: `Added ${coursesAddedForThisTutor} missing default courses`
                });
                
                tutorsProcessed++;
                
            } catch (tutorError) {
                console.error(`[API/add-default-courses] Error processing tutor ${tutor.username}:`, tutorError);
                processingResults.push({
                    tutorId: tutor._id,
                    tutorName: tutor.username,
                    action: "Error",
                    coursesAdded: 0,
                    message: `Error: ${tutorError.message}`
                });
                continue;
            }
        }
        
        console.log(`[API/add-default-courses] Completed processing. Tutors processed: ${tutorsProcessed}, Total courses added: ${totalCoursesAdded}`);
        
        return NextResponse.json({
            success: true,
            message: "Default courses addition process completed",
            totalTutorsFound: tutors.length,
            tutorsProcessed: tutorsProcessed,
            totalCoursesAdded: totalCoursesAdded,
            processingResults: processingResults
        });
        
    } catch (error: any) {
        console.error("[API/add-default-courses] An exception occurred.", { error: error.message, stack: error.stack });
        return NextResponse.json({
            success: false,
            error: error.message,
            message: "Failed to add default courses to tutors"
        }, { status: 500 });
    }
}

// Optional: Add GET method to check which tutors are missing default courses
// export async function GET(request: NextRequest) {
//     try {
//         console.log("[API/add-default-courses] GET request - Checking tutors missing default courses.");
        
//         await connect();
        
//         const defaultCourseIds = ['68d83ffadfe106de56ae841d', '68d8411fdfe106de56ae91cf'];
        
//         // Find all tutors
//         const tutors = await User.find({ category: "Tutor" }).select('username email courses');
        
//         const tutorsStatus = tutors.map(tutor => {
//             const existingCourseIds = tutor.courses.map(courseId => courseId.toString());
//             const missingCourseIds = defaultCourseIds.filter(courseId => 
//                 !existingCourseIds.includes(courseId)
//             );
            
//             return {
//                 tutorId: tutor._id,
//                 tutorName: tutor.username,
//                 email: tutor.email,
//                 totalCourses: tutor.courses.length,
//                 hasAllDefaultCourses: missingCourseIds.length === 0,
//                 missingCourseIds: missingCourseIds,
//                 missingCourseCount: missingCourseIds.length
//             };
//         });
        
//         const tutorsNeedingCourses = tutorsStatus.filter(tutor => !tutor.hasAllDefaultCourses);
        
//         return NextResponse.json({
//             success: true,
//             totalTutors: tutors.length,
//             tutorsWithAllCourses: tutorsStatus.length - tutorsNeedingCourses.length,
//             tutorsNeedingCourses: tutorsNeedingCourses.length,
//             defaultCourseIds: defaultCourseIds,
//             tutorsStatus: tutorsStatus
//         });
        
//     } catch (error: any) {
//         console.error("[API/add-default-courses] GET request error:", error);
//         return NextResponse.json({
//             success: false,
//             error: error.message
//         }, { status: 500 });
//     }
// }