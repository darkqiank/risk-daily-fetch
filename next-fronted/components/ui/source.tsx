import React from 'react';
import source_data from '@/resources/source.json';
// import { Table, Tag, Avatar } from '@douyinfe/semi-ui';
import { Table } from 'antd';

const SourceTable = () => {
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
        },
        {
            title: '归属国家',
            dataIndex: 'country',
        },
    ];

    const data = source_data;
    return <Table columns={columns} dataSource={data} />;
}

export default SourceTable;