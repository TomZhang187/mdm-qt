import request from '@/utils/request'

export function getEmployeeByCode(params) {
  return request({
    url: 'api/getEmployeeByCode',
    method: 'get',
    params

  })
}
export function add(data) {
  return request({
    url: 'api/employee',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/employee/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/employee',
    method: 'put',
    data
  })
}
export function getDeptsStr(params) {
  return request({
    url: 'api/getBelongDeptsStr',
    method: 'get',
    params
  })
}
// 查询所有员工，可模糊查询
export function allEmployee(params) {
  return request({
    url: 'api/allEmployee',
    method: 'get',
    params
  })
}
