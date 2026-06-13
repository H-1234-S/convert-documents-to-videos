import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export const r2Client =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

export function generateAssetKey(
  userId: string,
  projectId: string,
  assetId: string,
  ext: string
): string {
  return `${userId}/${projectId}/${assetId}.${ext}`;
}

export interface UploadParams {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  sizeBytes: number;
  checksum: string;
}

export async function uploadToR2(params: UploadParams): Promise<UploadResult> {
  throw new Error("uploadToR2 not implemented in Epic 1");
}

export interface SignedUrlParams {
  key: string;
  purpose: "download" | "preview";
  expiresIn?: number;
}

export async function getSignedUrl(params: SignedUrlParams): Promise<string> {
  throw new Error("getSignedUrl not implemented in Epic 1");
}

export async function deleteFromR2(key: string): Promise<void> {
  throw new Error("deleteFromR2 not implemented in Epic 1");
}
