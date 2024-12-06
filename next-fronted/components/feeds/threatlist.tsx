import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Pagination } from "@nextui-org/react";

import ThreatTable from "../ui/threatTable";

const ThreatList = () => {
  const [threats, setThreats] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const url = `/api/threat/?page=${page}`;
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
    fetchData(page);
  }, [page]);

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
