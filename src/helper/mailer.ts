import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Add S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

console.log("[Mailer] Module initialized");

interface EmailParams {
  email: string;
  emailType: "VERIFY" | "RESET" | "RESET_PASSWORD" | "MAGIC_LINK" | "ADMIN_APPROVAL" | "USER_CONFIRMATION" | "REQUEST_APPROVED" | "STUDENT_INVITATION" | "CLASS_RESCHEDULED" | "CLASS_CANCELLED" | "FEEDBACK_RECEIVED" | "VIDEO_SHARE";
  userId?: string;
  username?: string;
  category?: string;
  resetToken?: string;
  classId?:string;
  tutorName?: string;
  courseName?: string;
  className?: string;
  newDate?: string;
  newTime?: string;
  reasonForReschedule?: string;
  reasonForCancellation?: string;
  originalDate?: string; 
  originalTime?: string; 
  personalFeedback?: string; 
  averageScore?: string;
  feedbackCategory?:string;
  classDate?: string;
  feedbackDetails?: any;
    videoUrl?: string; // Add this
  message?: string; // Add this
}

export const sendEmail = async ({ email, emailType, userId, username, category, resetToken, tutorName, courseName,
  className,     
  newDate,        
  newTime,        
  reasonForReschedule , 
  reasonForCancellation, 
  classId,
  originalDate,  
  originalTime,    
  personalFeedback, 
  averageScore,
  feedbackCategory,
  classDate,
  feedbackDetails,
  videoUrl,
  message
  
 }: EmailParams) => {
  console.log(`[Mailer] Sending ${emailType} email to: ${email}`);
  
  try {
    // Generate a secure token for verification
    console.log("[Mailer] Generating secure token");
    const hashedToken = await bcryptjs.hash(userId?.toString() || email, 10);

    if (emailType === "MAGIC_LINK") {
      console.log("[Mailer] Storing verification token in database");
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            verifyToken: hashedToken,
            verifyTokenExpiry: Date.now() + 600000 // 10 minutes
          }
        },
        { upsert: true, new: true }
      );
      console.log("[Mailer] Token stored successfully");
    }

    // Configure email transport with Google Workspace
    console.log("[Mailer] Configuring email transport");
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.MAIL_USER, // Your Google Workspace email
        pass: process.env.MAIL_PASS  // App password
      },
      // Optional: Add these for better reliability
      tls: {
        rejectUnauthorized: true
      }
    });

    // Verify transporter configuration
    await transport.verify();
    console.log("[Mailer] SMTP connection verified");

    // Prepare email content based on email type
    console.log("[Mailer] Preparing email content");
    let mailOptions;

    // Use your company email as sender
    const fromEmail = process.env.MAIL_USER || 'upkraft@upkraft.in';
    const fromName = 'UpKraft';
    const fromAddress = `${fromName} <${fromEmail}>`;

    if (emailType === "STUDENT_INVITATION") {
      mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'Welcome to UpKraft - Course Invitation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Welcome to UpKraft!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">Hi ${username},</p>
              <p style="font-size: 16px; color: #333;">
                ${tutorName} has invited you to join their course "${courseName}" on UpKraft.
              </p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 16px; color: #333; margin: 0;">
                  <strong>Your Login Credentials:</strong><br>
                  Email: ${email}<br>
                  Password: ${resetToken}
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.DOMAIN}/login"
                   style="background-color: #ff8c00; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          font-weight: bold;
                          display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              <p style="font-size: 16px; color: #333;">
                We recommend changing your password after your first login.
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    } else if (emailType === "RESET_PASSWORD") {
      mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'Reset Your UpKraft Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Reset Your Password</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">You requested to reset your password. Click the link below to set a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.DOMAIN}/reset-password?token=${resetToken}"
                   style="background-color: #ff8c00; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          font-weight: bold;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link in your browser:<br>
                <a href="${process.env.DOMAIN}/reset-password?token=${resetToken}" style="color: #ff8c00; word-break: break-all;">
                  ${process.env.DOMAIN}/reset-password?token=${resetToken}
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 10 minutes for security reasons.<br>
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    } else if (emailType === "ADMIN_APPROVAL") {
      mailOptions = {
        from: fromAddress,
        to: process.env.ADMIN_EMAIL,
        subject: `New ${category} Registration Request - UpKraft`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">New Registration Request</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #ff8c00; margin-bottom: 15px;">Registration Details:</h3>
              <p style="font-size: 16px; color: #333; margin: 10px 0;">
                <strong>Name:</strong> ${username}
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0;">
                <strong>Category:</strong> ${category}
              </p>
              <p style="font-size: 16px; color: #333; margin: 20px 0;">
                A new ${category} has requested to join UpKraft. Please review and approve their registration.
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    } else if (emailType === "USER_CONFIRMATION") {
      mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'Welcome to UpKraft - Request Submitted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Welcome to UpKraft!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">Hi ${username},</p>
              <p style="font-size: 16px; color: #333;">
                Welcome to UpKraft! Thank you for your interest in joining our platform as a ${category}.
              </p>
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 16px; color: #155724; margin: 0;">
                  <strong>✅ Your request has been sent to the admin for approval.</strong>
                </p>
              </div>
              <p style="font-size: 16px; color: #333;">
                You will be able to login once the admin approves your registration. 
                We'll notify you via email once your account is approved.
              </p>
              <p style="font-size: 16px; color: #333;">
                Thank you for choosing UpKraft!
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    } else if (emailType === "REQUEST_APPROVED") {
      mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'Welcome to UpKraft - Request Approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Welcome to UpKraft!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">Hi ${username},</p>
              <p style="font-size: 16px; color: #333;">
                Welcome to UpKraft! Thank you for your interest in joining our platform as a ${category}.
              </p>
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 16px; color: #155724; margin: 0;">
                  <strong>✅ Your request has been APPROVED by the admin.</strong>
                </p>
              </div>
              <p style="font-size: 16px; color: #333;">
                You can now login with your email and password.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.DOMAIN}/login" style="background-color: #ff8c00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to UpKraft</a>
              </div>
              <p style="font-size: 16px; color: #333;">
                Thank you for choosing UpKraft!
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    } 
    else if (emailType === "CLASS_RESCHEDULED") {
  mailOptions = {
    from: fromAddress,
    to: email,
    subject: `Class Rescheduled: ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
        <h1 style="color: #ff8c00; text-align: center;">Class Rescheduled</h1>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi ${username},</p>
          <p style="font-size: 16px; color: #333;">
            Your class <strong>"${courseName}"</strong> has been rescheduled.
          </p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 16px; color: #856404; margin: 0;">
              <strong>📅 New Date & Time:</strong><br>
              ${newDate}<br>
              ${newTime}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin: 0;">
              <strong>Reason for Reschedule:</strong><br>
              ${reasonForReschedule}
            </p>
          </div>

          <p style="font-size: 16px; color: #333;">
            Please make sure to update your calendar accordingly.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.DOMAIN}/login"
               style="background-color: #ff8c00; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;">
              View Course Details
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            © 2024 UpKraft. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
}

else if (emailType === "CLASS_CANCELLED") {
  mailOptions = {
    from: fromAddress,
    to: email,
    subject: `Class Cancelled: ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
        <h1 style="color: #dc3545; text-align: center;">Class Cancelled</h1>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi ${username},</p>
          <p style="font-size: 16px; color: #333;">
            We regret to inform you that the class <strong>"${courseName}"</strong> has been cancelled.
          </p>
          
          <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 16px; color: #721c24; margin: 0;">
              <strong>❌ Cancelled Class:</strong><br>
              Date: ${originalDate}<br>
              Time: ${originalTime}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin: 0;">
              <strong>Reason for Cancellation:</strong><br>
              ${reasonForCancellation}
            </p>
          </div>

          <p style="font-size: 16px; color: #333;">
            We apologize for any inconvenience this may cause. Please check your course page for any updates or rescheduled classes.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.DOMAIN}/login"
               style="background-color: #ff8c00; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;">
              View Course Details
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            © 2025 UpKraft. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
}

