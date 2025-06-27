import { NextApiRequest, NextApiResponse } from "next";
import { batchInsertContentDetail, DetailFilters, getPaginatedData, fullTextSearch } from "@/db/schema/content_detail";
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

      // 应用过滤条件
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

      // 如果有查询参数，使用全文搜索
      if (typeof query === "string" && query.trim()) {
        res_data = await fullTextSearch(query.trim(), filters, pn, ps);
      } else {
        // 否则使用常规分页查询
      res_data = await getPaginatedData(filters, pn, ps);
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
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
