import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Popconfirm, message, Tag, Space, Modal, Select, DatePicker, Progress } from 'antd';
import {
  PlusOutlined, DeleteOutlined, SearchOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  BarChartOutlined, HomeOutlined, RightOutlined,
  CheckOutlined, CloseOutlined, AlertOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAttendanceSessions, createAttendanceSession,
  getAttendanceBySession, bulkUpdateAttendance,
  deleteAttendanceSession, getAttendanceReport
} from '../api/attendanceApi';
import { getSchedules } from '../api/scheduleApi';
import { useNavigate } from 'react-router-dom';

const STATUS = {
  present: { label: 'Có mặt', color: '#059669', bg: '#ecfdf5', icon: <CheckOutlined /> },
  absent:  { label: 'Vắng',   color: '#dc2626', bg: '#fef2f2', icon: <CloseOutlined /> },
  late:    { label: 'Muộn',   color: '#d97706', bg: '#fffbeb', icon: <AlertOutlined /> },
};

export default function AttendanceManagement() {
  const navigate = useNavigate();
  const [sessions, setSessions]     = useState([]);
  const [schedules, setSchedules]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // modals
  const [createOpen, setCreateOpen]     = useState(false);
  const [attendOpen, setAttendOpen]     = useState(false);
  const [reportOpen, setReportOpen]     = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // create form
  const [createForm, setCreateForm] = useState({ scheduleId: null, date: dayjs(), note: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // attendance modal
  const [records, setRecords]     = useState([]);
  const [attendSearch, setAttendSearch] = useState('');
  const [attendLoading, setAttendLoading] = useState(false);
  const [saving, setSaving]       = useState(false);

  // report
  const [report, setReport]       = useState([]);
  const [reportSearch, setReportSearch] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceSessions();
      setSessions(res.data || []);
    } catch { setSessions([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
    getSchedules().then(r => setSchedules(r.data || [])).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!createForm.scheduleId) { setCreateError('Vui lòng chọn lịch học!'); return; }
    setCreateLoading(true); setCreateError('');
    try {
      await createAttendanceSession({
        scheduleId: createForm.scheduleId,
        date: createForm.date.format('YYYY-MM-DD'),
        note: createForm.note,
      });
      message.success('Tạo buổi điểm danh thành công!');
      setCreateOpen(false);
      setCreateForm({ scheduleId: null, date: dayjs(), note: '' });
      fetchSessions();
    } catch (e) {
      const msg = e.response?.data || 'Lỗi tạo buổi điểm danh';
      setCreateError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    setCreateLoading(false);
  };

  const openAttend = async (session) => {
    setActiveSession(session);
    setAttendOpen(true);
    setAttendLoading(true);
    try {
      const res = await getAttendanceBySession(session.id);
      setRecords(res.data || []);
    } catch { setRecords([]); }
    setAttendLoading(false);
  };

  const toggleStatus = (studentId, status) =>
    setRecords(r => r.map(rec => rec.studentId === studentId ? { ...rec, status } : rec));

  const markAll = (status) => setRecords(r => r.map(rec => ({ ...rec, status })));

  const handleSaveAttend = async () => {
    setSaving(true);
    try {
      await bulkUpdateAttendance(activeSession.id, records);
      message.success('Lưu điểm danh thành công!');
      setAttendOpen(false);
      fetchSessions();
    } catch (e) { message.error(e.response?.data || 'Lỗi lưu điểm danh'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttendanceSession(id);
      message.success('Đã xóa buổi điểm danh!');
      setSessions(s => s.filter(x => x.id !== id));
    } catch (e) {
      message.error(e.response?.data || 'Lỗi xóa buổi điểm danh');
    }
  };

  const openReport = async () => {
    setReportOpen(true);
    setReportLoading(true);
    try {
      const res = await getAttendanceReport();
      setReport(res.data || []);
    } catch { setReport([]); }
    setReportLoading(false);
  };

  const filtered = useMemo(() => sessions.filter(s =>
    s.subjectName?.toLowerCase().includes(searchText.toLowerCase()) ||
    s.className?.toLowerCase().includes(searchText.toLowerCase()) ||
    s.date?.includes(searchText)
  ), [sessions, searchText]);

  const stats = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const avg = sessions.length
      ? Math.round(sessions.reduce((a, s) => a + (s.attendanceRate || 0), 0) / sessions.length) : 0;
    return {
      total: sessions.length,
      today: sessions.filter(s => s.date === today).length,
      done: sessions.filter(s => s.completed).length,
      avg,
    };
  }, [sessions]);

  const statCards = [
    { label: 'Tổng buổi học', value: stats.total, color: '#7c3aed', bg: '#f5f3ff', icon: <CalendarOutlined /> },
    { label: 'Hôm nay', value: stats.today, color: '#0284c7', bg: '#eff6ff', icon: <ClockCircleOutlined /> },
    { label: 'Hoàn thành', value: stats.done, color: '#059669', bg: '#ecfdf5', icon: <CheckCircleOutlined /> },
    { label: 'Tỉ lệ TB', value: `${stats.avg}%`, color: '#d97706', bg: '#fffbeb', icon: <BarChartOutlined /> },
  ];

  const filteredAttend = records.filter(r =>
    r.studentName?.toLowerCase().includes(attendSearch.toLowerCase()) ||
    r.studentCode?.toLowerCase().includes(attendSearch.toLowerCase())
  );

  const filteredReport = report.filter(r =>
    r.studentName?.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.studentCode?.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const columns = [
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Môn học</span>,
      render: (_, r) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.subjectName || '—'}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Lớp</span>,
      render: (_, r) => (
        <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>{r.className || '—'}</Tag>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Ngày</span>,
      render: (_, r) => (
        <Space>
          <CalendarOutlined style={{ color: '#0284c7' }} />
          <span style={{ fontWeight: 600 }}>{r.date}</span>
        </Space>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Ca học</span>,
      render: (_, r) => <span style={{ color: '#64748b' }}>{r.shift || '—'}</span>,
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Tỉ lệ có mặt</span>,
      render: (_, r) => (
        <div style={{ width: 140 }}>
          <Progress percent={r.attendanceRate ?? 0} size="small"
            strokeColor={r.attendanceRate >= 80 ? '#22c55e' : r.attendanceRate >= 60 ? '#f59e0b' : '#ef4444'}
            showInfo={false} />
          <small style={{ fontWeight: 700, color: r.attendanceRate >= 80 ? '#059669' : r.attendanceRate >= 60 ? '#d97706' : '#dc2626' }}>
            {r.attendanceRate ?? 0}% ({r.totalStudents || 0} SV)
          </small>
        </div>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Trạng thái</span>,
      render: (_, r) => (
        <Tag color={r.completed ? 'green' : 'orange'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {r.completed ? '✓ Hoàn thành' : '⏳ Chưa xong'}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: '#475569', fontWeight: 700 }}>Thao tác</span>,
      width: 130,
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<CheckCircleOutlined />}
            onClick={() => openAttend(r)}
            style={{ borderRadius: 8, background: '#7c3aed', border: 'none' }}>
            Điểm danh
          </Button>
          <Popconfirm title="Xóa buổi này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reportColumns = [
    { title: 'Mã SV', dataIndex: 'studentCode', render: t => <span style={{ fontWeight: 700, color: '#7c3aed' }}>{t}</span> },
    { title: 'Họ tên', dataIndex: 'studentName', render: t => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: 'Có mặt', dataIndex: 'presentCount', render: t => <span style={{ color: '#059669', fontWeight: 700 }}>{t}</span> },
    { title: 'Vắng', dataIndex: 'absentCount', render: t => <span style={{ color: '#dc2626', fontWeight: 700 }}>{t}</span> },
    { title: 'Muộn', dataIndex: 'lateCount', render: t => <span style={{ color: '#d97706', fontWeight: 700 }}>{t}</span> },
    { title: 'Tổng', dataIndex: 'totalSessions' },
    {
      title: 'Tỉ lệ',
      render: (_, r) => {
        const pct = r.totalSessions > 0 ? Math.round(r.presentCount / r.totalSessions * 100) : 0;
        const color = pct >= 80 ? '#059669' : pct >= 60 ? '#d97706' : '#dc2626';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}>
            <Progress percent={pct} size="small" strokeColor={color} showInfo={false} style={{ flex: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
          </div>
        );
      },
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
        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Quản lý Điểm danh</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Quản lý Điểm danh</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Theo dõi và quản lý điểm danh sinh viên</p>
        </div>
        <Space>
          <Button icon={<BarChartOutlined />} onClick={openReport}
            style={{ borderRadius: 10, fontWeight: 600, height: 38, borderColor: '#ddd6fe', color: '#7c3aed' }}>
            Báo cáo
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', height: 38, borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
            Tạo buổi mới
          </Button>
        </Space>
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
          <Input placeholder="Tìm theo môn học, lớp, ngày..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText} onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ width: 320, borderRadius: 8 }} allowClear />
          {searchText && (
            <Button size="small" onClick={() => { setSearchText(''); setCurrentPage(1); }}
              style={{ borderRadius: 8, color: '#7c3aed', borderColor: '#ddd6fe' }}>Xóa bộ lọc</Button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
            {filtered.length} / {sessions.length} buổi
          </div>
        </div>
        <Table rowKey="id" columns={columns} dataSource={filtered} loading={loading}
          components={{ header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }} /> } }}
          pagination={{ current: currentPage, pageSize: PAGE_SIZE, total: filtered.length, onChange: setCurrentPage, showSizeChanger: false, showTotal: (t, r) => `${r[0]}-${r[1]} trong ${t} buổi`, style: { padding: '12px 20px' } }}
        />
      </div>

      {/* ── Modal tạo buổi ── */}
      <Modal title="📋 Tạo buổi điểm danh mới" open={createOpen}
        onCancel={() => { setCreateOpen(false); setCreateError(''); }}
        onOk={handleCreate} okText="Tạo buổi" cancelText="Hủy"
        confirmLoading={createLoading}
        okButtonProps={{ style: { background: '#7c3aed', borderColor: '#7c3aed' } }} centered>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {createError && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>
              ⚠ {createError}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Lịch học *</div>
            <Select placeholder="Chọn lịch học" style={{ width: '100%' }} size="large"
              value={createForm.scheduleId}
              onChange={v => { setCreateForm(f => ({ ...f, scheduleId: v })); setCreateError(''); }}
              showSearch optionFilterProp="children">
              {schedules.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.monHoc} — {s.caDay} — {s.lop?.tenLop}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Ngày điểm danh *</div>
            <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY"
              value={createForm.date}
              onChange={d => { setCreateForm(f => ({ ...f, date: d })); setCreateError(''); }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Ghi chú</div>
            <Input placeholder="Ghi chú (tuỳ chọn)..." size="large"
              value={createForm.note} onChange={e => setCreateForm(f => ({ ...f, note: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* ── Modal điểm danh ── */}
      <Modal title={activeSession ? `✅ Điểm danh — ${activeSession.subjectName}` : ''}
        open={attendOpen} onCancel={() => setAttendOpen(false)}
        onOk={handleSaveAttend} okText="Lưu điểm danh" cancelText="Hủy"
        confirmLoading={saving}
        okButtonProps={{ style: { background: '#7c3aed', borderColor: '#7c3aed' } }}
        width={680} centered>
        {activeSession && (
          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
              {activeSession.date} · {activeSession.shift} · {activeSession.className}
            </div>
            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Có mặt', count: records.filter(r => r.status === 'present').length, color: '#059669' },
                { label: 'Vắng',   count: records.filter(r => r.status === 'absent').length,  color: '#dc2626' },
                { label: 'Muộn',   count: records.filter(r => r.status === 'late').length,    color: '#d97706' },
                { label: 'Tổng',   count: records.length,                                     color: '#7c3aed' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px 0', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <Input placeholder="Tìm sinh viên..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={attendSearch} onChange={e => setAttendSearch(e.target.value)}
                style={{ flex: 1, borderRadius: 8 }} allowClear />
              <Button size="small" onClick={() => markAll('present')}
                style={{ borderRadius: 8, background: '#ecfdf5', color: '#059669', border: 'none', fontWeight: 600 }}>
                <CheckOutlined /> Có mặt tất cả
              </Button>
              <Button size="small" onClick={() => markAll('absent')}
                style={{ borderRadius: 8, background: '#fef2f2', color: '#dc2626', border: 'none', fontWeight: 600 }}>
                <CloseOutlined /> Vắng tất cả
              </Button>
            </div>
            {/* Student list */}
            <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {attendLoading ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Đang tải...</div>
              ) : filteredAttend.map(rec => (
                <div key={rec.studentId} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, background: STATUS[rec.status]?.bg || '#f8fafc',
                  border: `1px solid ${STATUS[rec.status]?.color || '#e2e8f0'}33`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {rec.studentName?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{rec.studentName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{rec.studentCode}</div>
                  </div>
                  <Space>
                    {Object.entries(STATUS).map(([key, val]) => (
                      <Button key={key} size="small" onClick={() => toggleStatus(rec.studentId, key)}
                        icon={val.icon}
                        style={{
                          borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none',
                          background: rec.status === key ? val.color : '#f1f5f9',
                          color: rec.status === key ? 'white' : '#94a3b8',
                        }}>
                        {val.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal báo cáo ── */}
      <Modal title="📊 Báo cáo điểm danh" open={reportOpen}
        onCancel={() => setReportOpen(false)} footer={null} width={780} centered>
        <div style={{ marginTop: 12 }}>
          <Input placeholder="Tìm sinh viên..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={reportSearch} onChange={e => setReportSearch(e.target.value)}
            style={{ borderRadius: 8, marginBottom: 14 }} allowClear />
          <Table rowKey="studentId" columns={reportColumns} dataSource={filteredReport}
            loading={reportLoading} size="small"
            pagination={{ pageSize: 8, showTotal: t => `${t} sinh viên` }}
            components={{ header: { cell: (props) => <th {...props} style={{ ...props.style, background: '#f1f5f9', color: '#475569', fontWeight: 700 }} /> } }}
          />
        </div>
      </Modal>
    </div>
  );
}