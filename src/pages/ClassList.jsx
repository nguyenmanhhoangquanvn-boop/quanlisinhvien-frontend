import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Popconfirm, message, Progress, Select, Input } from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, FilterOutlined, BookOutlined, TeamOutlined,
  ApartmentOutlined, BarChartOutlined, HomeOutlined, RightOutlined
} from "@ant-design/icons";
import ClassModal from "../components/ClassModal";

const API = "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ── Empty State Illustration ──────────────────────────────────────────────────
const EmptyIllustration = () => (
  <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="130" width="180" height="10" rx="5" fill="#e2e8f0"/>
    <rect x="40" y="140" width="10" height="30" rx="3" fill="#cbd5e1"/>
    <rect x="170" y="140" width="10" height="30" rx="3" fill="#cbd5e1"/>
    <rect x="55" y="30" width="110" height="75" rx="8" fill="#7c3aed" opacity="0.12"/>
    <rect x="55" y="30" width="110" height="75" rx="8" stroke="#7c3aed" strokeWidth="2"/>
    <rect x="70" y="50" width="60" height="5" rx="2.5" fill="#7c3aed" opacity="0.35"/>
    <rect x="70" y="63" width="45" height="5" rx="2.5" fill="#7c3aed" opacity="0.25"/>
    <rect x="70" y="76" width="52" height="5" rx="2.5" fill="#7c3aed" opacity="0.2"/>
    <circle cx="148" cy="62" r="16" fill="#7c3aed" opacity="0.1"/>
    <text x="142" y="68" fontSize="18" fontWeight="800" fill="#7c3aed" opacity="0.5">?</text>
    <rect x="90" y="108" width="28" height="9" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
    <rect x="130" y="100" width="30" height="36" rx="4" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
    <rect x="136" y="112" width="18" height="3" rx="1.5" fill="#93c5fd" opacity="0.6"/>
    <rect x="136" y="119" width="12" height="3" rx="1.5" fill="#93c5fd" opacity="0.4"/>
    <circle cx="45" cy="55" r="3" fill="#fbbf24" opacity="0.7"/>
    <circle cx="178" cy="42" r="2" fill="#34d399" opacity="0.7"/>
    <circle cx="185" cy="110" r="2.5" fill="#f472b6" opacity="0.6"/>
    <circle cx="35" cy="100" r="2" fill="#60a5fa" opacity="0.6"/>
  </svg>
);

