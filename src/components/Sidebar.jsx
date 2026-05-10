import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, GraduationCap, Users, Library, BookOpen, 
  BarChart2, LogOut, ChevronDown, CalendarDays, UserSquare2, FileText, ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const rawUsername = localStorage.getItem('username') || 'Sinh viên';
  const username = rawUsername.split(':')[0].trim();
  const role = localStorage.getItem('role') || '';

  // ✅ Chuẩn hoá: hỗ trợ cả "ADMIN" lẫn "ROLE_ADMIN"
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  const isUser  = role === 'ROLE_USER'  || role === 'USER';

  const handleAddStudent = () => {
    if (location.pathname !== '/students') navigate('/students');
    setTimeout(() => window.dispatchEvent(new CustomEvent('openAddStudentModal')), 100);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <GraduationCap size={22} color="white" />
          </div>
          <div className="logo-text">
            <h2>STUDENT MS</h2>
            <p>University System</p>
          </div>
        </div>
      </div>

      {/* THÔNG TIN NGƯỜI DÙNG */}
      <div className="user-info">
        <div className="avatar">
          <img src={`https://ui-avatars.com/api/?name=${username}&background=7c3aed&color=fff&bold=true`} alt="User" />
        </div>
        <div className="user-details">
          <h4>{username}</h4>
          <span className="role-badge" style={{ 
            background: isAdmin ? '#f5f3ff' : '#dcfce7', 
            color: isAdmin ? '#8b5cf6' : '#16a34a' 
          }}>
            {isAdmin ? 'ADMIN' : 'USER'}
          </span>
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">

        {/* MENU ADMIN */}
        {isAdmin && (
          <>
            <div className="menu-item-wrapper">
              <NavLink to="/" end className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><LayoutDashboard size={17} /><span>Tổng quan</span></div>
              </NavLink>
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/classes" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><Library size={17} /><span>Quản lý Lớp học</span></div>
              </NavLink>
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/schedule" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><CalendarDays size={17} /><span>Quản lý Lịch học</span></div>
              </NavLink>
            </div>

            {/* Quản lý Sinh viên có submenu */}
            <div className="menu-item-wrapper">
              <div
                className={`menu-item ${location.pathname.includes('/students') ? 'active' : ''}`}
                onClick={() => setIsStudentsOpen(!isStudentsOpen)}
              >
                <div className="menu-item-content"><Users size={17} /><span>Quản lý Sinh viên</span></div>
                <ChevronDown size={16} className={`submenu-indicator transition-transform duration-300 ${isStudentsOpen ? 'rotate-180' : ''}`} />
              </div>
              {isStudentsOpen && (
                <div className="submenu">
                  <NavLink to="/students" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                    <span>Tất cả sinh viên</span>
                  </NavLink>
                  <div className="submenu-item" onClick={handleAddStudent}>
                    <span>Thêm sinh viên mới</span>
                  </div>
                  <NavLink to="/grades" className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                    <span>Vào điểm</span>
                  </NavLink>
                </div>
              )}
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/lecturers" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><GraduationCap size={17} /><span>Quản lý Giảng viên</span></div>
              </NavLink>
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/departments" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><BookOpen size={17} /><span>Quản lý Khoa</span></div>
              </NavLink>
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/statistics" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><BarChart2 size={17} /><span>Thống kê</span></div>
              </NavLink>
            </div>

            <div className="menu-item-wrapper">
              <NavLink to="/attendance" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                <div className="menu-item-content"><ClipboardList size={17} /><span>Quản lý Điểm danh</span></div>
              </NavLink>
            </div>
          </>
        )}

        {/* MENU USER */}
        {isUser && (
  <>
    <div className="menu-item-wrapper">
      <NavLink to="/" end className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
        <div className="menu-item-content"><LayoutDashboard size={17} /><span>Tổng quan</span></div>
      </NavLink>
    </div>
    <div className="menu-item-wrapper">
      <NavLink to="/my-profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
        <div className="menu-item-content"><UserSquare2 size={17} /><span>Hồ sơ của tôi</span></div>
      </NavLink>
    </div>
    <div className="menu-item-wrapper">
      <NavLink to="/my-schedule" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
        <div className="menu-item-content"><CalendarDays size={17} /><span>Lịch học cá nhân</span></div>
      </NavLink>
    </div>
    <div className="menu-item-wrapper">
      <NavLink to="/my-grades" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
        <div className="menu-item-content"><FileText size={17} /><span>Bảng điểm</span></div>
      </NavLink>
    </div>
    {/* ← Thêm mới */}
    <div className="menu-item-wrapper">
      <NavLink to="/my-attendance" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
        <div className="menu-item-content"><ClipboardList size={17} /><span>Điểm danh của tôi</span></div>
      </NavLink>
    </div>
  </>
)}
      </nav>

      <div className="sidebar-divider" />

      {/* ĐĂNG XUẤT */}
      
    </aside>
  );
};

export default Sidebar;