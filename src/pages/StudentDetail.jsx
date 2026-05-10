import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, Spin, Space, Typography, Avatar } from 'antd';
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, BookOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api/studentApi';

const { Title } = Typography;

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tải dữ liệu chi tiết sinh viên từ API
    api.get(`/students/${id}`)
      .then(res => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!student) return <div style={{ textAlign: 'center', padding: 50 }}>Không tìm thấy sinh viên</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        {/* Nút quay lại và Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={3} style={{ margin: 0 }}>Hồ sơ chi tiết sinh viên</Title>
        </div>

        {/* Thẻ chứa thông tin chính (Avatar, Tên, Trạng thái) */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar 
              size={100} 
              src={student.avatar ? `http://localhost:8080/uploads/${student.avatar}` : null}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#4F46E5' }}
            />
            <div>
              <Title level={2} style={{ margin: '0 0 8px 0' }}>{student.fullName}</Title>
              <Space>
                <Tag color="blue">{student.studentCode}</Tag>
                <Tag color={student.status === 'active' ? 'green' : 'red'}>
                  {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                </Tag>
              </Space>
            </div>
          </div>
        </Card>

        {/* THÔNG TIN CHI TIẾT - PHẦN FIX LỖI XẾP DỌC CHỮ */}
        <Card title={<span><IdcardOutlined /> Thông tin chi tiết</span>}>
          <Descriptions 
            column={1} 
            bordered 
            size="middle"
            labelStyle={{ width: '200px', fontWeight: 'bold', background: '#fafafa' }}
          >
            <Descriptions.Item label={<span><MailOutlined style={{ marginRight: 8 }} /> Email</span>}>
              {student.email || 'Chưa cập nhật'}
            </Descriptions.Item>
            
            <Descriptions.Item label={<span><PhoneOutlined style={{ marginRight: 8 }} /> Số điện thoại</span>}>
              {student.phone || 'Chưa cập nhật'}
            </Descriptions.Item>
            
            <Descriptions.Item label={<span><BookOutlined style={{ marginRight: 8 }} /> Khoa / Ngành</span>}>
              {student.department}
            </Descriptions.Item>
            
            <Descriptions.Item label={<span><BookOutlined style={{ marginRight: 8 }} /> Lớp học</span>}>
              {student.tenLop ? (
                <Tag color="purple">{student.maLop} - {student.tenLop}</Tag>
              ) : (
                <span style={{ color: '#ccc', fontStyle: 'italic' }}>Chưa xếp lớp</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}