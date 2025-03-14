import { NextApiRequest, NextApiResponse } from "next";

import { bizFilters, getPaginatedData } from "@/db/schema/wechat_biz";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      // 获取日期参数
      const { date, nickname, page, pageSize } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 20;

      const filters: bizFilters = {};

      if (typeof date === "string") {
        filters.date = date;
      }

      if (typeof nickname === "string") {
        filters.nickname = nickname;
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
