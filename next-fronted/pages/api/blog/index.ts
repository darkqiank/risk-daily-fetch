import { NextApiRequest, NextApiResponse } from "next";

import {
  batchInsertBlog,
  BlogFilters,
  getPaginatedData,
} from "@/db/schema/t_blog";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const blogs = await req.body;

    if (Array.isArray(blogs)) {
      // 如果是 List 格式，直接输入 batchUpsertX/batchInsertX
      await batchInsertBlog(blogs);
    } else if (typeof blogs === "object" && blogs !== null) {
      // 如果是 KV 格式，将所有 values 作为 List 输入 batchUpsertX/batchInsertX
      const valuesList = Object.entries(blogs).reduce(
        (acc: object[], [key, values]: [string, any]) => {
          values.forEach((value: string) => {
            acc.push({ url: value, blog_name: key });
          });

          return acc;
        },
        [],
      );

      await batchInsertBlog(valuesList);
    }
    res.status(200).json({ success: "blogs updated!" });
  } else if (req.method === "GET") {
    // 获取日期参数
    const { blog_name, date, page, pageSize } = req.query;

    const pn = parseInt(page as string, 10) || 1;
    const ps = parseInt(pageSize as string, 10) || 5;

    try {
      const filters: BlogFilters = {};

      if (typeof blog_name === "string") {
        filters.blog_name = blog_name;
      }
      if (typeof date === "string") {
        filters.date = date;
      }

      const res_data = await getPaginatedData(filters, pn, ps);

      res.status(200).json(res_data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
