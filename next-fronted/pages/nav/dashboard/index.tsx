import { Card, Row, Col, Statistic, Progress } from "antd";
import {
  XOutlined,
  FileSearchOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import { Typography } from "antd";

const { Title } = Typography;

// 类型定义
interface StatsItem {
  title: string;
  iconType: string;
  monitored: number;
  total: number;
  new: number;
  progress: number;
}

interface DashboardData {
  stats: StatsItem[];
  totals: {
    monitoredTotal: number;
    contentTotal: number;
    newTotal: number;
  };
}

// 创建 fetcher 函数
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DashboardPage = () => {
  // 修正 API 路径并添加 fetcher
  const { data, error } = useSWR<DashboardData>("/api/stat", fetcher);

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "X":
        return <XOutlined className="text-black-500" />;
      case "Blog":
        return <FileSearchOutlined className="text-red-500" />;
      case "Wechat":
        return <WechatOutlined className="text-green-500" />;
      default:
        return null;
    }
  };

  if (error) return <div className="p-4 text-red-500">数据加载失败</div>;
  if (!data) return <div className="p-4 text-gray-500">数据加载中...</div>;

  return (
    <div className="p-4">
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>
          欢迎使用情报收集系统
        </Title>
        <div>
          <p>这里是系统主页，您可以通过侧边栏导航到不同功能模块</p>
        </div>
      </div>
      {/* 全局统计 - 添加可选链操作符 */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col md={8} xs={24}>
            <Statistic
              prefix={<FileSearchOutlined className="text-blue-500" />}
              title="总监控源数量"
              value={data.totals?.monitoredTotal || 0}
            />
          </Col>
          <Col md={8} xs={24}>
            <Statistic
              prefix={<FileSearchOutlined className="text-blue-500" />}
              title="总内容数量"
              value={data.totals?.contentTotal || 0}
            />
          </Col>
          <Col md={8} xs={24}>
            <Statistic
              prefix={<FileSearchOutlined className="text-blue-500" />}
              title="近3天新增"
              value={data.totals?.newTotal || 0}
            />
          </Col>
        </Row>
      </Card>

      {/* 分类统计 - 添加类型断言 */}
      <Row className="mb-6" gutter={[16, 16]}>
        {(data.stats || []).map((item: StatsItem, index: number) => (
          <Col key={index} lg={8} sm={12} xs={24}>
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 text-2xl">
                    {renderIcon(item.iconType)}
                  </div>
                  <div>
                    <div className="text-lg font-medium">{item.title}</div>
                    <div className="text-gray-500">
                      监控源数量：{item.monitored}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{item.total}</div>
                  <div className="text-green-500">+{item.new}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardPage;
