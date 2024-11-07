import { NextApiRequest, NextApiResponse } from "next";
import { getLinkPreview } from "link-preview-js";

import {
  batchInsertBlog,
  BlogFilters,
  getBlogCount,
  getPaginatedData,
} from "@/db/schema/t_blog";
import { authenticate } from "@/components/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      authenticate(req);
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
      const { blog_name, date, page, pageSize, withInfo, type } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 6;

      const filters: BlogFilters = {};

      if (typeof blog_name === "string") {
        filters.blog_name = blog_name;
      }
      if (typeof date === "string") {
        filters.date = date;
      }

      let res_data = {};

      if (type === "total") {
        res_data = await getBlogCount();
      } else {
        res_data = await getPaginatedData(filters, pn, ps);

        if (withInfo) {
          // 如果需要更新metaInfo，则请求并返回
          (res_data as any).data = await getMetaInfos(
            (res_data as any).data as any,
          );
        }
      }

      res.status(200).json(res_data);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMetaInfos = async (blogs: []) => {
  let needUpdate = false;
  const blogsWithInfo = (await Promise.all(
    blogs.map(async (blog: any) => {
      if (!blog.info) {
        needUpdate = true;
        try {
          console.log(blog.url);
          const metaInfo = await getLinkPreview(blog.url, {
            timeout: 3000,
          });

          if (metaInfo) {
            metaInfo.url = metaInfo.url || blog.url;
            metaInfo.title =
              metaInfo.title === null || metaInfo.title.trim() === ""
                ? blog.url
                : metaInfo.title;
            metaInfo.siteName = metaInfo.siteName || blog.blog_name;

            return { ...blog, info: metaInfo };
          } else {
            blog.info = {
              url: blog.url,
              title: blog.url,
              siteName: blog.blog_name,
            };
          }
        } catch (error) {
          console.error(`Error fetching meta for ${blog.url}:`, error);
          blog.info = {
            url: blog.url,
            title: blog.url,
            siteName: blog.blog_name,
          };
        }
      }

      return blog;
    }),
  )) as any;

  if (needUpdate) {
    const updateRes = await batchInsertBlog(blogsWithInfo);

    console.log(updateRes);
  }

  return blogsWithInfo;
};
