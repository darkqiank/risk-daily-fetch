import React, { useEffect, useState } from "react";
import { List, Typography, Tag } from "antd";
import { Pagination } from "@nextui-org/react";

const ContentList = () => {
  const [datas, setDatas] = useState();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const url = `/api/detail/?page=${page}`;
      const response = await fetch(url);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;
      let ds = jsonData.data;

      setDatas(ds);
      setTotal(total);
    } catch (err) {
      console.error("Error fetching blog data:", err);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div>
      <List
        dataSource={datas}
        itemLayout="vertical"
        renderItem={(item: any) => (
          <List.Item key={item.contentHash}>
            <Typography.Title level={5}>
              <a href={item.url} rel="noopener noreferrer" target="_blank">
                {item.url}
              </a>
            </Typography.Title>
            <div className="flex gap-3">
              <div>
                <strong>来源类型：</strong> {item.sourceType || "未知"}
              </div>
              <div>
                <strong>来源：</strong> {item.source || "未知"}
              </div>
              <div>
                <strong>日期：</strong> {item.date}
              </div>
            </div>
            {item.detail && (
              <div>
                <div className="flex gap-3">
                  <div>
                    <strong>运营商事件：</strong>
                    {item.detail["运营商事件"]}
                  </div>
                  <div>
                    <strong>原因：</strong>
                    {item.detail.原因}
                  </div>
                  <div>
                    <strong>国家：</strong>
                    {/* {item.detail.国家.map((country: any) => (
                      <Tag key={country}>{country}</Tag>
                    ))} */}
                    {Array.isArray(item.detail.国家) ? (
                      item.detail.国家.map((country: any) => (
                        <Tag key={country}>{country}</Tag>
                      ))
                    ) : item.detail.国家 ? (
                      <span>{item.detail.国家}</span>
                    ) : (
                      "无"
                    )}
                  </div>
                </div>
                {item.extractionResult && (
                  <div className="flex gap-3">
                    <div>
                      <strong>APT：</strong>
                      {item.extractionResult.data.APT}
                    </div>
                    <div>
                      <strong>欧美：</strong>
                      {item.extractionResult.data.欧美}
                    </div>
                    {/* <div>
                      <strong>iocs：</strong>
                      {item.extractionResult.data.iocs}
                    </div> */}
                  </div>
                )}
                <div>
                  <strong>摘要：</strong>
                  {item.detail.摘要}
                </div>
              </div>
            )}
          </List.Item>
        )}
        size="large"
      />
      <Pagination
        showControls
        showShadow
        color="success"
        initialPage={1}
        page={page}
        total={total}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default ContentList;
