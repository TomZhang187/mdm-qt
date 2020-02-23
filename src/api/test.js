import request from '@/utils/request'

// 获取所有的Role
export function getTestData(data) {
  return request({
    url: 'test/getTestData',
    method: 'get',
    data
  })
}
