// import React from "react";
// import { Typography } from "antd";

// const { Title } = Typography;

// export default function HomePage() {
//   return (
//     <div>
//       <Title level={2} style={{ marginBottom: 24 }}>
//         欢迎使用情报收集系统
//       </Title>
//       <div>
//         <p>这里是系统主页，您可以通过侧边栏导航到不同功能模块</p>
//       </div>
//     </div>
//   );
// }

// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/nav/dashboard");
  }, []);

  return null; // 不渲染任何内容
};

export default HomePage;
