import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, BookOpen, GraduationCap, Edit, Lock, Calendar } from 'lucide-react'; // ← thêm Calendar
import { Spin, message, Button, Modal, Form, Input } from 'antd';
import axios from 'axios';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [updateForm] = Form.useForm();
  const [passForm] = Form.useForm();

  const rawUsername = localStorage.getItem('username') || '';
  const username = rawUsername.split(':')[0].trim();
  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/students/profile/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch {
      setUser({
        fullName: username || 'Sinh viên',
        studentCode: username || 'SV001',
        department: 'Chưa cập nhật',
        email: 'Chưa cập nhật',
        phone: 'Chưa cập nhật',
        diaChi: 'Chưa cập nhật',
        ngaySinh: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChangePassword = async (values) => {
    try {
      await axios.post(`http://localhost:8080/api/auth/change-password`, {
        username, oldPassword: values.oldPassword, newPassword: values.newPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      message.success('Mật khẩu đã được thay đổi thành công!');
      passForm.resetFields();
      setIsPassModalOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data || 'Mật khẩu cũ không chính xác!';
      message.error(typeof errorMsg === 'string' ? errorMsg : 'Mật khẩu cũ không chính xác!');
    }
  };

  const handleUpdateContact = async (values) => {
    try {
      await axios.put(`http://localhost:8080/api/students/profile/${username}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã cập nhật thông tin liên hệ!');
      setUser({ ...user, ...values });
      setIsUpdateModalOpen(false);
    } catch {
      message.error('Không thể cập nhật thông tin!');
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div className="dashboard">
      <div className="card-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hồ sơ của tôi</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<Lock size={16} />} onClick={() => setIsPassModalOpen(true)} style={{ borderRadius: 8, fontWeight: 600 }}>
            Đổi mật khẩu
          </Button>
          <Button type="primary" icon={<Edit size={16} />} onClick={() => {
            updateForm.setFieldsValue({
              email: user.email !== 'Chưa cập nhật' ? user.email : '',
              soDienThoai: user.phone || user.soDienThoai || '',
              diaChi: user.diaChi !== 'Chưa cập nhật' ? user.diaChi : '',
            });
            setIsUpdateModalOpen(true);
          }} style={{ background: '#8b5cf6', borderRadius: 8 }}>
            Cập nhật liên hệ
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Sidebar */}
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <img
            src={`https://ui-avatars.com/api/?name=${user.fullName}&background=f5f3ff&color=8b5cf6&size=150&bold=true`}
            style={{ width: 120, height: 120, borderRadius: 30, marginBottom: 20, border: '4px solid #f5f3ff' }}
            alt="Avatar"
          />
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{user.fullName}</h3>
          <span className="role-badge" style={{ background: '#dcfce7', color: '#166534' }}>SINH VIÊN</span>
          <div style={{ marginTop: 32, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <GraduationCap size={18} /><span>MSSV: {user.studentCode}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <BookOpen size={18} /><span>Khoa: {user.department || 'Chưa cập nhật'}</span>
            </div>
            {/* ← Thêm ngày sinh vào sidebar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
              <Calendar size={18} /><span>Ngày sinh: {user.ngaySinh || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Thông tin liên lạc */}
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            Thông tin liên lạc
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Email</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b', fontWeight: 600 }}>
                <Mail size={16} color="#8b5cf6" /> {user.email || 'Chưa cập nhật'}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Số điện thoại</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b', fontWeight: 600 }}>
                <Phone size={16} color="#8b5cf6" /> {user.phone || user.soDienThoai || 'Chưa cập nhật'}
              </div>
            </div>
            {/* ← Thêm ngày sinh vào card thông tin */}
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Ngày sinh</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b', fontWeight: 600 }}>
                <Calendar size={16} color="#8b5cf6" /> {user.ngaySinh || 'Chưa cập nhật'}
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Địa chỉ</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b', fontWeight: 600 }}>
                <MapPin size={16} color="#8b5cf6" /> {user.diaChi || 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      <Modal title="Thiết lập mật khẩu mới" open={isPassModalOpen} onCancel={() => setIsPassModalOpen(false)} footer={null} centered width={400}>
        <Form form={passForm} layout="vertical" onFinish={handleChangePassword} style={{ marginTop: 20 }}>
          <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['newPassword']}
            rules={[{ required: true, message: 'Xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject('Mật khẩu không khớp!');
                },
              })]}>
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsPassModalOpen(false)} style={{ marginRight: 12 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#8b5cf6' }}>Đổi mật khẩu</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal cập nhật liên hệ */}
      <Modal title="Cập nhật thông tin liên hệ" open={isUpdateModalOpen} onCancel={() => setIsUpdateModalOpen(false)} footer={null} centered>
        <Form form={updateForm} layout="vertical" onFinish={handleUpdateContact} style={{ marginTop: 20 }}>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Sai định dạng email!' }]}>
            <Input prefix={<Mail size={16} color="#94a3b8" />} />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại">
            <Input prefix={<Phone size={16} color="#94a3b8" />} />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ">
            <Input prefix={<MapPin size={16} color="#94a3b8" />} />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsUpdateModalOpen(false)} style={{ marginRight: 12 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#8b5cf6' }}>Lưu thông tin</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}