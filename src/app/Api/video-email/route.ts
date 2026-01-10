import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/helpers/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      videoUrl, 
      recipientEmail, 
      studentName, 
      className,
      courseName,
      classDate,
      message 
    } = body;

    if (!videoUrl || !recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: videoUrl, recipientEmail' },
        { status: 400 }
      );
    }

    await sendEmail({
      email: recipientEmail,
      emailType: 'VIDEO_SHARE',
      username: studentName,
      className: className,
      courseName: courseName,
      classDate: classDate,
      videoUrl: videoUrl,
      message: message || 'Here is the class recording for your review.',
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error: any) {
    console.error('Error sending video email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}