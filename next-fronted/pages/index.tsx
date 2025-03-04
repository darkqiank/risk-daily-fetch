// import { Link } from "@nextui-org/link";
// import { Snippet } from "@nextui-org/snippet";
// import { Code } from "@nextui-org/code";
// import { button as buttonStyles } from "@nextui-org/theme";
// import React from "react";

// import { siteConfig } from "@/config/site";
// import { title, subtitle } from "@/components/primitives";
// import { GithubIcon } from "@/components/icons";
// import DefaultLayout from "@/layouts/default";

// export default function IndexPage() {
//   return (
//     <DefaultLayout>
//       <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//         <div className="inline-block max-w-xl text-center justify-center">
//           <h1 className={title()}>Risk&nbsp;</h1>
//           <h1 className={title({ color: "violet" })}>Eye&nbsp;</h1>
//           <br />
//           <h4 className={subtitle({ class: "mt-4" })}>
//             Uncovering threats, securing futures .
//           </h4>
//         </div>

//         <div className="flex gap-3">
//           <Link
//             isExternal
//             className={buttonStyles({ variant: "bordered", radius: "full" })}
//             href={siteConfig.links.github}
//           >
//             <GithubIcon size={20} />
//             GitHub
//           </Link>
//         </div>

//         <div className="mt-8">
//           <Snippet hideCopyButton hideSymbol variant="bordered">
//             <span>
//               Get started by goto <Code color="primary">/x</Code>
//             </span>
//           </Snippet>
//         </div>
//       </section>
//     </DefaultLayout>
//   );
// }

// pages/index.tsx
import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

export default function HomePage() {
  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        欢迎使用情报收集系统
      </Title>
      <div>
        <p>这里是系统主页，您可以通过侧边栏导航到不同功能模块</p>
      </div>
    </div>
  );
}
