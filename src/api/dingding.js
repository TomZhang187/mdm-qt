import request from '@/utils/request'

export function getDDConfig(url) {
  return request({
    url: 'auth/dingAuth?url=' + url,
    method: 'get'
  })
}

export function getSpaceId() {
  return request({
    url: 'api/getApprovalSpaceId',
    method: 'get'
  })
}

export function getSpacePermission(params) {
  return request({
    url: 'api/getSpacePermission?type=',
    method: 'get',
    params
  })
}
