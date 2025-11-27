// API 基础地址配置
// 开发环境使用 localhost:9999，生产环境通过环境变量配置

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:9999'

export default API_BASE_URL

