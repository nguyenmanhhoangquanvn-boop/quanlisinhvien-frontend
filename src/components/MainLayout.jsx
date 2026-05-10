import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LogOut, User, KeyRound } from 'lucide-react';
import { Modal, Form, Input, message } from 'antd';
import api from '../api/studentApi';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [form] = Form.useForm();
  const menuRef = useRef(null);

  const username = localStorage.getItem('username')?.split(':')[0].trim() || 'Admin';
  const role = localStorage.getItem('role') || '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const menuItemStyle = (bg, color) => ({
    padding: '11px 16px',
    display: 'flex', alignItems: 'center', gap: 10,
    cursor: 'pointer', color, fontWeight: 600, fontSize: 14,
    background: bg, transition: 'background .15s',
  });

  return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleChangePassword = async (values) => {
    try {
      await api.post('/auth/change-password', {
        username,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      setPwOpen(false);
      form.resetFields();
    } catch (err) {
      const msg = err?.response?.data || 'Đổi mật khẩu thất bại!';
      message.error(typeof msg === 'string' ? msg : 'Lỗi!');
    }
  };

  return (
    <div className="main-layout">
      <Sidebar userRole="admin" />

      <div className="main-content">
        <header className="content-header">
          <h1>Hệ thống Quản lý Sinh viên</h1>

          <div className="header-actions">
            {/* Avatar dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: isAdmin ? '#f5f3ff' : '#dcfce7',
                  border: `2px solid ${isAdmin ? '#8b5cf6' : '#16a34a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <User size={20} color={isAdmin ? '#8b5cf6' : '#16a34a'} />
              </div>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 50,
                  background: 'white', borderRadius: 14,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.13)',
                  border: '1px solid #f1f5f9',
                  minWidth: 200, zIndex: 999, overflow: 'hidden',
                }}>
                  {/* Header info */}
                  <div style={{
                    padding: '14px 16px',
                    background: isAdmin ? '#f5f3ff' : '#dcfce7',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isAdmin ? '#8b5cf6' : '#16a34a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={18} color="white" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{username}</div>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        color: isAdmin ? '#8b5cf6' : '#16a34a',
                        background: isAdmin ? '#ede9fe' : '#bbf7d0',
                        padding: '1px 8px', borderRadius: 99, display: 'inline-block', marginTop: 2,
                      }}>
                        {isAdmin ? 'ADMIN' : 'USER'}
                      </div>
                    </div>
                  </div>

                  {/* Đổi mật khẩu — chỉ USER */}
                  {!isAdmin && (
                    <div
                      onClick={() => { setMenuOpen(false); setPwOpen(true); }}
                      style={menuItemStyle('#f0fdf4', '#16a34a')}
                      onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <KeyRound size={15} /> Đổi mật khẩu
                    </div>
                  )}

                  {/* Đăng xuất */}
                  <div
                    onClick={handleLogout}
                    style={menuItemStyle('white', '#ef4444')}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <LogOut size={15} /> Đăng xuất
                  </div>
                </div>
              )}
            </div>

            {/* Modal đổi mật khẩu */}
            <Modal
              title="🔑 Đổi mật khẩu"
              open={pwOpen}
              onCancel={() => { setPwOpen(false); form.resetFields(); }}
              onOk={() => form.submit()}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ style: { background: '#16a34a', borderColor: '#16a34a' } }}
              centered
            >
              <Form form={form} layout="vertical" onFinish={handleChangePassword} style={{ marginTop: 12 }}>
                <Form.Item name="oldPassword" label="Mật khẩu cũ"
                  rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}>
                  <Input.Password placeholder="Mật khẩu hiện tại" />
                </Form.Item>
                <Form.Item name="newPassword" label="Mật khẩu mới"
                  rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Ít nhất 6 ký tự!' }]}>
                  <Input.Password placeholder="Mật khẩu mới (ít nhất 6 ký tự)" />
                </Form.Item>
                <Form.Item name="confirmPassword" label="Xác nhận mật khẩu"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value)
                          return Promise.resolve();
                        return Promise.reject('Mật khẩu không khớp!');
                      },
                    }),
                  ]}>
                  <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </header>

        <main className="content-body">
          <div key={location.pathname} className="animate-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const menuItemStyle = (bg, color) => ({
  padding: '11px 16px',
  display: 'flex', alignItems: 'center', gap: 10,
  cursor: 'pointer', color, fontWeight: 600, fontSize: 14,
  background: bg, transition: 'background .15s',
});

export default MainLayout;