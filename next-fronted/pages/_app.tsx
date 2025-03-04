import type { AppProps } from "next/app";

import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

import "antd/dist/reset.css";
import "@/styles/globals.css";
import AppLayout from "@/layouts/default";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 4,
        },
      }}
    >
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </ConfigProvider>
  );
}

export default MyApp;
