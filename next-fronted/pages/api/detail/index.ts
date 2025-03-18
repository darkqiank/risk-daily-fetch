import { NextApiRequest, NextApiResponse } from "next";

import { DetailFilters, getPaginatedData } from "@/db/schema/content_detail";
import searchClient from "@/db/search";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      // 获取日期参数
      const {
        date,
        sourceType,
        home,
        op,
        apt,
        eu,
        ioc,
        query,
        page,
        pageSize,
      } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 20;

      const filters: DetailFilters = {};

      let searchHits: Array<{ id: string; snippet: string }> = [];

      if (typeof query === "string" && query.trim()) {
        const searchResult = await searchClient
          .index("meilisearch_index_content_detail")
          .search(query, {
            attributesToHighlight: ["*"],
            highlightPreTag: "__hl__",
            highlightPostTag: "__/hl__",
            limit: 1000,
          });

        // 优化后的高亮处理函数
        const extractHighlightSnippets = (hit: any) => {
          const rawContent = hit._formatted?.content || hit.content || "";

          // 清理换行符和多余空格
          const cleanContent = rawContent
            .replace(/[\n\r]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          // 匹配所有高亮片段
          const highlightRegex = /__hl__(.*?)__\/hl__/g;
          const highlights = [];
          let match;

          // 遍历所有高亮匹配项
          while ((match = highlightRegex.exec(cleanContent)) !== null) {
            const start = Math.max(0, match.index - 20); // 关键词前20字符
            const end = match.index + match[0].length + 20; // 关键词后20字符

            // 截取上下文片段
            const snippet = cleanContent
              .substring(start, end)
              .replace(
                /__hl__/g,
                '<em class="bg-yellow-200 font-bold not-italic">',
              ) // 转换高亮标签
              .replace(/__\/hl__/g, "</em>");

            highlights.push(snippet);
            // 当收集到3个片段时立即停止
            if (highlights.length >= 3) {
              break;
            }
          }

          return highlights.join(" ... ");
        };

        searchHits = searchResult.hits.map((item: any) => ({
          id: item.id,
          snippet: extractHighlightSnippets(item),
        }));

        filters.ids = searchHits.map((item) => item.id);
      }

      if (typeof date === "string") {
        filters.date = date;
      }

      if (typeof sourceType === "string") {
        filters.sourceType = sourceType;
      }

      if (typeof home === "string") {
        filters.home = home;
      }

      if (typeof op === "string") {
        filters.op = op;
      }

      if (typeof apt === "string") {
        filters.apt = apt;
      }

      if (typeof eu === "string") {
        filters.eu = eu;
      }

      if (typeof ioc === "string") {
        filters.ioc = ioc;
      }

      let res_data: { data: any[] } = { data: [] };

      res_data = await getPaginatedData(filters, pn, ps);

      // 合并高亮信息
      if (searchHits.length > 0) {
        const hitMap = new Map(searchHits.map((hit) => [hit.id, hit]));

        res_data = {
          ...res_data,
          data: res_data.data.map((item: any) => ({
            ...item,
            snippet: hitMap.get(item.id)?.snippet || null, // 改为数组
          })),
        };
      }

      res.status(200).json(res_data);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
