import axios from 'axios';

// 1. 创建一个 axios 实例，配置基础地址和超时时间
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 2. 请求拦截器（例如：统一添加 Token）
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. 响应拦截器（例如：统一处理错误码）
api.interceptors.response.use(
  (response) => {
    // 统一处理 401、500 等错误
    if (response.data?.code === 401) {
      // 跳转到登录页
      const timer = setTimeout(() => {
        clearTimeout(timer)
        localStorage.removeItem('token')
        location.href = '/login'
      }, 1000)
    }
    return response.data;
  },
  (error) => Promise.reject(error)
);

export default api;