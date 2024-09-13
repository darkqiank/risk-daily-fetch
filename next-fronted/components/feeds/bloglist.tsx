import React, { useEffect, useState } from "react";
import { Pagination } from "@nextui-org/react";
import { CircularProgress } from "@mui/material";

import { PreviewCard, SkeletonCard } from "../ui/previewcard";

const BlogList = () => {
  const [blogs, setBlogs] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/?page=${page}&withInfo=true`);
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

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);
  // console.log(data);
  if (!blogs)
    return (
      <div>
        <CircularProgress />
      </div>
    );

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading ? (
        <div className="gap-2 grid sm:grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-[27vw]">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : (
        <div className="gap-2 grid sm:grid-cols-1 md:grid-cols-3">
          {(blogs as any).map((item: any) => {
            let info = item.info;

            console.log("info:", info);

            return (
              <div key={item.url} className="w-[27vw]">
                <PreviewCard {...info} />
              </div>
            );
          })}
        </div>
      )}
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

export default BlogList;
