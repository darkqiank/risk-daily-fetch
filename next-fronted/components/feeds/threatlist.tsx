import React, { useEffect, useRef, useState } from "react";
import { Spin, Pagination, Select } from "antd";

import ThreatTable from "../ui/threatTable";
import MyScrollShadow from "../ui/scroll";

const { Option } = Select;

const ThreatList = () => {
  const [threats, setThreats] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [aptFilter, setAptFilter] = useState("all");
  const [euFilter, setEuFilter] = useState("all");
  const scrollRef = useRef<{ scrollToTop: () => void } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (setter: any) => (value: any) => {
    setter(value);
    setPage(1);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
    scrollRef.current?.scrollToTop(); // 翻页时滚动到顶部
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `/api/threat/?page=${page}`;

      if (sourceTypeFilter !== "all") url += `&sourceType=${sourceTypeFilter}`;
      if (aptFilter !== "all") url += `&apt=${aptFilter}`;
      if (euFilter !== "all") url += `&eu=${euFilter}`;

      const response = await fetch(url);
      const jsonData = await response.json();

      setThreats(jsonData.data);
      setTotal(jsonData.totalRecords);
    } catch (err) {
      console.error("Error fetching threats data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, sourceTypeFilter, aptFilter, euFilter]);

  if (!threats) return <Spin />;

  return (
    <div className="flex flex-col items-center space-y-4 w-full min-w-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader">
            <Spin />
          </div>
        </div>
      )}
      
      {/* 响应式筛选器区域 */}
      <div className="flex flex-col lg:flex-row w-full gap-3 items-start lg:items-center">
        <div className="flex flex-wrap gap-2 lg:gap-3 items-center flex-1 min-w-0">
          <Select
            prefix={<span style={{ fontWeight: 'bold' }}>类型：</span>}
            className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
            defaultValue="all"
            size="small"
            onChange={handleSelectionChange(setSourceTypeFilter)}
          >
            <Option value="twitter">推特</Option>
            <Option value="biz">微信公众号</Option>
            <Option value="blog">博客</Option>
            <Option value="all">不限</Option>
          </Select>
          
          <Select
            prefix={<span style={{ fontWeight: 'bold' }}>来源：</span>}
            className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
            defaultValue="all"
            size="small"
            onChange={handleSelectionChange(setSourceFilter)}
          >
            <Option value="all">不限</Option>
          </Select>
          
          <Select
            prefix={<span style={{ fontWeight: 'bold' }}>APT：</span>}
            className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
            defaultValue="all"
            size="small"
            onChange={handleSelectionChange(setAptFilter)}
          >
            <Option value="true">是</Option>
            <Option value="false">否</Option>
            <Option value="all">不限</Option>
          </Select>
          
          <Select
            prefix={<span style={{ fontWeight: 'bold' }}>欧美：</span>}
            className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
            defaultValue="all"
            size="small"
            onChange={handleSelectionChange(setEuFilter)}
          >
            <Option value="true">是</Option>
            <Option value="false">否</Option>
            <Option value="all">不限</Option>
          </Select>
        </div>
      </div>
      
      <Pagination
        current={page}
        defaultCurrent={1}
        pageSize={20}
        showSizeChanger={false}
        total={total}
        onChange={handlePageChange}
      />
      
      <MyScrollShadow
        ref={scrollRef}
        className="w-full h-[500px] p-4 min-w-0"
        hideScrollBar={false}
        showShadow={false}
      >
        <ThreatTable threats={threats} />
      </MyScrollShadow>
    </div>
  );
};

export default ThreatList;
