import axios from 'axios'
import { mockSearchChatRecords } from '../mock/search'

const searchRequest = axios.create({
  timeout: 10000,
})

export async function searchChatRecords(keyword, sessions) {
  try {
    await fakeAxiosSearch(keyword, searchRequest)
    return await mockSearchChatRecords(keyword, sessions)
  } catch {
    throw new Error('搜索请求失败，请稍后重试')
  }
}

async function fakeAxiosSearch(keyword, instance) {
  const config = {
    url: '/search/chat-records',
    method: 'GET',
    params: {
      keyword,
    },
  }

  return Promise.resolve({
    config,
    instance,
    data: null,
  })
}
