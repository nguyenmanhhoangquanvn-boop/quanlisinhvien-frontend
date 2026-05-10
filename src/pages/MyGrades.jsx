import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin } from 'antd';
import { Star, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        // Gọi thẳng API student dashboard - không cần lấy studentId nữa
        const res = await axios.get(
          'http://localhost:8080/api/student/grades',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGrades(res.data || []);
      } catch (error) {
        console.error('Lỗi tải điểm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Đếm số môn có đủ cả HK1 lẫn HK2
  const subjectMap = {};
  grades.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = new Set();
    subjectMap[g.subject].add(g.semester);
  });
  const totalSubjects = Object.keys(subjectMap).length;

  // Đếm số môn trượt (có ít nhất 1 kỳ điểm < 5)
  const failedSubjects = Object.keys(subjectMap).filter(subject =>
    grades.some(g => g.subject === subject && g.score < 5)
  ).length;

  // Tính GPA từ dữ liệu local
  const avgScore = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length).toFixed(1)
    : null;

  const getXepLoai = (avg) => {
    const n = parseFloat(avg);
    if (!avg || isNaN(n)) return '—';
    if (n >= 9.0) return 'XUẤT SẮC';
    if (n >= 8.0) return 'GIỎI';
    if (n >= 6.5) return 'KHÁ';
    if (n >= 5.0) return 'TRUNG BÌNH';
    return 'YẾU';
  };

  // Đổi hàm này:
const xepLoaiColor = (xepLoai) => {
  if (!xepLoai) return '#94a3b8';
  if (xepLoai.includes('XUẤT') || xepLoai.includes('GIỎI')) return '#7c3aed'; // ← đổi màu
  if (xepLoai.includes('KHÁ')) return '#059669';
  if (xepLoai.includes('TRUNG')) return '#f59e0b';
  return '#dc2626';
};

  const columns = [
    {
      title: 'TÊN MÔN HỌC',
      dataIndex: 'subject',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'HỌC KỲ',
      dataIndex: 'semester',
      align: 'center',
      render: (text) => <Tag color="blue" style={{ borderRadius: 6 }}>{text || 'N/A'}</Tag>
    },
    {
      title: 'ĐIỂM SỐ',
      dataIndex: 'score',
      align: 'center',
      render: (score) => (
        <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: 16 }}>{score}</span>
      )
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'score',
      align: 'center',
      render: (score) => (
        <Tag color={score >= 5 ? 'green' : 'red'} style={{ borderRadius: 6, fontWeight: 700 }}>
          {score >= 5 ? 'Đạt' : 'Không đạt'}
        </Tag>
      )
    },
  ];

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div className="dashboard">
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
          <div className="stat-content">
            <h3 style={{ color: '#7c3aed' }}>Điểm trung bình</h3>
            <div className="stat-value">
              <span className="value" style={{ color: '#6d28d9' }}>
                {avgScore ?? '—'}
              </span>
            </div>
          </div>
          <Star color="#8b5cf6" size={32} />
        </div>

        <div className="stat-card" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div className="stat-content">
            <h3 style={{ color: '#059669' }}>Số môn đã học</h3>
            <div className="stat-value">
              <span className="value" style={{ color: '#047857' }}>{totalSubjects}</span>
            </div>
          </div>
          <FileText color="#10b981" size={32} />
        </div>

        <div className="stat-card" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <div className="stat-content">
            <h3 style={{ color: '#d97706' }}>Xếp loại</h3>
            <div className="stat-value">
              <span className="value" style={{ color: xepLoaiColor(getXepLoai(avgScore)) }}>
                {getXepLoai(avgScore)}
              </span>
            </div>
          </div>
          <TrendingUp color="#f59e0b" size={32} />
        </div>

        <div className="stat-card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div className="stat-content">
            <h3 style={{ color: '#dc2626' }}>Môn trượt</h3>
            <div className="stat-value">
              <span className="value" style={{ color: '#b91c1c' }}>{failedSubjects}</span>
            </div>
          </div>
          <TrendingUp color="#ef4444" size={32} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Bảng điểm chi tiết</h2>
        </div>
        <Table
          columns={columns}
          dataSource={grades}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Chưa có điểm nào được nhập' }}
        />
      </div>
    </div>
  );
}