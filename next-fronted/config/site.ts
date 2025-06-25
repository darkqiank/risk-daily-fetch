// config/site.ts
import {
  DashboardOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

// 定义菜单项类型
export interface MenuItem {
  label: React.ReactNode;
  key: string;
  icon?: React.ComponentType;
  href?: string;
  subItems?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: "仪表盘",
    key: "/nav/dashboard",
    icon: DashboardOutlined,
    href: "/nav/dashboard",
  },
  {
    label: "数据查看",
    key: "/nav",
    icon: DatabaseOutlined,
    subItems: [
      {
        label: "输出详情",
        key: "/nav/detail",
        href: "/nav/detail",
      },
      {
        label: "twitter",
        key: "/nav/x",
        href: "/nav/x",
      },
      // {
      //   label: "博客源",
      //   key: "/nav/blog",
      //   href: "/nav/blog",
      // },
      {
        label: "ioc列表",
        key: "/nav/threat",
        href: "/nav/threat",
      },
    ],
  },
  {
    label: "爬虫任务",
    key: "/nav/spider",
    icon: DatabaseOutlined,
    subItems: [
      {
        label: "工作流",
        key: "/nav/spider/workflow",
        href: "/nav/spider/workflow",
      },
      {
        label: "运行记录",
        key: "/nav/spider/flow_runs",
        href: "/nav/spider/flow_runs",
      },
    ],
  },
  {
    label: "数据源管理",
    key: "/nav/source",
    icon: DatabaseOutlined,
    href: "/nav/source",
  },
  // {
  //   label: "设备识别",
  //   key: "/dev",
  //   icon: DatabaseOutlined,
  //   subItems: [
  //     {
  //       label: "识别日志",
  //       key: "/dev/identify",
  //       href: "/dev/identify",
  //     },
  //   ],
  // },
  {
    label: "关于",
    key: "/nav/about",
    icon: TeamOutlined,
    href: "/nav/about",
  },
];
