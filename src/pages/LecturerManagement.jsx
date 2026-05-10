import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, Button, Input, Select, Modal, Form, Tag, Space,
  message, Popconfirm, Avatar, Tooltip, Badge, DatePicker
} from 'antd';
import dayjs from 'dayjs';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ReloadOutlined, UserOutlined, TeamOutlined,
  HomeOutlined, RightOutlined, FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const API = 'http://localhost:8080/api';
const HOC_VI = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó Giáo sư', 'Giáo sư'];
const STATUS_LIST = ['Đang dạy', 'Nghỉ phép', 'Đã nghỉ'];
const GIOI_TINH = ['Nam', 'Nữ', 'Khác'];

export default function LecturerManagement() {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ total: 0, dangDay: 0, soKhoa: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterKhoa, setFilterKhoa] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [form] = Form.useForm();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.name = search;
      if (filterKhoa) params.khoaId = filterKhoa;
      if (filterStatus) params.status = filterStatus;
      const [lecRes, deptRes, statsRes] = await Promise.all([
        axios.get(`${API}/lecturers`, { headers, params }),
        axios.get(`${API}/departments`, { headers }),
        axios.get(`${API}/lecturers/stats`, { headers }),
      ]);
      setLecturers(lecRes.data);
      setDepartments(deptRes.data);
      setStats(statsRes.data);
    } catch { message.error('Lỗi tải dữ liệu!'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [search, filterKhoa, filterStatus]);

  const openAdd = () => { setEditingId(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => {
    setEditingId(r.id);
    form.setFieldsValue({
      ...r, khoaId: r.khoa?.id,
      ngaySinh: r.ngaySinh ? dayjs(r.ngaySinh, 'DD/MM/YYYY') : null,
      ngayVaoLam: r.ngayVaoLam ? dayjs(r.ngayVaoLam, 'DD/MM/YYYY') : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        khoa: values.khoaId ? { id: values.khoaId } : null,
        ngaySinh: values.ngaySinh ? values.ngaySinh.format('DD/MM/YYYY') : null,
        ngayVaoLam: values.ngayVaoLam ? values.ngayVaoLam.format('DD/MM/YYYY') : null,
      };
      delete payload.khoaId;
      if (editingId) {
        await axios.put(`${API}/lecturers/${editingId}`, payload, { headers });
        message.success('Cập nhật thành công!');
      } else {
        await axios.post(`${API}/lecturers`, payload, { headers });
        message.success('Thêm giảng viên thành công!');
      }
      setModalOpen(false);
      fetchAll();
    } catch (e) {
      const msg = e.response?.data || 'Lỗi xử lý!';
      message.error(typeof msg === 'string' ? msg : 'Lỗi xử lý!');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/lecturers/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        message.success('Đã xóa giảng viên!');
        fetchAll();
      } else {
        const errMsg = await res.text();
        message.error(errMsg || 'Không thể xóa giảng viên!');
      }
    } catch { message.error('Lỗi kết nối server!'); }
  };

  const statCards = [
    { label: 'Tổng giảng viên', value: stats.total, color: '#7c3aed', bg: '#f5f3ff', icon: <UserOutlined /> },
    { label: 'Đang dạy', value: stats.dangDay, color: '#059669', bg: '#ecfdf5', icon: <TeamOutlined /> },
    { label: 'Số khoa', value: stats.soKhoa, color: '#0284c7', bg: '#eff6ff', icon: <UserOutlined /> },
    { label: 'Nghỉ / Đã nghỉ', value: stats.total - stats.dangDay, color: '#d97706', bg: '#fffbeb', icon: <UserOutlined /> },
  ];

  const columns = [
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Giảng viên</span>,
      key: 'name',
      render: (_, r) => (
        <Space>
          <Avatar src={r.avatar ? `${API}/students/avatars/${r.avatar}` : null}
            style={{ background: '#8b5cf6', fontWeight: 700 }} size={40}>
            {!r.avatar && r.fullName?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.fullName}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.lecturerCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Khoa</span>,
      render: (_, r) => r.khoa?.name
        ? <Tag color="purple" style={{ borderRadius: 6 }}>{r.khoa.name}</Tag>
        : <span style={{ color: '#94a3b8' }}>—</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Học vị</span>,
      dataIndex: 'hocVi',
      render: (t) => <span style={{ fontWeight: 600, color: '#475569' }}>{t || '—'}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Email</span>,
      dataIndex: 'email',
      render: (t) => <span style={{ color: '#64748b' }}>{t || '—'}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Trạng thái</span>,
      dataIndex: 'status',
      render: (s) => (
        <Badge
          color={s === 'Đang dạy' ? '#22c55e' : s === 'Nghỉ phép' ? '#f59e0b' : '#ef4444'}
          text={<span style={{ fontWeight: 600 }}>{s}</span>}
        />
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Thao tác</span>,
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedLecturer(r); setDetailOpen(true); }} style={{ color: '#8b5cf6' }} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} style={{ color: '#3b82f6' }} />
          </Tooltip>
          <Popconfirm title="Xóa giảng viên này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
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
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Giảng viên</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Quản lý Giảng viên</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Quản lý danh sách giảng viên và thông tin giảng dạy</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', height: 38, borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          Thêm giảng viên
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
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input placeholder="Tìm theo tên giảng viên..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ width: 240, borderRadius: 8 }} allowClear />
          <Select placeholder="Lọc theo khoa" suffixIcon={<FilterOutlined style={{ color: '#7c3aed' }} />}
            options={departments.map(d => ({ label: d.name, value: d.id }))}
            value={filterKhoa} onChange={v => { setFilterKhoa(v); setCurrentPage(1); }}
            allowClear style={{ width: 180 }} />
          <Select placeholder="Trạng thái"
            options={STATUS_LIST.map(s => ({ label: s, value: s }))}
            value={filterStatus} onChange={v => { setFilterStatus(v); setCurrentPage(1); }}
            allowClear style={{ width: 150 }} />
          {(search || filterKhoa || filterStatus) && (
            <Button size="small" icon={<ReloadOutlined />}
              onClick={() => { setSearch(''); setFilterKhoa(null); setFilterStatus(null); setCurrentPage(1); }}
              style={{ borderRadius: 8, color: '#7c3aed', borderColor: '#ddd6fe' }}>
              Xóa bộ lọc
            </Button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>{lecturers.length} giảng viên</div>
        </div>

        <Table columns={columns} dataSource={lecturers} rowKey="id" loading={loading}
          components={{ header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} /> } }}
          pagination={{ current: currentPage, pageSize: PAGE_SIZE, total: lecturers.length, onChange: setCurrentPage, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} trong ${t} giảng viên`, style: { padding: '12px 20px' } }}
        />
      </div>

      {/* Modal thêm/sửa */}
      <Modal title={editingId ? '✏️ Chỉnh sửa giảng viên' : '➕ Thêm giảng viên mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSubmit}
        okText={editingId ? 'Cập nhật' : 'Thêm mới'}
        okButtonProps={{ style: { background: '#8b5cf6' } }} width={700} centered>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="lecturerCode" label="Mã giảng viên" rules={[{ required: true, message: 'Nhập mã GV!' }]}>
              <Input placeholder="GV001" disabled={!!editingId} />
            </Form.Item>
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item name="gioiTinh" label="Giới tính">
              <Select placeholder="Chọn giới tính">{GIOI_TINH.map(g => <Option key={g} value={g}>{g}</Option>)}</Select>
            </Form.Item>
            <Form.Item name="ngaySinh" label="Ngày sinh">
              <DatePicker placeholder="Chọn ngày sinh" format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="gv@example.com" />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input placeholder="0901234567" />
            </Form.Item>
            <Form.Item name="khoaId" label="Khoa">
              <Select placeholder="Chọn khoa" allowClear>{departments.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}</Select>
            </Form.Item>
            <Form.Item name="chuyenNganh" label="Chuyên ngành">
              <Input placeholder="Công nghệ thông tin" />
            </Form.Item>
            <Form.Item name="hocVi" label="Học vị">
              <Select placeholder="Chọn học vị">{HOC_VI.map(h => <Option key={h} value={h}>{h}</Option>)}</Select>
            </Form.Item>
            <Form.Item name="ngayVaoLam" label="Ngày vào làm">
              <DatePicker placeholder="Chọn ngày vào làm" format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select placeholder="Trạng thái">{STATUS_LIST.map(s => <Option key={s} value={s}>{s}</Option>)}</Select>
            </Form.Item>
          </div>
          <Form.Item name="diaChi" label="Địa chỉ">
            <Input placeholder="123 Đường ABC, Hà Nội" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <Modal title="👤 Chi tiết giảng viên" open={detailOpen} onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="edit" type="primary" style={{ background: '#8b5cf6' }}
            onClick={() => { setDetailOpen(false); openEdit(selectedLecturer); }}>Chỉnh sửa</Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>
        ]} width={520} centered>
        {selectedLecturer && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar src={selectedLecturer.avatar ? `${API}/students/avatars/${selectedLecturer.avatar}` : null}
                size={80} style={{ background: '#8b5cf6', fontSize: 32, fontWeight: 700 }}>
                {!selectedLecturer.avatar && selectedLecturer.fullName?.charAt(0)}
              </Avatar>
              <div style={{ marginTop: 12, fontSize: 20, fontWeight: 800 }}>{selectedLecturer.fullName}</div>
              <Tag color={selectedLecturer.status === 'Đang dạy' ? 'green' : selectedLecturer.status === 'Nghỉ phép' ? 'orange' : 'red'} style={{ marginTop: 4, borderRadius: 6 }}>
                {selectedLecturer.status}
              </Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Mã GV', selectedLecturer.lecturerCode],
                ['Học vị', selectedLecturer.hocVi],
                ['Giới tính', selectedLecturer.gioiTinh],
                ['Ngày sinh', selectedLecturer.ngaySinh],
                ['Email', selectedLecturer.email],
                ['Điện thoại', selectedLecturer.phone],
                ['Khoa', selectedLecturer.khoa?.name],
                ['Chuyên ngành', selectedLecturer.chuyenNganh],
                ['Ngày vào làm', selectedLecturer.ngayVaoLam],
                ['Địa chỉ', selectedLecturer.diaChi],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}