import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Row, Col } from 'antd';
import { createSchedule } from '../api/scheduleApi';
import api from '../api/studentApi';

export default function ScheduleModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      Promise.all([
        api.get('/classes'),
        api.get('/lecturers')
      ]).then(([resClass, resLec]) => {
        setClasses(resClass.data);
        setLecturers(resLec.data);
      }).catch(() => message.error('Không thể tải dữ liệu!'));
    }
  }, [open]);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      // Lỗi validate form (thiếu trường) — Ant Design tự hiển thị, không cần toast
      return;
    }

    setLoading(true);
    try {
      await createSchedule({
        monHoc: values.monHoc,
        lopId: values.lopId,
        lecturerId: values.lecturerId,
        caDay: values.caDay,
        ngay: values.ngay.format('YYYY-MM-DD'),
        phong: values.phong,
      });
      message.success('Đã xếp lịch thành công!');
      onSuccess();
    } catch (err) {
      // Đọc message lỗi từ backend nếu có
      const errMsg =
        err?.response?.data ||           // Spring trả về string body
        err?.response?.data?.message ||  // hoặc object { message: ... }
        'Xếp lịch thất bại, vui lòng thử lại!';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>📅 Xếp lịch dạy mới</span>}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      width={580}
      okText="Lưu lịch dạy"
      cancelText="Hủy bỏ"
      confirmLoading={loading}
      okButtonProps={{
        style: { background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, fontWeight: 700, height: 40 }
      }}
      cancelButtonProps={{ style: { borderRadius: 8, height: 40 } }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="monHoc"
              label={<span style={{ fontWeight: 600 }}>Môn học</span>}
              rules={[{ required: true, message: 'Nhập tên môn học!' }]}
            >
              <Input placeholder="Tên môn học..." size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="lopId"
              label={<span style={{ fontWeight: 600 }}>Lớp học</span>}
              rules={[{ required: true, message: 'Chọn lớp!' }]}
            >
              <Select placeholder="Chọn lớp..." size="large" showSearch optionFilterProp="children">
                {classes.map(lop => (
                  <Select.Option key={lop.id} value={lop.id}>
                    {lop.tenLop} ({lop.maLop})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="lecturerId"
              label={<span style={{ fontWeight: 600 }}>Giảng viên</span>}
              rules={[{ required: true, message: 'Chọn giảng viên!' }]}
            >
              <Select placeholder="Chọn giảng viên..." size="large" showSearch optionFilterProp="children">
                {lecturers.map(lec => (
                  <Select.Option key={lec.id} value={lec.id}>
                    {lec.fullName}
                    {lec.hocVi ? ` (${lec.hocVi})` : ''}
                    {lec.khoa ? ` — ${lec.khoa.name}` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="caDay"
              label={<span style={{ fontWeight: 600 }}>Ca dạy</span>}
              rules={[{ required: true, message: 'Chọn ca!' }]}
            >
              <Select placeholder="Chọn ca" size="large">
                <Select.Option value="Ca 1 (07:15 - 09:15)">Ca 1 (07:15 - 09:15)</Select.Option>
                <Select.Option value="Ca 2 (09:25 - 11:25)">Ca 2 (09:25 - 11:25)</Select.Option>
                <Select.Option value="Ca 3 (12:00 - 14:00)">Ca 3 (12:00 - 14:00)</Select.Option>
                <Select.Option value="Ca 4 (14:10 - 16:10)">Ca 4 (14:10 - 16:10)</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="ngay"
              label={<span style={{ fontWeight: 600 }}>Ngày dạy</span>}
              rules={[{ required: true, message: 'Chọn ngày!' }]}
            >
              <DatePicker style={{ width: '100%', borderRadius: 10 }} size="large" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="phong"
              label={<span style={{ fontWeight: 600 }}>Phòng học</span>}
              rules={[{ required: true, message: 'Nhập phòng!' }]}
            >
              <Input placeholder="VD: Tòa A - P.302" size="large" style={{ borderRadius: 10 }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}