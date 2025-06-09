import type { NextApiRequest, NextApiResponse } from "next";
import { searchByIOC } from "../../../db/schema/threat_intelligence";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { ioc, pn = "1", ps = "20" } = req.query;

    if (!ioc || typeof ioc !== "string") {
      return res.status(400).json({ 
        error: "IOC参数是必需的",
        message: "请提供要搜索的IOC值" 
      });
    }

    const pageNumber = parseInt(pn as string, 10);
    const pageSize = parseInt(ps as string, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ 
        error: "无效的页码",
        message: "页码必须是大于0的整数" 
      });
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ 
        error: "无效的页面大小",
        message: "页面大小必须是1-100之间的整数" 
      });
    }

    // 清理IOC值（去除首尾空格）
    const cleanedIoc = ioc.trim();
    
    if (!cleanedIoc) {
      return res.status(400).json({ 
        error: "IOC值不能为空",
        message: "请提供有效的IOC值" 
      });
    }

    const result = await searchByIOC(cleanedIoc, pageNumber, pageSize);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        totalPages: result.totalPages,
        totalRecords: result.totalRecords,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
      },
      searchTerm: result.searchTerm,
    });
  } catch (error) {
    console.error("IOC搜索错误:", error);
    res.status(500).json({ 
      error: "服务器内部错误",
      message: "搜索IOC时发生错误，请稍后重试" 
    });
  }
} 