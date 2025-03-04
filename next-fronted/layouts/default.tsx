// import { Layout } from "antd";

// import Sidebar from "@/layouts/sidebar";

// const AppLayout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <Layout hasSider>
//       <Sidebar />
//       <Layout style={{ marginLeft: 240 }}>
//         <main>{children}</main>
//       </Layout>
//     </Layout>
//   );
// };

// export default AppLayout;

// components/Layout/index.tsx
import React from "react";
import { Layout } from "antd";

import Sidebar from "@/layouts/sidebar";
import Header from "@/layouts/header";

const { Content } = Layout;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 240 }}>
        <Header />
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 112px)",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