// else if (emailType === "FEEDBACK_RECEIVED") {
//  mailOptions = {
//   from: fromAddress,
//   to: email,
//   subject: `New feedback received${courseName ? ` — ${courseName}` : ''}`,
//   html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>Student Feedback Summary</title>
// </head>
// <body style="margin: 0; padding: 0; background-color: #f8f8f6; font-family: Arial, sans-serif;">
//   <div style="max-width: 600px; margin: 0 auto; padding: 20px; min-height: 100vh;">
//     <h1 style="color: #ff8c00; text-align: center; margin-bottom: 20px;">Feedback Received</h1>
//     <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-align: center;">
//       <p style="font-size: 16px; color: #333; margin: 10px 0; line-height: 1.5;">
//         Hi <strong>${username}</strong>,
//       </p>
//       <p style="font-size: 16px; color: #333; margin: 10px 0; line-height: 1.5;">
//         Here is a summary of your recent feedback for the class <strong>"${className}"</strong>${classDate ? ` on <strong>${classDate}</strong>` : ''} in <strong>${courseName}</strong> course.
//       </p>
//       <div
//   style="
//     width: 100px;
//     height: 100px;
//     background-color: #ff8c00;
//     border-radius: 50%;
//     margin: 20px auto 10px auto;
//     color: #ffffff;
//     font-size: 24px;
//     font-weight: bold;
//     text-align: center;
//     line-height: 100px;
//     box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//   "
// >
//   ${averageScore}/10
// </div>
//       <span style="font-size: 14px; color: #666; margin-top: -15px; margin-bottom: 20px; display: block;">Average Score</span>
      
