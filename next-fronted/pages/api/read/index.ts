import type { NextApiRequest, NextApiResponse } from "next";

import { JSDOM } from "jsdom";
import * as Readability from "@mozilla/readability";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      const { htmlContent } = req.body;

      // 创建一个虚拟 DOM
      const dom = new JSDOM(htmlContent);

      // 使用 Readability 解析 HTML 内容
      const reader = new Readability.Readability(dom.window.document);
      const article = reader.parse();

      res.status(200).json({
        title: article?.title,
        content: article?.textContent,
        publishedTime: article?.publishedTime,
      });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
