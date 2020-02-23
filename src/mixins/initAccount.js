
import { get, dictGetLabelByValue, dictGetValueByLabel } from '@/api/dictDetail'
import {
  findAllCompany
} from '@/api/companyInfo'
// import {
//   findById
// } from '@/api/companyInfo'
export default {
  data() {
    return {
      // 字典对象相关数据
      dictBlankClass: [],
      dictCurrency: [],
      allCompany: [],
      // 字典转换相关数据
      blankClassArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      currencyArr: {
        valueByLabel: '',
        labelByValue: ''
      }
    }
  },
  created() {
    // 所有字典
    this.getAccountDictObject()
    // 拿到需要的字典对象集合
    this.getAccountDicts()
  },
  methods: {
    formatBelongCompany: function(row, column, cellValue, index) {
      const arr = this.allCompany
      let value = '未知'
      arr.some((item) => {
        if (item.companyKey === row.belongCompany) {
          value = item.companyName
          return value
        }
      })

      return value
    },
    formatBlankClass: function(row, column, cellValue, index) {
      const label = this.blankClassArr.labelByValue[row.blankClass]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatCurrency: function(row, column, cellValue, index) {
      const label = this.currencyArr.labelByValue[row.currency]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatIsDefault: function(row, column, cellValue, index) {
      const value = row.isDefalut
      if (typeof value === 'undefined') {
        return '未知'
      } else if (value === 1) {
        return '是'
      } else {
        return '否'
      }
    },
    formatCompanyKey: function(row, column, cellValue, index) {
      const arr = this.allCompany
      let value = '未知'
      arr.some((item) => {
        if (item.companyKey === row.companyKey) {
          value = item.companyName
          return true
        }
      })

      return value
    },
    // 拿到字典对象集合
    async getAccountDictObject() {
      const _this = this
      get('blank_class').then(res => {
        this.dictBlankClass = res.content
      })

      get('currency').then(res => {
        this.dictCurrency = res.content
      })

      findAllCompany().then(res => {
        _this.allCompany = res.content.filter(tab => tab.companyState === 4)
        _this.allCompany.push({
          companyKey: null,
          companyName: '未分配'
        })
      })
    },
    // 拿到客商标签与值转换字典
    async getAccountDicts() {
      const _this = this
      dictGetValueByLabel('blank_class').then(function(result) {
        _this.blankClassArr.valueByLabel = result
      })
      dictGetLabelByValue('blank_class').then(function(result) {
        _this.blankClassArr.labelByValue = result
      })

      dictGetValueByLabel('currency').then(function(result) {
        _this.currencyArr.valueByLabel = result
      })
      dictGetLabelByValue('currency').then(function(result) {
        _this.currencyArr.labelByValue = result
      })
    }
  }

}

