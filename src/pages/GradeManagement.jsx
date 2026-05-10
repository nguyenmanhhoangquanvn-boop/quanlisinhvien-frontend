import { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tag, Input, Select, Row, Col } from 'antd';
import { StarOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getStudents } from '../api/studentApi';
import { getDepartments } from '../api/departmentApi';
import GradeModal from '../components/GradeModal';

export default function GradeManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [studentForGrade, setStudentForGrade] = useState(null);

  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStudents, resDepts] = await Promise.all([getStudents(), getDepartments()]);
      setStudents(resStudents.data);
      setDepartments(resDepts.data);
    } catch {
      message.error('Lỗi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredStudents = students.filter(sv => {
    const codeMatch = sv.studentCode?.toLowerCase().includes(searchCode.toLowerCase());
    const nameMatch = sv.fullName?.toLowerCase().includes(searchName.toLowerCase());
    const deptMatch = searchDept ? sv.department === searchDept : true;
    return codeMatch && nameMatch && deptMatch;
  });

  const handleResetSearch = () => {
    setSearchCode('');
    setSearchName('');
    setSearchDept(null);
  };

  const columns = [
    { title: 'Mã SV', dataIndex: 'studentCode', width: 110 },
    { title: 'Họ tên', dataIndex: 'fullName' },
    {
      title: 'Lớp',
      render: (_, record) => {
        const tenLop = record.tenLop || record.lop?.tenLop;
        return tenLop
          ? <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>{tenLop}</Tag>
          : <Tag>Trống</Tag>;
      }
    },
    {
      title: 'Khoa',
      dataIndex: 'department',
      render: (text) => text
        ? <Tag color="blue" style={{ borderRadius: 6 }}>{text}</Tag>
        : <span style={{ color: '#94a3b8' }}>—</span>,
    },
    {
      title: 'Vào điểm',
      render: (_, record) => (
        <Button
          icon={<StarOutlined />}
          style={{ color: '#faad14', borderColor: '#faad14', borderRadius: 8, fontWeight: 600 }}
          onClick={() => { setStudentForGrade(record); setGradeModalOpen(true); }}
        >
          Vào điểm
        </Button>
      )
    },
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: 16 }}>
        <h2>Vào điểm sinh viên</h2>
      </div>

      {/* KHUNG TÌM KIẾM */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo Mã SV..."
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              size="large"
              style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo Tên SV..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              size="large"
              style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Chọn Khoa để lọc"
              value={searchDept}
              onChange={val => setSearchDept(val)}
              size="large"
              style={{ width: '100%' }}
              allowClear
            >
              {departments.map(d => <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>)}
            </Select>
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            onClick={handleResetSearch}
            icon={<ReloadOutlined />}
            size="large"
            style={{ borderRadius: '10px', color: '#64748b', fontWeight: 600, border: 'none', background: '#f1f5f9' }}
          >
            Làm mới bộ lọc
          </Button>
        </div>
      </div>

      {/* BẢNG */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredStudents}
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} sinh viên` }}
      />

      <GradeModal
        open={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        student={studentForGrade}
        onSuccess={() => { setGradeModalOpen(false); fetchData(); }}
      />
    </div>
  );
}