import React, { useMemo } from 'react';
import source_data from '@/resources/source.json';
import { Table, Card, Row, Col, Statistic, Tag, Space } from 'antd';
import { 
    GlobalOutlined, 
    TeamOutlined, 
    DatabaseOutlined, 
    LinkOutlined,
    FlagOutlined
} from '@ant-design/icons';

const SourceTable = () => {
    // 计算统计数据
    const statistics = useMemo(() => {
        const totalSources = source_data.length;
        const uniqueOrgs = new Set(source_data.map(item => item.org));
        const totalOrgs = uniqueOrgs.size;
        
        // 按国家统计厂商数
        const countryStats = source_data.reduce((acc, item) => {
            if (!acc[item.country]) {
                acc[item.country] = new Set();
            }
            acc[item.country].add(String(item.org));
            return acc;
        }, {} as Record<string, Set<string>>);
        
        const countryOrgCounts = Object.entries(countryStats).map(([country, orgs]) => ({
            country,
            orgCount: orgs.size
        })).sort((a, b) => b.orgCount - a.orgCount);
        
        return {
            totalSources,
            totalOrgs,
            countryOrgCounts
        };
    }, []);

    const columns = [
        {
            title: '数据源名称',
            dataIndex: 'name',
            render: (text: string, record: any, index: number) => {
                return (
                    <div>
                        <div style={{ 
                            width: 24, 
                            height: 24, 
                            marginRight: 12,
                            display: 'inline-block',
                            verticalAlign: 'middle'
                        }}>
                            <img 
                                // 如果favicon为空或者空字符串，则使用默认图标
                                src={record.favicon || '/icons/default_logo.svg'} 
                                alt=""
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                        {text}
                    </div>
                );
            },
        },
        {
            title: '厂商',
            dataIndex: 'org',
        },
        {
            title: '链接',
            dataIndex: 'link',
            render: (link: string) => {
                return link ? (
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            color: '#1890ff',
                            fontSize: '16px',
                            textDecoration: 'none'
                        }}
                        title={link}
                    >
                        🔗
                    </a>
                ) : null;
            },
        },
        {
            title: '归属国家',
            dataIndex: 'country',
        },
    ];

    const data = source_data;
    
    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* 统计信息卡片 */}
            <div style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]}>
                    {/* 总统计 */}
                    <Col xs={24} sm={12} lg={8}>
                        <Card>
                            <Statistic
                                title="总来源数"
                                value={statistics.totalSources}
                                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                        <Card>
                            <Statistic
                                title="总厂商数"
                                value={statistics.totalOrgs}
                                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} lg={8}>
                        <Card>
                            <Statistic
                                title="覆盖国家"
                                value={statistics.countryOrgCounts.length}
                                prefix={<GlobalOutlined style={{ color: '#fa8c16' }} />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* 按国家统计的厂商数 */}
            <Card 
                title={
                    <Space>
                        <FlagOutlined />
                        <span>各国厂商数分布</span>
                    </Space>
                } 
                style={{ marginBottom: '24px' }}
                bodyStyle={{ padding: '16px' }}
            >
                <Row gutter={[8, 8]}>
                    {statistics.countryOrgCounts.map(({ country, orgCount }) => (
                        <Col key={country}>
                            <Tag 
                                color={orgCount > 10 ? 'blue' : orgCount > 5 ? 'green' : 'orange'}
                                style={{ margin: '2px', fontSize: '13px', padding: '4px 8px' }}
                            >
                                {country}: {orgCount}
                            </Tag>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* 数据源表格 */}
            <Card 
                title={
                    <Space>
                        <LinkOutlined />
                        <span>数据源详情</span>
                    </Space>
                }
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        pageSize: 20,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    size="middle"
                    scroll={{ x: 800 }}
                    rowClassName={(record, index) => 
                        index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                    }
                />
            </Card>
            
            <style jsx>{`
                .table-row-light {
                    background-color: #fafafa;
                }
                .table-row-dark {
                    background-color: #ffffff;
                }
                .table-row-light:hover,
                .table-row-dark:hover {
                    background-color: #e6f7ff !important;
                }
            `}</style>
        </div>
    );
}

export default SourceTable;