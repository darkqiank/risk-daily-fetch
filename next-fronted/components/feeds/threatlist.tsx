import React, { useEffect, useState } from "react";
import { Spin, Pagination, Select } from "antd";

import ThreatTable from "../ui/threatTable";

const { Option } = Select;

const ThreatList = () => {
  const [threats, setThreats] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [aptFilter, setAptFilter] = useState("all");
  const [euFilter, setEuFilter] = useState("all");

  const [loading, setLoading] = useState(false);

  const handleSelectionChange = (setter: any) => (value: any) => {
    setter(value);
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
      setTotal(jsonData.totalPages);
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
    <div className="flex flex-col items-center space-y-4">
      <div className="flex w-full gap-3 items-center">
        <Select
          className="max-w-xs"
          defaultValue="all"
          prefix="类型"
          size="small"
          onChange={handleSelectionChange(setSourceTypeFilter)}
        >
          <Option value="twitter">推特</Option>
          <Option value="blog">博客</Option>
          <Option value="all">不限</Option>
        </Select>
        <Select
          className="max-w-xs"
          defaultValue="all"
          prefix="来源"
          size="small"
          onChange={handleSelectionChange(setSourceFilter)}
        >
          <Option value="all">不限</Option>
        </Select>
        <Select
          className="max-w-xs"
          defaultValue="all"
          prefix="APT"
          size="small"
          onChange={handleSelectionChange(setAptFilter)}
        >
          <Option value="true">是</Option>
          <Option value="false">否</Option>
          <Option value="all">不限</Option>
        </Select>
        <Select
          className="max-w-xs"
          defaultValue="all"
          prefix="欧美"
          size="small"
          onChange={handleSelectionChange(setEuFilter)}
        >
          <Option value="true">是</Option>
          <Option value="false">否</Option>
          <Option value="all">不限</Option>
        </Select>
      </div>
      <Pagination
        current={page}
        pageSize={10}
        showSizeChanger={false}
        total={total * 10}
        onChange={setPage}
      />
      <div className="flex flex-col gap-2">
        <ThreatTable threats={threats} />
      </div>
    </div>
  );
};

export default ThreatList;
