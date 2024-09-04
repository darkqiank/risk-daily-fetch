import { NextApiRequest, NextApiResponse } from "next";

import { batchUpsertX, getPaginatedData, XFilters } from "@/db/schema/t_x";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const twitters = await req.body;

    await batchUpsertX(twitters);
    res.status(200).json({ success: "twitters updated!" });
  } else if (req.method === "GET") {
    // 获取日期参数
    const { user_id, date, page, pageSize } = req.query;

    const pn = parseInt(page as string, 10) || 1;
    const ps = parseInt(pageSize as string, 10) || 30;

    try {
      const filters: XFilters = {};

      if (typeof user_id === "string") {
        filters.user_id = user_id;
      }
      if (typeof date === "string") {
        filters.date = date;
      }

      const res_data = await getPaginatedData(filters, pn, ps);

      res.status(200).json(res_data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }

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
};
