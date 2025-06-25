import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Badge,
  Tooltip,
  Card,
  Row,
  Col,
  Typography,
  message,
} from 'antd';
import {
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';

const { Title, Text } = Typography;

// 定义数据类型
interface DeploymentSchedule {
  id: string;
  created: string;
  updated: string;
  deployment_id: string;
  schedule: {
    // 间隔类型调度
    interval?: number;
    anchor_date?: string;
    timezone?: string | null;
    // Cron类型调度
    cron?: string;
    day_or?: boolean;
  };
  active: boolean;
  max_scheduled_runs?: number | null;
  parameters: Record<string, any>;
  slug?: string | null;
}

interface GlobalConcurrencyLimit {
  id: string;
  created: string;
  updated: string;
  active: boolean;
  name: string;
  limit: number;
  active_slots: number;
  slot_decay_per_second: number;
}

interface ConcurrencyOptions {
  collision_strategy: string;
}

interface CreatedBy {
  id: string;
  type: string;
  display_value: string;
}

interface Deployment {
  id: string;
  created: string;
  updated: string;
  name: string;
  flow_id: string;
  version?: string;
  description?: string;
  paused: boolean;
  schedules: DeploymentSchedule[];
  concurrency_limit?: number;
  global_concurrency_limit?: GlobalConcurrencyLimit;
  concurrency_options?: ConcurrencyOptions;
  job_variables: Record<string, any>;
  parameters: Record<string, any>;
  tags: string[];
  labels: Record<string, any>;
  work_queue_name?: string;
  last_polled?: string;
  parameter_openapi_schema?: Record<string, any>;
  path?: string;
  pull_steps?: any[];
  entrypoint?: string;
  storage_document_id?: string;
  infrastructure_document_id?: string;
  created_by?: CreatedBy;
  updated_by?: CreatedBy;
  work_pool_name?: string;
  status: 'READY' | 'NOT_READY';
  enforce_parameter_schema: boolean;
}

interface ApiResponse {
  results: Deployment[];
  count: number;
  limit: number;
  pages: number;
  page: number;
}

// 使用 NEXT_PUBLIC_ 前缀使环境变量在客户端可用
const PREFECT_API_URL = process.env.NEXT_PUBLIC_PREFECT_API_URL ?? '';

const WorkflowList: React.FC = () => {
  const [data, setData] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取数据
  const fetchData = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`${PREFECT_API_URL}/api/deployments/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          limit,
          sort: 'UPDATED_DESC',
        }),
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        setData(result.results);
        setPagination({
          current: result.page,
          pageSize: result.limit,
          total: result.count,
        });
      } else {
        message.error('获取数据失败');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 处理表格变化
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };



  // 跳转到部署详情页面
  const goToDeploymentDetail = (id: string) => {
    const url = `${PREFECT_API_URL}/deployments/deployment/${id}?tab=Runs`;
    window.open(url, '_blank');
  };

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const color = status === 'READY' ? 'green' : 'orange';
    const text = status === 'READY' ? '就绪' : '未就绪';
    return <Badge status={color === 'green' ? 'success' : 'warning'} text={text} />;
  };

  // 暂停状态渲染
  const renderPaused = (paused: boolean) => {
    return paused ? (
      <Tag icon={<PauseCircleOutlined />} color="red">
        已暂停
      </Tag>
    ) : (
      <Tag icon={<PlayCircleOutlined />} color="green">
        运行中
      </Tag>
    );
  };

  // 表格列定义
  const columns: ColumnsType<Deployment> = [
    {
      title: '部署名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: Deployment) => (
        <Button type="link" onClick={() => goToDeploymentDetail(record.id)}>
          {text}
        </Button>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '运行状态',
      dataIndex: 'paused',
      key: 'paused',
      width: 100,
      render: renderPaused,
    },
    {
      title: '工作池',
      dataIndex: 'work_pool_name',
      key: 'work_pool_name',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '定时调度',
      dataIndex: 'schedules',
      key: 'schedules',
      width: 200,
      render: (schedules: DeploymentSchedule[]) => {
        if (!schedules || schedules.length === 0) {
          return <Tag color="default">无调度</Tag>;
        }
        
        return (
          <Space direction="vertical" size="small">
            {schedules.slice(0, 2).map((schedule, index) => {
              const renderScheduleInfo = () => {
                if (!schedule.schedule) return null;
                
                if (schedule.schedule.cron) {
                  return (
                    <Tooltip title={`Cron: ${schedule.schedule.cron}, 时区: ${schedule.schedule.timezone || 'UTC'}`}>
                      <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                        Cron: {schedule.schedule.cron}
                      </Text>
                    </Tooltip>
                  );
                } else if (schedule.schedule.interval) {
                  return (
                    <Tooltip title={`时区: ${schedule.schedule.timezone || 'UTC'}`}>
                      <Text style={{ fontSize: '12px', marginLeft: '4px' }}>
                        间隔: {schedule.schedule.interval}s
                      </Text>
                    </Tooltip>
                  );
                }
                return null;
              };

              return (
                <div key={schedule.id || index}>
                  <Tag color={schedule.active ? "green" : "red"}>
                    {schedule.active ? "激活" : "暂停"}
                  </Tag>
                  {renderScheduleInfo()}
                </div>
              );
            })}
            {schedules.length > 2 && (
              <Tooltip title={`共${schedules.length}个调度任务`}>
                <Tag color="blue">+{schedules.length - 2}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updated',
      key: 'updated',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
      sorter: true,
    },
  ];

      return (
      <div
          className="flex w-full overflow-hidden"
          style={{
              position: "relative",
          }}
      >
         <div className="flex flex-col gap-4 w-full min-w-0">
        <Card>
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
            <Col>
                <Title level={4} style={{ margin: 0 }}>
                工作流部署列表
                </Title>
            </Col>
            <Col flex="auto" />
            <Col>
                <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchData(pagination.current, pagination.pageSize)}
                loading={loading}
                >
                刷新
                </Button>
            </Col>
            </Row>

            

                    {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Text type="secondary">总部署数</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {pagination.total}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Text type="secondary">就绪部署</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                {data.filter(item => item.status === 'READY').length}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Text type="secondary">运行中</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                {data.filter(item => !item.paused).length}
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Text type="secondary">已暂停</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {data.filter(item => item.paused).length}
              </div>
            </Card>
          </Col>
        </Row>

                    {/* 数据表格 */}
        <div className="w-full overflow-auto">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </div>
        </Card>

        
        </div>
    </div>
  );
};

export default WorkflowList;