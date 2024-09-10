import React, { useEffect, useState } from "react";
import { Pagination, ScrollShadow } from "@nextui-org/react";

import PreviewCard from "../ui/previewcard";

const BlogList = () => {
  const [blogs, setBlogs] = useState();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUrlMeta = async (url: any) => {
    const response = await fetch(`/api/proxy/?url=${encodeURIComponent(url)}`);

    if (response.ok) {
      const jsonData = await response.json();
      const newJsonData = {
        url: jsonData.url,
        description: jsonData.description,
        title: jsonData.title,
        logo: jsonData.favicons?.[0],
        image: jsonData.images?.[0],
        publisher: jsonData.siteName,
        video: jsonData.videos?.[0],
      } as any;

      return newJsonData;
    }

    return null;
  };

  const fetchData = async (page: any) => {
    try {
      const response = await fetch(`/api/blog/?page=${page}`);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;

      let blogs = jsonData.data;

      // 为没有 info 的博客项目获取元数据
      const blogsWithInfo = (await Promise.all(
        blogs.map(async (blog: any) => {
          if (!blog.info) {
            try {
              console.log(blog.url);
              const metaInfo = await fetchUrlMeta(blog.url);

              if (metaInfo) {
                metaInfo.url = metaInfo.url || blog.url;
                metaInfo.title = metaInfo.title || blog.url;
                metaInfo.publisher = metaInfo.publisher || blog.blog_name;

                return { ...blog, info: metaInfo };
              }
            } catch (error) {
              console.error(`Error fetching meta for ${blog.url}:`, error);
            }
          }
          blog.info = {
            url: blog.url,
            title: blog.url,
            publisher: blog.blog_name,
          };

          return blog;
        }),
      )) as any;

      setBlogs(blogsWithInfo);
      setTotal(total);
    } catch (err) {
      console.error("Error fetching blog data:", err);
    }
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
    fetchData(newPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);
  // console.log(data);
  if (!blogs) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center space-y-4">
      <ScrollShadow className="w-[600px] h-[400px] p-4">
        <div className="flex flex-col space-y-4">
          {(blogs as []).map((item: any) => {
            let info = item.info;

            console.log("info:", info);

            return (
              <div key={item.url}>
                <PreviewCard {...info} />
              </div>
            );
          })}
        </div>
      </ScrollShadow>
      <Pagination
        showControls
        color="success"
        initialPage={1}
        total={total}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default BlogList;
