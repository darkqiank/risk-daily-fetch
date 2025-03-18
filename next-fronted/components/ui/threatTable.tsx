import React from "react";
import { Table, Typography, Button, message, Space, Tag, theme } from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CopyOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import copy from "copy-to-clipboard";

import { VTLogo, XLogo } from "../icons";

const { Text } = Typography;
const { useToken } = theme;

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const ThreatTable = ({ threats }: any) => {
  const { token } = useToken();
  const handleCopy = (text: string) => {
    copy(text);
    message.success("复制成功");
  };

  const expandedRowRender = (record: any) => {
    const columns = [
      {
        title: "IOC",
        dataIndex: "IOC",
        key: "IOC",
        width: 300,
        render: (_: any, ioc: any) => (
          <div key={ioc.IOC}>
            <Space>
              <Text ellipsis={{ tooltip: ioc.IOC }} style={{ maxWidth: 200 }}>
                {truncateText(ioc.IOC, 30)}
              </Text>
              <Button
                icon={<CopyOutlined />}
                size="small"
                type="text"
                onClick={() => handleCopy(ioc.IOC)}
              />
              <Button
                href={`https://www.virustotal.com/gui/search/${ioc.IOC}`}
                icon={<VTLogo style={{ fontSize: 14 }} />}
                size="small"
                target="_blank"
                type="text"
              />
            </Space>
          </div>
        ),
      },
      { title: "类型", dataIndex: "类型", key: "类型", width: 120 },
      { title: "端口", dataIndex: "端口", key: "端口", width: 80 },
      { title: "威胁等级", dataIndex: "威胁等级", key: "威胁等级", width: 100 },
      { title: "威胁类型", dataIndex: "威胁类型", key: "威胁类型", width: 120 },
      { title: "组织", dataIndex: "组织", key: "组织", width: 120 },
      { title: "家族", dataIndex: "家族", key: "家族", width: 120 },
      { title: "攻击时间", dataIndex: "攻击时间", key: "攻击时间", width: 180 },
      { title: "发表时间", dataIndex: "发表时间", key: "发表时间", width: 180 },
      {
        title: "来源",
        key: "source",
        width: 80,
        align: "center" as const,
        render: (_: any, __: any, index: number) => {
          if (index !== 0) return { props: { rowSpan: 0 } };

          return {
            children: (
              <Button
                href={
                  record.source.startsWith("tweet") ||
                  record.source.startsWith("profile-conversation")
                    ? `/nav/x/${record.source}`
                    : record.url.startsWith("http") ||
                        record.url.startsWith("https")
                      ? record.url
                      : record.source.startsWith("http") ||
                          record.source.startsWith("https")
                        ? record.source
                        : "#"
                }
                icon={
                  record.source.startsWith("tweet") ||
                  record.source.startsWith("profile-conversation") ? (
                    <XLogo style={{ fontSize: 14 }} />
                  ) : (
                    <LinkOutlined style={{ fontSize: 14 }} />
                  )
                }
                size="small"
                target="_blank"
                type="text"
              />
            ),
            props: { rowSpan: record.extractionResult.data.iocs.length },
          };
        },
      },
      {
        title: "APT",
        key: "APT",
        dataIndex: ["extractionResult", "data", "APT"],
        width: 120,
        render: (text: any, __: any, index: number) => ({
          children: index === 0 ? text : null,
          props: {
            rowSpan: index === 0 ? record.extractionResult.data.iocs.length : 0,
          },
        }),
      },
      {
        title: "欧美",
        key: "欧美",
        dataIndex: ["extractionResult", "data", "欧美"],
        width: 100,
        render: (text: any, __: any, index: number) => ({
          children: index === 0 ? text : null,
          props: {
            rowSpan: index === 0 ? record.extractionResult.data.iocs.length : 0,
          },
        }),
      },
      {
        title: "插入时间",
        key: "insertedAt",
        width: 180,
        render: (_: any, __: any, index: number) => ({
          children:
            index === 0 ? new Date(record.insertedAt).toLocaleString() : null,
          props: {
            rowSpan: index === 0 ? record.extractionResult.data.iocs.length : 0,
          },
        }),
      },
    ];

    return (
      <div
        style={{
          padding: "8px 0 16px",
          background: token.colorFillAlter,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          margin: "8px 0",
          borderRadius: token.borderRadius,
        }}
      >
        <Table
          bordered
          columns={columns}
          dataSource={record.extractionResult.data.iocs}
          pagination={false}
          rowKey={(row: any) => row.IOC}
          scroll={{ x: true }}
          size="small"
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        />
      </div>
    );
  };

  const columns = [
    {
      title: "IOC",
      key: "IOC",
      width: 300,
      render: (_: any, record: any) => (
        <Space align="center">
          {record.extractionResult.data.iocs.slice(0, 1).map((ioc: any) => (
            <div key={ioc.IOC}>
              <Space>
                <Text ellipsis={{ tooltip: ioc.IOC }} style={{ maxWidth: 200 }}>
                  {truncateText(ioc.IOC, 30)}
                </Text>
                <Button
                  icon={<CopyOutlined />}
                  size="small"
                  type="text"
                  onClick={() => handleCopy(ioc.IOC)}
                />
                <Button
                  href={`https://www.virustotal.com/gui/search/${ioc.IOC}`}
                  icon={<VTLogo style={{ fontSize: 14 }} />}
                  size="small"
                  target="_blank"
                  type="text"
                />
              </Space>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: "类型",
      key: "类型",
      width: 120,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.类型,
    },
    {
      title: "端口",
      key: "端口",
      width: 80,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.端口,
    },
    {
      title: "威胁等级",
      key: "威胁等级",
      width: 100,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.威胁等级,
    },
    {
      title: "威胁类型",
      key: "威胁类型",
      width: 120,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.威胁类型,
    },
    {
      title: "组织",
      key: "组织",
      width: 120,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.组织,
    },
    {
      title: "家族",
      key: "家族",
      width: 120,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.家族,
    },
    {
      title: "攻击时间",
      key: "攻击时间",
      width: 180,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.攻击时间,
    },
    {
      title: "发表时间",
      key: "发表时间",
      width: 180,
      render: (_: any, record: any) =>
        record.extractionResult.data.iocs[0]?.发表时间,
    },
    {
      title: "来源",
      key: "source",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          href={
            record.source.startsWith("tweet") ||
            record.source.startsWith("profile-conversation")
              ? `/nav/x/${record.source}`
              : record.url.startsWith("http") || record.url.startsWith("https")
                ? record.url
                : record.source.startsWith("http") ||
                    record.source.startsWith("https")
                  ? record.source
                  : "#"
          }
          icon={
            record.source.startsWith("tweet") ||
            record.source.startsWith("profile-conversation") ? (
              <XLogo style={{ fontSize: 14 }} />
            ) : (
              <LinkOutlined style={{ fontSize: 14 }} />
            )
          }
          size="small"
          target="_blank"
          type="text"
        />
      ),
    },
    {
      title: "APT",
      dataIndex: ["extractionResult", "data", "APT"],
      key: "APT",
      width: 120,
    },
    {
      title: "欧美",
      dataIndex: ["extractionResult", "data", "欧美"],
      key: "欧美",
      width: 100,
    },
    {
      title: "插入时间",
      key: "insertedAt",
      width: 180,
      render: (_: any, record: any) =>
        new Date(record.insertedAt).toLocaleString(),
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={threats}
      expandable={{
        expandedRowRender,
        expandIcon: ({ expanded, onExpand, record }) =>
          (record as any).extractionResult.data.iocs.length > 1 && (
            <Button
              icon={
                expanded ? (
                  <CaretUpOutlined style={{ fontSize: 12 }} />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0 4px",
                    }}
                  >
                    <CaretDownOutlined style={{ fontSize: 12 }} />
                    <Tag
                      style={{
                        margin: 0,
                        fontSize: 12,
                        lineHeight: "12px",
                        padding: "0 4px",
                        height: 18,
                        borderRadius: 4,
                        background: token.colorFillSecondary,
                        border: "none",
                      }}
                    >
                      +{(record as any).extractionResult.data.iocs.length}
                    </Tag>
                  </div>
                )
              }
              size="small"
              style={{ width: 64, marginRight: 8 }}
              type="text"
              onClick={(e) => onExpand(record, e)}
            />
          ),
        indentSize: 0,
        columnWidth: 48,
      }}
      pagination={false}
      rowKey="id"
      scroll={{ x: true }}
      size="small"
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderBottom: 0,
      }}
    />
  );
};

export default ThreatTable;
