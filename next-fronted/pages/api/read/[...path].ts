import type { NextApiRequest, NextApiResponse } from "next";

import { JSDOM } from "jsdom";
import * as Readability from "@mozilla/readability";
import { RequestBuilder } from "ts-curl-impersonate";
import {Curl} from "curl-wrap-ciff";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { path, format = "json" } = req.query as any;
    let newURL: string;

    if (path[0] === "https:" || path[0] === "http:") {
      newURL = path[0] + "//" + path.slice(1).join("/");
    } else {
      newURL = "https://" + path.join("/");
    }

    console.log("url", newURL);

    const curl = new Curl();
    curl.impersonate('chrome');
    curl.url(newURL);
    curl.get();
    curl.followRedirect(true);
    curl.timeout(30);

    // const response = await new RequestBuilder()
    //   .url(newURL)
    //   .flag("--max-time", "20")
    //   .send();
    // console.log("res", response.response);
    // const dom = new JSDOM(response.response);

    const curl_res = await curl;

    console.log("res", curl_res);
    // 创建一个虚拟 DOM
    const dom = new JSDOM(curl_res.body);

    // 使用 Readability 解析 HTML 内容
    const reader = new Readability.Readability(dom.window.document);
    const article = reader.parse();

    if (format == "html") {
      res.status(200).send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${article?.title}</title>
          </head>
          <body>
            <h1>${article?.title}</h1>
            <p><small>Published: ${article?.publishedTime}</small></p>
            <p><small>Author: ${article?.byline}</small></p>
            <p>Description: ${article?.excerpt}</p>
            <p>${article?.textContent}</p>
          </body>
        </html>
      `);
    } else if (format == "html2") {
      res.status(200).send(`
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <p>${article?.content}</p>
          </body>
        </html>
      `);
    } else {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.status(200).json({
        title: article?.title,
        publishedTime: article?.publishedTime,
        author: article?.byline,
        description: article?.excerpt,
        content: article?.textContent,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
