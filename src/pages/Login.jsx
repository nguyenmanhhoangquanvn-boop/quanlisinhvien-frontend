import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';
import ForgotPassword from './ForgotPassword';

/* ─── Keyframe animations injected once ─────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-20px) scale(1.05); }
    66%      { transform: translate(-20px,15px) scale(0.97); }
  }
  @keyframes floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(-25px,30px) scale(1.08); }
    70%      { transform: translate(20px,-15px) scale(0.95); }
  }
  @keyframes floatC {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(15px,25px) scale(1.04); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeSlideRight {
    from { opacity:0; transform:translateX(-32px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes shine {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(124,77,255,0.35); }
    50%      { box-shadow: 0 0 0 12px rgba(124,77,255,0); }
  }
  @keyframes iconGlow {
    0%,100% { filter: drop-shadow(0 0 6px rgba(124,77,255,0.5)); }
    50%      { filter: drop-shadow(0 0 14px rgba(168,85,247,0.8)); }
  }
  @keyframes gridFade {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes statCard {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .sms-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    width: 100%;
    background: #f0f0f8;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  /* ── blobs ── */
  .sms-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .sms-blob-1 {
    width: 700px; height: 700px;
    top: -180px; left: -180px;
    background: radial-gradient(circle, #c4b5fd 0%, #a78bfa 40%, transparent 70%);
    animation: floatA 12s ease-in-out infinite;
    opacity: 0.35;
  }
  .sms-blob-2 {
    width: 500px; height: 500px;
    bottom: -120px; right: 38%;
    background: radial-gradient(circle, #818cf8 0%, #6366f1 40%, transparent 70%);
    animation: floatB 16s ease-in-out infinite;
    opacity: 0.22;
  }
  .sms-blob-3 {
    width: 380px; height: 380px;
    top: 30%; right: -60px;
    background: radial-gradient(circle, #f0abfc 0%, #e879f9 40%, transparent 70%);
    animation: floatC 10s ease-in-out infinite;
    opacity: 0.18;
  }

  /* ── left panel ── */
  .sms-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 64px 56px 64px 72px;
    position: relative;
    z-index: 2;
    animation: fadeSlideRight 0.9s cubic-bezier(0.22,1,0.36,1) both;
  }
  .sms-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 64px;
  }
  .sms-brand-icon {
    background: linear-gradient(135deg, #7c4dff, #a855f7);
    border-radius: 14px;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    animation: iconGlow 3s ease-in-out infinite;
    flex-shrink: 0;
  }
  .sms-brand-name {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #3730a3, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .sms-headline {
    font-family: 'Sora', sans-serif;
    font-size: clamp(32px, 3.5vw, 52px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -1.5px;
    color: #1e1b4b;
    margin: 0 0 20px;
  }
  .sms-headline span {
    background: linear-gradient(135deg, #7c4dff 0%, #a855f7 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sms-subtext {
    font-size: 16px;
    color: #6b7280;
    line-height: 1.65;
    margin: 0 0 52px;
    max-width: 420px;
    font-weight: 400;
  }

  /* stat cards */
  .sms-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    max-width: 480px;
  }
  .sms-stat {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 18px;
    padding: 18px 16px;
    opacity: 0;
  }
  .sms-stat:nth-child(1) { animation: statCard 0.6s 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat:nth-child(2) { animation: statCard 0.6s 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat:nth-child(3) { animation: statCard 0.6s 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .sms-stat-num {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #1e1b4b;
    line-height: 1;
    margin-bottom: 3px;
  }
  .sms-stat-label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  /* ── right panel / card ── */
  .sms-right {
    width: 480px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 40px 40px 20px;
    position: relative;
    z-index: 2;
  }
  .sms-card {
    width: 100%;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 28px;
    padding: 44px 40px 36px;
    box-shadow:
      0 32px 64px rgba(124,77,255,0.12),
      0 8px 24px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.9);
    animation: fadeSlideUp 0.85s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* card header */
  .sms-card-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 36px;
  }
  .sms-logo-wrap {
    position: relative;
    margin-bottom: 18px;
  }
  .sms-logo-bg {
    width: 68px; height: 68px;
    border-radius: 22px;
    background: linear-gradient(135deg, #ede9fe, #f3e8ff);
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(167,139,250,0.3);
    animation: pulse 3s ease-in-out infinite;
  }
  .sms-logo-dot {
    position: absolute;
    width: 14px; height: 14px;
    background: linear-gradient(135deg, #7c4dff, #a855f7);
    border-radius: 50%;
    bottom: -3px; right: -3px;
    border: 2.5px solid #f0f0f8;
  }
  .sms-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #1e1b4b;
    margin: 0 0 6px;
  }
  .sms-card-sub {
    font-size: 13.5px;
    color: #9ca3af;
    margin: 0;
  }

  /* footer */
  .sms-card-footer {
    margin-top: 28px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(196,181,253,0.2);
  }
  .sms-footer-copy {
    font-size: 11.5px;
    color: #c4c4d4;
    margin: 0 0 3px;
  }
  .sms-footer-tech {
    font-size: 11px;
    color: #d4d4e8;
    margin: 0;
  }
  .sms-footer-tech span {
    background: linear-gradient(135deg, #7c4dff, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }

  /* remember / forgot row */
  .sms-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .sms-forgot {
    font-size: 13px;
    font-weight: 600;
    color: #7c4dff;
    text-decoration: none;
    transition: color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .sms-forgot:hover { color: #a855f7; }

  /* login button */
  .sms-btn-login {
    width: 100%;
    height: 50px;
    border-radius: 14px;
    background: linear-gradient(135deg, #7c4dff 0%, #a855f7 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: opacity 0.2s, transform 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .sms-btn-login:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124,77,255,0.3);
  }
  .sms-btn-login:disabled, .sms-btn-login.loading {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  /* decorative grid on left */
  .sms-grid-deco {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,77,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,77,255,0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    z-index: 1;
    animation: gridFade 1.5s 0.3s both;
  }

  /* ── responsive ── */
  @media (max-width: 960px) {
    .sms-left { display: none; }
    .sms-root { justify-content: center; align-items: center; }
    .sms-right {
      width: 100%;
      max-width: 480px;
      padding: 24px;
    }
  }
  @media (max-width: 480px) {
    .sms-card { padding: 32px 24px 28px; border-radius: 22px; }
    .sms-card-title { font-size: 22px; }
    .sms-stats { grid-template-columns: 1fr 1fr; }
  }
`;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById('sms-style');
    if (!el) {
      const tag = document.createElement('style');
      tag.id = 'sms-style';
      tag.textContent = STYLE;
      document.head.appendChild(tag);
    }
  }, []);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', values);
      const token    = res.data.token;
      const username = res.data.username || values.username;
      const role     = res.data.role;

      if (!role) {
        message.error('Lỗi: Server không trả về role. Liên hệ quản trị viên!');
        return;
      }

      const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      localStorage.setItem('token',    token);
      localStorage.setItem('username', username);
      localStorage.setItem('role',     normalizedRole);

      if (normalizedRole === 'ROLE_ADMIN') {
        message.success('Đăng nhập Quản trị viên thành công!');
        navigate('/');
      } else if (normalizedRole === 'ROLE_USER') {
        message.success('Đăng nhập Sinh viên thành công!');
        navigate('/my-profile');
      } else {
        message.warning(`Role không xác định: ${normalizedRole}`);
        navigate('/');
      }
    } catch {
      message.error('Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // ── Hiển thị màn hình Quên Mật Khẩu ──────────────────────────────────────
  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="sms-root">
      {/* ── blobs ── */}
      <div className="sms-blob sms-blob-1" />
      <div className="sms-blob sms-blob-2" />
      <div className="sms-blob sms-blob-3" />

      {/* ── LEFT PANEL ── */}
      <div className="sms-left">
        <div className="sms-grid-deco" />

        {/* brand */}
        <div className="sms-brand">
          <div className="sms-brand-icon">
            <GraduationCap size={22} color="#fff" />
          </div>
          <p className="sms-brand-name">STUDENT MS</p>
        </div>

        {/* headline */}
        <h1 className="sms-headline">
          Quản lý sinh viên<br />
          <span>thông minh &amp; hiện đại</span>
        </h1>
        <p className="sms-subtext">
          Nền tảng quản trị học vụ toàn diện — từ hồ sơ sinh viên, điểm số đến lịch học,
          mọi thứ trong một giao diện duy nhất.
        </p>

        {/* stat cards */}
        <div className="sms-stats">
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background: 'rgba(124,77,255,0.1)' }}>
              <Users size={18} color="#7c4dff" />
            </div>
            <div className="sms-stat-num">12K+</div>
            <div className="sms-stat-label">Sinh viên</div>
          </div>
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background: 'rgba(168,85,247,0.1)' }}>
              <BookOpen size={18} color="#a855f7" />
            </div>
            <div className="sms-stat-num">340+</div>
            <div className="sms-stat-label">Môn học</div>
          </div>
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <BarChart3 size={18} color="#6366f1" />
            </div>
            <div className="sms-stat-num">98%</div>
            <div className="sms-stat-label">Uptime</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL / CARD ── */}
      <div className="sms-right">
        <div className="sms-card">
          {/* header */}
          <div className="sms-card-header">
            <div className="sms-logo-wrap">
              <div className="sms-logo-bg">
                <GraduationCap size={34} color="#7c4dff" />
              </div>
              <div className="sms-logo-dot" />
            </div>
            <h2 className="sms-card-title">STUDENT MS</h2>
            <p className="sms-card-sub">Hệ thống quản lý sinh viên hiện đại</p>
          </div>

          {/* form */}
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
            className="sms-input"
          >
            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#c4b5fd' }} />}
                placeholder="Mã sinh viên hoặc Email"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#c4b5fd' }} />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <div className="sms-meta-row sms-checkbox">
              <Checkbox style={{ fontSize: 13, color: '#6b7280', fontFamily: '"DM Sans", sans-serif' }}>
                Ghi nhớ đăng nhập
              </Checkbox>
              <button
                className="sms-forgot"
                type="button"
                onClick={() => setShowForgot(true)}
              >
                Quên mật khẩu?
              </button>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <button
                type="submit"
                className={`sms-btn-login${loading ? ' loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </Form.Item>
          </Form>

          {/* footer */}
          <div className="sms-card-footer">
            <p className="sms-footer-copy">© 2026 Student MS. All rights reserved.</p>
            <p className="sms-footer-tech">Powered by <span>Spring Boot</span> &amp; <span>React</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}