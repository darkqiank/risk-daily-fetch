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
import MyScrollShadow from "../ui/scroll";

const TweetList = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUsers] = useState(null);

  const UserScroll: any = ({ userInfos }: any) => {
    const itemWidth = 40; // 每个 Avatar 的宽度，包括间距
    const totalNew = userInfos.reduce(
      (sum: any, user: any) => sum + user.new,
      0,
    );
    const UserUpdateInfo = (userInfo: any) => {
      return (
        <Badge color="danger" content={`${userInfo.new}`}>
          <Tooltip placement="right" title={`${userInfo.username}`}>
            <Avatar
              data-hover
              isFocusable
              className={`w-[50px] h-[50px] transition-transform duration-200 transform
            hover:border-2 hover:border-blue-500 hover:z-5 cursor-pointer
             ${(currentUser as unknown as string) === (userInfo.user_id as string) ? "border-blue-500 border-2 z-5" : "z-1"}
             `}
              src={`${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${userInfo.user_id}.png`}
              onClick={() => handleUserSelect(userInfo.user_id)}
            />
          </Tooltip>
        </Badge>
      );
    };

    return (
      <MyScrollShadow hideScrollBar className="w-[150-px] h-[500px] px-8">
        <div className="flex flex-col space-y-4 items-center py-8">
          <div key={0} className="w-[100-px] h-[60-px]">
            <Badge color="danger" content={`${totalNew}`}>
              <Avatar
                data-hover
                isFocusable
                className={`bg-gradient-to-br from-[#FFB457] to-[#F31260] w-[50px] h-[50px] transition-transform duration-200 transform
       hover:border-2 hover:border-blue-500 hover:z-5 cursor-pointer
       ${!currentUser ? "border-blue-500 border-2 z-5" : "z-1"}
       `}
                icon={<GroupIcon className="text-white" />}
                onClick={() => handleUserSelect(null)}
              />
            </Badge>
          </div>
          {userInfos.map((user: any) => {
            return (
              <div key={user.user_id} className="w-[100-px] h-[60-px]">
                <UserUpdateInfo {...user} />
              </div>
            );
          })}
        </div>
      </MyScrollShadow>
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
        const parsedCachedUsers = JSON.parse(cachedUsers);

        console.log("cachedUsers: ", parsedCachedUsers.length);
        setUsers(parsedCachedUsers);
      } else {
        const response = await fetch(`/api/x/?type=total`);
        const jsonData = await response.json();

        console.log("getUsers: ", jsonData.length);
        setUsers(jsonData);
        localStorage.setItem("risk_x_users", JSON.stringify(jsonData));
        localStorage.setItem("risk_x_cacheTime", now.toString());
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleUserSelect = (user_id: any) => {
    setCurrentUsers(user_id);
    setPage(1);
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

  const testDataArray: any[] = [];

  for (let i = 1; i <= 100; i++) {
    testDataArray.push({
      id: i,
      name: `Test Name ${i}`,
    });
  }

  return (
    <div
      className="flex"
      style={{
        position: "relative",
      }}
    >
      <UserScroll className="flex-shrink-0" userInfos={x_users} />
      <div className="flex flex-col items-center justify-center space-y-4 flex-grow">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader">
              <GradientCircularProgress />
            </div>
          </div>
        )}

        <ScrollShadow hideScrollBar className="w-1/2 h-[500px] p-4">
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
                                    <Chip
                                      color="warning"
                                      size="sm"
                                      variant="dot"
                                    >
                                      Medias
                                    </Chip>
                                    <div>
                                      <span className="flex flex-wrap gap-1">
                                        {Object.entries(
                                          subItem.data.medias,
                                        ).map(([shortMedia, mediaLinks]: any) =>
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
          page={page}
          total={total}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default TweetList;
