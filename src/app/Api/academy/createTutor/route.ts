import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest,NextResponse } from 'next/server'
import { sendEmail } from '@/helper/mailer'
import courseName from "@/models/courseName"

export async function POST(request : NextRequest ){
    try{
        console.log("[API/academy/createTutor] Received POST request.");
        // Connect to the database
        await connect();

        const reqBody = await request.json();
        const {username, email, password} = reqBody;
        console.log("[API/academy/createTutor] Request body:", { username, email });

        // Validate required fields
        if (!username || !email || !password) {
            return NextResponse.json({
                error: "Username, email, and password are required",
                success: false
            }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        // Get academy user from token
        const token = (() => {
      const referer = request.headers.get("referer") || "";
      let refererPath = "";
      try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
      const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
      return (isTutorContext && request.cookies.get("impersonate_token")?.value) ? request.cookies.get("impersonate_token")?.value : request.cookies.get("token")?.value;
    })();
        if (!token) {
            return NextResponse.json({
                error: "Authentication required",
                success: false
            }, { status: 401 });
        }

        const decodedToken = token ? jwt.decode(token) : null;
        const academyId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!academyId) {
            return NextResponse.json({
                error: "Invalid token",
                success: false
            }, { status: 401 });
        }

        // Verify the user is an Academy
        const academy = await User.findById(academyId);
        if (!academy || academy.category !== "Academic") {
            return NextResponse.json({
                error: "Only academies can create tutors",
                success: false
            }, { status: 403 });
        }

        console.log("[API/academy/createTutor] Academy verified:", academy.username);

        // Check if user with the same email already exists
        const userByEmail = await User.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
        if (userByEmail) {
            console.warn("[API/academy/createTutor] User with this email already exists.", { email });
            return NextResponse.json({
                error: "User with this email already exists",
                success: false
            }, { status: 400 });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new tutor user - automatically verified since created by academy
        const newTutor = new User({
            username,
            email: normalizedEmail,
            password: hashedPassword,
            category: "Tutor",
            age: 1,
            address: "",
            contact: "",
            isVerified: true, // Auto-verify tutors created by academies
            // instructorId: [academyId], // Link tutor to academy
            academyId: academyId
        });

        console.log("[API/academy/createTutor] Creating new tutor object.");
        const savedTutor = await newTutor.save();
        console.log("[API/academy/createTutor] Successfully saved new tutor.", { tutorId: savedTutor._id });
        await academy.tutors.push(savedTutor._id);
        await academy.save();
        console.log("[API/academy/createTutor] Linked tutor to academy.");


        // If the user is a Tutor, duplicate default courses
        try {
            console.log("[API/academy/createTutor] Duplicating default courses for tutor.");
            
            const courseIds = ['68d83ffadfe106de56ae841d', '68d8411fdfe106de56ae91cf'];
            
            for (const courseId of courseIds) {
                try {
                    console.log(`[API/academy/createTutor] Fetching course data for ID: ${courseId}`);
                    
                    // Fetch course data from the GET API
                    const baseUrl = request.nextUrl.origin;
                    const getCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses/${courseId}`);
                    
                    if (!getCourseResponse.ok) {
                        console.error(`[API/academy/createTutor] Failed to fetch course ${courseId}:`, getCourseResponse.status);
                        continue;
                    }
                    
                    const courseResponse = await getCourseResponse.json();
                    const originalCourse = courseResponse.courseDetails;
                    
                    if (!originalCourse) {
                        console.error(`[API/academy/createTutor] No course details found for ID: ${courseId}`);
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
                    
                    console.log(`[API/academy/createTutor] Duplicating course: ${originalCourse.title}`);
                    
                    // Create the duplicated course via POST API
                    const createCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses?tutorId=${savedTutor._id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(duplicatedCourseData)
                    });
                    
                    if (!createCourseResponse.ok) {
                        const errorText = await createCourseResponse.text();
                        console.error(`[API/academy/createTutor] Failed to create duplicated course ${originalCourse.title}:`, errorText);
                        continue;
                    }
                    
                    const createResponse = await createCourseResponse.json();
                    console.log(`[API/academy/createTutor] Successfully duplicated course: ${originalCourse.title}`);
                    
                } catch (courseError) {
                    console.error(`[API/academy/createTutor] Error processing course ${courseId}:`, courseError);
                    continue;
                }
            }
            
            console.log("[API/academy/createTutor] Finished processing default courses for tutor.");
            
        } catch (courseProcessingError) {
            console.error("[API/academy/createTutor] Error in course duplication process:", courseProcessingError);
            // Don't fail the registration if course duplication fails
        }

        // Send welcome email to the tutor
        try {
            await sendEmail({
                email: normalizedEmail,
                emailType: "TUTOR_CREATED_BY_ACADEMY",
                username: username,
                password: password, // Send password in email
                academyName: academy.username
            });
        } catch (emailError) {
            console.error("[API/academy/createTutor] Error sending email:", emailError);
            // Don't fail the creation if email fails
        }

        return NextResponse.json({
            message: "Tutor created successfully",
            success: true,
            tutor: {
                id: savedTutor._id,
                username: savedTutor.username,
                email: savedTutor.email,
                category: savedTutor.category
            }
        });

    } catch(error:any) {
        console.error("[API/academy/createTutor] An exception occurred.", { error: error.message, stack: error.stack });
        return NextResponse.json({
            error: error.message || "Failed to create tutor",
            success: false
        }, { status: 500 });
    }
}

