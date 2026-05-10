import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Lấy tất cả buổi điểm danh
export const getAttendanceSessions = () =>
  axios.get(`${API_URL}/attendance/sessions`, getAuthHeader());

// Tạo buổi điểm danh mới
export const createAttendanceSession = (data) =>
  axios.post(`${API_URL}/attendance/sessions`, data, getAuthHeader());

// Lấy danh sách điểm danh theo buổi
export const getAttendanceBySession = (sessionId) =>
  axios.get(`${API_URL}/attendance/sessions/${sessionId}/records`, getAuthHeader());

// Cập nhật trạng thái điểm danh (tick/untick)
export const updateAttendance = (sessionId, studentId, status) =>
  axios.put(`${API_URL}/attendance/sessions/${sessionId}/records/${studentId}`, { status }, getAuthHeader());

// Điểm danh hàng loạt
export const bulkUpdateAttendance = (sessionId, records) =>
  axios.put(`${API_URL}/attendance/sessions/${sessionId}/bulk`, { records }, getAuthHeader());

// Lấy báo cáo điểm danh theo sinh viên
export const getAttendanceReport = (params) =>
  axios.get(`${API_URL}/attendance/report`, { ...getAuthHeader(), params });

// Xóa buổi điểm danh
export const deleteAttendanceSession = (sessionId) =>
  axios.delete(`${API_URL}/attendance/sessions/${sessionId}`, getAuthHeader());