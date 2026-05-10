import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Spin } from 'antd';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import api from '../api/studentApi'; // ✅ dùng api instance thay vì axios trực tiếp

export default function MySchedule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // ✅ Bỏ hardcode URL và token thủ công, api instance tự xử lý
        const res = await api.get('/student/schedules');
        setData(res.data || []);
      } catch (error) {
        console.error('Lỗi tải lịch học:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const columns = [
    {
      title: 'MÔN HỌC',
      dataIndex: 'monHoc',
      render: (text) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{text}</span>
    },
    {
      title: 'LỚP',
      dataIndex: 'tenLop',
      render: (tenLop) => (
        <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>
          {tenLop || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'caDay',
      render: (text) => (
        <Space style={{ color: '#8b5cf6', fontWeight: 600 }}>
          <Clock size={16} />{text}
        </Space>
      )
    },
    {
      title: 'NGÀY',
      dataIndex: 'ngay',
      render: (text) => <span style={{ color: '#64748b' }}>{text}</span>
    },
    {
      title: 'PHÒNG HỌC',
      dataIndex: 'phong',
      render: (text) => (
        <Space>
          <MapPin size={16} color="#94a3b8" />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      )
    },
  ];

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CalendarDays size={24} color="#8b5cf6" />
          <h2 style={{ margin: 0 }}>Thời khóa biểu cá nhân</h2>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Bạn chưa có lịch học nào trong danh sách' }}
      />
    </div>
  );
}