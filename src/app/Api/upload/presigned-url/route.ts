import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
    region: process.env.AWS_REGION_CUSTOM,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_CUSTOM as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_CUSTOM as string,
    },
});

export async function POST(req: NextRequest) {
  console.log("INFO: Presigned URL request received (AWS SDK v3).");
  try {
    const { fileName, fileType, classId } = await req.json();
    console.log("INFO: Request body:", { fileName, fileType, classId });

    if (!fileName || !fileType || !classId) {
      console.error("ERROR: Missing required parameters in presigned URL request.");
      return NextResponse.json({ error: 'File name, type, and classId are required' }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop();
    const key = `uploads/class-videos/${classId}.${fileExtension}`;
    console.log(`INFO: Generated S3 key: ${key}`);

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME_CUSTOM,
        Key: key,
        ContentType: fileType,
        ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 300 } // 5 minutes
    );

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME_CUSTOM}.s3.${process.env.AWS_REGION_CUSTOM}.amazonaws.com/${key}`;
    console.log("INFO: Successfully generated presigned URL and public URL (v3).");

    return NextResponse.json({ 
        uploadUrl,
        key: key,
        publicUrl: publicUrl
    });

  } catch (error) {
    console.error('ERROR: Could not create presigned URL (v3).', error);
    return NextResponse.json({ error: 'Error creating presigned URL' }, { status: 500 });
  }
} 