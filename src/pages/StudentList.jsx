import { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Tag,
  Modal, Spin, Input, Select, Row, Col
} from 'antd';
import {
  EyeOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, PlusOutlined,
  UserOutlined, TeamOutlined, BookOutlined,
  HomeOutlined, RightOutlined
} from '@ant-design/icons';
import { getStudents, deleteStudent } from '../api/studentApi';
import { getDepartments } from '../api/departmentApi';
import StudentModal from '../components/StudentModal';
import api from '../api/studentApi';
import { useNavigate } from 'react-router-dom';

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStudents, resDepts] = await Promise.all([getStudents(), getDepartments()]);
      setStudents(resStudents.data);
      setDepartments(resDepts.data);
    } catch { message.error('Lỗi tải dữ liệu'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const handleOpenModal = () => { setEditingStudent(null); setModalOpen(true); };
    window.addEventListener('openAddStudentModal', handleOpenModal);
    return () => window.removeEventListener('openAddStudentModal', handleOpenModal);
  }, []);

  const handleViewDetail = async (record) => {
    setDetailStudent(record);
    setDetailOpen(true);
    setGradeLoading(true);
    try {
      const [resGrades, resSummary] = await Promise.all([
        api.get(`/students/${record.id}/grades`),
        api.get(`/students/${record.id}/grades/summary`),
      ]);
      setGrades(resGrades.data);
      setSummary(resSummary.data);
    } catch { message.error('Không thể tải điểm số!'); }
    setGradeLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      message.success('Đã xóa sinh viên!');
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message
        || (typeof err?.response?.data === 'string' ? err.response.data : null)
        || 'Lỗi khi xóa!';
      message.error(msg);
    }
  };

  const filtered = useMemo(() => students.filter(sv => {
    const codeMatch = sv.studentCode?.toLowerCase().includes(searchCode.toLowerCase());
    const nameMatch = sv.fullName?.toLowerCase().includes(searchName.toLowerCase());
    const deptMatch = searchDept ? sv.department === searchDept : true;
    return codeMatch && nameMatch && deptMatch;
  }), [students, searchCode, searchName, searchDept]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    withClass: students.filter(s => s.lop || s.tenLop).length,
    depts: new Set(students.map(s => s.department).filter(Boolean)).size,
  }), [students]);

  const statCards = [
    { label: 'Tổng sinh viên', value: stats.total, color: '#7c3aed', bg: '#f5f3ff', icon: <UserOutlined /> },
    { label: 'Đang học', value: stats.active, color: '#0284c7', bg: '#eff6ff', icon: <TeamOutlined /> },
    { label: 'Đã xếp lớp', value: stats.withClass, color: '#059669', bg: '#ecfdf5', icon: <BookOutlined /> },
    { label: 'Số khoa', value: stats.depts, color: '#d97706', bg: '#fffbeb', icon: <BookOutlined /> },
  ];

  const xepLoaiColor = (x) => ({ 'Giỏi': '#16a34a', 'Khá': '#8b5cf6', 'Trung bình': '#ea580c', 'Yếu': '#dc2626' }[x] || '#64748b');

  const gradeColumns = [
    { title: 'Môn học', dataIndex: 'subject' },
    { title: 'Học kỳ', dataIndex: 'semester', width: 90 },
    {
      title: 'Điểm', dataIndex: 'score', width: 80,
      render: (s) => <span style={{ fontWeight: 800, color: s >= 5 ? '#16a34a' : '#dc2626' }}>{s}</span>
    },
  ];

  const columns = [
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Mã SV</span>,
      dataIndex: 'studentCode', width: 110,
      render: (t) => <span style={{ fontWeight: 700, color: '#7c3aed' }}>{t}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Họ tên</span>,
      dataIndex: 'fullName',
      render: (t) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{t}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Lớp</span>,
      render: (_, r) => {
        const tenLop = r.tenLop || r.lop?.tenLop;
        return tenLop
          ? <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>{tenLop}</Tag>
          : <Tag style={{ borderRadius: 6 }}>Chưa xếp</Tag>;
      }
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Trạng thái</span>,
      render: (_, r) => (
        <Tag color={r.status === 'active' ? 'green' : 'red'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {r.status === 'active' ? 'Đang học' : 'Nghỉ học'}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Thao tác</span>,
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} style={{ borderRadius: 8 }} onClick={() => handleViewDetail(r)} />
          <Button size="small" type="primary" icon={<EditOutlined />}
            style={{ borderRadius: 8, background: '#8b5cf6', border: 'none' }}
            onClick={() => { setEditingStudent(r); setModalOpen(true); }} />
          <Popconfirm title="Xóa sinh viên này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
          </Popconfirm>
        </Space>
      )
    }
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
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Sinh viên</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Quản lý Sinh viên</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Quản lý danh sách sinh viên và thông tin học tập</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditingStudent(null); setModalOpen(true); }}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', height: 38, borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          Thêm sinh viên
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
            <div style={{ width: 52, height: 52, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: c.color }}>
              {c.icon}
            </div>
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
          <Input placeholder="Tìm mã SV..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchCode} onChange={e => { setSearchCode(e.target.value); setCurrentPage(1); }}
            style={{ width: 160, borderRadius: 8 }} allowClear />
          <Input placeholder="Tìm tên SV..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchName} onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }}
            style={{ width: 200, borderRadius: 8 }} allowClear />
          <Select placeholder="Lọc theo Khoa" value={searchDept}
            onChange={v => { setSearchDept(v); setCurrentPage(1); }}
            allowClear style={{ width: 200 }}>
            {departments.map(d => <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>)}
          </Select>
          {(searchCode || searchName || searchDept) && (
            <Button size="small" icon={<ReloadOutlined />}
              onClick={() => { setSearchCode(''); setSearchName(''); setSearchDept(null); setCurrentPage(1); }}
              style={{ borderRadius: 8, color: '#7c3aed', borderColor: '#ddd6fe' }}>
              Xóa bộ lọc
            </Button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
            {filtered.length} / {students.length} sinh viên
          </div>
        </div>

        <Table rowKey="id" columns={columns} dataSource={filtered} loading={loading}
          components={{ header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} /> } }}
          pagination={{ current: currentPage, pageSize: PAGE_SIZE, total: filtered.length, onChange: setCurrentPage, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} trong ${t} sinh viên`, style: { padding: '12px 20px' } }}
        />
      </div>

      {/* Modal chi tiết */}
      <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={850} centered
        closeIcon={<span style={{ fontSize: 24, color: '#94a3b8' }}>×</span>}>
        {detailStudent && (
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ flex: '0 0 260px' }} className="about-me-sidebar">
              <img src={detailStudent.avatar ? `http://localhost:8080/uploads/${detailStudent.avatar}` : `https://ui-avatars.com/api/?name=${detailStudent.fullName}&background=f5f3ff&color=8b5cf6`}
                alt="avatar" className="about-me-avatar" />
              <h3 className="about-me-title">{detailStudent.fullName}</h3>
              <div className="about-me-info">
                {[
                  ['Mã Sinh Viên', detailStudent.studentCode],
                  ['Khoa', detailStudent.department || '—'],
                  ['Lớp', detailStudent.lop?.tenLop || detailStudent.tenLop || 'Chưa xếp lớp'],
                  ['Trạng Thái', detailStudent.status === 'active' ? 'Đang học' : 'Nghỉ học'],
                ].map(([label, value]) => (
                  <div key={label} className="about-me-info-item">
                    <span className="about-me-info-label">{label}</span>
                    <span className="about-me-info-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Chi tiết sinh viên</h2>
              {gradeLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
              ) : (
                <>
                  {summary && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                      {[
                        { label: 'Học kỳ 1', value: summary.hk1, color: '#8b5cf6', bg: '#f5f3ff' },
                        { label: 'Học kỳ 2', value: summary.hk2, color: '#8b5cf6', bg: '#f5f3ff' },
                        { label: 'Cả năm', value: summary.caNam, color: '#16a34a', bg: '#dcfce7' },
                      ].map(item => (
                        <div key={item.label} style={{ flex: 1, background: item.bg, borderRadius: 16, padding: 16, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value > 0 ? item.value : '—'}</div>
                        </div>
                      ))}
                      <div style={{ flex: 1, background: '#fff7ed', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Xếp loại</div>
                        <Tag color={xepLoaiColor(summary.xepLoai)} style={{ borderRadius: 6, fontWeight: 700 }}>{summary.xepLoai || 'Chưa xét'}</Tag>
                      </div>
                    </div>
                  )}
                  <Table rowKey="id" columns={gradeColumns} dataSource={grades} size="small"
                    pagination={{ pageSize: 4 }} locale={{ emptyText: 'Chưa có dữ liệu điểm' }} />
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <StudentModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
        student={editingStudent} departments={departments} />
    </div>
  );
}