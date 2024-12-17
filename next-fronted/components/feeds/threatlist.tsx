import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Pagination } from "@nextui-org/react";
import { Select as ASelect } from "antd";

import ThreatTable from "../ui/threatTable";

const ThreatList = () => {
  const [threats, setThreats] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sourceTypeFilter, setSourceTypeFilter] = React.useState("all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [aptFilter, setAptFilter] = React.useState("all");
  const [euFilter, setEuFilter] = React.useState("all");

  const [loading, setLoading] = useState(false);

  const handleSelectionSourceTypeChange = (e: any) => {
    setSourceTypeFilter(e);
  };

  const handleSelectionSourceChange = (e: any) => {
    setSourceFilter(e);
  };

  const handleSelectionAptChange = (e: any) => {
    setAptFilter(e);
  };
  const handleSelectionEuChange = (e: any) => {
    setEuFilter(e);
  };

  const fetchData = async (
    page: any,
    sourceTypeFilter: any,
    aptFilter: any,
    euFilter: any,
  ) => {
    try {
      setLoading(true);
      let url = `/api/threat/?page=${page}`;

      if (sourceTypeFilter != "all") {
        url = url + `&sourceType=${sourceTypeFilter}`;
      }
      if (aptFilter != "all") {
        url = url + `&apt=${aptFilter}`;
      }
      if (euFilter != "all") {
        url = url + `&eu=${euFilter}`;
      }
      const response = await fetch(url);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;

      setThreats(jsonData.data);
      setTotal(total);
    } catch (err) {
      console.error("Error fetching threats data:", err);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchData(page, sourceTypeFilter, aptFilter, euFilter);
  }, [page, sourceTypeFilter, aptFilter, euFilter]);

  // console.log(data);
  if (!threats)
    return (
      <div>
        <CircularProgress />
      </div>
    );
  console.log(threats);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex  w-full gap-3 items-center">
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[
            { value: "twitter", label: "推特" },
            { value: "blog", label: "博客" },
            { value: "all", label: "不限" },
          ]}
          placeholder="select it"
          prefix="类型"
          size="small"
          onChange={handleSelectionSourceTypeChange}
        />
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[{ value: "all", label: "不限" }]}
          placeholder="select it"
          prefix="来源"
          size="small"
          onChange={handleSelectionSourceChange}
        />
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[
            { value: "true", label: "是" },
            { value: "false", label: "否" },
            { value: "all", label: "不限" },
          ]}
          placeholder="select it"
          prefix="APT"
          size="small"
          onChange={handleSelectionAptChange}
        />
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[
            { value: "true", label: "是" },
            { value: "false", label: "否" },
            { value: "all", label: "不限" },
          ]}
          placeholder="select it"
          prefix="欧美"
          size="small"
          onChange={handleSelectionEuChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <ThreatTable threats={threats} />
      </div>
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

export default ThreatList;
