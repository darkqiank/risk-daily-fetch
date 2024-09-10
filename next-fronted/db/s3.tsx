// lib/s3Client.js
import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // 根据实际情况设置
});

export default client;