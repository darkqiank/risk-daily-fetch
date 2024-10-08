/* eslint-disable import/no-anonymous-default-export */
import { Readable } from "stream";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

import client from "@/db/s3";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // 获取日期参数
  const { date } = req.query;

  // 如果没有日期参数，使用当前日期
  const dateParam =
    typeof date === "string" ? date : new Date().toISOString().split("T")[0];

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `risk/mailtrail/maltrail_iocs_${dateParam}.xlsx`,
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await client.send(command);
    const stream = data.Body as Readable;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mailtrail_iocs_${dateParam}.xlsx"`,
    );
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving or processing the file.");
  }
};
