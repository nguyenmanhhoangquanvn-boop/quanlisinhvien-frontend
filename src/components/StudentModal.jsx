import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { createStudent, updateStudent } from '../api/studentApi';
import api from '../api/studentApi';

// ── Cấu hình domain email trường ─────────────────────────────────────────────
// Phải khớp với STUDENT_EMAIL_DOMAIN trong StudentService.java
const SCHOOL_EMAIL_DOMAIN = '@student.edu.vn';

function buildSchoolEmail(studentCode) {
  if (!studentCode || !studentCode.trim()) return '';
  return studentCode.toLowerCase().trim() + SCHOOL_EMAIL_DOMAIN;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentModal({ open, onClose, onSuccess, student, departments = [] }) {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [selectedLopId, setSelectedLopId] = useState(null);
  const [selectedKhoa, setSelectedKhoa] = useState(null);

  // Email preview khi thêm mới: theo dõi studentCode để hiện email dự kiến
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [emailManuallyEdited, setEmailManuallyEdited] = useState(false);

  const isEditing = !!student;
  const previewEmail = buildSchoolEmail(studentCodeInput);

  const currentDept = departments.find(d => d.name === selectedKhoa);
  const filteredClasses = selectedKhoa
    ? classes.filter(c => String(c.khoaId) === String(currentDept?.id))
    : classes;

  useEffect(() => {
    if (open) {
      api.get('/classes').then(res => setClasses(res.data)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (student) {
        // Chế độ sửa: hiện email hiện tại, cho phép chỉnh
        form.setFieldsValue({
          ...student,
          ngaySinh: student.ngaySinh ? dayjs(student.ngaySinh, 'DD/MM/YYYY') : null,
        });
        setSelectedKhoa(student.department ?? null);
        setSelectedLopId(student.lop?.id || student.lopId || null);
        setStudentCodeInput('');
        setEmailManuallyEdited(false);
      } else {
        // Chế độ thêm mới: reset sạch
        form.resetFields();
        setSelectedKhoa(null);
        setSelectedLopId(null);
        setStudentCodeInput('');
        setEmailManuallyEdited(false);
      }
    }
  }, [open, student, form]);

  // Khi mã SV thay đổi (chế độ thêm mới):
  // nếu admin chưa tự sửa email → tự fill email preview vào field
  const handleStudentCodeChange = (e) => {
    const code = e.target.value;
    setStudentCodeInput(code);
    if (!isEditing && !emailManuallyEdited) {
      form.setFieldValue('email', buildSchoolEmail(code));
    }
  };

  const handleEmailChange = (e) => {
    // Nếu admin xoá sạch email field khi thêm mới → reset về auto-generate
    if (!isEditing && e.target.value === '') {
      setEmailManuallyEdited(false);
      form.setFieldValue('email', buildSchoolEmail(studentCodeInput));
    } else {
      setEmailManuallyEdited(true);
    }
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch { return; }

    try {
      const payload = {
        ...values,
        ngaySinh: values.ngaySinh ? values.ngaySinh.format('DD/MM/YYYY') : null,
        lop: selectedLopId ? { id: selectedLopId } : null,
        // Nếu thêm mới và email rỗng → để trống, backend sẽ tự generate
        email: values.email?.trim() || '',
      };

      if (student) {
        await updateStudent(student.id, payload);
        message.success('Cập nhật thành công!');
      } else {
        await createStudent(payload);
        message.success('Thêm sinh viên thành công!');
      }
      onSuccess();
    } catch (err) {
      const errMsg = err?.response?.data || err?.response?.data?.message || 'Lỗi khi lưu dữ liệu!';
      message.error(typeof errMsg === 'string' ? errMsg : 'Lỗi khi lưu dữ liệu!');
    }
  };

  return (
    <Modal
      title={student ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
      open={open} onOk={handleSubmit} onCancel={onClose} width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

        <Form.Item
          name="studentCode"
          label="Mã sinh viên"
          rules={[{ required: true, message: 'Nhập mã SV' }]}
        >
          <Input
            disabled={isEditing}
            placeholder="VD: SV001"
            onChange={handleStudentCodeChange}
          />
        </Form.Item>

        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item name="ngaySinh" label="Ngày sinh">
          <DatePicker
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            disabledDate={d => d && d > dayjs()}
          />
        </Form.Item>

        {/* ── Email field ── */}
        <Form.Item
          name="email"
          label={
            <span>
              Email&nbsp;
              {!isEditing && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#7C4DFF',
                  background: '#f5f3ff',
                  border: '1px solid #ede9fe',
                  borderRadius: 20,
                  padding: '1px 8px',
                  marginLeft: 4,
                }}>
                  🎓 Tự động cấp email trường
                </span>
              )}
            </span>
          }
          rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
          extra={
            !isEditing && studentCodeInput && (
              <span style={{ fontSize: 12, color: '#6b7280', marginTop: 4, display: 'block' }}>
                {emailManuallyEdited
                  ? <span style={{ color: '#f59e0b' }}>✏️ Đang dùng email tùy chỉnh</span>
                  : <span style={{ color: '#059669' }}>
                      ✅ Email trường tự động: <strong>{previewEmail}</strong>
                    </span>
                }
              </span>
            )
          }
        >
          <Input
            placeholder={
              isEditing
                ? 'Email sinh viên'
                : studentCodeInput
                  ? previewEmail
                  : 'Nhập mã SV để tự sinh email trường'
            }
            onChange={handleEmailChange}
            suffix={
              !isEditing && !emailManuallyEdited && studentCodeInput
                ? <span style={{ fontSize: 11, color: '#7C4DFF', whiteSpace: 'nowrap' }}>Tự động</span>
                : null
            }
          />
        </Form.Item>
        {/* ─────────────── */}

        <Form.Item name="department" label="Khoa" rules={[{ required: true, message: 'Chọn khoa' }]}>
          <Select placeholder="Chọn khoa" onChange={(val) => { setSelectedKhoa(val); setSelectedLopId(null); }}>
            {departments.map(d => <Select.Option key={d.id} value={d.name}>{d.name}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item label="Lớp học (Chọn để xếp lớp - Tự động khóa nếu đầy)">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filteredClasses.length === 0 ? (
              <span style={{ color: '#aaa', fontSize: 13 }}>
                {selectedKhoa ? 'Không có lớp nào' : 'Chọn khoa trước'}
              </span>
            ) : (
              filteredClasses.map(lop => {
                const isSelected = selectedLopId === lop.id;
                const isFull = (lop.soSinhVien || 0) >= (lop.siSo || 20);
                return (
                  <button key={lop.id} type="button"
                    disabled={isFull && !isSelected}
                    onClick={() => setSelectedLopId(isSelected ? null : lop.id)}
                    style={{
                      padding: '6px 15px', borderRadius: 20,
                      border: `2px solid ${isSelected ? '#4F46E5' : '#e5e7eb'}`,
                      background: isSelected ? '#4F46E5' : isFull ? '#f5f5f5' : '#fff',
                      color: isSelected ? '#fff' : isFull ? '#ccc' : '#374151',
                      fontWeight: 600, fontSize: 12,
                      cursor: isFull && !isSelected ? 'not-allowed' : 'pointer',
                    }}>
                    {lop.tenLop} ({lop.soSinhVien || 0}/{lop.siSo || 20})
                  </button>
                );
              })
            )}
          </div>
        </Form.Item>

        <Form.Item name="status" label="Trạng thái" initialValue="active">
          <Select>
            <Select.Option value="active">Đang học</Select.Option>
            <Select.Option value="inactive">Nghỉ học</Select.Option>
          </Select>
        </Form.Item>

      </Form>
    </Modal>
  );
}