import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';

const API = "http://localhost:8080/api";

export default function ClassModal({ isOpen, onClose, onSave, classData, departments }) {
  const [form] = Form.useForm();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
      fetch(`${API}/lecturers`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setLecturers(Array.isArray(data) ? data : []))
        .catch(() => setLecturers([]));

      if (classData) {
        form.setFieldsValue({ ...classData, khoaId: classData.khoa?.id });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, classData, form]);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // Ant Design tự hiển thị lỗi validate
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token")?.replace(/['"]+/g, '');
      const url = classData ? `${API}/classes/${classData.id}` : `${API}/classes`;
      const res = await fetch(url, {
        method: classData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(classData ? "Cập nhật lớp thành công!" : "Thêm lớp thành công!");
        onSave();
      } else {
        const errMsg = await res.text();
        message.error(errMsg || "Lỗi khi lưu dữ liệu!");
      }
    } catch {
      message.error("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={classData ? "✏️ Sửa lớp học" : "➕ Thêm lớp học mới"}
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText={classData ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ style: { background: '#7c3aed', borderColor: '#7c3aed' } }}
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <Form.Item name="maLop" label="Mã lớp" rules={[{ required: true, message: 'Nhập mã lớp!' }]}>
            <Input placeholder="VD: CNTT01" />
          </Form.Item>
          <Form.Item name="tenLop" label="Tên lớp" rules={[{ required: true, message: 'Nhập tên lớp!' }]}>
            <Input placeholder="VD: Công nghệ thông tin 01" />
          </Form.Item>
        </div>

        <Form.Item name="khoaId" label="Khoa" rules={[{ required: true, message: 'Chọn khoa!' }]}>
          <Select placeholder="-- Chọn khoa --">
            {departments.map(d => (
              <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <Form.Item name="nienKhoa" label="Niên khóa">
            <Input placeholder="VD: 2022-2026" />
          </Form.Item>
          <Form.Item name="siSo" label="Sĩ số tối đa" initialValue={20}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item name="giaoVienChuNhiem" label="Giáo viên chủ nhiệm">
          <Select placeholder="-- Chọn giáo viên chủ nhiệm --" showSearch allowClear optionFilterProp="children">
            {lecturers.map(lec => (
              <Select.Option key={lec.id} value={lec.fullName}>
                {lec.fullName}
                {lec.hocVi ? ` (${lec.hocVi})` : ''}
                {lec.khoa ? ` — ${lec.khoa.name}` : ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}