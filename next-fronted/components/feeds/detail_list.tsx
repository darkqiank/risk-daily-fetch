import React, { useEffect, useState } from "react";
import { List, Typography, Tag, Select as ASelect, Modal, Table } from "antd";
import { Pagination } from "@nextui-org/react";

const ContentList = () => {
  const [datas, setDatas] = useState();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [opFilter, setOpFilter] = React.useState("all");
  const [aptFilter, setAptFilter] = React.useState("all");
  const [euFilter, setEuFilter] = React.useState("all");

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

  const handleSelectionOpChange = (e: any) => {
    setOpFilter(e);
  };

  const handleSelectionAptChange = (e: any) => {
    setAptFilter(e);
  };
  const handleSelectionEuChange = (e: any) => {
    setEuFilter(e);
  };

  const fetchData = async (
    page: any,
    opFilter: any,
    aptFilter: any,
    euFilter: any,
  ) => {
    try {
      setLoading(true);
      let url = `/api/detail/?page=${page}`;

      if (opFilter != "all") {
        url = url + `&op=${opFilter}`;
      }

      if (aptFilter != "all") {
        url = url + `&apt=${aptFilter}`;
      }
      if (euFilter != "all") {
        url = url + `&eu=${euFilter}`;
      }
      const response = await fetch(url);
      const jsonData = await response.json();

      const total = (jsonData as any).totalPages;
      let ds = jsonData.data;

      setDatas(ds);
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
    fetchData(page, opFilter, aptFilter, euFilter);
  }, [page, opFilter, aptFilter, euFilter]);

  return (
    <div>
      <div className="flex  w-full gap-3 items-center">
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
        {/* <Modal
          open={isModalOpen}
          title="Basic Modal"
          onCancel={handleCancel}
          onOk={handleOk}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal> */}
      </div>
      <List
        dataSource={datas}
        itemLayout="vertical"
        renderItem={(item: any) => (
          <List.Item key={item.contentHash}>
            <Typography.Title level={5}>
              <a href={item.url} rel="noopener noreferrer" target="_blank">
                {item.url}
              </a>
            </Typography.Title>
            <div className="flex gap-3">
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
              <div>
                <div className="flex gap-3">
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
                {item.extractionResult && (
                  <div className="flex gap-3">
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
                <div>
                  <strong>摘要：</strong>
                  {item.detail.摘要}
                </div>
              </div>
            )}
          </List.Item>
        )}
        size="large"
      />
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
