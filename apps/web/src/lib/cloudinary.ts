import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (Priority: ENV -> Hardcoded defaults from user)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "hb1ropwm",
  api_key: process.env.CLOUDINARY_API_KEY || "219453755147514",
  api_secret: process.env.CLOUDINARY_API_SECRET || "QSQ-HbPN10B20hHzIz-sZ9LgJvo",
});

// Configure MinIO
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "sim-alfida";

/**
 * Upload to Cloudinary (Used for routine files: SPMB, Evidences, Reports)
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  filename: string,
  contentType: string = "image/png"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: filename.split(".")[0], // Remove extension for Cloudinary public_id
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload to MinIO (Used for static/internal files: Logos, Signatures, Profiles)
 */
export async function uploadToMinio(
  fileBuffer: Buffer,
  folder: string,
  filename: string,
  contentType: string = "image/png"
): Promise<string> {
  const fullPath = `${folder}/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fullPath,
    Body: fileBuffer,
    ContentType: contentType, // Menggunakan MIME type yang tepat
  });

  await s3Client.send(command);

  // Return the public URL for the file
  const endpoint = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT;
  return `${endpoint}/${BUCKET_NAME}/${fullPath}`;
}
