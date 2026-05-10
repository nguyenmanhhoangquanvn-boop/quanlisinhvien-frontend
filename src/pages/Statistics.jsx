import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Button } from 'antd'
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getStudents } from '../api/studentApi'
import { ArrowLeftOutlined, TeamOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const COLORS = ['#2E75B6', '#1D9E75', '#FF6B6B', '#FFA500', '#9B59B6', '#3498DB']

export default function Statistics() {
  const [students, setStudents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getStudents().then(res => setStudents(res.data))
  }, [])

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'active').length
  const inactiveStudents = students.filter(s => s.status === 'inactive').length

  const departmentData = students.reduce((acc, s) => {
    const found = acc.find(item => item.name === s.department)
    if (found) found.value++
    else acc.push({ name: s.department || 'Chưa có', value: 1 })
    return acc
  }, [])

  const statusData = [
    { name: 'Đang học', value: activeStudents },
    { name: 'Nghỉ học', value: inactiveStudents }
  ]

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/students')}>
          Quay lại
        </Button>
        <h2 style={{ margin: 0 }}>Thống kê sinh viên</h2>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Tổng sinh viên" value={totalStudents} prefix={<TeamOutlined />} styles={{ content: { color: '#2E75B6' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Đang học" value={activeStudents} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#1D9E75' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Nghỉ học" value={inactiveStudents} prefix={<CloseCircleOutlined />} styles={{ content: { color: '#FF6B6B' } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Sinh viên theo khoa">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                  {departmentData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Trạng thái sinh viên">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Số lượng" fill="#2E75B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}