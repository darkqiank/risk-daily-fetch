import React, { useEffect, useRef, useState } from "react";
import {
  List,
  Typography,
  Tag,
  Select as ASelect,
  Modal,
  Table,
  Spin,
  Input,
} from "antd";
import { Pagination } from "antd";

import MyScrollShadow from "../ui/scroll";

const { Search } = Input;

const ContentList = () => {
  const [datas, setDatas] = useState();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [sourceTypeFilter, setSourceTypeFilter] = React.useState("all");
  const [homeFilter, setHomeFilter] = React.useState("all");
  const [opFilter, setOpFilter] = React.useState("all");
  const [aptFilter, setAptFilter] = React.useState("all");
  const [euFilter, setEuFilter] = React.useState("all");
  const [iocFilter, setIocFilter] = React.useState("all");
  const [query, setQuery] = useState();

  const scrollRef = useRef<{ scrollToTop: () => void } | null>(null);

  const showModal = (iocs: any) => {
    // console.log("iocs 数据类型：", Array.isArray(iocsArray));
    // console.log("iocs 数据：", iocsArray);
    // 显示弹窗并将 iocs 的内容显示在弹窗中
    Modal.info({
      title: "IOCs 内容",
      content: (
        <div style={{ width: "100%" }}>
          <IocsTable data={iocs} />
        </div>
      ),
      width: "80%", // 或者使用具体的像素值，例如 800
      centered: true, // 使 Modal 垂直居中显示
      onOk() {},
    });
  };

  // const handleOk = () => {
  //   setIsModalOpen(false);
  // };

  // const handleCancel = () => {
  //   setIsModalOpen(false);
  // };

  const handleSelectionSourceTypeChange = (e: any) => {
    setSourceTypeFilter(e);
    setPage(1);
  };

  const handleSelectionHomeChange = (e: any) => {
    setHomeFilter(e);
    setPage(1);
  };

  const handleSelectionOpChange = (e: any) => {
    setOpFilter(e);
    setPage(1);
  };

  const handleSelectionAptChange = (e: any) => {
    setAptFilter(e);
    setPage(1);
  };
  const handleSelectionEuChange = (e: any) => {
    setEuFilter(e);
    setPage(1);
  };

  const handleSelectionIOCChange = (e: any) => {
    setIocFilter(e);
    setPage(1);
  };

  const handleSearch = (e: any) => {
    setQuery(e);
    setPage(1);
  };

  const fetchData = async (
    page: any,
    sourceTypeFilter: any,
    homeFilter: any,
    opFilter: any,
    aptFilter: any,
    euFilter: any,
    iocFilter: any,
    query: any,
  ) => {
    try {
      setLoading(true);
      let url = `/api/detail/?page=${page}`;

      if (sourceTypeFilter != "all") {
        url = url + `&sourceType=${sourceTypeFilter}`;
      }

      if (homeFilter != "all") {
        url = url + `&home=${homeFilter}`;
      }

      if (opFilter != "all") {
        url = url + `&op=${opFilter}`;
      }

      if (aptFilter != "all") {
        url = url + `&apt=${aptFilter}`;
      }
      if (euFilter != "all") {
        url = url + `&eu=${euFilter}`;
      }
      if (iocFilter != "all") {
        url = url + `&ioc=${iocFilter}`;
      }
      if (query != undefined && query != null && query != "") {
        url = url + `&query=${query}`;
      }
      const response = await fetch(url);
      const jsonData = await response.json();

      const total = (jsonData as any).totalRecords;
      let ds = jsonData.data;

      setDatas(ds);
      setTotal(total);
      console.log("total", total);
    } catch (err) {
      console.error("Error fetching blog data:", err);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: any) => {
    setPage(newPage);
    scrollRef.current?.scrollToTop(); // 翻页时滚动到顶部
  };

  useEffect(() => {
    fetchData(
      page,
      sourceTypeFilter,
      homeFilter,
      opFilter,
      aptFilter,
      euFilter,
      iocFilter,
      query,
    );
  }, [
    page,
    sourceTypeFilter,
    homeFilter,
    opFilter,
    aptFilter,
    euFilter,
    iocFilter,
    query,
  ]);

  if (!datas) return <Spin />;

  return (
    <div className="flex flex-col gap-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader">
            <Spin />
          </div>
        </div>
      )}
      <div className="flex  w-full gap-3 items-center">
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[
            { value: "blog", label: "博客" },
            { value: "biz", label: "微信公众号" },
            { value: "all", label: "不限" },
          ]}
          placeholder="select it"
          prefix="来源类型"
          size="small"
          onChange={handleSelectionSourceTypeChange}
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
          prefix="家庭事件"
          size="small"
          onChange={handleSelectionHomeChange}
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
          prefix="运营商事件"
          size="small"
          onChange={handleSelectionOpChange}
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
        <ASelect
          className="max-w-xs"
          defaultValue="all"
          options={[
            { value: "true", label: "有" },
            { value: "false", label: "无" },
            { value: "all", label: "不限" },
          ]}
          placeholder="select it"
          prefix="ioc"
          size="small"
          onChange={handleSelectionIOCChange}
        />
        <Search
          allowClear
          enterButton
          className="w-[400px]"
          loading={loading}
          placeholder="全文搜索..."
          onSearch={handleSearch}
        />
      </div>
      <Pagination
        current={page}
        defaultCurrent={1}
        pageSize={20}
        showSizeChanger={false}
        total={total}
        onChange={handlePageChange}
      />
      <MyScrollShadow
        ref={scrollRef}
        // className="w-full h-[500px] p-4"
        className="w-full h-[500px] p-4"
        hideScrollBar={false}
        showShadow={false}
      >
        <List
          dataSource={datas}
          itemLayout="vertical"
          renderItem={(item: any) => (
            <List.Item key={item.contentHash}>
              <div className="flex flex-col gap-1">
                <Typography.Title
                  className="whitespace-normal break-words" // 添加换行样式
                  level={5}
                  style={{ wordWrap: "break-word", margin: 0 }}
                >
                  {item.detail && <div>{item.detail.摘要} </div>}
                </Typography.Title>
                <div className="w-full">
                  {item.url.startsWith("http") && (
                    <a
                      className="text-blue-500 hover:underline whitespace-normal break-words"
                      href={item.url}
                      rel="noopener noreferrer"
                      style={{
                        wordBreak: "break-all",
                        display: "inline-block",
                        maxWidth: "100%",
                      }}
                      target="_blank"
                      title={item.url}
                    >
                      {item.url}
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <strong>来源类型：</strong> {item.sourceType || "未知"}
                  </div>
                  <div>
                    <strong>来源：</strong> {item.source || "未知"}
                  </div>
                  <div>
                    <strong>日期：</strong> {item.date}
                  </div>
                </div>
                {item.detail && (
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <strong>家庭事件：</strong>
                      <Tag
                        color={
                          item.detail["家庭事件"] === "是" ? "green" : "red"
                        }
                      >
                        {item.detail["家庭事件"] === "是" ? "是" : "否"}
                      </Tag>
                    </div>
                    <div>
                      <strong>运营商事件：</strong>
                      {/* {item.detail["运营商事件"]} */}
                      <Tag
                        color={
                          item.detail["运营商事件"] === "是" ? "green" : "red"
                        }
                      >
                        {item.detail["运营商事件"] === "是" ? "是" : "否"}
                      </Tag>
                    </div>
                    <div>
                      <strong>原因：</strong>
                      {item.detail.原因}
                    </div>
                    <div>
                      <strong>国家：</strong>
                      {/* {item.detail.国家.map((country: any) => (
                      <Tag key={country}>{country}</Tag>
                    ))} */}
                      {Array.isArray(item.detail.国家) ? (
                        item.detail.国家.map((country: any) => (
                          <Tag key={country}>{country}</Tag>
                        ))
                      ) : item.detail.国家 ? (
                        <span>{item.detail.国家}</span>
                      ) : (
                        "无"
                      )}
                    </div>
                  </div>
                )}
                {item.extractionResult && (
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <strong>APT：</strong>
                      {/* {item.extractionResult.data.APT} */}
                      <Tag
                        color={
                          item.extractionResult.data.APT === "是"
                            ? "green"
                            : "red"
                        }
                      >
                        {item.extractionResult.data.APT}
                      </Tag>
                    </div>
                    <div>
                      <strong>欧美：</strong>
                      {/* {item.extractionResult.data.欧美} */}
                      <Tag
                        color={
                          item.extractionResult.data.欧美 === "是"
                            ? "green"
                            : "red"
                        }
                      >
                        {item.extractionResult.data.欧美}
                      </Tag>
                    </div>
                    <div>
                      <strong>iocs: </strong>
                      {Array.isArray(item.extractionResult.data.iocs) &&
                      item.extractionResult.data.iocs.length > 0 ? (
                        <Tag
                          color="#f50"
                          onClick={() =>
                            showModal(item.extractionResult.data.iocs)
                          }
                        >
                          {item.extractionResult.data.iocs.length}
                        </Tag>
                      ) : (
                        <Tag color="default">0</Tag>
                      )}
                    </div>
                  </div>
                )}
                {item.snippet && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `...${item.snippet}...`,
                    }}
                    className="text-gray-600"
                  />
                )}
              </div>
            </List.Item>
          )}
          size="large"
        />
      </MyScrollShadow>
    </div>
  );
};

const IocsTable = (data: any) => {
  let iocsArray = data
    ? Object.values(data.data).map((item: any, index) => ({
        ...item,
        key: index,
      }))
    : [];

  const columns = [
    {
      title: "IOC",
      dataIndex: "IOC",
      key: "IOC",
    },
    {
      title: "家族",
      dataIndex: "家族",
      key: "家族",
    },
    {
      title: "端口",
      dataIndex: "端口",
      key: "端口",
    },
    {
      title: "类型",
      dataIndex: "类型",
      key: "类型",
    },
    {
      title: "组织",
      dataIndex: "组织",
      key: "组织",
    },
    {
      title: "发表时间",
      dataIndex: "发表时间",
      key: "发表时间",
    },
    {
      title: "威胁等级",
      dataIndex: "威胁等级",
      key: "威胁等级",
      render: (text: any) => {
        let color = text === "高" ? "red" : text === "中" ? "orange" : "green";

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "威胁类型",
      dataIndex: "威胁类型",
      key: "威胁类型",
    },
    {
      title: "攻击时间",
      dataIndex: "攻击时间",
      key: "攻击时间",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={iocsArray}
      scroll={{ x: "max-content" }}
    />
  );
};

export default ContentList;
