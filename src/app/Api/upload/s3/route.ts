import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoData, classId, studentId } = body;

    if (!videoData || !classId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: videoData, classId, studentId' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const fileName = `class-recordings/${classId}/${studentId}_${Date.now()}.webm`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: 'video/webm',
    });

    await s3Client.send(command);

    // Generate public URL
    const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
    });

  } catch (error: any) {
    console.error('S3 upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload video to S3' },
      { status: 500 }
    );
  }
}