import request from '@/utils/request'

export function companyApprove(params) {
  return request({
    url: 'api/companyApproval',
    method: 'get',
    params

  })
}

export function getDingUrl(params) {
  return request({
    url: 'api/getDingUrl',
    method: 'get',
    params

  })
}

export function contactApproval(params) {
  return request({
    url: 'api/contactApproval',
    method: 'get',
    params

  })
}

export function contactDingUrl(params) {
  return request({
    url: 'api/contactDingUrl',
    method: 'get',
    params

  })
}

export function accountApproval(params) {
  return request({
    url: 'api/accountApproval',
    method: 'get',
    params

  })
}

export function accountDingUrl(params) {
  return request({
    url: 'api/accountDingUrl',
    method: 'get',
    params

  })
}
// 钉钉员工同步接口
export function syncDingUser() {
  return request({
    url: 'api/syncDingUser',
    method: 'put'

  })
}
// 钉钉部门同步接口
export function syncDingDept() {
  return request({
    url: 'api/syncDingDept',
    method: 'put'

  })
}

