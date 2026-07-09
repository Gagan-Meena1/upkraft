import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getDataFromToken } from '@/helper/getDataFromToken';

const ALLOWED_MIME_PREFIX = 'data:video/webm;base64,';
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const callerId = getDataFromToken(req);
    if (!callerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { videoData, classId, studentId } = body;

    if (!videoData || !classId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: videoData, classId, studentId' },
        { status: 400 }
      );
    }

    if (!videoData.startsWith(ALLOWED_MIME_PREFIX)) {
      return NextResponse.json(
        { success: false, error: 'Only webm video uploads are permitted' },
        { status: 415 }
      );
    }

    // Convert base64 to buffer
    const base64Data = videoData.replace(/^data:video\/webm;base64,/, '');
    const estimatedBytes = Math.ceil(base64Data.length * 0.75);
    if (estimatedBytes > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File exceeds the 200 MB size limit' },
        { status: 413 }
      );
    }
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