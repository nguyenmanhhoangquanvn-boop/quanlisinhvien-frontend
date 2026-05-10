import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    if (err.response?.status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này!')
    }
    return Promise.reject(err)
  }
)

export const getStudents = () => api.get('/students')
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)
export const searchStudents = (name) => api.get(`/students/search?name=${name}`)
export default api
// --- CÁC HÀM QUẢN LÝ ĐIỂM SỐ ---
export const getGrades = (studentId) => api.get(`/students/${studentId}/grades`)
export const getGradeSummary = (studentId) => api.get(`/students/${studentId}/grades/summary`)
export const createGrade = (studentId, data) => api.post(`/students/${studentId}/grades`, data)
export const deleteGrade = (studentId, gradeId) => api.delete(`/students/${studentId}/grades/${gradeId}`)
export const uploadAvatar = (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/students/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}