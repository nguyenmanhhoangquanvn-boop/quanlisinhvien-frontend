import { useEffect, useState } from 'react'
import { Modal, Table, Form, InputNumber, Input, Select, Button, Space, Popconfirm, message, Tag, Typography } from 'antd'
import { getGrades, getGradeSummary, createGrade, deleteGrade } from '../api/studentApi'

const { Text } = Typography;

export default function GradeModal({ open, onClose, student }) {
    const [grades, setGrades] = useState([])
    const [summary, setSummary] = useState({ diemTrungBinh: 0, xepLoai: '' })
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const fetchGradesData = async () => {
        if (!student) return;
        setLoading(true)
        try {
            const [gradesRes, summaryRes] = await Promise.all([
                getGrades(student.id),
                getGradeSummary(student.id)
            ])
            setGrades(gradesRes.data)
            setSummary(summaryRes.data)
        } catch (error) {
            message.error('Không thể tải điểm số!')
        }
        setLoading(false)
    }

    useEffect(() => {
        if (open) {
            fetchGradesData()
            form.resetFields()
        }
    }, [open, student])

    const handleAddGrade = async (values) => {
        try {
            await createGrade(student.id, values)
            message.success('Thêm điểm thành công')
            form.resetFields()
            fetchGradesData()
        } catch (error) {
            if (error.response?.status !== 403) {
            message.error('Lỗi khi thêm điểm!')
            }
        }
    }

    const handleDelete = async (gradeId) => {
        try {
            await deleteGrade(student.id, gradeId)
            message.success('Đã xóa điểm')
            fetchGradesData()
        } catch (error) {
            if (error.response?.status === 403) {
                message.error('Bạn không có quyền thực hiện thao tác này!')
            } else {
                message.error('Lỗi khi xóa!')
            }
        }
    }

    const columns = [
        { title: 'Môn học', dataIndex: 'subject' },
        { title: 'Điểm', dataIndex: 'score', render: (score) => <Text strong>{score}</Text> },
        {
            title: 'Thao tác',
            render: (_, record) => (
                <Popconfirm title="Xóa điểm này?" onConfirm={() => handleDelete(record.id)}>
                    <Button size="small" danger>Xóa</Button>
                </Popconfirm>
            )
        }
    ];

    const gradesHK1 = grades.filter(g => g.semester === 'HK1');
    const gradesHK2 = grades.filter(g => g.semester === 'HK2');

    return (
        <Modal
            title={`Bảng điểm của: ${student?.fullName} (${student?.studentCode})`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <div style={{ marginBottom: 16, padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                <Space size="large">
                    <Text strong>TỔNG KẾT CẢ NĂM: <Text type="danger" style={{ fontSize: 20 }}>{summary.caNam?.toFixed(2) || 0}</Text></Text>
                    <Text strong>Xếp Loại: <Tag color={summary.xepLoai === 'Yếu' ? 'red' : 'green'}>{summary.xepLoai}</Tag></Text>
                </Space>
            </div>

            <Form form={form} layout="inline" onFinish={handleAddGrade} style={{ marginBottom: 24 }}>
                <Form.Item name="semester" rules={[{ required: true, message: 'Chọn kỳ!' }]}>
                    <Select placeholder="Chọn học kỳ" style={{ width: 120 }}>
                        <Select.Option value="HK1">Học kỳ 1</Select.Option>
                        <Select.Option value="HK2">Học kỳ 2</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="subject" rules={[{ required: true, message: 'Nhập môn!' }]}>
                    <Input placeholder="Tên môn học" style={{ width: 180 }} />
                </Form.Item>
                <Form.Item name="score" rules={[{ required: true, message: 'Nhập điểm!' }]}>
                    <InputNumber min={0} max={10} step={0.1} placeholder="Điểm" style={{ width: 80 }} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Thêm điểm</Button>
                </Form.Item>
            </Form>

            <div style={{ marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #1890ff' }}>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>Học kỳ 1</Text>
                <Text type="secondary" style={{ marginLeft: 16 }}>Điểm TB HK1: <Text strong>{summary.hk1?.toFixed(2) || 0}</Text></Text>
            </div>
            <Table
                rowKey="id" columns={columns} dataSource={gradesHK1}
                loading={loading} pagination={false} size="small"
                style={{ marginBottom: 24 }}
            />

            <div style={{ marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #52c41a' }}>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>Học kỳ 2</Text>
                <Text type="secondary" style={{ marginLeft: 16 }}>Điểm TB HK2: <Text strong>{summary.hk2?.toFixed(2) || 0}</Text></Text>
            </div>
            <Table
                rowKey="id" columns={columns} dataSource={gradesHK2}
                loading={loading} pagination={false} size="small"
            />
        </Modal>
    )
}