import { NextApiRequest, NextApiResponse } from "next";
import { batchInsertContentDetail, DetailFilters, getPaginatedData } from "@/db/schema/content_detail";
import searchClient, { extractHighlightSnippets } from "@/db/search";
import { authenticate } from "@/components/auth";

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

        searchHits = searchResult.hits.map((item: any) => ({
          id: item.id,
          snippet: extractHighlightSnippets(
            [
              item._formatted?.url ?? "",
              item._formatted?.source ?? "",
              item._formatted?.content ?? "",
            ]
              .filter(Boolean) // 自动过滤空字符串
              .join(" ... "), // 用空格连接非空内容
          ),
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
    } else if (req.method === "POST") {
      authenticate(req);
      const data  = req.body;
      console.log(data);
      if (Array.isArray(data)) {
        await batchInsertContentDetail(data);
      } else {
        res.status(400).json({ message: "Invalid data format" });
      }
      res.status(200).json({ message: "Data inserted successfully" });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
