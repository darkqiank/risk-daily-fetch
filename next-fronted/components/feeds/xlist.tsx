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
  Badge,
  Avatar,
} from "@nextui-org/react";
import GroupIcon from "@mui/icons-material/Group";
import { Tooltip } from "@mui/material";

import { GradientCircularProgress } from "../ui/progress";

const TweetList = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUsers] = useState(null);
  const [offset, setOffset] = useState(0);

  const UserScroll: any = ({ userInfos }: any) => {
    const itemWidth = 40; // 每个 Avatar 的宽度，包括间距
    let userCount = (userInfos as []).length;
    const totalNew = userInfos.reduce(
      (sum: any, user: any) => sum + user.new,
      0,
    );
    const UserUpdateInfo = (userInfo: any) => {
      return (
        <Badge color="danger" content={`${userInfo.new}`}>
          <Tooltip title={`${userInfo.username}`}>
            <Avatar
              data-hover
              isFocusable
              className={`w-[50px] h-[50px] transition-transform duration-200 transform
             hover:scale-150 hover:border-2 hover:border-blue-500 cursor-pointer
             ${(currentUser as unknown as string) === (userInfo.user_id as string) ? "scale-150 border-grey-500 border-2 z-5" : "z-1"}
             `}
              src={`${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${userInfo.user_id}.png`}
              onClick={() => handleUserSelect(userInfo.user_id)}
              onMouseEnter={() => {
                handleHover(userInfo.user_id);
              }}
            />
          </Tooltip>
        </Badge>
      );
    };

    const handleHover = (userId: any) => {
      const index = userId
        ? userInfos.findIndex((user: any) => user.user_id === userId)
        : -1;

      if (index !== -1) {
        setOffset(index);
        console.log("offset", offset);
      }
    };

    const handleUserSelect = (user_id: any) => {
      setCurrentUsers(user_id);
      setPage(1);
    };

    return (
      <div className="relative w-1/3 h-[100px] overflow-hidden p-4">
        {/* Blurred edges */}
        <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-background to-transparent z-10 cursor-pointer" />
        <div className="absolute right-0 top-0 bottom-0 w-[10px] bg-gradient-to-l from-background to-transparent z-10 cursor-pointer" />
        <div className="px-10">
          <div
            className="flex space-x-4 items-center justify-cente transition-transform duration-500"
            style={{ transform: `translateX(-${offset * itemWidth}px)` }}
          >
            <div>
              <Badge color="danger" content={`${totalNew}`}>
                <Avatar
                  data-hover
                  isFocusable
                  className={`bg-gradient-to-br from-[#FFB457] to-[#F31260] w-[50px] h-[50px] transition-transform duration-200 transform
       hover:scale-150 hover:border-2 hover:border-blue-500 hover:z-5 cursor-pointer
       ${!currentUser ? "scale-150 border-grey-500 border-2 z-5" : "z-1"}
       `}
                  icon={<GroupIcon className="text-white" />}
                  onClick={() => handleUserSelect(null)}
                  onMouseEnter={() => handleHover(null)}
                />
              </Badge>
            </div>
            {userInfos.map((user: any) => {
              return (
                <div key={user.user_id}>
                  <UserUpdateInfo {...user} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const fetchData = async (page: any) => {
    try {
      setLoading(true);
      const url = currentUser
        ? `/api/x/?page=${page}&user_id=${currentUser}`
        : `/api/x/?page=${page}`;
      const response = await fetch(url);
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

  const fetchUsers = async () => {
    try {
      const cachedUsers = localStorage.getItem("risk_x_users");
      const cacheTime = localStorage.getItem("risk_x_cacheTime");
      const now = new Date().getTime();

      if (cachedUsers && cacheTime && now - parseInt(cacheTime) < 60000) {
        // 1分钟有效期
        console.log(cachedUsers);
        setUsers(JSON.parse(cachedUsers));
      } else {
        const response = await fetch(`/api/x/?type=total`);
        const jsonData = await response.json();

        setUsers(jsonData);
        localStorage.setItem("risk_x_users", JSON.stringify(jsonData));
        localStorage.setItem("risk_x_cacheTime", now.toString());
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchUsers();
    fetchData(page);
  }, [page, currentUser]);

  // console.log(data);
  if (!data)
    return (
      <div>
        <GradientCircularProgress />
      </div>
    );
  const tweets = Object.values(data);
  const x_users = Object.values(users as any);

  return (
    <div className="flex flex-col items-center space-y-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader">
            <GradientCircularProgress />
          </div>
        </div>
      )}

      <UserScroll userInfos={x_users} />

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
                        avatarProps={{
                          src: `${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${item.user_id}.png`,
                        }}
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
                        avatarProps={{
                          src: `${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${item.user_id}.png`,
                        }}
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
