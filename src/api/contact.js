import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/contact',
    method: 'post',
    data
  })
}

export function del(contactKey) {
  return request({
    url: 'api/contact/' + contactKey,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/contact',
    method: 'put',
    data
  })
}
