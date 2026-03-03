import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import Class from '@/models/Class'; // Import Class model to get class details
import courseName from '@/models/courseName'; // Import Course model to get course name
import { sendEmail } from '@/helper/mailer';
import { RekognitionClient, StartContentModerationCommand } from '@aws-sdk/client-rekognition';

export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();
    const { studentId, classId, videoUrl, s3Key } = body;

    if (!studentId || !classId || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, classId, videoUrl' },
        { status: 400 }
      );
    }

    const student = await User.findById(studentId);

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const attendanceRecord = student.attendance.find(
      (att: any) => att.classId.toString() === classId
    );

    if (attendanceRecord) {
      attendanceRecord.videoUrl = videoUrl;
    } else {
      student.attendance.push({
        classId,
        status: 'not_marked',
        videoUrl,
      });
    }

    await student.save();

    // ✅ Get class and course details for email
    try {
      const classData = await Class.findById(classId).populate('course');
      
      if (classData && student.email) {
        const courseName = classData.course?.title || 'Your Course';
        const className = classData.title || 'Class Recording';
        const classDate = classData.startTime 
          ? new Date(classData.startTime).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: '2-digit' 
            })
          : '';

        // Send email with video links
        await sendEmail({
          email: student.email,
          emailType: 'VIDEO_SHARE',
          username: student.username,
          className: className,
          courseName: courseName,
          classDate: classDate,
          videoUrl: videoUrl,
          message: 'Your class recording is now available. You can watch or download it using the links below.',
        });

        console.log(`✅ Video email sent to ${student.email}`);
      }
    } catch (emailError) {
      // Log error but don't fail the main operation
      console.error('❌ Failed to send video email:', emailError);
    }

    // Start Rekognition content moderation (async, fire-and-forget — does not block response)
    if (s3Key && process.env.AWS_S3_BUCKET_NAME) {
      const rekognition = new RekognitionClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
      });
      rekognition.send(new StartContentModerationCommand({
        Video: { S3Object: { Bucket: process.env.AWS_S3_BUCKET_NAME, Name: s3Key } },
        MinConfidence: 60,
      })).then(res => {
        console.log(`✅ Rekognition moderation job started for ${s3Key}: ${res.JobId}`);
      }).catch(err => {
        console.error('❌ Rekognition moderation failed to start:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Video URL saved successfully and email sent',
    });

  } catch (error: any) {
    console.error('Error saving video URL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save video URL' },
      { status: 500 }
    );
  }
}