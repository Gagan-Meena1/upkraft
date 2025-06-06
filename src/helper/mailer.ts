import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";

console.log("[Mailer] Module initialized");

interface EmailParams {
  email: string;
  emailType: "VERIFY" | "RESET" | "MAGIC_LINK" | "ADMIN_APPROVAL" | "USER_CONFIRMATION";
  userId?: string;
  username?: string;
  category?: string;
}

export const sendEmail = async ({ email, emailType, userId, username, category }: EmailParams) => {
  console.log(`[Mailer] Sending ${emailType} email to: ${email}`);
  
  try {
    // Generate a secure token for verification
    console.log("[Mailer] Generating secure token");
    const hashedToken = await bcryptjs.hash(userId?.toString() || email, 10);

    if (emailType === "MAGIC_LINK") {
      console.log("[Mailer] Storing verification token in database");
      // Store the token in user document if they exist, or create a temporary one
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

    // Configure email transport
    console.log("[Mailer] Configuring email transport");
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Prepare email content based on email type
    console.log("[Mailer] Preparing email content");
    let mailOptions;

    if (emailType === "ADMIN_APPROVAL") {
      // Email to admin for approval
      mailOptions = {
        from: 'ankitsuthar8607@gmail.com',
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
      // Email to user confirming their request
      mailOptions = {
        from: 'ankitsuthar8607@gmail.com',
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
    } else {
      // Regular verification email (existing code)
      mailOptions = {
        from: 'ankitsuthar8607@gmail.com',
        to: email,
        subject: 'Verify your UpKraft Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f6; min-height: 100vh;">
            <h1 style="color: #ff8c00; text-align: center;">Welcome to UpKraft!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">Please verify your email address by clicking the link below:</p>
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