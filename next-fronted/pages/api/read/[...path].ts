import type { NextApiRequest, NextApiResponse } from "next";

import { JSDOM } from "jsdom";
import * as Readability from "@mozilla/readability";
import { RequestBuilder } from "ts-curl-impersonate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { path } = req.query as any;
    let newURL = "https://" + path.join('/');
    console.log("url", newURL);

    const response = await new RequestBuilder()
    .url(newURL)
    .preset({ name: "chrome", version: "110" })
    .send();

    console.log("res", response.response);
    // 创建一个虚拟 DOM
    const dom = new JSDOM(response.response);

    // 使用 Readability 解析 HTML 内容
    const reader = new Readability.Readability(dom.window.document);
    const article = reader.parse();

    res.status(200).json({
      title: article?.title,
      content: article?.textContent,
      publishedTime: article?.publishedTime,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" });
  }
};
