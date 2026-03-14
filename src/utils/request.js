import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL,
  timeout: 60000,
})

request.interceptors.request.use(
  (config) => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY

    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
    }

    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      return Promise.reject(
        new Error(`请求失败：${error.response.status}`)
      )
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }

    return Promise.reject(new Error('网络异常，请稍后重试'))
  }
)

export default request