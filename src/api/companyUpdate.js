import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/companyUpdate',
    method: 'post',
    data
  })
}

export function del(operateKey) {
  return request({
    url: 'api/companyUpdate/' + operateKey,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/companyUpdate',
    method: 'put',
    data
  })
}

export function findByCompanyKey(params) {
  return request({
    url: 'api/findByCompanyKey',
    method: 'get',
    params
  })
}

export function saveByCompanyKey(params) {
  return request({
    url: 'api/saveCompamyUpdate',
    method: 'get',
    params
  })
}

export function findPermissionRecord(params) {
  return request({
    url: 'api/findPermissionRecord',
    method: 'get',
    params
  })
}
