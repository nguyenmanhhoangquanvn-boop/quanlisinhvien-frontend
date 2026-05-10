import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Progress } from 'antd';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/studentApi';

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/attendance');
        setRecords(res.data || []);
      } catch (e) {
        console.error('Lỗi tải điểm danh:', e);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Thống kê
  const total   = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const late    = records.filter(r => r.status === 'late').length;
  const rate    = total > 0 ? Math.round(present / total * 100) : 0;
  const rateColor = rate >= 80 ? '#059669' : rate >= 60 ? '#d97706' : '#dc2626';

  const statCards = [
    { label: 'Tỉ lệ có mặt', value: `${rate}%`, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <ClipboardList size={32} color="#8b5cf6" /> },
    { label: 'Có mặt',        value: present,     color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle size={32} color="#10b981" /> },
    { label: 'Vắng mặt',      value: absent,      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: <XCircle size={32} color="#ef4444" /> },
    { label: 'Đi muộn',       value: late,        color: '#d97706', bg: '#fff7ed', border: '#fed7aa', icon: <Clock size={32} color="#f59e0b" /> },
  ];

  const columns = [
    {
      title: 'MÔN HỌC',
      dataIndex: 'subjectName',
      render: (t) => <span style={{ fontWeight: 700, color: '#1e293b' }}>{t || '—'}</span>,
    },
    {
      title: 'LỚP',
      dataIndex: 'className',
      render: (t) => <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>{t || 'N/A'}</Tag>,
    },
    {
      title: 'NGÀY',
      dataIndex: 'date',
      render: (t) => <span style={{ color: '#64748b' }}>{t}</span>,
    },
    {
      title: 'CA HỌC',
      dataIndex: 'shift',
      render: (t) => <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{t || '—'}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      align: 'center',
      render: (s) => {
        const map = {
          present: { label: 'Có mặt', color: 'green' },
          absent:  { label: 'Vắng',   color: 'red'   },
          late:    { label: 'Muộn',   color: 'orange' },
        };
        const item = map[s] || { label: s, color: 'default' };
        return <Tag color={item.color} style={{ borderRadius: 6, fontWeight: 700 }}>{item.label}</Tag>;
      },
    },
  ];

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div className="dashboard">
      {/* Stat cards — giống MyGrades */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {statCards.map((c, i) => (
          <div key={i} className="stat-card" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <div className="stat-content">
              <h3 style={{ color: c.color }}>{c.label}</h3>
              <div className="stat-value">
                <span className="value" style={{ color: c.color }}>{c.value}</span>
              </div>
            </div>
            {c.icon}
          </div>
        ))}
      </div>

      {/* Progress bar tỉ lệ */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, color: '#0f172a', minWidth: 120 }}>Tỉ lệ có mặt</span>
          <Progress percent={rate} strokeColor={rateColor}
            format={p => <span style={{ color: rateColor, fontWeight: 800 }}>{p}%</span>}
            style={{ flex: 1 }} />
          <span style={{ fontWeight: 600, color: '#64748b', minWidth: 80, textAlign: 'right' }}>
            {present} / {total} buổi
          </span>
        </div>
      </div>

      {/* Bảng chi tiết — giống MySchedule */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ClipboardList size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0 }}>Chi tiết điểm danh</h2>
          </div>
        </div>
        <Table columns={columns} dataSource={records} rowKey={(r, i) => i}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có dữ liệu điểm danh' }} />
      </div>
    </div>
  );
}