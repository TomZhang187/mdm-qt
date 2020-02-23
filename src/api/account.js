import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/account',
    method: 'post',
    data
  })
}

export function del(accountKey) {
  return request({
    url: 'api/account/' + accountKey,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/account',
    method: 'put',
    data
  })
}
