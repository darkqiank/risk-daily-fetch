import { NextApiRequest, NextApiResponse } from "next";

import {
  getPaginatedData,
  threatFilters,
} from "@/db/schema/threat_intelligence";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      // 获取日期参数
      const { date, sourceType, apt, eu, page, pageSize } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 20;

      const filters: threatFilters = {};

      if (typeof date === "string") {
        filters.date = date;
      }

      if (typeof sourceType === "string") {
        filters.sourceType = sourceType;
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

      // if (typeof date === "string") {
      //   const res_data = await getXByDate(date);

      //   res.status(200).json(res_data);
      // } else {
      //   const res_data = await getLatestX();

      //   res.status(200).json(res_data);
      // }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
