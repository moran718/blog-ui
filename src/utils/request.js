/**
 * Axios 请求封装
 * 统一处理请求拦截、响应拦截、错误处理
 */
import axios from 'axios'

// API 基础地址
const BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:9999'

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10秒超时
  withCredentials: true // 携带 Cookie
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果返回的 code 不是 200，说明业务出错
    if (res.code !== 200) {
      // 登录过期
      if (res.code === 401) {
        console.warn('登录已过期，请重新登录')
        localStorage.removeItem('user')
        // 可以在这里跳转到登录页
        // window.location.href = '/login'
      }

      // 返回错误信息，让调用者处理
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 成功返回数据
    return res
  },
  error => {
    // 处理 HTTP 错误
    let message = '网络错误，请稍后重试'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未登录或登录已过期'
          localStorage.removeItem('user')
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = `请求失败 (${error.response.status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    }

    console.error('响应错误:', message)
    return Promise.reject(new Error(message))
  }
)

// 封装常用方法
export const http = {
  get(url, params) {
    return request.get(url, { params })
  },

  post(url, data) {
    return request.post(url, data)
  },

  put(url, data) {
    return request.put(url, data)
  },

  delete(url, params) {
    return request.delete(url, { params })
  },

  // 上传文件
  upload(url, file, fieldName = 'file') {
    const formData = new FormData()
    formData.append(fieldName, file)
    return request.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

/**
 * 获取资源完整URL
 * 将相对路径转换为完整的访问URL
 * @param {string} path - 相对路径，如 /uploads/music/audio/xxx.mp3
 * @returns {string} 完整URL
 */
export function getResourceUrl(path) {
  if (!path) return ''
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 拼接BASE_URL和相对路径
  return BASE_URL + path
}

// 导出实例和工具方法
export default request
export { BASE_URL }

