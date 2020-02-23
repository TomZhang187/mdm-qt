
import { get, dictGetValueByLabel, dictGetLabelByValue } from '@/api/dictDetail'
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
      contactType: [],
      allCompany: [],
      // 字典转换相关数据
      contactTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      }
    }
  },
  created() {
    // 所有字典
    this.getNeedContactDicts()
    // 拿到需要的字典对象集合
    this.getDictContactObject()
  },
  methods: {
    formatContactType: function(row, column, cellValue, index) {
      const label = this.customerPropArr.labelByValue[row.contactType]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatIsDefaultAddress: function(row, column, cellValue, index) {
      const value = row.isDefaultAddress
      if (typeof value === 'undefined') {
        return '未知'
      } else if (value === 1) {
        return '是'
      } else {
        return '否'
      }
    },
    // 拿到字典对象集合
    async getDictContactObject() {
      const _this = this
      get('customer_prop').then(res => {
        _this.contactType = res.content.filter(tab => tab.value !== '1')
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
    async getNeedContactDicts() {
      const _this = this
      dictGetValueByLabel('customer_prop').then(function(result) {
        // console.log(result)
        _this.contactTypeArr.valueByLabel = result
      })
      dictGetLabelByValue('customer_prop').then(function(result) {
        _this.contactTypeArr.labelByValue = result
      })
    }
  }

}

