// components/SubPageLayout/index.tsx
import React from "react";
import { Layout, Breadcrumb } from "antd";

const { Content } = Layout;

interface SubPageLayoutProps {
  children: React.ReactNode;
  breadcrumbItems?: { title: string; href?: string }[];
  pageTitle?: string;
}

const SubPageLayout: React.FC<SubPageLayoutProps> = ({
  children,
  breadcrumbItems = [],
  pageTitle,
}) => {
  return (
    <Content style={{ margin: "4px 4px 0", overflow: "initial" }}>
      {/* 面包屑导航 */}
      {breadcrumbItems.length > 0 && (
        <Breadcrumb style={{ marginBottom: 16 }}>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index} href={item.href}>
              {item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* 页面标题 */}
      {pageTitle && (
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
          {pageTitle}
        </h1>
      )}

      {/* 页面内容 */}
      <div
        style={{
          padding: 2,
          background: "#fff",
          minHeight: "calc(100vh - 112px)",
        }}
      >
        {children}
      </div>
    </Content>
  );
};

export default SubPageLayout;
