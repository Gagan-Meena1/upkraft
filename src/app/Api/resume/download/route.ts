import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { connect } from "@/dbConnection/dbConfic";
import Registration from "@/models/Registration";
import { Readable } from "stream";

export const runtime = "nodejs";

// Centralized env validation + lazy client
function getS3Config() {
  const region =
    process.env.AWS_REGION ||
    process.env.AWS_REGION_CUSTOM ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION ||
    process.env.NEXT_PUBLIC_AWS_REGION_CUSTOM;

  const bucket =
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME_CUSTOM;

  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID_CUSTOM;

  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY_CUSTOM;

  if (!region) throw new Error("S3 region is not configured");
  if (!bucket) throw new Error("S3 bucket is not configured");
  if (!accessKeyId || !secretAccessKey)
    throw new Error("S3 credentials missing");

  return { region, bucket, accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!s3Client) {
    const { region, accessKeyId, secretAccessKey } = getS3Config();
    s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get("id");
    const resumeUrl = searchParams.get("url");

    // If registrationId is provided, fetch from database
    if (registrationId) {
      await connect();
      const registration = await Registration.findById(registrationId).lean();
      
      if (!registration) {
        return NextResponse.json(
          { error: "Registration not found" },
          { status: 404 }
        );
      }

      if (!registration.resumeUrl) {
        return NextResponse.json(
          { error: "No resume available for this tutor" },
          { status: 404 }
        );
      }

      // Extract S3 key from URL
      // Handle formats like:
      // - https://bucket.s3.region.amazonaws.com/key
      // - https://bucket.s3-region.amazonaws.com/key
      // - https://s3.region.amazonaws.com/bucket/key
      const url = registration.resumeUrl;
      let key = "";
      
      // Try to extract key from standard S3 URL formats
      const patterns = [
        /https?:\/\/[^\/]+\.s3[.-][^\/]+\/(.+)$/,  // bucket.s3.region/key or bucket.s3-region/key
        /https?:\/\/s3[.-][^\/]+\/[^\/]+\/(.+)$/,   // s3.region/bucket/key
        /https?:\/\/[^\/]+\/(.+)$/,                 // fallback: anything after first /
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          key = match[1];
          break;
        }
      }
      
      if (!key) {
        return NextResponse.json(
          { error: "Invalid resume URL format" },
          { status: 400 }
        );
      }
      const { bucket } = getS3Config();
      const client = getS3Client();

      // Fetch file from S3
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await client.send(command);
      
      if (!response.Body) {
        return NextResponse.json(
          { error: "Resume file not found in S3" },
          { status: 404 }
        );
      }

      // Convert stream to buffer
      // AWS SDK v3 returns Body as Readable stream in Node.js
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      
      // Read the stream into chunks
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      
      const buffer = Buffer.concat(chunks);

      // Determine content type
      const contentType = response.ContentType || "application/octet-stream";
      const fileName = registration.resumeFileName || "resume.pdf";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    // If resumeUrl is provided directly
    if (resumeUrl) {
      // Extract S3 key from URL
      // Handle formats like:
      // - https://bucket.s3.region.amazonaws.com/key
      // - https://bucket.s3-region.amazonaws.com/key
      // - https://s3.region.amazonaws.com/bucket/key
      let key = "";
      
      // Try to extract key from standard S3 URL formats
      const patterns = [
        /https?:\/\/[^\/]+\.s3[.-][^\/]+\/(.+)$/,  // bucket.s3.region/key or bucket.s3-region/key
        /https?:\/\/s3[.-][^\/]+\/[^\/]+\/(.+)$/,   // s3.region/bucket/key
        /https?:\/\/[^\/]+\/(.+)$/,                 // fallback: anything after first /
      ];
      
      for (const pattern of patterns) {
        const match = resumeUrl.match(pattern);
        if (match && match[1]) {
          key = match[1];
          break;
        }
      }
      
      if (!key) {
        return NextResponse.json(
          { error: "Invalid resume URL format" },
          { status: 400 }
        );
      }
      const { bucket } = getS3Config();
      const client = getS3Client();

      // Fetch file from S3
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await client.send(command);
      
      if (!response.Body) {
        return NextResponse.json(
          { error: "Resume file not found in S3" },
          { status: 404 }
        );
      }

      // Convert stream to buffer
      // AWS SDK v3 returns Body as Readable stream in Node.js
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      
      // Read the stream into chunks
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });
      
      const buffer = Buffer.concat(chunks);

      // Determine content type and filename
      const contentType = response.ContentType || "application/octet-stream";
      const fileName = key.split("/").pop() || "resume.pdf";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": buffer.length.toString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Either 'id' or 'url' parameter is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error downloading resume:", error);
    return NextResponse.json(
      {
        error: "Failed to download resume",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