export default function ClassList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [resCls, resDepts] = await Promise.all([
        fetch(`${API}/classes`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API}/departments`, { headers: getHeaders() }).then(r => r.json())
      ]);
      setClasses(resCls);
      setDepartments(resDepts);
    } catch {
      message.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
  try {
    const res = await fetch(`${API}/classes/${id}`, { method: "DELETE", headers: getHeaders() });
    if (res.ok) {
      message.success("Xóa lớp thành công");
      loadData();
    } else {
      const errMsg = await res.text();
      message.error(errMsg || "Không thể xóa lớp!");
    }
  } catch {
    message.error("Lỗi kết nối server!");
  }
};

  const stats = useMemo(() => {
    const total = classes.length;
    const active = classes.filter(c => (c.soSinhVien || 0) < (c.siSo || 20)).length;
    const uniqueDepts = new Set(classes.map(c => c.tenKhoa).filter(Boolean)).size;
    const avgStudents = total > 0
      ? Math.round(classes.reduce((s, c) => s + (c.soSinhVien || 0), 0) / total)
      : 0;
    return { total, active, uniqueDepts, avgStudents };
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchSearch = !searchText ||
        c.maLop?.toLowerCase().includes(searchText.toLowerCase()) ||
        c.tenLop?.toLowerCase().includes(searchText.toLowerCase());
      const matchDept = !filterDept || c.tenKhoa === filterDept;
      return matchSearch && matchDept;
    });
  }, [classes, searchText, filterDept]);

  const deptOptions = useMemo(() =>
    [...new Set(classes.map(c => c.tenKhoa).filter(Boolean))].map(d => ({ label: d, value: d }))
  , [classes]);

  const statCards = [
    { label: 'Tổng lớp học', value: stats.total, icon: <BookOutlined />, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Lớp còn chỗ', value: stats.active, icon: <TeamOutlined />, color: '#0284c7', bg: '#eff6ff' },
    { label: 'Số khoa', value: stats.uniqueDepts, icon: <ApartmentOutlined />, color: '#059669', bg: '#ecfdf5' },
    { label: 'TB sinh viên/lớp', value: stats.avgStudents, icon: <BarChartOutlined />, color: '#d97706', bg: '#fffbeb' },
  ];

  const colTitle = (icon, text) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 700 }}>
      <span style={{ opacity: 0.7 }}>{icon}</span>{text}
    </span>
  );

  const columns = [
    { title: colTitle(<BookOutlined />, "Mã lớp"), dataIndex: "maLop", key: "maLop", width: 120 },
    { title: colTitle(<EditOutlined />, "Tên lớp"), dataIndex: "tenLop", key: "tenLop" },
    { title: colTitle(<ApartmentOutlined />, "Khoa"), dataIndex: "tenKhoa", key: "tenKhoa" },
    {
      title: colTitle(<TeamOutlined />, "Sĩ số (Thực tế/Tối đa)"),
      key: "siSo",
      width: 220,
      render: (_, record) => {
        const current = record.soSinhVien || 0;
        const max = record.siSo || 20;
        const percent = Math.min((current / max) * 100, 100);
        return (
          <div style={{ width: 170 }}>
            <Progress
              percent={percent}
              size="small"
              status={current >= max ? "exception" : "active"}
              showInfo={false}
              strokeColor={current >= max ? "#ff4d4f" : "#52c41a"}
            />
            <small style={{ color: current >= max ? "red" : "#8c8c8c", fontWeight: 'bold' }}>
              {current}/{max} Sinh viên
            </small>
          </div>
        );
      }
    },
    {
      title: colTitle(<BarChartOutlined />, "Thao tác"),
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { setEditData(record); setModalOpen(true); }} />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: '#94a3b8' }}>
        <HomeOutlined style={{ fontSize: 13 }} />
        <span
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#7c3aed'}
          onMouseLeave={e => e.target.style.color = '#94a3b8'}
        >Tổng quan</span>
        <RightOutlined style={{ fontSize: 10 }} />
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Lớp học</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Quản lý Lớp học
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Quản lý danh sách lớp học và thông tin sĩ số
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditData(null); setModalOpen(true); }}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', height: 38, borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
        >
          Thêm lớp
        </Button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: `0 4px 16px rgba(0,0,0,0.08)`,
            borderLeft: `4px solid ${card.color}`,
            border: `1px solid ${card.color}22`,
            borderLeft: `4px solid ${card.color}`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: card.color, flexShrink: 0,
              boxShadow: `0 4px 12px ${card.color}30`,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm mã lớp, tên lớp..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ width: 220, borderRadius: 8 }}
            allowClear
          />
          <Select
            suffixIcon={<FilterOutlined style={{ color: '#7c3aed' }} />}
            placeholder="Lọc theo Khoa"
            options={deptOptions}
            value={filterDept}
            onChange={v => { setFilterDept(v); setCurrentPage(1); }}
            allowClear
            style={{ width: 200 }}
          />
          {(searchText || filterDept) && (
            <Button
              size="small"
              onClick={() => { setSearchText(""); setFilterDept(null); setCurrentPage(1); }}
              style={{ borderRadius: 8, color: '#7c3aed', borderColor: '#ddd6fe' }}
            >
              Xóa bộ lọc
            </Button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
            {filteredClasses.length} / {classes.length} lớp
          </div>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredClasses}
          columns={columns}
          rowKey="id"
          loading={loading}
          components={{
            header: {
              cell: (props) => (
                <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} />
              )
            }
          }}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: filteredClasses.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} lớp`,
            style: { padding: '12px 20px' },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <EmptyIllustration />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
                  Danh sách lớp học đang trống
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
                  {searchText || filterDept
                    ? 'Không tìm thấy lớp nào phù hợp với bộ lọc hiện tại.'
                    : 'Chưa có lớp học nào được tạo trong hệ thống. Hãy bắt đầu bằng cách tạo lớp đầu tiên!'}
                </div>
                {!searchText && !filterDept && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setEditData(null); setModalOpen(true); }}
                    style={{ marginTop: 8, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
                  >
                    Tạo lớp học đầu tiên
                  </Button>
                )}
              </div>
            )
          }}
        />
      </div>

      <ClassModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        classData={editData}
        onSave={() => { setModalOpen(false); loadData(); }}
        departments={departments}
      />
    </div>
  );
}