import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/materialProduction',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/materialProduction/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/materialProduction',
    method: 'put',
    data
  })
}

export function getDefaultFactory() {
  return request({
    url: 'api/getUserDefaultFactory',
    method: 'post'
  })
}

// 物料生产档案审批
export function approval(data) {
  return request({
    url: 'api/materialProductionApproval',
    method: 'post',
    data
  })
}

// 获取当前用户临时修改数据
export function getTemporaryData(data) {
  return request({
    url: 'api/getProductionTemporaryData',
    method: 'post',
    data
  })
}

// 获取审批链接
export function getDingUrl(params) {
  return request({
    url: 'api/getMaterialDingUrl',
    method: 'get',
    params

  })
}
