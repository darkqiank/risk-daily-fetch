import { NextApiRequest, NextApiResponse } from "next";

import { DetailFilters, getPaginatedData } from "@/db/schema/content_detail";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      // 获取日期参数
      const { date, sourceType, home, op, apt, eu, page, pageSize } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 20;

      const filters: DetailFilters = {};

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

      let res_data = {};

      res_data = await getPaginatedData(filters, pn, ps);

      res.status(200).json(res_data);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
