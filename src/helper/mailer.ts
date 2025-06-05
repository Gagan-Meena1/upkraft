import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";

console.log("[Mailer] Module initialized");

interface EmailParams {
  email: string;
  emailType: "VERIFY" | "RESET" | "MAGIC_LINK";
  userId?: string;
}

export const sendEmail = async ({ email, emailType, userId }: EmailParams) => {
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

    // Prepare email content
    console.log("[Mailer] Preparing email content");
    let mailOptions = {
      from: 'ankitsuthar8607@gmail.com',
      to: email,
      subject: 'Verify your UpKraft Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff6b6b; text-align: center;">Welcome to UpKraft!</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333;">Please verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}"
                 style="background-color: #ff6b6b; 
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
              <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}" style="color: #ff6b6b; word-break: break-all;">
                ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
              </a>
            </p>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This link will expire in 10 minutes for security reasons.<br>
            If you didn't request this verification, please ignore this email.
          </p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              © 2024 UpKraft. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

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