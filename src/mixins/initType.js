
import { get } from '@/api/dictDetail'
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
      dictMaterType: [],
      dictOutType: [],
      dictMaterState: [],
      dictPlanningAttribute: [],
      dictCustomize: [],
      dictMaterialGrade: [],
      dictMaterialUnit: [],
      // 字典转换相关数据
      materTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      outTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      materStateArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      planningAttributeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      customizeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      materialGradeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      materialUnitArr: {
        valueByLabel: '',
        labelByValue: ''
      }

    }
  },
  created() {
    // 所有字典
    this.getAccountDictObject()
    // 拿到需要的字典对象集合
    this.getTypeDicts()
  },
  methods: {

    formatMaterType: function(row, column, cellValue, index) {
      const label = this.MaterTypeArr.labelByValue[row.materType]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatOutType: function(row, column, cellValue, index) {
      const label = this.OutTypeArr.labelByValue[row.OutType]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatMaterState: function(row, column, cellValue, index) {
      const label = this.MaterStateArr.labelByValue[row.materState]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatPlanningAttribute: function(row, column, cellValue, index) {
      const label = this.PlanningAttributeArr.labelByValue[row.planningAttribute]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatCustomize: function(row, column, cellValue, index) {
      const label = this.CustomizeArr.labelByValue[row.customize]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formatMaterialGrade: function(row, column, cellValue, index) {
      const label = this.MaterialGradeArr.labelByValue[row.materialGrade]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    formaterialUnit: function(row, column, cellValue, index) {
      const label = this.MaterialUnitArr.labelByValue[row.materialUnit]
      if (typeof label !== 'string') {
        return '未知'
      }
      return label
    },
    // 拿到字典对象集合
    async getAccountDictObject() {
      const _this = this
      get('material_type').then(res => {
        this.dictMaterType = res.content
      })
      get('outsourcign_type').then(res => {
        this.dictOutType = res.content
      })
      get('material_state').then(res => {
        this.dictMaterState = res.content
      })
      get('planning_attribute').then(res => {
        this.dictPlanningAttribute = res.content
      })
      get('customize').then(res => {
        this.dictCustomize = res.content
      })
      get('material_grade').then(res => {
        this.dictMaterialGrade = res.content
      })
      get('material_unit').then(res => {
        this.dictMaterialUnit = res.content
      })
      findAllCompany().then(res => {
        _this.allCompany = res.content.filter(tab => tab.companyState === 4)
        _this.allCompany.push({
          companyKey: null,
          companyName: '未分配'
        })
      })
    }
  }

}

