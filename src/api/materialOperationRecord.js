import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/materialOperationRecord',
    method: 'post',
    data
  })
}

export function del(key) {
  return request({
    url: 'api/materialOperationRecord/' + key,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/materialOperationRecord',
    method: 'put',
    data
  })
}
