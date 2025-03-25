import { NextApiRequest, NextApiResponse } from "next";

import { getBlogCount } from "@/db/schema/t_blog";
import { getUserXcount } from "@/db/schema/t_x";
import { getBizCount } from "@/db/schema/wechat_biz";
import { getIOCCount } from "@/db/schema/threat_intelligence";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const [bizData, blogData, userData, iocData] = await Promise.all([
      getBizCount(),
      getBlogCount(),
      getUserXcount(),
      getIOCCount(),
    ]);

    // 微信公众号统计
    const wechatStats = {
      monitored: bizData.length,
      total: bizData.reduce((sum, biz) => sum + biz.total, 0),
      new: bizData.reduce((sum, biz) => sum + biz.new, 0),
    };

    // 博客统计
    const blogStats = {
      monitored: blogData.length,
      total: blogData.reduce((sum, blog) => sum + blog.total, 0),
      new: blogData.reduce((sum, blog) => sum + blog.new, 0),
    };

    // Twitter用户统计
    const twitterStats = {
      monitored: userData.length,
      total: userData.reduce((sum, user) => sum + user.total, 0),
      new: userData.reduce((sum, user) => sum + user.new, 0),
    };

    // ioc统计
    const iocStats = {
      total: iocData.reduce((sum, item) => sum + item.total, 0),
      new: iocData.reduce((sum, item) => sum + item.new, 0),
    };

    // 构建统计数据
    const statsData = [
      {
        title: "Twitter用户监控",
        iconType: "X",
        monitored: twitterStats.monitored,
        total: twitterStats.total,
        new: twitterStats.new,
      },
      {
        title: "博客源监控",
        iconType: "Blog",
        monitored: blogStats.monitored,
        total: blogStats.total,
        new: blogStats.new,
      },
      {
        title: "微信公众号监控",
        iconType: "Wechat",
        monitored: wechatStats.monitored,
        total: wechatStats.total,
        new: wechatStats.new,
      },
    ];

    res.status(200).json({
      stats: statsData,
      iocStats: iocStats,
      totals: {
        monitoredTotal: statsData.reduce(
          (sum, item) => sum + item.monitored,
          0,
        ),
        contentTotal: statsData.reduce((sum, item) => sum + item.total, 0),
        newTotal: statsData.reduce((sum, item) => sum + item.new, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "数据加载失败" });
  }
}
