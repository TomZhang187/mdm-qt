import { initData } from '@/api/data'
import { get, dictGetLabelByValue, dictGetValueByLabel } from '@/api/dictDetail'
import { findLikeCompanyName } from '@/api/companyInfo'
import { delAll } from '@/api/redis'
import {
  findAllCompany, findPermissonCompany
} from '@/api/companyInfo'
import * as dd from 'dingtalk-jsapi'

let that
export default {

  data() {
    return {
      loading: true, data: [], page: 0, size: 10, total: 0, url: '', params: {}, query: {}, time: 170, isAdd: false,
      // 字典对象相关数据
      dictMaterialType: [],
      dictCompanys: [],
      dictAreas: [],
      dictCompanyProp: [],
      dictCustomerProp: [],
      dictCustomerType: [],
      dictTrades: [],
      parentCompany: [],
      // 上级公司模糊查询字典
      companyDicts: [],
      // 字典转换相关数据
      materialTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      tradeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      areaArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      economicArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      statusArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      belongCompanyArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      companyPropArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      customerPropArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      customerTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      operationTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      }
    }
  },
  created() {
    // 所有字典
    this.getNeedDicts()
  },
  beforeCreate() { // 全局this
    that = this
  },
  // 物料类型过滤器
  filtermaterialType: function(value) {
    const label = that.materialTypeArr.labelByValue[value]
    if (typeof label !== 'string') {
      return ''
    }
    return label
  },
  filters: {
    // 时间过滤器
    filterTime: function(time) {
      if (!time) {
        return ''
      }
      const date = new Date(time)
      const dateNumFun = num => (num < 10 ? `0${num}` : num)
      const [Y, M, D, h, m, s] = [
        // es6 解构赋值
        date.getFullYear(),
        dateNumFun(date.getMonth() + 1),
        dateNumFun(date.getDate()),
        dateNumFun(date.getHours()),
        dateNumFun(date.getMinutes()),
        dateNumFun(date.getSeconds())
      ]
      return `${Y}-${M}-${D} ${h}:${m}:${s}` // 一定要注意是反引号，否则无效。
    },
    // 使用状态过滤器
    filterIsDisable: function(value) {
      if (value === 0) {
        return '停用'
      } else if (value === 1) {
        return '启用'
      }
      return ''
    },
    // 是否散户过滤器
    filterIsRetai: function(value) {
      if (value === 0) {
        return '否'
      } else if (value === 1) {
        return '是'
      }
      return ''
    },
    // 协同付款过滤器
    filterIsSynergyPay: function(value) {
      if (value === 0) {
        return '否'
      } else if (value === 1) {
        return '是'
      }
      return ''
    },
    // 上级公司过滤器
    filterParentCompany: function(value) {
      const arr = that.parentCompany
      let value2 = ''
      arr.some((item) => {
        if (item.companyKey === value) {
          value2 = item.companyName
          return value2
        }
      })

      return value2
    },
    // 所属公司过滤器
    filterbelongCompany: function(value) {
      const label = that.belongCompanyArr.labelByValue[value]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    // 所属地区过滤器
    filterArea: function(value) {
      const label = that.areaArr.labelByValue[value]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    // 公司属性过滤器
    filtercompanyProp: function(value) {
      const label = that.companyPropArr.labelByValue[value]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    // 客商属性过滤器
    filtercustomerProp: function(value) {
      const label = that.customerPropArr.labelByValue[value]
      if (typeof label !== 'string') {
        return label
      }
      return label
    },
    // 客商类型过滤器
    filtercustomerType: function(value) {
      const label = that.customerTypeArr.labelByValue[value]
      if (typeof label !== 'string') {
        return label
      }
      return label
    },
    // 行业过滤器
    filterTrade: function(value) {
      const label = that.tradeArr.labelByValue[value]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    // 经济类型过滤器
    filterEconomicType: function(value) {
      const label = that.economicArr.labelByValue[value]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    // 状态过滤器
    filterApprovalStatus: function(value) {
      const label = that.statusArr.labelByValue[value]

      if (typeof label !== 'string') {
        return ''
      }
      return label
    }

  },
  methods: {
    async init() {
      if (!await this.beforeInit()) {
        return
      }

      return new Promise((resolve, reject) => {
        this.loading = true
        initData(this.url, this.params).then(res => {
          // console.log(res, '返回数据')
          this.total = res.totalElements
          this.data = res.content
          setTimeout(() => {
            this.loading = false
          }, this.time)
          resolve(res)
        }).catch(err => {
          this.loading = false
          reject(err)
        })
      })
    },
    beforeInit() {
      return true
    },
    pageChange(e) {
      this.page = e - 1
      this.init()
    },
    sizeChange(e) {
      this.page = 0
      this.size = e
      this.init()
    },
    // 预防删除第二页最后一条数据时，或者多选删除第二页的数据时，页码错误导致请求无数据
    dleChangePage(size) {
      if (size === undefined) {
        size = 1
      }
      if (this.data.length === size && this.page !== 0) {
        this.page = this.page - 1
      }
    },
    refreshCleatRedis() {
      delAll().then(res => {
        this.init()
      })
    },
    // 在钉钉新窗口打开链接
    openNewDingWidow(url) {
      dd.biz.util.openSlidePanel({
        url: url, // 打开侧边栏的url
        title: '审批详情', // 侧边栏顶部标题
        onSuccess: function(result) {
          /*
               调用biz.navigation.quit接口进入onSuccess, result为调用biz.navigation.quit传入的数值
           */
        },
        onFail: function() {
          /*
              tips:点击右上角上角关闭按钮会进入onFail
           */
        }
      })
    },
    formatTagType(state) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (state === 1) return ''
      else if (state === 2 || state === 5) return 'info'
      else if (state === 3) return 'danger'
      else return 'success'
    },
    formatTime: function(row, column, cellValue, index) {
      const time = row.approveTime
      if (!time) {
        return ''
      }
      const date = new Date(time)
      const dateNumFun = num => (num < 10 ? `0${num}` : num)
      const [Y, M, D, h, m] = [
        // es6 解构赋值
        date.getFullYear(),
        dateNumFun(date.getMonth() + 1),
        dateNumFun(date.getDate()),
        dateNumFun(date.getHours()),
        dateNumFun(date.getMinutes())
      ]
      return `${Y}-${M}-${D} ${h}:${m}` // 一定要注意是反引号，否则无效。
    },

    toQuery() {
      this.page = 0
      this.init()
    },
    // 通过公司名模糊查询
    getCompanyDict(query) {
      if (query !== '') {
        const params = {
          companyName: query
        }
        findLikeCompanyName(params).then(res => {
          this.companyDicts = res
          // console.log(this.companyDicts)
        })
      }
    },
    // 查询当前用户权限客商集合
    findPermissonCompany() {
      findPermissonCompany().then(res => {
        this.companyDicts = res
      })
    },
    async getDictCompanys() {
      get('inside_company').then(res => {
        this.dictCompanys = res.content
      })
    },
    async getDictMaterialType() {
      get('material_type').then(res => {
        this.dictMaterialType = res.content
      })
    },
    async getDictArea() {
      get('area').then(res => {
        this.dictAreas = res.content
      })
    },
    async getDictCompanyProp() {
      get('company_prop').then(res => {
        this.dictCompanyProp = res.content
      })
    },
    async getDictCustomerProp() {
      get('customer_prop').then(res => {
        this.dictCustomerProp = res.content
      })
    },
    async getDictCustomerType() {
      get('customer_type').then(res => {
        this.dictCustomerType = res.content
      })
    },
    async getDictTrade() {
      get('trade').then(res => {
        this.dictTrades = res.content
      })
    },
    // 拿到所有上级公司对象下拉框字典
    async getDictParentCompany() {
      findAllCompany().then(res => {
        this.parentCompany = res.content
        this.parentCompany.push({
          companyKey: null,
          companyName: '其他'
        })
      })
    },
    // 拿到客商操作类型标签与值转换字典
    async getOperationType() {
      const _this = this
      dictGetValueByLabel('company_operation_type').then(function(result) {
        _this.operationTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('company_operation_type').then(function(result) {
        _this.operationTypeArr.labelByValue = result
      })
    },
    // 拿到物料操作类型标签与值转换字典
    async getMaterialOperationType(that) {
      // const _this = this
      dictGetValueByLabel('material_operation_type').then(function(result) {
        that.operationTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('material_operation_type').then(function(result) {
        that.operationTypeArr.labelByValue = result
      })
    },

    // 拿到审批状态字典
    async getApprovalState() {
      // const _this = this
      dictGetValueByLabel('approval_status').then(function(result) {
        that.operationTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('approval_status').then(function(result) {
        that.operationTypeArr.labelByValue = result
      })
    },

    async  getNeedDicts() {
      const _this = this
      // 拿到物料类型字典
      dictGetValueByLabel('material_type').then(function(result) {
        _this.materialTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('material_type').then(function(result) {
        _this.materialTypeArr.labelByValue = result
      })
      // 拿到地区字典
      dictGetValueByLabel('area').then(function(result) {
        _this.areaArr.valueByLabel = result
      })
      dictGetLabelByValue('area').then(function(result) {
        _this.areaArr.labelByValue = result
      })
      // 拿到行业字典
      dictGetValueByLabel('trade').then(function(result) {
        _this.tradeArr.valueByLabel = result
      })
      dictGetLabelByValue('trade').then(function(result) {
        _this.tradeArr.labelByValue = result
      })
      // 拿到经济类型字典
      dictGetValueByLabel('economic_type').then(function(result) {
        _this.economicArr.valueByLabel = result
      })
      dictGetLabelByValue('economic_type').then(function(result) {
        _this.economicArr.labelByValue = result
      })
      // 拿到状态字典
      dictGetValueByLabel('approval_status').then(function(result) {
        _this.statusArr.valueByLabel = result
      })
      dictGetLabelByValue('approval_status').then(function(result) {
        _this.statusArr.labelByValue = result
      })
      // 拿到内部公司字典
      dictGetValueByLabel('inside_company').then(function(result) {
        _this.belongCompanyArr.valueByLabel = result
      })
      dictGetLabelByValue('inside_company').then(function(result) {
        _this.belongCompanyArr.labelByValue = result
      })
      // 拿到公司属性字典
      dictGetValueByLabel('company_prop').then(function(result) {
        _this.companyPropArr.valueByLabel = result
      })
      dictGetLabelByValue('company_prop').then(function(result) {
        _this.companyPropArr.labelByValue = result
      })
      // 拿到客商属性字典
      dictGetValueByLabel('customer_prop').then(function(result) {
        _this.customerPropArr.valueByLabel = result
      })
      dictGetLabelByValue('customer_prop').then(function(result) {
        _this.customerPropArr.labelByValue = result
      })
      // 拿到客商类型字典
      dictGetValueByLabel('customer_type').then(function(result) {
        _this.customerTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('customer_type').then(function(result) {
        _this.customerTypeArr.labelByValue = result
      })
    }

  }
}

// filters: {
//   filterTime: function(time) {
//     if (!time) {
//       return '未知'
//     }
//     const date = new Date(time)
//     const dateNumFun = num => (num < 10 ? `0${num}` : num)
//     const [Y, M, D, h, m] = [
//       // es6 解构赋值
//       date.getFullYear(),
//       dateNumFun(date.getMonth() + 1),
//       dateNumFun(date.getDate()),
//       dateNumFun(date.getHours()),
//       dateNumFun(date.getMinutes())
//     ]
//     return `${Y}-${M}-${D} ${h}:${m}` // 一定要注意是反引号，否则无效。
//   },
//   filterbelongCompany: function(value) {
//     const label = self.belongCompanyArr.labelByValue[value]
//     if (typeof label !== 'string') {
//       return '未知'
//     }
//     return label
//   },
//   filterCompanyProp: function(value) {
//     const label = self.companyPropArr.labelByValue[value]
//     if (typeof label !== 'string') {
//       return '未知'
//     }
//     return label
//   },
//   filterCustomerProp: function(value) {
//     const label = self.customerPropArr.labelByValue[value]
//     if (typeof label !== 'string') {
//       return '未知'
//     }
//     return label
//   },
//   filtereconomicType: function(value) {
//     const label = self.economicArr.labelByValue[value]
//     if (typeof label !== 'string') {
//       return '未知'
//     }
//     return label
//   },
//   filterisDisable: function(value) {
//     if (value === 0) return '停用'
//     else if (value === 1) return '启用'
//     else return '未知'
//   },
//   filterisRetai: function(value) {
//     if (value === 0) return '否'
//     else if (value === 1) return '是'
//     else return '未知'
//   }
// },
