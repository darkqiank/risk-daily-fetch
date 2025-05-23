import { NextApiRequest, NextApiResponse } from "next";

import {
  batchInsertX,
  getXDataById,
  getPaginatedData,
  getUserXcount,
  XFilters,
} from "@/db/schema/t_x";
import { authenticate } from "@/components/auth";
import { XDataParse } from "@/components/feeds/x_data_parse";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      //进行认证
      authenticate(req);
      const twitters = await req.body;

      if (Array.isArray(twitters)) {
        // 如果是 List 格式，直接输入 batchUpsertX/batchInsertX
        await batchInsertX(twitters);
      } else if (typeof twitters === "object" && twitters !== null) {
        // 如果是 KV 格式，将所有 values 作为 List 输入 batchUpsertX/batchInsertX
        const valuesList = Object.values(twitters);

        await batchInsertX(valuesList);
      } else {
        res.status(400).json({ error: "Invalid data format" });

        return;
      }
      res.status(200).json({ success: "twitters updated!" });
    } else if (req.method === "GET") {
      // 获取日期参数
      const { user_id, x_id, date, page, pageSize, type } = req.query;

      const pn = parseInt(page as string, 10) || 1;
      const ps = parseInt(pageSize as string, 10) || 20;

      const filters: XFilters = {};
      let res_data = {};

      if (typeof x_id === "string") {
        // 查询特定x数据
        res_data = await getXDataById(x_id);
      } else {
        // 分页筛选请求x数据
        if (typeof user_id === "string") {
          filters.user_id = user_id;
        }
        if (typeof date === "string") {
          filters.date = date;
        }

        if (type === "total") {
          res_data = await getUserXcount();
        } else if (type === "feed") {
          res_data = await getPaginatedData(filters, pn, ps);
          const feed_data = XDataParse(Object.values((res_data as any).data));

          res_data = {
            url: feed_data,
          };
        } else {
          res_data = await getPaginatedData(filters, pn, ps);
        }
      }

      res.status(200).json(res_data);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