//       ${feedbackDetails ? `
//       <div style="margin: 20px 0;">
//         <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
//           <thead>
//             <tr style="background-color: #f8f9fa;">
//               <th style="padding: 10px; border-bottom: 2px solid #dee2e6; color: #495057;">Skill</th>
//               <th style="padding: 10px; border-bottom: 2px solid #dee2e6; color: #495057; text-align: right;">Score</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${Object.entries(feedbackDetails).map(([key, value]) => `
//               <tr>
//                 <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #212529; text-transform: capitalize;">
//                   ${key.replace(/([A-Z])/g, ' $1').trim()}
//                 </td>
//                 <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: #212529; text-align: right; font-weight: bold;">
//                   ${value}/10
//                 </td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
//       </div>
//       ` : ''}

//       <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: left;">
//         <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; color: #333; font-size: 18px;">Tutor's Feedback</h3>
//         <p style="font-size: 15px; color: #555; font-style: italic;">
//           "${personalFeedback}"
//         </p>
//       </div>
      
//       <div style="margin-top: 30px;">
//         <a href="${process.env.DOMAIN}/student/singleFeedback/${feedbackCategory}?classId=${classId}&studentId=${userId}" style="background-color: #333; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Detailed Report</a>
//       </div>
//     </div>
    
//     <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888;">
//       © 2024 UpKraft. All rights reserved.
//     </div>
//   </div>
// </body>
// </html>
//   `
// };
// }
else if (emailType === "VIDEO_SHARE") {
  // Generate pre-signed URLs (valid for 7 days)
  const url = new URL(videoUrl!);
  const key = url.pathname.substring(1);

  const viewCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });
  const viewUrl = await getSignedUrl(s3Client, viewCommand, { 
    expiresIn: 604800 // 7 days
  });

  const downloadCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ResponseContentDisposition: 'attachment',
  });
  const downloadUrl = await getSignedUrl(s3Client, downloadCommand, { 
    expiresIn: 604800 
  });

  mailOptions = {
    from: fromAddress,
    to: email,
    subject: `Class Recording - ${ username} - ${className || courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
        <h1 style="color: #ff8c00; text-align: center;">Class Recording</h1>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;"><strong>Student:</strong> ${username}</p>
          <p style="font-size: 16px; color: #333;"><strong>Class:</strong> ${className || courseName}</p>
          ${classDate ? `<p style="font-size: 16px; color: #333;"><strong>Date:</strong> ${classDate}</p>` : ''}
          
          ${message ? `<p style="font-size: 16px; color: #666; margin: 20px 0;">${message}</p>` : ''}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${viewUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
              ▶️ Watch Video
            </a>
            
            <a href="${downloadUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
              ⬇️ Download Video
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 14px; color: #856404; margin: 0;">
              ⏰ <strong>Note:</strong> These links will expire in 7 days for security reasons.
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            © 2024 UpKraft. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
}
    else {
      // Regular verification email
      mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'Verify your UpKraft Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Welcome to UpKraft!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">The admin has approved your request. Please verify your email address by clicking the link below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}"
                   style="background-color: #ff8c00; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          font-weight: bold;
                          display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link in your browser:<br>
                <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}" style="color: #ff8c00; word-break: break-all;">
                  ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
                </a>
              </p>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">
              This link will expire in 10 minutes for security reasons.<br>
              If you didn't request this verification, please ignore this email.
            </p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px;">
                © 2024 UpKraft. All rights reserved.
              </p>
            </div>
          </div>
        `
      };
    }

    // Send the email
    console.log("[Mailer] Sending email");
    const mailResponse = await transport.sendMail(mailOptions);
    console.log("[Mailer] Email sent successfully:", mailResponse.messageId);
    
    return mailResponse;

  } catch (error: any) {
    console.error("[Mailer] Error sending email:", error.message);
    throw new Error(error.message);
  }
}