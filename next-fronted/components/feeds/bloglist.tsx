import React, { useEffect, useState } from "react";
import {
  Tag,
  Pagination,
  Card,
  Skeleton,
  Flex,
  Grid,
  Select,
  Space,
  Typography,
} from "antd";
import { LoadingOutlined, FilterOutlined } from "@ant-design/icons";

import { PreviewCardV2 } from "../ui/previewcard";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const BlogList = () => {
  const [blogs, setBlogs] = useState<any>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentSite, setCurrentSite] = useState<string>("all");
  const screens = useBreakpoint();

  // 保持原有的数据获取逻辑不变...

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const url =
        currentSite != "all"
          ? `/api/blog/?page=${page}&withInfo=true&blog_name=${currentSite}`
          : `/api/blog/?page=${page}&withInfo=true`;
      const response = await fetch(url);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;

      let blogs = jsonData.data;

      setBlogs(blogs);
      setTotal(total);
    } catch (err) {
      console.error("Error fetching blog data:", err);
    }
    setLoading(false);
  };

  const fetchSites = async () => {
    try {
      const cachedSites = localStorage.getItem("risk_blog_sites");
      const cachedTime = localStorage.getItem("risk_blog_cacheTime");
      const now = new Date().getTime();

      if (cachedSites && cachedTime && now - parseInt(cachedTime) < 60000) {
        // 1分钟有效期
        const parsedCachedSites = JSON.parse(cachedSites);

        console.log("cachedSites: ", parsedCachedSites.length);
        setWebsites(parsedCachedSites);
      } else {
        const response = await fetch(`/api/blog/?type=total`);
        const jsonData = await response.json();

        console.log("getSites: ", jsonData.length);
        setWebsites(jsonData);
        localStorage.setItem("risk_blog_sites", JSON.stringify(jsonData));
        localStorage.setItem("risk_blog_cacheTime", now.toString());
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchSites();
    fetchData(page);
  }, [page, currentSite]);

  // console.log(data);
  if (!blogs)
    return (
      <div>
        <LoadingOutlined />
      </div>
    );

  // 处理选择器变化
  const handleSiteSelect = (value: string) => {
    setCurrentSite(value);
    setPage(1);
  };

  // 生成选择器选项
  const selectorItems = [
    {
      value: "all",
      label: "全部博客",
      total: websites.reduce((sum, item) => sum + item.total, 0),
      new: websites.reduce((sum, item) => sum + item.new, 0),
    },
    ...websites.map((site) => ({
      value: site.blog_name,
      label: site.blog_name,
      total: site.total,
      new: site.new,
    })),
  ];

  return (
    <Flex vertical gap={16} style={{ padding: 24 }}>
      {/* 筛选控制栏 */}
      <Flex
        align="center"
        gap={16}
        justify="space-between"
        style={{ marginBottom: 24 }}
        wrap="wrap"
      >
        <Space>
          <FilterOutlined />
          <Text strong>博客筛选：</Text>
          <Select
            dropdownRender={(menu) => <div style={{ padding: 8 }}>{menu}</div>}
            style={{ width: screens.md ? 280 : "100%" }}
            value={currentSite}
            onChange={handleSiteSelect}
          >
            {selectorItems.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                <Flex align="center" justify="space-between">
                  <Text ellipsis>{item.label}</Text>
                  <Space size={8}>
                    {item.new > 0 && (
                      <Tag color="red" style={{ marginRight: 0 }}>
                        +{item.new}
                      </Tag>
                    )}
                    <Tag color="default">{item.total}</Tag>
                  </Space>
                </Flex>
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Pagination
          current={page}
          showSizeChanger={false}
          simple={!screens.md}
          total={total} // 假设每页10条
          onChange={handlePageChange}
        />
      </Flex>

      {/* 内容区域 */}
      <div style={{ minHeight: 600 }}>
        {loading ? (
          <Flex vertical gap={16}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            ))}
          </Flex>
        ) : (
          <Flex vertical gap={16}>
            {(blogs || []).map((item: any) => (
              <PreviewCardV2 key={item.url} {...item.info} date={item.date} />
            ))}
          </Flex>
        )}
      </div>
    </Flex>
  );
};

export default BlogList;
