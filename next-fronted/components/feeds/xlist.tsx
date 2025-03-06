/* eslint-disable no-console */
import React, { useEffect, useRef, useState } from "react";
import { Pagination, Spin } from "antd";

// import { GradientCircularProgress } from "../ui/progress";
import { LoadingOutlined } from "@ant-design/icons";

import XCard from "../ui/xcard";
import MyScrollShadow from "../ui/scroll";

const TweetList = () => {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUsers] = useState(null);
  const scrollRef = useRef<{ scrollToTop: () => void } | null>(null);

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

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
    scrollRef.current?.scrollToTop(); // 翻页时滚动到顶部
  };

  useEffect(() => {
    fetchUsers();
    fetchData(page);
  }, [page, currentUser]);

  // console.log(data);
  // if (!data)
  //   return (
  //     <div>
  //       <LoadingOutlined />
  //     </div>
  //   );
  if (!data) return <Spin />;
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
      <div className="flex flex-col items-center justify-center space-y-4 flex-grow">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader">
              <Spin />
            </div>
          </div>
        )}
        <Pagination
          current={page}
          defaultCurrent={1}
          showSizeChanger={false}
          total={total}
          onChange={handlePageChange}
        />
        <MyScrollShadow
          ref={scrollRef}
          className="w-full h-[500px] p-2"
          hideScrollBar={false}
          showShadow={false}
        >
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
              .map((item: any) => (
                <XCard key={item.x_id} item={item} />
              ))}
          </div>
        </MyScrollShadow>
      </div>
    </div>
  );
};

export default TweetList;
