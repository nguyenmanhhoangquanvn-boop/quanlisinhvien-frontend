import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message, Empty, Spin } from 'antd';
import {
  SearchOutlined, PlusOutlined, DeleteOutlined,
  CalendarOutlined, BookOutlined, UserOutlined,
  HomeOutlined, RightOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import ScheduleModal from '../components/ScheduleModal';
import { getSchedules, deleteSchedule } from '../api/scheduleApi';
import { useNavigate } from 'react-router-dom';

const caColors = {
  'Ca 1 (07:15 - 09:15)': '#7c3aed',
  'Ca 2 (09:25 - 11:25)': '#0284c7',
  'Ca 3 (12:00 - 14:00)': '#d97706',
  'Ca 4 (14:10 - 16:10)': '#059669',
};
const caBg = {
  'Ca 1 (07:15 - 09:15)': '#f5f3ff',
  'Ca 2 (09:25 - 11:25)': '#eff6ff',
  'Ca 3 (12:00 - 14:00)': '#fffbeb',
  'Ca 4 (14:10 - 16:10)': '#ecfdf5',
};

export default function Schedule() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSchedules();
      setData(res.data);
    } catch {
      message.error('Không thể tải lịch học!');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')?.replace(/['"]+/g, '')}` },
      });
      if (res.ok) {
        message.success('Đã xóa lịch học!');
        fetchData();
      } else {
        const errMsg = await res.text();
        message.error(errMsg || 'Không thể xóa lịch học!');
      }
    } catch { message.error('Lỗi kết nối server!'); }
  };

  const filtered = useMemo(() => data.filter(item =>
    item.monHoc?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.lop?.tenLop?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.lecturer?.fullName?.toLowerCase().includes(searchText.toLowerCase())
  ), [data, searchText]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: data.length,
      today: data.filter(d => d.ngay === today).length,
      subjects: new Set(data.map(d => d.monHoc).filter(Boolean)).size,
      classes: new Set(data.map(d => d.lop?.tenLop).filter(Boolean)).size,
    };
  }, [data]);

  const statCards = [
    { label: 'Tổng lịch học', value: stats.total, color: '#7c3aed', bg: '#f5f3ff', icon: <CalendarOutlined /> },
    { label: 'Hôm nay', value: stats.today, color: '#0284c7', bg: '#eff6ff', icon: <ClockCircleOutlined /> },
    { label: 'Số môn học', value: stats.subjects, color: '#059669', bg: '#ecfdf5', icon: <BookOutlined /> },
    { label: 'Số lớp', value: stats.classes, color: '#d97706', bg: '#fffbeb', icon: <UserOutlined /> },
  ];

  const columns = [
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Môn học</span>,
      dataIndex: 'monHoc',
      render: (t) => (
        <Space>
          <BookOutlined style={{ color: '#7c3aed' }} />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{t}</span>
        </Space>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Lớp</span>,
      render: (_, r) => (
        <Tag color="purple" style={{ borderRadius: 8, fontWeight: 600, padding: '2px 10px' }}>
          {r.lop?.tenLop || 'N/A'}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Giảng viên</span>,
      render: (_, r) => (
        <Space>
          <UserOutlined style={{ color: '#64748b' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.lecturer?.fullName || 'N/A'}</div>
            {r.lecturer?.hocVi && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.lecturer.hocVi}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Ca dạy</span>,
      dataIndex: 'caDay',
      render: (t) => (
        <span style={{
          color: caColors[t] || '#7c3aed', background: caBg[t] || '#f5f3ff',
          fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 99,
        }}>{t}</span>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Ngày</span>,
      dataIndex: 'ngay',
      render: (t) => (
        <Space>
          <CalendarOutlined style={{ color: '#0284c7' }} />
          <span style={{ fontWeight: 600 }}>{t}</span>
        </Space>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Phòng</span>,
      dataIndex: 'phong',
      render: (t) => <span style={{ color: '#475569' }}>{t}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Thao tác</span>,
      width: 80,
      render: (_, r) => (
        <Popconfirm title="Xóa lịch này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
          <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: '#94a3b8' }}>
        <HomeOutlined style={{ fontSize: 13 }} />
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}
          onMouseEnter={e => e.target.style.color = '#7c3aed'}
          onMouseLeave={e => e.target.style.color = '#94a3b8'}>Tổng quan</span>
        <RightOutlined style={{ fontSize: 10 }} />
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Lịch học</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Quản lý Lịch dạy & Học</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Quản lý lịch giảng dạy của các lớp học</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', height: 38, borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          Xếp lịch mới
        </Button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {statCards.map((c, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: `1px solid ${c.color}22`, borderLeft: `4px solid ${c.color}`,
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: c.color }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Input placeholder="Tìm theo môn học, lớp, giảng viên..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ width: 360, borderRadius: 8 }} allowClear />
          {searchText && (
            <Button size="small" onClick={() => { setSearchText(''); setCurrentPage(1); }}
              style={{ borderRadius: 8, color: '#7c3aed', borderColor: '#ddd6fe' }}>Xóa bộ lọc</Button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
            {filtered.length} / {data.length} lịch học
          </div>
        </div>

        <Spin spinning={loading}>
          <Table rowKey="id" columns={columns} dataSource={filtered}
            components={{ header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} /> } }}
            pagination={{ current: currentPage, pageSize: PAGE_SIZE, total: filtered.length, onChange: setCurrentPage, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} trong ${t} lịch học`, style: { padding: '12px 20px' } }}
            locale={{ emptyText: <Empty description="Chưa có lịch học nào" /> }}
          />
        </Spin>
      </div>

      <ScheduleModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); fetchData(); }} />
    </div>
  );
}