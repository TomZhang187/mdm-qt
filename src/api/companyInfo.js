import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/companyInfo',
    method: 'post',
    data
  })
}

export function del(companyKey) {
  return request({
    url: 'api/companyInfo/' + companyKey,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/companyInfo',
    method: 'put',
    data
  })
}

export function dingTest(params) {
  return request({
    url: 'api/dingTest',
    method: 'get',
    params
  })
}

export function verifyAdd(params) {
  return request({
    url: 'api/verifyAdd',
    method: 'get',
    params
  })
}

export function findById(params) {
  return request({
    url: 'api/findByID',
    method: 'get',
    params
  })
}

export function findAllCompany() {
  return request({
    url: 'api/companyInfo',
    method: 'get'

  })
}

export function findCompanyBasicByTaxId(params) {
  return request({
    url: 'api/findCompanyBasicByTaxId',
    method: 'get',
    params

  })
}

export function VerifyPermission(params) {
  return request({
    url: 'api/verifyPermission',
    method: 'get',
    params

  })
}

// 客商权限申请接口

export function getPermission(params) {
  return request({
    url: 'api/getCustomerPermission',
    method: 'get',
    params

  })
}
// 通过公司名模糊查询
export function findLikeCompanyName(params) {
  return request({
    url: 'api/findLikeCompanyName',
    method: 'get',
    params

  })
}
// 验证单个客商权限
export function verifyPermissions(params) {
  return request({
    url: 'api/findEmployCompanyByEmployeeKeyAndCompanyKey',
    method: 'get',
    params

  })
}
// 查询当前用户权限客商集合
export function findPermissonCompany() {
  return request({
    url: 'api/findPermissonCompany',
    method: 'get'

  })
}
