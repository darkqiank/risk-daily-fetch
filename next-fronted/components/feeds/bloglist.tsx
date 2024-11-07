import React, { useEffect, useState } from "react";
import { Chip, Pagination, ScrollShadow } from "@nextui-org/react";
import { CircularProgress } from "@mui/material";
import { Listbox, ListboxItem } from "@nextui-org/react";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import { PreviewCardV2, SkeletonCard } from "../ui/previewcard";

const BlogList = () => {
  const [blogs, setBlogs] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const url = currentSite
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

  const handleSiteSelect = (site: any) => {
    if (site === "all") {
      setCurrentSite(null);
    } else {
      setCurrentSite(site);
    }
    setPage(1);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchSites();
    fetchData(page);
  }, [page, currentSite]);

  // Calculate the total sum of all `total` and `new` values
  const totalSum = (websites as any).reduce(
    (sum: any, item: any) => sum + item.total,
    0,
  );
  const newSum = (websites as any).reduce(
    (sum: any, item: any) => sum + item.new,
    0,
  );

  // console.log(data);
  if (!blogs)
    return (
      <div>
        <CircularProgress />
      </div>
    );

  return (
    <div className="flex gap-2">
      <div className="flex flex-col p-3">
        <div className="flex p-3">
          <FilterAltIcon />
          <p>当前选择：{currentSite && <Chip>{currentSite}</Chip>}</p>
        </div>
        <ScrollShadow className="flex h-[600px] p-4">
          <div>
            <Listbox
              disallowEmptySelection
              aria-label="选择博客来源"
              items={[
                { blog_name: "all", total: totalSum, new: newSum },
                ...websites,
              ]}
              selectionMode="single"
              variant="flat"
              onAction={handleSiteSelect}
            >
              {(item: any) => (
                <ListboxItem
                  key={item.blog_name}
                  endContent={
                    <div className="flex items-center gap-2">
                      {item.new > 0 && (
                        <Chip
                          color="danger"
                          radius="md"
                          size="sm"
                          startContent={<BookmarkAddIcon fontSize="small" />}
                          variant="flat"
                        >
                          {item.new}
                        </Chip>
                      )}
                      <Chip radius="md" size="sm" variant="dot">
                        {item.total}
                      </Chip>
                    </div>
                  }
                  startContent={<RssFeedIcon fontSize="small" />}
                >
                  {item.blog_name}
                </ListboxItem>
              )}
            </Listbox>
          </div>
        </ScrollShadow>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <ScrollShadow className="flex flex-col items-center space-y-4 h-[600px] p-4">
          {loading ? (
            <div className="gap-2 grid sm:grid-cols-1 md:grid-cols-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="sm:w-[50vw] md:w-[50vw]">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : (
            <div className="gap-2 grid sm:grid-cols-1 md:grid-cols-1">
              {(blogs as any).map((item: any) => {
                let info = item.info;

                info.date = item.date;
                console.log("info:", info);

                return (
                  <div key={item.url} className="sm:w-[50vw] md:w-[50vw]">
                    <PreviewCardV2 {...info} />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollShadow>
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
    </div>
  );
};

export default BlogList;
