import request from '@/utils/request'

// 新增物料
export function add(data) {
  return request({
    url: 'api/createMaterial',
    method: 'post',
    data
  })
}

// 删除物料
export function del(id) {
  return request({
    url: 'api/deleteMaterial/' + id,
    method: 'delete'
  })
}
// 修改物料信息
export function edit(data) {
  return request({
    url: 'api/updateMaterial',
    method: 'put',
    data
  })
}
// 获取物料分类
export function getClassify(data) {
  return request({
    url: 'api/classify',
    method: 'get',
    data
  })
}

// 通过物料分类获取物料信息
export function getMaterials(data) {
  return request({
    url: 'api/getMaterialBySecondTypeId?id=' + data.id + '&rows=' + data.rows + '&page=' + data.page,
    method: 'get'
  })
}

// 通过物料分类获取物料信息
export function getMaterialAttributes(typeId) {
  return request({
    url: 'api/getMaterialAttributes?id=' + typeId,
    method: 'get'
  })
}
// 根据物料获取列表
export function getMaterialAttribute(id) {
  return request({
    url: 'api/getMaterialAttribute?id=' + id,
    method: 'get'
  })
}

// 获取所有物料
export function allMaterials(data) {
  return request({
    url: 'api/allMaterials',
    method: 'get'
  })
}
// 同步请求是不是父类型
export function isPtype(id) {
  return request({
    url: 'api/isPtype?id=' + id,
    method: 'get'
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
// 临时数据查询
export function findTemporaryData(params) {
  return request({
    url: 'api/findTemporaryData',
    method: 'get',
    params

  })
}

// 物料基本档案审批接口
export function materialApproval(data) {
  return request({
    url: 'api/materialApproval',
    method: 'post',
    data

  })
}

// 物料基本档案获取流水码
export function getWaterCode(params) {
  return request({
    url: 'api/getWaterCode',
    method: 'get',
    params

  })
}
