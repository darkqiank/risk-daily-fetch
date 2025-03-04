import React from "react";
import { Layout, Dropdown, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header: AntHeader } = Layout;

const Header = () => {
  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <Dropdown
        menu={{
          items: [
            { key: "profile", label: "个人中心" },
            { key: "logout", label: "退出登录" },
          ],
        }}
      >
        <Button icon={<UserOutlined />} type="text">
          管理员
        </Button>
      </Dropdown>
    </AntHeader>
  );
};

export default Header;
