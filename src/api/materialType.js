import request from '@/utils/request'

// 新增物料
export function add(data) {
  return request({
    url: 'api/addSmallType',
    method: 'post',
    data
  })
}

// 删除物料
export function del(id) {
  return request({
    url: 'api/deleteMaterialType/' + id,
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
// 根据物料获取列表
export function getMaterialAttribute(id) {
  return request({
    url: 'api/getMaterialAttributes?id=' + id,
    method: 'get'
  })
}
// 新增物料属性
export function addMaterialAttribute(data) {
  return request({
    url: 'api/addMaterialAttribute',
    method: 'post',
    data
  })
}
// 删除物料的属性

export function attributeDelete(data) {
  return request({
    url: 'api/attributeDelete?id=' + data.id + '&attributeId=' + data.attributeId,
    method: 'get'
  })
}
// 获取全部属性
export function attributeAll(data) {
  return request({
    url: 'api/attributeAll',
    method: 'get'
  })
}
// 删除属性
export function deleteAttribute(id) {
  return request({
    url: 'api/deleteAttribute/' + id,
    method: 'delete'
  })
}
// 修改属性
export function updateAttribute(data) {
  return request({
    url: 'api/updateAttribute',
    method: 'put',
    data
  })
}
// 添加属性
export function addAttribute(data) {
  return request({
    url: 'api/addAttribute',
    method: 'post',
    data
  })
}
// 添加分类属性
export function addTypeAttribute(data) {
  return request({
    url: 'api/addTypeAttribute',
    method: 'post',
    data
  })
}

