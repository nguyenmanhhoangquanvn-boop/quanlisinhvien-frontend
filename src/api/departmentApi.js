import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/departments`;

// Hàm lấy Token từ Local Storage và dọn dẹp các dấu ngoặc kép thừa
const getAuthHeaders = () => {
    let token = localStorage.getItem('token');
    if (token) {
        token = token.replace(/['"]+/g, ''); // Xóa dấu ngoặc kép nếu có
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// 1. Lấy danh sách Khoa
export const getDepartments = async () => {
    return await axios.get(API_URL, {
        headers: getAuthHeaders() // KẸP TOKEN VÀO ĐÂY
    });
};

// 2. Thêm Khoa mới
export const createDepartment = async (departmentData) => {
    return await axios.post(API_URL, departmentData, {
        headers: getAuthHeaders() // KẸP TOKEN VÀO ĐÂY
    });
};

// 3. Xóa Khoa
export const deleteDepartment = async (id) => {
    return await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders() // KẸP TOKEN VÀO ĐÂY
    });
};