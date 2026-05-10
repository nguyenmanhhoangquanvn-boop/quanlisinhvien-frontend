import React, { useState, useEffect } from 'react';
import {
  Users, Library, CalendarDays, TrendingUp, BookOpen, Clock,
  UserSquare2, CheckSquare, XSquare, AlertCircle, Star, BarChart2
} from 'lucide-react';
import { getStudents } from '../api/studentApi';
import { getDepartments } from '../api/departmentApi';
import { getSchedules } from '../api/scheduleApi';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API = 'http://localhost:8080/api/student';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#f43f5e'];

const rankColor = (score) => {
  if (!score) return '#94a3b8';
  if (score >= 9)   return '#7c3aed';
  if (score >= 8)   return '#3b82f6';
  if (score >= 6.5) return '#f59e0b';
  if (score >= 5)   return '#10b981';
  return '#f43f5e';
};

// ─── ADMIN DASHBOARD (giữ nguyên code cũ) ────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalDepartments: 0, totalSchedules: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  const SLIDE_IMAGES = [
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-1.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-2.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-3.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-5.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-6.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-10.jpg',
    'https://navigates.vn/wp-content/uploads/2023/05/co-so-vat-chat-dai-hoc-thang-long-14.jpg',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStudents, resDepts] = await Promise.all([getStudents(), getDepartments()]);
        const students = resStudents.data || [];
        const departments = resDepts.data || [];
        setStats(prev => ({ ...prev, totalStudents: students.length, totalDepartments: departments.length }));
        setRecentStudents([...students].reverse().slice(0, 5));
        const uniqueDepts = departments.filter((dept, idx, self) =>
          idx === self.findIndex(d => d.name === dept.name)
        );
        const deptDist = uniqueDepts.map(dept => ({
          name: dept.name.length > 12 ? dept.name.slice(0, 12) + '…' : dept.name,
          fullName: dept.name,
          count: students.filter(sv => sv.department === dept.name).length
        })).sort((a, b) => b.count - a.count);
        setDeptStats(deptDist.slice(0, 3));
        setChartData(deptDist.slice(0, 5));
      } catch (e) { console.error(e); }
      try {
        const resSched = await getSchedules();
        const schedules = resSched.data || [];
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
        setStats(prev => ({ ...prev, totalSchedules: schedules.length }));
        setTodaySchedules(schedules.filter(s => s.ngay === todayStr).slice(0, 3));
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex(prev => (prev + 1) % 7), 3000);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { label: 'Tổng Sinh viên',  value: stats.totalStudents,   icon: <Users size={22} color="white"/>,       gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    { label: 'Tổng Khoa',       value: stats.totalDepartments, icon: <Library size={22} color="white"/>,     gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
    { label: 'Lịch học',        value: stats.totalSchedules,   icon: <CalendarDays size={22} color="white"/>,gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)' },
    { label: 'Hôm nay',         value: `${todaySchedules.length} ca`, icon: <TrendingUp size={22} color="white"/>, gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  ];

  const caColors = {
    'Ca 1 (07:15 - 09:15)': { bg: '#f5f3ff', color: '#7c3aed' },
    'Ca 2 (09:25 - 11:25)': { bg: '#eff6ff', color: '#3b82f6' },
    'Ca 3 (12:00 - 14:00)': { bg: '#fffbeb', color: '#d97706' },
    'Ca 4 (14:10 - 16:10)': { bg: '#ecfdf5', color: '#059669' },
  };

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Xin chào, Quản trị viên 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {statCards.map((card, i) => (
          <div className="stat-card" key={i} style={{ background: card.gradient }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3>{card.label}</h3>
              <div className="stat-value"><span className="value">{card.value}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          {SLIDE_IMAGES.map((src, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: slideIndex === i ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }} />
          ))}
          <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 10, zIndex: 1 }}>
            <div style={{ background: 'rgba(80,40,180,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(167,139,250,0.6)', borderRadius: 99, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>Hệ thống hoạt động</span>
            </div>
            <div style={{ background: 'rgba(80,40,180,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(167,139,250,0.6)', borderRadius: 99, padding: '6px 14px', fontSize: 12, color: '#fff', fontWeight: 700 }}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'center', zIndex: 1 }}>
            {SLIDE_IMAGES.map((_, i) => (
              <div key={i} onClick={() => setSlideIndex(i)} style={{ width: slideIndex === i ? 20 : 6, height: 6, borderRadius: 99, background: slideIndex === i ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s ease', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h2>🏫 Phân bổ Khoa</h2></div>
            <div className="departments-list">
              {deptStats.length > 0 ? deptStats.map((dept, i) => (
                <div className="department-item" key={dept.fullName}>
                  <div className="dept-info">
                    <div className="dept-rank">{i + 1}</div>
                    <div style={{ flex: 1 }}><h4>{dept.fullName}</h4><p>{dept.count} Sinh viên</p></div>
                    <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 16, color: '#7c3aed' }}>{dept.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${stats.totalStudents > 0 ? Math.round(dept.count / stats.totalStudents * 100) : 0}%` }} />
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>Chưa có dữ liệu</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>📅 Lịch hôm nay</h2></div>
            {todaySchedules.length > 0 ? todaySchedules.map(s => {
              const style = caColors[s.caDay] || { bg: '#f5f3ff', color: '#7c3aed' };
              return (
                <div key={s.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} color={style.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{s.monHoc}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.caDay} · {s.lop?.tenLop}</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>☀️</div>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>Không có lịch hôm nay</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h2>📊 Sinh viên theo Khoa</h2></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 13 }} formatter={(val, name, props) => [val + ' sinh viên', props.payload.fullName]} />
                <Bar dataKey="count" radius={[8,8,0,0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><h2>🍩 Tỉ lệ Khoa</h2></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 13 }} formatter={(val, name, props) => [val + ' SV', props.payload.fullName]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chartData.map((dept, i) => (
                  <div key={dept.fullName} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{dept.fullName}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{dept.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
const UserDashboard = () => {
  const [stats, setStats]       = useState(null);
  const [grades, setGrades]     = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const h = authHeader();
    Promise.all([
      axios.get(`${API}/dashboard/stats`, { headers: h }),
      axios.get(`${API}/grades`,          { headers: h }),
      axios.get(`${API}/schedules`,       { headers: h }),
    ])
      .then(([s, g, sc]) => {
        setStats(s.data);
        setGrades(g.data || []);
        setSchedules(sc.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <p>Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard">
      <div className="card" style={{ textAlign: 'center', color: '#ef4444', padding: 32 }}>
        <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
        <p>Lỗi tải dữ liệu: {error}</p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Kiểm tra kết nối backend tại {API}</p>
      </div>
    </div>
  );

  // Attendance chart data (chỉ lấy 6 tháng gần nhất có data)
  const attendanceChartData = Object.entries(stats?.attendanceByMonth || {})
    .map(([k, v]) => ({ name: MONTH_LABELS[parseInt(k) - 1], value: v }))
    .filter(d => d.value > 0);

  // Grade chart data
  const gradeChartData = grades.map(g => ({
    name: g.subject?.length > 10 ? g.subject.slice(0, 10) + '…' : g.subject,
    fullName: g.subject,
    score: g.score,
  }));

  // Today's schedule
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
  const todaySchedules = schedules.filter(s => s.ngay === todayStr);

  const caColors = {
    'Ca 1 (07:15 - 09:15)': { bg: '#f5f3ff', color: '#7c3aed' },
    'Ca 2 (09:25 - 11:25)': { bg: '#eff6ff', color: '#3b82f6' },
    'Ca 3 (12:00 - 14:00)': { bg: '#fffbeb', color: '#d97706' },
    'Ca 4 (14:10 - 16:10)': { bg: '#ecfdf5', color: '#059669' },
  };

  const statCards = [
    {
      label: 'Số môn học',
      value: stats?.totalSubjects ?? 0,
      icon: <BookOpen size={22} color="white"/>,
      gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    },
    {
      label: 'Tỉ lệ điểm danh',
      value: `${stats?.attendanceRate ?? 0}%`,
      icon: <CheckSquare size={22} color="white"/>,
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
    },
    {
      label: 'Điểm trung bình',
      value: stats?.averageGrade?.toFixed(1) ?? '—',
      icon: <Star size={22} color="white"/>,
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    },
    {
      label: 'Lịch hôm nay',
      value: `${todaySchedules.length} ca`,
      icon: <CalendarDays size={22} color="white"/>,
      gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    },
  ];

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Xin chào, {stats?.studentName} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          MSSV: <strong>{stats?.studentCode}</strong>
          {stats?.className && <> · Lớp: <strong>{stats.className}</strong></>}
          {' · '}{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {statCards.map((card, i) => (
          <div className="stat-card" key={i} style={{ background: card.gradient }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3>{card.label}</h3>
              <div className="stat-value"><span className="value">{card.value}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Attendance Chart */}
        <div className="card">
          <div className="card-header"><h2>📊 Tỉ lệ điểm danh theo tháng</h2></div>
          {attendanceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 13 }}
                  formatter={v => [v + '%', 'Có mặt']}
                />
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {attendanceChartData.map((d, i) => (
                    <Cell key={i} fill={d.value >= 80 ? '#7c3aed' : d.value >= 60 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <BarChart2 size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Chưa có dữ liệu điểm danh</p>
            </div>
          )}

          {/* Attendance summary pills */}
          {stats && (
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Có mặt',  value: stats.presentCount,  color: '#059669', bg: '#ecfdf5', icon: <CheckSquare size={14}/> },
                { label: 'Vắng',    value: stats.absentCount,   color: '#ef4444', bg: '#fef2f2', icon: <XSquare size={14}/> },
                { label: 'Trễ',     value: stats.lateCount,     color: '#d97706', bg: '#fffbeb', icon: <AlertCircle size={14}/> },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: item.bg, color: item.color, borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  {item.icon} {item.label}: {item.value ?? 0}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today schedule + Attendance donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Attendance donut */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><h2>🎯 Điểm danh tổng quan</h2></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="55%" height={140}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Có mặt', value: stats?.presentCount || 0 },
                      { name: 'Vắng',   value: stats?.absentCount  || 0 },
                      { name: 'Trễ',    value: stats?.lateCount    || 0 },
                    ]}
                    cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                    paddingAngle={3} dataKey="value"
                  >
                    <Cell fill="#7c3aed" />
                    <Cell fill="#f43f5e" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'Plus Jakarta Sans' }}>
                  {stats?.attendanceRate ?? 0}%
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>tỉ lệ có mặt</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {stats?.totalAttendance ?? 0} buổi tổng cộng
                </div>
              </div>
            </div>
          </div>

          {/* Today schedule */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><h2>📅 Lịch hôm nay</h2></div>
            {todaySchedules.length > 0 ? todaySchedules.slice(0, 3).map(s => {
              const st = caColors[s.caDay] || { bg: '#f5f3ff', color: '#7c3aed' };
              return (
                <div key={s.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={15} color={st.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{s.monHoc}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
  {s.caDay} · {s.lecturer?.fullName || ''} · P.{s.phong}
</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>☀️</div>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>Không có lịch hôm nay</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grade Chart */}
      {gradeChartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          {/* Bar chart điểm */}
          <div className="card">
            <div className="card-header"><h2>📝 Điểm số các môn</h2></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 13 }}
                  formatter={(val, name, props) => [val + ' điểm', props.payload.fullName]}
                />
                <Bar dataKey="score" radius={[8,8,0,0]}>
                  {gradeChartData.map((d, i) => (
                    <Cell key={i} fill={rankColor(d.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade list */}
          <div className="card">
            <div className="card-header"><h2>🏆 Bảng điểm</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {grades.slice(0, 6).map((g, i) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < grades.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: rankColor(g.score) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={14} color={rankColor(g.score)} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.subject}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{g.semester || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: rankColor(g.score), fontFamily: 'Plus Jakarta Sans' }}>{g.score}</div>
                    <div style={{ fontSize: 10, color: rankColor(g.score), fontWeight: 600 }}>{g.rank}</div>
                  </div>
                </div>
              ))}
              {grades.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>Chưa có điểm</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── EXPORT: tự động chọn Admin hay User ─────────────────────────────────────
const Dashboard = () => {
  const role = localStorage.getItem('role') || '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;