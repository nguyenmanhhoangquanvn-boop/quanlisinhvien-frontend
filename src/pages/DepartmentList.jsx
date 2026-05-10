import { useEffect, useState, useMemo } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Space } from 'antd';
import {
  PlusOutlined, DeleteOutlined, SearchOutlined,
  ApartmentOutlined, HomeOutlined, RightOutlined
} from '@ant-design/icons';
import { getDepartments, createDepartment, deleteDepartment } from '../api/departmentApi';
import { useNavigate } from 'react-router-dom';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch {
      message.error('Không thể tải danh sách Khoa!');
    }
    setLoading(false);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAdd = async (values) => {
    try {
      await createDepartment(values);
      message.success('Thêm Khoa thành công!');
      form.resetFields();
      fetchDepartments();
    } catch (err) {
      const errMsg =
        err?.response?.data ||
        err?.response?.data?.message ||
        'Lỗi! Mã hoặc tên Khoa có thể đã tồn tại.';
      message.error(typeof errMsg === 'string' ? errMsg : 'Lỗi khi thêm khoa!');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/departments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')?.replace(/['"]+/g, '')}`,
        },
      });
      if (res.ok) {
        message.success('Đã xóa Khoa thành công!');
        fetchDepartments();
      } else {
        const errMsg = await res.text();
        message.error(errMsg || 'Không thể xóa khoa!');
      }
    } catch {
      message.error('Lỗi kết nối server!');
    }
  };

  const filtered = useMemo(() =>
    departments.filter(d =>
      d.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      d.name?.toLowerCase().includes(searchText.toLowerCase())
    ), [departments, searchText]);

  const statCards = [
    { label: 'Tổng số khoa', value: departments.length, color: '#7c3aed', bg: '#f5f3ff', icon: <ApartmentOutlined /> },
    { label: 'Khoa có mã', value: departments.filter(d => d.code).length, color: '#0284c7', bg: '#eff6ff', icon: <ApartmentOutlined /> },
  ];

  const columns = [
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Mã Khoa</span>,
      dataIndex: 'code',
      width: 140,
      render: (text) => <strong style={{ color: '#7c3aed', fontSize: 14 }}>{text}</strong>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Tên Khoa / Ngành</span>,
      dataIndex: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Thao tác</span>,
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa khoa này?"
          description="Đảm bảo không còn giảng viên hoặc lớp thuộc khoa này."
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa" cancelText="Hủy"
        >
          <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>Xóa</Button>
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
          onMouseLeave={e => e.target.style.color = '#94a3b8'}>
          Tổng quan
        </span>
        <RightOutlined style={{ fontSize: 10 }} />
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Khoa</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Quản lý Khoa / Ngành</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Quản lý danh mục các khoa trong trường</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20, maxWidth: 520 }}>
        {statCards.map((c, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c.color}`,
            border: `1px solid ${c.color}22`, borderLeft: `4px solid ${c.color}`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: c.color,
            }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm khoa */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 14 }}>
          <PlusOutlined style={{ color: '#7c3aed', marginRight: 8 }} />
          Thêm khoa mới
        </div>
        <Form form={form} layout="inline" onFinish={handleAdd}>
          <Form.Item name="code" rules={[{ required: true, message: 'Nhập mã khoa!' }]}>
            <Input placeholder="Mã Khoa (VD: IT)" style={{ width: 160, borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="name" rules={[{ required: true, message: 'Nhập tên khoa!' }]}>
            <Input placeholder="Tên Khoa (VD: Công nghệ thông tin)" style={{ width: 320, borderRadius: 8 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              Thêm Khoa
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Input
            placeholder="Tìm mã hoặc tên khoa..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
            allowClear
          />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
            {filtered.length} / {departments.length} khoa
          </div>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} khoa` }}
          components={{
            header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} /> }
          }}
        />
      </div>
    </div>
  );
}