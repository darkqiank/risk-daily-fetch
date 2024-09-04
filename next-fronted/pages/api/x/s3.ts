/* eslint-disable import/no-anonymous-default-export */
import { Readable } from "stream";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // 根据实际情况设置
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // 获取日期参数
  const { date } = req.query;

  // 如果没有日期参数，使用当前日期
  const dateParam =
    typeof date === "string" ? date : new Date().toISOString().split("T")[0];

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `risk/twitter/${dateParam}.json`,
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await client.send(command);

    // Ensure that data.Body is defined and is a Readable stream
    if (data.Body && "transformToString" in data.Body) {
      const jsonContent = JSON.parse(
        await streamToString(data.Body as Readable),
      );

      res.status(200).json(jsonContent);
    } else {
      res.status(500).json({ error: "No data received from S3" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch or parse JSON file" });
  }
};

// Utility function to convert a ReadableStream to a string
const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
};
