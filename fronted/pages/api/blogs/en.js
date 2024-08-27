import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,  // 依据实际情况设置
});

export default async (req, res) => {
  const { date } = req.query;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `risk/blogs/en/${date}.json`,
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await client.send(command);
    const jsonContent = JSON.parse(await streamToString(data.Body));
    res.status(200).json(jsonContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch or parse JSON file' });
  }
};


// Utility function to convert a ReadableStream to a string
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
};