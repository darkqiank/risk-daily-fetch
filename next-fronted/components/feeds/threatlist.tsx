import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Pagination, Select, SelectItem } from "@nextui-org/react";

import ThreatTable from "../ui/threatTable";

const ThreatList = () => {
  const [threats, setThreats] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [aptFilter, setAptFilter] = React.useState("all");
  const [euFilter, setEuFilter] = React.useState("all");

  const [loading, setLoading] = useState(false);

  const handleSelectionSourceChange = (e: any) => {
    setSourceFilter(e.target.value);
  };
  const handleSelectionAptChange = (e: any) => {
    setAptFilter(e.target.value);
  };
  const handleSelectionEuChange = (e: any) => {
    setEuFilter(e.target.value);
  };

  const fetchData = async (
    page: any,
    sourceFilter: any,
    aptFilter: any,
    euFilter: any,
  ) => {
    try {
      setLoading(true);
      let url = `/api/threat/?page=${page}`;

      if (sourceFilter != "all") {
        url = url + `&sourceType=${sourceFilter}`;
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
    fetchData(page, sourceFilter, aptFilter, euFilter);
  }, [page, sourceFilter, aptFilter, euFilter]);

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
        <Select
          className="max-w-xs"
          defaultSelectedKeys={["all"]}
          label="来源类型"
          selectedKeys={[sourceFilter]}
          size="sm"
          onChange={handleSelectionSourceChange}
        >
          <SelectItem key={"twitter"}>推特</SelectItem>
          <SelectItem key={"blog"}>博客</SelectItem>
          <SelectItem key={"all"}>不限</SelectItem>
        </Select>
        <Select
          className="max-w-xs"
          defaultSelectedKeys={["all"]}
          label="APT"
          selectedKeys={[aptFilter]}
          size="sm"
          onChange={handleSelectionAptChange}
        >
          <SelectItem key={"true"}>是</SelectItem>
          <SelectItem key={"false"}>否</SelectItem>
          <SelectItem key={"all"}>不限</SelectItem>
        </Select>
        <Select
          className="max-w-xs"
          defaultSelectedKeys={["all"]}
          label="欧美"
          selectedKeys={[euFilter]}
          size="sm"
          onChange={handleSelectionEuChange}
        >
          <SelectItem key={"true"}>是</SelectItem>
          <SelectItem key={"false"}>否</SelectItem>
          <SelectItem key={"all"}>不限</SelectItem>
        </Select>
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
