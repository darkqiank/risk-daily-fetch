// components/Sidebar.tsx
import { useRouter } from "next/router";
import { Layout, Menu, MenuProps } from "antd";
import React from "react";

import { menuItems, MenuItem } from "@/config/site";

const { Sider } = Layout;

const Sidebar = () => {
  const router = useRouter();

  const renderMenuItems = (
    items: MenuItem[],
  ): NonNullable<MenuProps["items"]> => {
    return items.map((item) => {
      if (item.subItems) {
        return {
          key: item.key,
          icon: item.icon ? React.createElement(item.icon) : null,
          label: item.label,
          children: renderMenuItems(item.subItems),
        };
      }

      return {
        key: item.href || item.key,
        icon: item.icon ? React.createElement(item.icon) : null,
        label: item.label,
        onClick: () => {
          if (item.href) {
            router.push(item.href);
          }
        },
      };
    });
  };

  return (
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
      width={240}
    >
      <div className="demo-logo-vertical" />
      <Menu
        items={renderMenuItems(menuItems)}
        mode="inline"
        selectedKeys={[router.pathname]}
        theme="dark"
      />
    </Sider>
  );
};

export default Sidebar;
