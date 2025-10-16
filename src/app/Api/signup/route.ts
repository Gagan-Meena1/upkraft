import {connect} from '@/dbConnection/dbConfic'
import User from "@/models/userModel"
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { NextRequest,NextResponse } from 'next/server'
import { sendEmail } from '@/helper/mailer'
import courseName from "@/models/courseName"

export async function POST(request : NextRequest ){
    try{
        console.log("[API/signup] Received POST request.");
        // Connect to the database
        await connect();

        const reqBody = await request.json();
        const {username, email, password, category, contact, emailType} = reqBody;
        console.log("[API/signup] Request body:", { username, email, category, contact, emailType });

        const normalizedEmail = email.toLowerCase();

        const token = request.cookies.get("token")?.value;
        const decodedToken = token ? jwt.decode(token) : null;
        const instructorId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        console.log("[API/signup] Decoded token from cookie.", { instructorId });

        // Check if user with the same email already exists
        const userByEmail = await User.findOne({ email: { $regex: `^${normalizedEmail}$`, $options: 'i' } });
        if (userByEmail) {
            console.warn("[API/signup] User with this email already exists.", { email });
            return NextResponse.json({
                error: "User with this email already exists",
                success: false
            });
        }


        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const age = 1;
        const address = "";
        const newUser = new User({
            username,
            email: normalizedEmail,
            password: hashedPassword,
            category,
            age,
            address,
            contact,
        });

        if (instructorId) {
            newUser.instructorId = Array.isArray(instructorId) ? instructorId : [instructorId];
        }
        console.log("[API/signup] Creating new user object.", { user: newUser.toObject() });

        const savedUser = await newUser.save();
        console.log("[API/signup] Successfully saved new user.", { userId: savedUser._id });

           // If the user is a Tutor, duplicate default courses
        if (category === "Tutor") {
            try {
                console.log("[API/signup] User is a Tutor, duplicating default courses.");
                
                const courseIds = ['68d83ffadfe106de56ae841d', '68d8411fdfe106de56ae91cf'];
                
                for (const courseId of courseIds) {
                    try {
                        console.log(`[API/signup] Fetching course data for ID: ${courseId}`);
                        
                        // Fetch course data from the GET API
                        const baseUrl = request.nextUrl.origin;
                        const getCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses/${courseId}`);
                        
                        if (!getCourseResponse.ok) {
                            console.error(`[API/signup] Failed to fetch course ${courseId}:`, getCourseResponse.status);
                            continue;
                        }
                        
                        const courseResponse = await getCourseResponse.json();
                        const originalCourse = courseResponse.courseDetails;
                        
                        if (!originalCourse) {
                            console.error(`[API/signup] No course details found for ID: ${courseId}`);
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
                        
                        console.log(`[API/signup] Duplicating course: ${originalCourse.title}`);
                        
                        // Create the duplicated course via POST API
                        const createCourseResponse = await fetch(`${baseUrl}/Api/tutors/courses?tutorId=${savedUser._id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(duplicatedCourseData)
                        });
                        
                        if (!createCourseResponse.ok) {
                            const errorText = await createCourseResponse.text();
                            console.error(`[API/signup] Failed to create duplicated course ${originalCourse.title}:`, errorText);
                            continue;
                        }
                        
                        const createResponse = await createCourseResponse.json();
                        console.log(`[API/signup] Successfully duplicated course: ${originalCourse.title}`);
                        
                    } catch (courseError) {
                        console.error(`[API/signup] Error processing course ${courseId}:`, courseError);
                        continue;
                    }
                }
                
                console.log("[API/signup] Finished processing default courses for tutor.");
                
            } catch (courseProcessingError) {
                console.error("[API/signup] Error in course duplication process:", courseProcessingError);
                // Don't fail the registration if course duplication fails
            }
        }

        // If this is a student invitation, send the invitation email
        if (emailType === "STUDENT_INVITATION" && instructorId) {
            // Get tutor information
            const tutor = await User.findById(instructorId);
            if (!tutor) {
                console.error("[API/signup] Tutor not found for ID:", instructorId);
                return NextResponse.json({
                    error: "Tutor not found",
                    success: false
                });
            }

            // Get the latest course for this tutor
            const tutorCourse = await courseName.findOne({ instructorId }).sort({ createdAt: -1 });
            
            // Send invitation email
            await sendEmail({
                email: normalizedEmail,
                emailType: "STUDENT_INVITATION",
                username: username,
                tutorName: tutor.username,
                courseName: tutorCourse ? tutorCourse.title : "Dance Course",
                resetToken: password // Send the original password in the email
            });
        }

        return NextResponse.json({
            message: "User registered successfully",
            success: true,
            savedUser
        });

    } catch(error:any) {
        console.error("[API/signup] An exception occurred.", { error: error.message, stack: error.stack });
        return NextResponse.json({error:error.message});
    }
}