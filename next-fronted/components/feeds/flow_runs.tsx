import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Badge,
  Card,
  Row,
  Col,
  Typography,
  message,
  DatePicker,
  Select,
  Input,
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// 使用 NEXT_PUBLIC_ 前缀使环境变量在客户端可用
const PREFECT_API_URL = process.env.NEXT_PUBLIC_PREFECT_API_URL ?? '';

// 定义数据类型
interface FlowRunState {
  id: string;
  type: string;
  name: string;
  timestamp: string;
  message: string;
  data?: any;
}

interface FlowRun {
  id: string;
  created: string;
  updated: string;
  name: string;
  flow_id: string;
  state_id: string;
  deployment_id: string;
  deployment_version?: string;
  work_queue_id?: string;
  work_queue_name?: string;
  flow_version?: string;
  parameters: Record<string, any>;
  tags: string[];
  labels: Record<string, any>;
  state_type: string;
  state_name: string;
  run_count: number;
  expected_start_time?: string;
  next_scheduled_start_time?: string;
  start_time?: string;
  end_time?: string;
  total_run_time: number;
  estimated_run_time: number;
  auto_scheduled: boolean;
  work_pool_name?: string;
  state: FlowRunState;
}

interface Deployment {
  id: string;
  name: string;
}


const FlowRuns: React.FC = () => {
  const [data, setData] = useState<FlowRun[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [selectedDeployment, setSelectedDeployment] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // 获取部署列表
  const fetchDeployments = async () => {
    try {
      const response = await fetch(`${PREFECT_API_URL}/api/deployments/paginate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          limit: 100,
          sort: 'NAME_ASC',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDeployments(result.results);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
    }
  };

  // 获取 Flow Runs 数据
  const fetchFlowRuns = async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    try {
      const filterBody: any = {
        flow_runs: {
          // 只获取有部署的 flow runs
          deployment_id: {
            is_null_: false
          }
        },
        sort: 'START_TIME_DESC',
        offset: (page - 1) * limit,
        limit: limit,
      };

      // 添加部署筛选
      if (selectedDeployment) {
        filterBody.flow_runs.deployment_id = {
          any_: [selectedDeployment]
        };
      }

      // 添加时间筛选
      if (dateRange && dateRange[0] && dateRange[1]) {
        filterBody.flow_runs.start_time = {
          after_: dateRange[0].toISOString(),
          before_: dateRange[1].toISOString(),
        };
      }

      const response = await fetch(`${PREFECT_API_URL}/api/flow_runs/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterBody),
      });

      if (response.ok) {
        const result: FlowRun[] = await response.json();
        setData(result);
        
        // 更新分页信息（注意：这个API可能不返回总数，需要根据实际情况调整）
        setPagination({
          current: page,
          pageSize: limit,
          total: result.length >= limit ? (page * limit) + 1 : (page - 1) * limit + result.length,
        });
      } else {
        message.error('获取Flow Runs数据失败');
      }
    } catch (error) {
      console.error('Error fetching flow runs:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchDeployments();
    fetchFlowRuns();
  }, []);

  // 处理表格变化
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchFlowRuns(newPagination.current, newPagination.pageSize);
  };

  // 处理筛选
  const handleFilter = () => {
    fetchFlowRuns(1, pagination.pageSize);
  };

  // 重置筛选
  const handleReset = () => {
    setSelectedDeployment('');
    setDateRange(null);
    fetchFlowRuns(1, pagination.pageSize);
  };

  // 状态渲染
  const renderState = (stateType: string, stateName: string) => {
    const stateConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      'COMPLETED': { color: 'green', icon: <CheckCircleOutlined />, text: '已完成' },
      'RUNNING': { color: 'blue', icon: <PlayCircleOutlined />, text: '运行中' },
      'SCHEDULED': { color: 'orange', icon: <ClockCircleOutlined />, text: '已调度' },
      'PENDING': { color: 'gold', icon: <ClockCircleOutlined />, text: '等待中' },
      'FAILED': { color: 'red', icon: <CloseCircleOutlined />, text: '失败' },
      'CANCELLED': { color: 'default', icon: <PauseCircleOutlined />, text: '已取消' },
      'CRASHED': { color: 'volcano', icon: <ExclamationCircleOutlined />, text: '崩溃' },
      'PAUSED': { color: 'purple', icon: <PauseCircleOutlined />, text: '暂停' },
    };

    const config = stateConfig[stateType] || { color: 'default', icon: <ClockCircleOutlined />, text: stateType };
    
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // 获取部署名称
  const getDeploymentName = (deploymentId: string) => {
    const deployment = deployments.find(d => d.id === deploymentId);
    return deployment?.name || deploymentId.substring(0, 8);
  };

  // 格式化运行时间
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  // 跳转到 Flow Run 详情页面
  const goToFlowRunDetail = (id: string) => {
    const url = `${PREFECT_API_URL}/runs/flow-run/${id}`;
    window.open(url, '_blank');
  };

  // 跳转到部署详情页面
  const goToDeploymentDetail = (deploymentId: string) => {
    const url = `${PREFECT_API_URL}/deployments/deployment/${deploymentId}?tab=Runs`;
    window.open(url, '_blank');
  };

  // 表格列定义
  const columns: ColumnsType<FlowRun> = [
    {
      title: 'Flow Run 名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: FlowRun) => (
        <Button 
          type="link" 
          onClick={() => goToFlowRunDetail(record.id)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text || '未命名'}
        </Button>
      ),
    },
    {
      title: '部署',
      dataIndex: 'deployment_id',
      key: 'deployment_id',
      width: 150,
      ellipsis: true,
      render: (deploymentId: string) => (
        <Button 
          type="link" 
          onClick={() => goToDeploymentDetail(deploymentId)}
          style={{ padding: 0, height: 'auto' }}
        >
          {getDeploymentName(deploymentId)}
        </Button>
      ),
    },
    {
      title: '状态',
      dataIndex: 'state_type',
      key: 'state_type',
      width: 120,
      render: (stateType: string, record: FlowRun) => renderState(stateType, record.state_name),
    },
    {
      title: '运行次数',
      dataIndex: 'run_count',
      key: 'run_count',
      width: 100,
      align: 'center',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (text: string) => text ? new Date(text).toLocaleString('zh-CN') : '-',
      sorter: true,
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 180,
      render: (text: string) => text ? new Date(text).toLocaleString('zh-CN') : '-',
    },
    {
      title: '运行时长',
      dataIndex: 'total_run_time',
      key: 'total_run_time',
      width: 100,
      render: (time: number) => time > 0 ? formatDuration(time) : '-',
    },
    {
      title: '工作池',
      dataIndex: 'work_pool_name',
      key: 'work_pool_name',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
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
                Flow Runs 列表
              </Title>
            </Col>
            <Col flex="auto" />
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchFlowRuns(pagination.current, pagination.pageSize)}
                loading={loading}
              >
                刷新
              </Button>
            </Col>
          </Row>

          {/* 筛选区域 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={8}>
                <Select
                  prefix={<span style={{ fontWeight: 'bold' }}>选择部署：</span>}
                  allowClear
                  style={{ width: '100%' }}
                  value={selectedDeployment}
                  onChange={setSelectedDeployment}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {deployments.map((deployment) => (
                    <Option key={deployment.id} value={deployment.id}>
                      {deployment.name}
                    </Option>
                  ))}
                </Select>
            </Col>
            <Col span={8}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['开始时间', '结束时间']}
              />
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={handleFilter}
                >
                  筛选
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>

          {/* 统计信息 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">总运行数</Text>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {data.length}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">成功</Text>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                  {data.filter(item => item.state_type === 'COMPLETED').length}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">运行中</Text>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                  {data.filter(item => item.state_type === 'RUNNING').length}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Text type="secondary">失败</Text>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  {data.filter(item => item.state_type === 'FAILED').length}
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

export default FlowRuns;