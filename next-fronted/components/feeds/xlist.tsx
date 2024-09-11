/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
  ScrollShadow,
  Card,
  CardBody,
  Link,
  User,
  Image,
  CardHeader,
  Divider,
  Chip,
  Pagination,
} from "@nextui-org/react";

import { GradientCircularProgress } from "../ui/progress";

const TweetList = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/x/?page=${page}`);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;
      const twitters = Object.values((jsonData as any).data) as any;

      setData(twitters);
      setTotal(total);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
    fetchData(newPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // console.log(data);
  if (!data)
    return (
      <div>
        <GradientCircularProgress />
      </div>
    );
  const tweets = Object.values(data);

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader">
            <GradientCircularProgress />
          </div>
        </div>
      )}
      <ScrollShadow className="w-1/2 h-[500px] p-4">
        <div className="flex flex-col space-y-4">
          {tweets
            .filter(
              (item: any) =>
                item.x_id.startsWith("tweet-") ||
                item.x_id.startsWith("profile-conversation-"),
            )
            .sort((a: any, b: any) => {
              // 获取时间
              const timeA: any = a.x_id.startsWith("tweet-")
                ? new Date(a.data.created_at)
                : new Date(a.data[0].data.created_at);
              const timeB: any = b.x_id.startsWith("tweet-")
                ? new Date(b.data.created_at)
                : new Date(b.data[0].data.created_at);

              return timeB - timeA; // 从最近到最晚排序
            })
            .map((item: any) => {
              if (item.x_id.startsWith("tweet-")) {
                return (
                  <Card key={item.x_id}>
                    <CardHeader className="flex items-center justify-between gap-3">
                      <User
                        description={
                          <Link isExternal href={item.user_link} size="sm">
                            @{item.username}
                          </Link>
                        }
                        name={item.username}
                      />
                      <span className="text-sm text-gray-300 ml-4">
                        {new Date(item.data.created_at).toLocaleString()}
                      </span>
                    </CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col space-y-4">
                      <span>{item.data.full_text}</span>
                      {item.data.urls &&
                        Object.keys(item.data.urls).length > 0 && (
                          <span className="flex flex-col space-y-2">
                            <Chip color="success" size="sm" variant="dot">
                              Links
                            </Chip>
                            {Object.entries(item.data.urls).map(
                              ([shortLink, links]: any) =>
                                links
                                  .filter((link: string) => link !== null)
                                  .map((link: string, index: any) => (
                                    <Link
                                      key={index}
                                      showAnchorIcon
                                      href={link}
                                      rel="noopener"
                                      target="_blank"
                                    >
                                      {link.length > 50
                                        ? `${link.substring(0, 50)}...`
                                        : link}
                                    </Link>
                                  )),
                            )}
                          </span>
                        )}

                      <div>
                        {item.data.medias &&
                          Object.keys(item.data.medias).length > 0 && (
                            <span className="flex flex-col space-y-2">
                              <Chip color="warning" size="sm" variant="dot">
                                Medias
                              </Chip>
                              <div>
                                <span className="flex flex-wrap gap-1">
                                  {Object.entries(item.data.medias).map(
                                    ([shortMedia, mediaLinks]: any) =>
                                      mediaLinks.map(
                                        (media: any, index: any) => (
                                          <Image
                                            key={index}
                                            alt="media"
                                            src={media}
                                            width={100}
                                          />
                                        ),
                                      ),
                                  )}
                                </span>
                              </div>
                            </span>
                          )}
                      </div>
                    </CardBody>
                  </Card>
                );
              } else if (item.x_id.startsWith("profile-conversation-")) {
                return (
                  <Card key={item.x_id}>
                    <CardHeader className="flex items-center justify-between gap-3">
                      <User
                        description={
                          <Link isExternal href={item.user_link} size="sm">
                            @{item.username}
                          </Link>
                        }
                        name={item.username}
                      />
                      <span className="text-sm text-gray-300 ml-4">
                        {new Date(
                          item.data[0].data.created_at,
                        ).toLocaleString()}
                      </span>
                    </CardHeader>
                    {item.data.map((subItem: any) => (
                      <div key={subItem.x_id}>
                        <Divider />
                        <CardBody className="flex flex-col space-y-4">
                          <span>{subItem.data.full_text}</span>
                          {subItem.data.urls &&
                            Object.keys(subItem.data.urls).length > 0 && (
                              <span className="flex flex-col space-y-2">
                                <Chip color="success" size="sm" variant="dot">
                                  Links
                                </Chip>
                                {Object.entries(subItem.data.urls).map(
                                  ([shortLink, links]: any) =>
                                    links
                                      .filter((link: string) => link !== null)
                                      .map((link: string, index: any) => (
                                        <Link
                                          key={index}
                                          showAnchorIcon
                                          href={link}
                                          rel="noopener"
                                          target="_blank"
                                        >
                                          {link.length > 50
                                            ? `${link.substring(0, 50)}...`
                                            : link}
                                        </Link>
                                      )),
                                )}
                              </span>
                            )}
                          <div>
                            {subItem.data.medias &&
                              Object.keys(subItem.data.medias).length > 0 && (
                                <span className="flex flex-col space-y-2">
                                  <Chip color="warning" size="sm" variant="dot">
                                    Medias
                                  </Chip>
                                  <div>
                                    <span className="flex flex-wrap gap-1">
                                      {Object.entries(subItem.data.medias).map(
                                        ([shortMedia, mediaLinks]: any) =>
                                          mediaLinks.map(
                                            (media: any, index: any) => (
                                              <Image
                                                key={index}
                                                alt="media"
                                                src={media}
                                                width={100}
                                              />
                                            ),
                                          ),
                                      )}
                                    </span>
                                  </div>
                                </span>
                              )}
                          </div>
                        </CardBody>
                      </div>
                    ))}
                  </Card>
                );
              }

              return null;
            })}
        </div>
      </ScrollShadow>
      <Pagination
        showControls
        showShadow
        color="success"
        initialPage={1}
        total={total}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default TweetList;
