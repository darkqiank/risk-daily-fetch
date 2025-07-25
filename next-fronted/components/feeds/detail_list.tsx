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
    <div className="flex flex-col gap-4 w-full min-w-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader">
            <Spin />
          </div>
        </div>
      )}
      {/* 响应式过滤器区域 */}
      <div className="flex flex-col lg:flex-row w-full gap-3 items-start lg:items-center">
        {/* 过滤器组 */}
        <div className="flex flex-wrap gap-2 lg:gap-3 items-center flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>来源类型：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "blog", label: "博客" },
                { value: "biz", label: "微信公众号" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionSourceTypeChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>家庭事件：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "true", label: "是" },
                { value: "false", label: "否" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionHomeChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>运营商事件：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "true", label: "是" },
                { value: "false", label: "否" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionOpChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>APT：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "true", label: "是" },
                { value: "false", label: "否" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionAptChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>欧美：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "true", label: "是" },
                { value: "false", label: "否" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionEuChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ASelect
              prefix={<span style={{ fontWeight: 'bold' }}>IOC：</span>}
              className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[150px]"
              defaultValue="all"
              options={[
                { value: "true", label: "有" },
                { value: "false", label: "无" },
                { value: "all", label: "不限" },
              ]}
              size="small"
              onChange={handleSelectionIOCChange}
            />
          </div>
        </div>
        {/* 搜索框 */}
        <div className="w-full lg:w-auto lg:min-w-[250px] lg:max-w-[400px]">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">全文搜索</span>
            <Search
              allowClear
              enterButton
              className="w-full"
              loading={loading}
              placeholder="输入关键词..."
              onSearch={handleSearch}
            />
          </div>
        </div>
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
        className="w-full h-[500px] p-4 min-w-0"
        hideScrollBar={false}
        showShadow={false}
      >
        <List
          dataSource={datas}
          itemLayout="vertical"
          renderItem={(item: any) => (
            <List.Item key={item.contentHash} className="min-w-0">
              <div className="flex flex-col gap-1 min-w-0">
                <Typography.Title
                  className="whitespace-normal break-words min-w-0" // 添加换行样式
                  level={5}
                  style={{ wordWrap: "break-word", margin: 0 }}
                >
                  {item.detail && <div className="min-w-0">{item.detail.摘要} </div>}
                </Typography.Title>
                <div className="w-full min-w-0 overflow-hidden">
                  {item.url.startsWith("http") && (
                    <a
                      className="text-blue-500 hover:underline whitespace-normal break-words block"
                      href={item.url}
                      rel="noopener noreferrer"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        maxWidth: "100%",
                      }}
                      target="_blank"
                      title={item.url}
                    >
                      {item.url}
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-3 text-sm">
                  <div className="min-w-0">
                    <strong>来源类型：</strong> {item.sourceType || "未知"}
                  </div>
                  <div className="min-w-0">
                    <strong>来源：</strong> <span className="break-words">{item.source || "未知"}</span>
                  </div>
                  <div className="min-w-0">
                    <strong>日期：</strong> {item.date}
                  </div>
                </div>
                {item.detail && (
                  <div className="flex flex-wrap gap-2 lg:gap-3 text-sm">
                    <div className="min-w-0">
                      <strong>家庭事件：</strong>
                      <Tag
                        color={
                          item.detail["家庭事件"] === "是" ? "green" : "red"
                        }
                      >
                        {item.detail["家庭事件"] === "是" ? "是" : "否"}
                      </Tag>
                    </div>
                    <div className="min-w-0">
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
                    <div className="min-w-0 flex-1">
                      <strong>原因：</strong>
                      <span className="break-words">{item.detail.原因}</span>
                    </div>
                    {/* 只有当国家信息存在且不为空时才显示国家字段 */}
                    {((Array.isArray(item.detail.国家) && item.detail.国家.length > 0) || 
                      (item.detail.国家 && !Array.isArray(item.detail.国家) && item.detail.国家.trim() !== "")) && (
                      <div className="min-w-0">
                        <strong>国家：</strong>
                        {Array.isArray(item.detail.国家) ? (
                          item.detail.国家.map((country: any) => (
                            <Tag key={country}>{country}</Tag>
                          ))
                        ) : (
                          <span className="break-words">{item.detail.国家}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {item.extractionResult && (
                  <div className="flex flex-wrap gap-2 lg:gap-3 text-sm">
                    {/* 通用安全访问组件 */}
                    <div className="min-w-0">
                      <strong>APT：</strong>
                      <Tag
                        color={
                          item.extractionResult?.data?.APT?.trim() === "是"
                            ? "green"
                            : "red"
                        }
                      >
                        {/* 带默认值的显示 */}
                        {item.extractionResult?.data?.APT || "无"}
                      </Tag>
                    </div>

                    <div className="min-w-0">
                      <strong>欧美：</strong>
                      <Tag
                        color={
                          item.extractionResult?.data?.["欧美"]?.trim() === "是"
                            ? "green"
                            : "red"
                        }
                      >
                        {/* 处理特殊字符属性名 */}
                        {item.extractionResult?.data?.["欧美"] || "无"}
                      </Tag>
                    </div>

                    <div className="min-w-0">
                      <strong>IOCs：</strong>
                      {/* 数组安全检测 + 默认值 */}
                      {(Array.isArray(item.extractionResult?.data?.iocs)
                        ? item.extractionResult.data.iocs
                        : []
                      ).length > 0 ? (
                        <Tag
                          color="#f50"
                          onClick={() =>
                            // 安全传递参数
                            showModal(item.extractionResult?.data?.iocs || [])
                          }
                        >
                          {/* 显示安全数量 */}
                          {item.extractionResult?.data?.iocs?.length || 0}
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
                    className="text-gray-600 break-words min-w-0"
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
