import api from './studentApi';

export const getSchedules = () => {
  const token = localStorage.getItem('token');
  if (!token) return Promise.resolve({ data: [] });
  return api.get('/schedules');
};

export const createSchedule = (data) => api.post('/schedules', data);

export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);