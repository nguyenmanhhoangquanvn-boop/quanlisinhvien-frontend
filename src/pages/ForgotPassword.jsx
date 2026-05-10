import React, { useState, useEffect, useRef } from 'react';
import { Input, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined, CodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';

const API = "http://localhost:8080/api/auth";

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
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes pulse-ring {
    0%   { transform:scale(.95); box-shadow:0 0 0 0 rgba(124,77,255,.4); }
    70%  { transform:scale(1);   box-shadow:0 0 0 14px rgba(124,77,255,0); }
    100% { transform:scale(.95); box-shadow:0 0 0 0 rgba(124,77,255,0); }
  }
  @keyframes check-draw { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
  @keyframes stepIn {
    from { opacity:0; transform:translateY(10px); }
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

  .sms-blob { position:absolute; border-radius:50%; pointer-events:none; z-index:0; }
  .sms-blob-1 {
    width:700px; height:700px; top:-180px; left:-180px;
    background:radial-gradient(circle,#c4b5fd 0%,#a78bfa 40%,transparent 70%);
    animation:floatA 12s ease-in-out infinite; opacity:.35;
  }
  .sms-blob-2 {
    width:500px; height:500px; bottom:-120px; right:38%;
    background:radial-gradient(circle,#818cf8 0%,#6366f1 40%,transparent 70%);
    animation:floatB 16s ease-in-out infinite; opacity:.22;
  }
  .sms-blob-3 {
    width:380px; height:380px; top:30%; right:-60px;
    background:radial-gradient(circle,#f0abfc 0%,#e879f9 40%,transparent 70%);
    animation:floatC 10s ease-in-out infinite; opacity:.18;
  }

  .sms-left {
    flex:1; display:flex; flex-direction:column; justify-content:center;
    padding:64px 56px 64px 72px; position:relative; z-index:2;
    animation:fadeSlideRight 0.9s cubic-bezier(0.22,1,0.36,1) both;
  }
  .sms-brand { display:flex; align-items:center; gap:12px; margin-bottom:64px; }
  .sms-brand-icon {
    background:linear-gradient(135deg,#7c4dff,#a855f7); border-radius:14px;
    width:44px; height:44px; display:flex; align-items:center; justify-content:center;
    animation:iconGlow 3s ease-in-out infinite; flex-shrink:0;
  }
  .sms-brand-name {
    font-family:'Sora',sans-serif; font-size:22px; font-weight:800; letter-spacing:-.5px;
    background:linear-gradient(135deg,#3730a3,#7c3aed);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin:0;
  }
  .sms-headline {
    font-family:'Sora',sans-serif; font-size:clamp(32px,3.5vw,52px); font-weight:800;
    line-height:1.12; letter-spacing:-1.5px; color:#1e1b4b; margin:0 0 20px;
  }
  .sms-headline span {
    background:linear-gradient(135deg,#7c4dff 0%,#a855f7 50%,#ec4899 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .sms-subtext { font-size:16px; color:#6b7280; line-height:1.65; margin:0 0 52px; max-width:420px; font-weight:400; }

  .sms-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:480px; }
  .sms-stat {
    background:rgba(255,255,255,0.65); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,0.8); border-radius:18px; padding:18px 16px; opacity:0;
  }
  .sms-stat:nth-child(1) { animation:statCard 0.6s 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat:nth-child(2) { animation:statCard 0.6s 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat:nth-child(3) { animation:statCard 0.6s 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
  .sms-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
  .sms-stat-num { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:#1e1b4b; line-height:1; margin-bottom:3px; }
  .sms-stat-label { font-size:11px; color:#9ca3af; font-weight:500; letter-spacing:.3px; }

  .sms-right {
    width:480px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
    padding:40px 40px 40px 20px; position:relative; z-index:2;
  }
  .sms-card {
    width:100%;
    background:rgba(255,255,255,0.72);
    backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%);
    border:1px solid rgba(255,255,255,0.9); border-radius:28px; padding:44px 40px 36px;
    box-shadow:0 32px 64px rgba(124,77,255,0.12),0 8px 24px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9);
    animation:fadeSlideUp 0.85s 0.15s cubic-bezier(0.22,1,0.36,1) both;
    max-height:calc(100vh - 48px); overflow-y:auto;
  }

  .sms-grid-deco {
    position:absolute; inset:0;
    background-image:linear-gradient(rgba(124,77,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,.05) 1px,transparent 1px);
    background-size:48px 48px; z-index:1; animation:gridFade 1.5s 0.3s both;
  }

  .sms-logo-wrap { position:relative; margin:0 auto 18px; width:fit-content; }
  .sms-logo-bg {
    width:68px; height:68px; border-radius:22px;
    background:linear-gradient(135deg,#ede9fe,#f3e8ff);
    display:flex; align-items:center; justify-content:center;
    border:1px solid rgba(167,139,250,.3);
    animation:pulse 3s ease-in-out infinite;
  }
  .sms-logo-dot {
    position:absolute; width:14px; height:14px;
    background:linear-gradient(135deg,#7c4dff,#a855f7);
    border-radius:50%; bottom:-3px; right:-3px; border:2.5px solid #f0f0f8;
  }

  .fp-stepper {
    display:flex; flex-direction:row; align-items:flex-start;
    justify-content:center; margin-bottom:32px; gap:0;
  }
  .fp-step-item {
    display:flex; flex-direction:column; align-items:center; gap:6px;
  }
  .fp-step-row {
    display:flex; flex-direction:row; align-items:center;
  }
  .fp-step-circle {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700;
    transition:all .3s; flex-shrink:0;
  }
  .fp-step-line {
    width:36px; height:2px; border-radius:2px;
    margin:0 4px; flex-shrink:0; transition:background .4s;
    position:relative; top:-10px;
  }
  .fp-step-label { font-size:11px; font-weight:600; white-space:nowrap; }

  .fp-otp-box {
    width:44px; height:52px; text-align:center; font-size:20px; font-weight:700;
    border-radius:12px; outline:none; transition:all .2s; caret-color:#7c4dff;
    font-family:'Sora',sans-serif;
  }

  .sms-btn-login {
    width:100%; height:50px; border-radius:14px;
    background:linear-gradient(135deg,#7c4dff 0%,#a855f7 100%);
    color:#fff; font-size:15px; font-weight:700; border:none; cursor:pointer;
    letter-spacing:.3px; transition:opacity .2s, transform .15s;
    font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .sms-btn-login:hover:not(:disabled) {
    opacity:.92; transform:translateY(-1px);
    box-shadow:0 4px 12px rgba(124,77,255,.3);
  }
  .sms-btn-login:disabled, .sms-btn-login.loading {
    opacity:.7; cursor:not-allowed; transform:none;
  }

  .fp-back {
    width:100%; background:none; border:none; cursor:pointer;
    color:#9ca3af; font-size:13px; font-weight:600;
    display:flex; align-items:center; justify-content:center; gap:6px;
    padding:16px 0 0; transition:color .2s; font-family:'DM Sans',sans-serif;
  }
  .fp-back:hover { color:#7c4dff !important; }

  .fp-rule { display:flex; align-items:center; gap:8px; font-size:12px; margin-bottom:6px; }
  .fp-rule.ok  { color:#059669; }
  .fp-rule.fail { color:#9ca3af; }

  .sms-card-footer {
    margin-top:28px; text-align:center; padding-top:20px; border-top:1px solid rgba(196,181,253,0.2);
  }
  .sms-footer-copy { font-size:11.5px; color:#c4c4d4; margin:0 0 3px; }
  .sms-footer-tech { font-size:11px; color:#d4d4e8; margin:0; }
  .sms-footer-tech span {
    background:linear-gradient(135deg,#7c4dff,#a855f7);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; font-weight:600;
  }

  .fp-step-content { animation:stepIn .25s cubic-bezier(0.22,1,0.36,1) both; }

  @media (max-width: 960px) {
    .sms-left { display:none; }
    .sms-root { justify-content:center; align-items:center; }
    .sms-right { width:100%; max-width:480px; padding:24px; }
  }
  @media (max-width: 480px) {
    .sms-card { padding:32px 24px 28px; border-radius:22px; }
  }
`;

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthMeta = [
  { label: "", color: "#e5e7eb" },
  { label: "Yếu", color: "#ef4444" },
  { label: "Trung bình", color: "#f59e0b" },
  { label: "Mạnh", color: "#8b5cf6" },
  { label: "Rất mạnh", color: "#10b981" },
];

function OtpDemoBanner({ username }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div style={{ background:"linear-gradient(135deg,#1e1b4b,#2d1b69)", border:"1px solid rgba(167,139,250,.4)", borderRadius:12, padding:"12px 14px", marginBottom:20, position:"relative" }}>
      <button onClick={() => setOpen(false)} style={{ position:"absolute", top:8, right:10, background:"none", border:"none", cursor:"pointer", color:"#a78bfa", fontSize:16, lineHeight:1, padding:0 }}>×</button>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
        <CodeOutlined style={{ color: '#a78bfa' }} />
        <span style={{ color:"#a78bfa", fontWeight:700, fontSize:12 }}>CHẾ ĐỘ DEMO</span>
      </div>
      <div style={{ fontFamily:"monospace", fontSize:11, color:"#c4b5fd", lineHeight:1.8 }}>
        <div style={{ color:"#6ee7b7" }}>✔ OTP đã tạo cho <strong style={{ color:"#fbbf24" }}>{username}</strong></div>
        <div style={{ marginTop:4, padding:"4px 8px", background:"rgba(255,255,255,.07)", borderRadius:6, color:"#fde68a" }}>
          Xem OTP trong console server
        </div>
      </div>
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => (value || "")[i] || "");

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        next[i - 1] = "";
        onChange(next.join(""));
        inputs.current[i - 1]?.focus();
      }
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = [...digits];
      next[i] = e.key;
      onChange(next.join(""));
      if (i < 5) inputs.current[i + 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      inputs.current[i + 1]?.focus();
    }
  };
  const handleChange = () => {};
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
      onChange(next.join(""));
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          className="fp-otp-box"
          type="text" inputMode="numeric" maxLength={1}
          value={d === " " ? "" : d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            border: d && d !== " " ? "2px solid #7c4dff" : "2px solid #e5e7eb",
            background: d && d !== " " ? "linear-gradient(135deg,#f5f3ff,#ede9fe)" : "#fafafa",
            color: "#4c1d95",
          }}
          onFocus={e => { e.target.style.borderColor="#7c4dff"; e.target.style.boxShadow="0 0 0 3px rgba(124,77,255,.18)"; }}
          onBlur={e => { e.target.style.boxShadow="none"; if (!(d && d !== " ")) e.target.style.borderColor="#e5e7eb"; }}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState("forward");
  const [visible, setVisible] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  const strength = calcStrength(newPw);
  const smeta = strengthMeta[strength];

  useEffect(() => {
    const el = document.getElementById("sms-style-fp");
    if (!el) {
      const tag = document.createElement("style");
      tag.id = "sms-style-fp";
      tag.textContent = STYLE;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    setCountdown(60); setCanResend(false);
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); setCanResend(true); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (otp.replace(/\s/g, "").length < 6) { setOtpError(""); setOtpSuccess(false); }
  }, [otp]);

  const goStep = (next) => {
    setAnimDir(next > step ? "forward" : "back");
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 220);
  };

  const validate1 = () => {
    const e = {};
    if (!studentId.trim()) e.studentId = "Vui lòng nhập tài khoản";
    if (!email.trim()) e.email = "Vui lòng nhập email";
    else if (!email.includes("@")) e.email = "Email không hợp lệ";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleStep1 = async () => {
    if (!validate1()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:studentId.trim(), email:email.trim() }) });
      const data = await res.json();
      if (res.ok && data.success) goStep(2);
      else message.error(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } catch { message.error("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (otpValue) => {
    const raw = (otpValue || otp).replace(/\s/g, "");
    if (raw.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:studentId.trim(), otp:raw }) });
      const data = await res.json();
      if (res.ok && data.success) { setOtpSuccess(true); setOtpError(""); }
      else { setOtpSuccess(false); setOtpError(data.message || "Mã OTP không đúng."); }
    } catch { setOtpError("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (val) => {
    setOtp(val); setOtpSuccess(false); setOtpError("");
    if (val.replace(/\s/g, "").length === 6) handleVerifyOtp(val);
  };

  const handleStep2 = async () => {
    const raw = otp.replace(/\s/g, "");
    if (raw.length !== 6) { setOtpError("Vui lòng nhập đủ 6 chữ số."); return; }
    if (!otpSuccess) { await handleVerifyOtp(otp); return; }
    goStep(3);
  };

  const validate3 = () => {
    const e = {};
    if (newPw.length < 8) e.newPw = "Mật khẩu phải có ít nhất 8 ký tự";
    else if (!/[A-Z]/.test(newPw)) e.newPw = "Mật khẩu phải có ít nhất 1 chữ hoa";
    else if (!/[0-9]/.test(newPw)) e.newPw = "Mật khẩu phải có ít nhất 1 chữ số";
    if (newPw !== confirmPw) e.confirmPw = "Mật khẩu xác nhận không khớp";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleStep3 = async () => {
    if (!validate3()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:studentId.trim(), otp:otp.replace(/\s/g,""), newPassword:newPw }) });
      const data = await res.json();
      if (res.ok && data.success) goStep(4);
      else message.error(data.message || "Thất bại. Vui lòng thử lại.");
    } catch { message.error("Không thể kết nối server."); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCountdown(60); setCanResend(false); setOtp(""); setOtpError(""); setOtpSuccess(false);
    try {
      const res = await fetch(`${API}/forgot-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:studentId.trim(), email:email.trim() }) });
      const data = await res.json();
      if (res.ok && data.success) message.success("Đã gửi lại mã OTP!");
      else message.error(data.message || "Gửi lại OTP thất bại.");
    } catch { message.error("Không thể kết nối server."); }
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); setCanResend(true); return 0; } return c - 1; }), 1000);
  };

  const errTxt = { fontSize:12, color:"#ef4444", marginTop:4, marginBottom:10, display:"flex", alignItems:"center", gap:4 };
  const steps = ["Xác minh", "Mã OTP", "Mật khẩu", "Hoàn tất"];

  return (
    <div className="sms-root">
      <div className="sms-blob sms-blob-1" />
      <div className="sms-blob sms-blob-2" />
      <div className="sms-blob sms-blob-3" />

      <div className="sms-left">
        <div className="sms-grid-deco" />
        <div className="sms-brand">
          <div className="sms-brand-icon">
            <GraduationCap size={22} color="#fff" />
          </div>
          <p className="sms-brand-name">STUDENT MS</p>
        </div>
        <h1 className="sms-headline">
          Quản lý sinh viên<br />
          <span>thông minh &amp; hiện đại</span>
        </h1>
        <p className="sms-subtext">
          Nền tảng quản trị học vụ toàn diện — từ hồ sơ sinh viên, điểm số đến lịch học,
          mọi thứ trong một giao diện duy nhất.
        </p>
        <div className="sms-stats">
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background:"rgba(124,77,255,0.1)" }}>
              <Users size={18} color="#7c4dff" />
            </div>
            <div className="sms-stat-num">12K+</div>
            <div className="sms-stat-label">Sinh viên</div>
          </div>
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background:"rgba(168,85,247,0.1)" }}>
              <BookOpen size={18} color="#a855f7" />
            </div>
            <div className="sms-stat-num">340+</div>
            <div className="sms-stat-label">Môn học</div>
          </div>
          <div className="sms-stat">
            <div className="sms-stat-icon" style={{ background:"rgba(99,102,241,0.1)" }}>
              <BarChart3 size={18} color="#6366f1" />
            </div>
            <div className="sms-stat-num">98%</div>
            <div className="sms-stat-label">Uptime</div>
          </div>
        </div>
      </div>

      <div className="sms-right">
        <div className="sms-card">
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div className="sms-logo-wrap">
              <div className="sms-logo-bg">
                <LockOutlined style={{ fontSize: 32, color: '#7c4dff' }} />
              </div>
              <div className="sms-logo-dot" />
            </div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, letterSpacing:"-.8px", color:"#1e1b4b", margin:"0 0 6px" }}>Khôi phục mật khẩu</h2>
            <p style={{ margin:0, fontSize:13.5, color:"#9ca3af", fontWeight:400 }}>Xác minh danh tính để đặt lại mật khẩu</p>
          </div>

          <div className="fp-stepper">
            {steps.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div key={i} className="fp-step-row">
                  <div className="fp-step-item">
                    <div
                      className="fp-step-circle"
                      style={{
                        background: (done || active) ? "linear-gradient(135deg,#7c4dff,#a855f7)" : "#e5e7eb",
                        color: (done || active) ? "#fff" : "#9ca3af",
                        boxShadow: active ? "0 2px 10px rgba(124,77,255,.4)" : "none",
                        animation: active ? "pulse-ring 2s ease-in-out infinite" : "none",
                      }}
                    >
                      {done ? "✓" : idx}
                    </div>
                    <span
                      className="fp-step-label"
                      style={{ color: (active || done) ? "#7c4dff" : "#9ca3af", fontWeight: active ? 700 : 500 }}
                    >{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="fp-step-line"
                      style={{ background: step > idx ? "linear-gradient(90deg,#7c4dff,#a855f7)" : "#e5e7eb" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="fp-step-content"
            key={step}
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : animDir === "forward" ? "translateY(10px)" : "translateY(-10px)", transition:"opacity .22s, transform .22s" }}
          >
            {step === 1 && (
              <div>
                <div style={{ marginBottom: errors.studentId ? 8 : 20 }}>
                  <Input
                    size="large"
                    prefix={<UserOutlined style={{ color: '#c4b5fd' }} />}
                    placeholder="Mã sinh viên hoặc Giảng viên"
                    value={studentId}
                    onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, studentId:"" })); }}
                    status={errors.studentId ? "error" : ""}
                  />
                  {errors.studentId && <div style={errTxt}>⚠ {errors.studentId}</div>}
                </div>

                <div style={{ marginBottom: errors.email ? 8 : 24 }}>
                  <Input
                    size="large"
                    prefix={<MailOutlined style={{ color: '#c4b5fd' }} />}
                    placeholder="Email trường"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email:"" })); }}
                    status={errors.email ? "error" : ""}
                  />
                  {errors.email && <div style={errTxt}>⚠ {errors.email}</div>}
                </div>

                <button className={`sms-btn-login ${loading ? 'loading' : ''}`} onClick={handleStep1} disabled={loading}>
                  {loading && <svg style={{ animation:"spin 1s linear infinite" }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  {loading ? "Đang xử lý..." : "Gửi mã OTP"}
                </button>
                <button className="fp-back" onClick={onBack}>
                  <ArrowLeftOutlined /> Quay lại đăng nhập
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <OtpDemoBanner username={studentId} />

                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <p style={{ margin:"0 0 4px", fontSize:13, color:"#6b7280" }}>Nhập mã OTP đã gửi đến email</p>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#1e1b4b" }}>{email}</p>
                </div>

                <div style={{ marginBottom:16 }}>
                  <OtpInput value={otp} onChange={handleOtpChange} />
                </div>

                {otpError && (
                  <div style={{ textAlign:"center", fontSize:13, color:"#ef4444", marginBottom:10 }}>⚠ {otpError}</div>
                )}
                {otpSuccess && (
                  <div style={{ textAlign:"center", fontSize:13, color:"#059669", marginBottom:10, fontWeight:600 }}>
                    <CheckCircleOutlined /> Xác minh OTP thành công!
                  </div>
                )}

                <div style={{ textAlign:"center", marginBottom:24, fontSize:13, color:"#9ca3af" }}>
                  {canResend
                    ? <button onClick={handleResend} style={{ background:"none", border:"none", cursor:"pointer", color:"#7c4dff", fontWeight:700, fontSize:13, fontFamily:"inherit", padding:0 }}>Gửi lại mã OTP</button>
                    : <span>Gửi lại sau <strong style={{ color:"#7c4dff" }}>{countdown}s</strong></span>
                  }
                </div>

                <button className={`sms-btn-login ${loading ? 'loading' : ''}`} onClick={handleStep2} disabled={loading || !otpSuccess}>
                  {loading && <svg style={{ animation:"spin 1s linear infinite" }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  {loading ? "Đang xác minh..." : "Tiếp tục"}
                </button>
                <button className="fp-back" onClick={() => goStep(1)}>
                  <ArrowLeftOutlined /> Nhập lại thông tin
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ marginBottom: errors.newPw ? 8 : 16 }}>
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: '#c4b5fd' }} />}
                    placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setErrors(p => ({ ...p, newPw:"" })); }}
                    status={errors.newPw ? "error" : ""}
                  />
                  {errors.newPw && <div style={errTxt}>⚠ {errors.newPw}</div>}
                </div>

                {newPw && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:4, borderRadius:4, background: strength >= i ? smeta.color : "#e5e7eb", transition:"background .3s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11.5, color:smeta.color, fontWeight:600 }}>{smeta.label}</span>
                  </div>
                )}

                <div style={{ marginBottom:16, background:"#fafafa", borderRadius:12, padding:"12px 14px", border:"1px solid #f3f4f6" }}>
                  {[
                    { ok: newPw.length >= 8, label:"Ít nhất 8 ký tự" },
                    { ok: /[A-Z]/.test(newPw), label:"Có ít nhất 1 chữ hoa" },
                    { ok: /[0-9]/.test(newPw), label:"Có ít nhất 1 chữ số" },
                  ].map((r, i) => (
                    <div key={i} className={`fp-rule ${r.ok ? "ok" : "fail"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={r.ok ? "#059669" : "#d1d5db"} strokeWidth="2.5" strokeLinecap="round">
                        {r.ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
                      </svg>
                      {r.label}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: errors.confirmPw ? 8 : 24 }}>
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: '#c4b5fd' }} />}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setErrors(p => ({ ...p, confirmPw:"" })); }}
                    status={errors.confirmPw ? "error" : ""}
                  />
                  {errors.confirmPw && <div style={errTxt}>⚠ {errors.confirmPw}</div>}
                  {confirmPw && newPw === confirmPw && !errors.confirmPw && (
                    <div style={{ fontSize:12, color:"#059669", marginTop:6, fontWeight:600 }}><CheckCircleOutlined /> Mật khẩu khớp!</div>
                  )}
                </div>

                <button className={`sms-btn-login ${loading ? 'loading' : ''}`} onClick={handleStep3} disabled={loading}>
                  {loading && <svg style={{ animation:"spin 1s linear infinite" }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                  {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </button>
              </div>
            )}

            {step === 4 && (
              <div style={{ textAlign:"center", padding:"8px 0" }}>
                <div style={{ position:"relative", width:88, height:88, margin:"0 auto 24px", animation:"pulse-ring 2.5s ease-in-out infinite" }}>
                  <div style={{ width:88, height:88, borderRadius:"50%", background:"linear-gradient(135deg,#7c4dff,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(124,77,255,.4)" }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" stroke="#fff" strokeDasharray="60" strokeDashoffset="0" style={{ animation:"check-draw .5s ease-out forwards" }} />
                    </svg>
                  </div>
                </div>

                <h2 style={{ margin:"0 0 10px", fontSize:22, fontWeight:800, color:"#1e1b4b", fontFamily:"'Sora',sans-serif" }}>Thành công!</h2>
                <p style={{ margin:"0 0 24px", fontSize:14.5, color:"#6b7280", lineHeight:1.7 }}>
                  Mật khẩu của bạn đã được cập nhật.<br />Vui lòng đăng nhập lại để tiếp tục.
                </p>

                <button className="sms-btn-login" onClick={onBack}>Đăng nhập ngay</button>
              </div>
            )}
          </div>

          <div className="sms-card-footer">
            <p className="sms-footer-copy">© 2026 Student MS. All rights reserved.</p>
            <p className="sms-footer-tech">Powered by <span>Spring Boot</span> &amp; <span>React</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}