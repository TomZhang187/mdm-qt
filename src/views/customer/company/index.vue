
<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-show="inputShow"
        v-model="query.value"
        :placeholder="prompt"
        clearable
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="toQuery" />
      <el-select
        v-show="selectShow"
        v-model="query.value"
        :placeholder="prompt"
        filterable
        clearable
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="toQuery">
        <el-option
          v-for="item in queryDetail"
          :key="item.value"
          :label="item.label"
          :value="item.value" />
      </el-select>
      <el-select
        v-model="query.type"
        filterable
        clearable
        placeholder="类型"
        class="filter-item"
        style="width: 130px"
        @change="handleChange">
        <el-option-group
          v-for="group in queryTypeOptions"
          :key="group.label"
          :label="group.label">
          <el-option
            v-for="item in group.options"
            :key="item.key"
            :label="item.display_name"
            :value="item.key" />
        </el-option-group>
      </el-select>
      <el-button
        class="filter-item"
        size="mini"
        type="success"
        icon="el-icon-search"
        @click="toQuery">搜索</el-button>
      <el-button
        v-if="checkPermission(['ADMIN','DEPT_ALL','DEPT_EDIT','DEPT_DELETE'])"
        class="filter-item"
        size="mini"
        type="success"
        icon="el-icon-search"
        @click="Test">查看用户</el-button>
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add">新增</el-button>
        <el-button
          class="filter-item"
          size="mini"
          type="info"
          icon="el-icon-refresh"
          @click="init">刷新</el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm
      ref="form"
      :is-add="isAdd" />
    <el-table
      v-loading="loading"
      :data="data"
      size="small"
      style="width: 100%; "
      @cell-dblclick="details">
      <el-table-column v-if="false" label="客商主键" prop="companyKey"/>
      <el-table-column :show-overflow-tooltip="true" label="客商名称" prop="companyName"/>
      <el-table-column :show-overflow-tooltip="true" label="客商简称" prop="companyShortName"/>
      <el-table-column :show-overflow-tooltip="true" label="客商编号" prop="taxId"/>
      <el-table-column :formatter="formatArea" label="所属地区" prop="belongArea"/>
      <el-table-column label="客商属性" >
        <template slot-scope="scope">
          <span>{{ scope.row.customerProp | filtercustomerProp }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" label="所属公司" >
        <template slot-scope="scope">
          <span>{{ scope.row.belongCompany | filterbelongCompany }}</span>
        </template>
      </el-table-column>

      <el-table-column :formatter="formatTrade" label="所属行业" prop="trade"/>
      <el-table-column :formatter="formatEconomicType" label="经济类型" prop="economicType"/>
      <el-table-column label="法人" prop="legalbody"/>
      <el-table-column label="注册资金(万)" prop="registerfund"/>
      <el-table-column label="客商状态" >
        <template slot-scope="scope">
          <el-tag
            :type="formatTagType(scope.row.companyState)"
            disable-transitions
            @click="toDingUrl(scope.row)">{{ scope.row.companyState | filterApprovalStatus }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="181px"
        align="center"
      >
        <template slot-scope="scope" class="button-box">
          <el-button
            size="mini"
            type="success"
            style="float:left"
            @click="details(scope.row)">
            详情</el-button>
          <el-button
            v-if="computedEdit(scope.row)"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="beforeEdit(scope.row)" />
          <el-popover
            v-if="computedEdit(scope.row)"
            :ref="scope.row.companyKey"
            placement="top">
            <p>{{ scope.row | filterDeletePrompt }}</p>
            <div style="text-align: right; margin: 0">
              <el-button
                size="mini"
                type="text"
                @click="$refs[scope.row.companyKey].doClose()">取消</el-button>
              <el-button
                :loading="delLoading"
                type="primary"
                size="mini"
                @click="deleteOrAble(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              :icon="computeDelteIcon(scope.row)"
              type="danger"
              size="mini" />
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <el-pagination
      :total="total"
      :current-page="page + 1"
      style="margin-top: 8px;"
      layout="total, prev, pager, next, sizes"
      @size-change="sizeChange"
      @current-change="pageChange"
    />
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import {
  del
} from '@/api/companyInfo'
import {
  companyApprove, getDingUrl
} from '@/api/dingTalk'
import {
  get
} from '@/api/dictDetail'
import { findByCompanyKey } from '@/api/companyUpdate'
import eForm from './form'

var self // 全局变量
export default {
  components: {
    eForm
  },
  filters: {
    // 删除提示内容过滤器
    filterDeletePrompt: function(value) {
      if (value.isDisable === 0) {
        return '确认申请启用?'
      } else {
        if (value.companyState === 4) {
          return '确认申请申请停用?'
        } else {
          return '确认删除？'
        }
      }
    }

  },
  mixins: [initData],
  data() {
    return {
      prompt: '请勾选类型',
      inputShow: true,
      selectShow: false,
      delLoading: false,
      updateShow: {
        isDisableShow: false
      },
      queryDetail: [],
      queryTypeOptions: [{
        label: '精准查询',
        options: [{
          key: 'belongArea',
          display_name: '所属地区',
          queryType: '精确',
          queryField: 'area'
        },
        {
          key: 'belongCompany',
          display_name: '所属公司',
          queryType: '精确',
          queryField: 'inside_company'
        },
        {
          key: 'companyProp',
          display_name: '公司属性',
          queryType: '精确',
          queryField: 'company_prop'
        },
        {
          key: 'companyState',
          display_name: '客商状态',
          queryType: '精确',
          queryField: 'company_status'
        },
        {
          key: 'customerProp',
          display_name: '客商属性',
          queryType: '精确',
          queryField: 'customer_prop'
        },
        {
          key: 'economicType',
          display_name: '经济类型',
          queryType: '精确',
          queryField: 'economic_type'
        },
        {
          key: 'isDisable',
          display_name: '使用状态',
          queryType: '精确',
          queryField: 'isDisable'
        },
        {
          key: 'isRetai',
          display_name: '是否散户',
          queryType: '精确',
          queryField: 'isRetai'
        },
        {
          key: 'trade',
          display_name: '所属行业',
          queryType: '精确',
          queryField: 'trade'
        }
        ]
      },
      {
        label: '模糊查询',
        options: [{
          key: 'companyShortName',
          display_name: '客商简称',
          queryType: '模糊'
        },
        {
          key: 'companyName',
          display_name: '客商名称',
          queryType: '模糊'
        },
        {
          key: 'contactAddress',
          display_name: '通讯地址',
          queryType: '模糊'
        },
        {
          key: 'foreignName',
          display_name: '外文名称',
          queryType: '模糊'
        },
        {
          key: 'legalbody',
          display_name: '法人',
          queryType: '模糊'
        },
        {
          key: 'parentCompanyId',
          display_name: '总公司编码',
          queryType: '模糊'
        },
        {
          key: 'postalCode',
          display_name: '邮政编码',
          queryType: '模糊'
        },
        {
          key: 'remark',
          display_name: '备注',
          queryType: '模糊'
        },
        {
          key: 'taxId',
          display_name: '税务登记号',
          queryType: '模糊'
        }
        ]
      }
      ],
      activeNames: ['1'],
      restaurants: [],
      state1: '',
      state2: ''
    }
  },
  created() {
    self = this
    // 等待dom生成以后再来获取dom对象
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    checkPermission,
    computedEdit(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.companyState === 2 || row.companyState === 5) {
        return false
      } else {
        return true
      }
    },
    computeDelteIcon(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.isDisable === 1 && row.companyState === 4) {
        return 'el-icon-lock'
      } else if (row.isDisable === 0 && row.companyState === 4) {
        return 'el-icon-unlock'
      } else {
        return 'el-icon-delete'
      }
    },

    formatSex: function(row, column, cellValue, index) { },
    formatArea: function(row, column, cellValue, index) {
      const label = this.areaArr.labelByValue[row.belongArea]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    formatTrade: function(row, column, cellValue, index) {
      const label = this.tradeArr.labelByValue[row.trade]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    formatEconomicType: function(row, column, cellValue, index) {
      const label = this.economicArr.labelByValue[row.economicType]
      if (typeof label !== 'string') {
        return ''
      }
      return label
    },
    formatTagType(state) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (state === 1) return ''
      else if (state === 2 || state === 5) return 'info'
      else if (state === 3) return 'danger'
      else return 'success'
    },
    beforeInit() {
      this.url = 'api/companyInfo'
      const sort = 'companyKey,desc'
      const user = this.$store.state.user.dingUser
      // alert('用户id' + user.userid + '部门id' + user.department[0])
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort,
        id: user.userid + ''
      }

      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) {
        this.params[type] = value
      }

      return true
    },
    subDelete(data) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (data.companyState === 2 || data.companyState === 5) {
        this.details(data)
      } else {
        const companyKey = data.companyKey
        this.delLoading = true
        del(companyKey)
          .then(res => {
            this.delLoading = false
            this.$refs[companyKey].doClose()
            this.dleChangePage()
            this.init()
            this.$notify({
              title: '删除成功',
              type: 'success',
              duration: 2500
            })
          })
          .catch(err => {
            this.delLoading = false
            this.$refs[companyKey].doClose()
            console.log(err.response.data.message)
          })
      }
    },
    isAbleApproval(row) {
      const user = this.$store.state.user.dingUser
      const companyKey = row.companyKey
      const params = {
        companyKey: companyKey,
        operationType: 'isAble',
        name: user.name,
        userid: user.userid,
        depteId: user.department[0]
      }
      companyApprove(params).then(res => {
        this.delLoading = false
        this.$refs[companyKey].doClose()
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '提交成功',
          type: 'success',
          duration: 2500
        })
      })
        .catch(err => {
          this.delLoading = false
          this.$refs[companyKey].doClose()
          console.log(err.response.data.message)
        })
    },
    deleteOrAble(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.companyState === 4) {
        this.isAbleApproval(row)
      } else {
        this.subDelete(row)
      }
    },
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
      this.$refs.form.showPermissButton = false
    },
    beforeEdit(data) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (data.companyState === 2 || data.companyState === 5) {
        this.details(data)
      } else {
        const _this = this
        const user = this.$store.state.user.dingUser
        const param = {
          userId: user.userid,
          name: user.name,
          companyKey: data.companyKey,
          state: data.companyState
        }
        findByCompanyKey(param).then(function(result) {
          if (result !== null && result !== '') {
            _this.$message({
              message: '有修改数据未审批',
              type: 'warning',
              customClass: 'zZindex'

            })
            result.isRetai = result.isRetai !== '0' ? 1 : 0
            result.isSynergyPay = result.isSynergyPay !== '0' ? 1 : 0
            // console.log('_this.edit(result)')
            _this.edit(result)
          } else {
            // console.log(' _this.edit(data)')
            _this.edit(data)
          }
        })
      }
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.formAdd = {
        companyKey: data.companyKey,
        updateMan: data.updateMan,
        updateTime: data.updateTime,
        createMan: data.createMan,
        createTime: data.createTime,
        approveTime: data.approveTime,
        belongArea: data.belongArea + '',
        belongCompany: data.belongCompany + '',
        companyProp: data.companyProp,
        companyShortName: data.companyShortName != null ? data.companyShortName + '' : '',
        companyState: data.companyState + '',
        customerProp: data.customerProp,
        customerType: data.customerType,
        companyName: data.companyName,
        contactAddress: data.contactAddress,
        economicType: data.economicType,
        foreignName: data.foreignName != null ? data.foreignName + '' : '',
        isDisable: data.isDisable,
        isRetai: data.isRetai,
        isSynergyPay: data.isSynergyPay,
        legalbody: data.legalbody,
        parentCompanyId: data.parentCompanyId,
        postalCode: data.postalCode,
        registerfund: data.registerfund,
        remark: data.remark != null ? data.remark + '' : '',
        taxId: data.taxId + '',
        trade: data.trade
      }
      if (typeof data.contacts !== 'undefined') {
        _this.tableContact = data.contacts
        _this.tableContactSize = data.contacts.length
        _this.tableAccount = data.accounts
        _this.tableAccountSize = data.accounts.length
      } else {
        _this.showBadge = false
      }
      this.$refs.form.doUpdate()
    },
    details(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.formAdd = {
        companyKey: data.companyKey,
        updateMan: data.updateMan,
        updateTime: data.updateTime,
        createMan: data.createMan,
        createTime: data.createTime,
        approveTime: data.approveTime,
        belongArea: data.belongArea + '',
        belongCompany: data.belongCompany + '',
        companyProp: data.companyProp,
        companyShortName: data.companyShortName != null ? data.companyShortName + '' : '',
        companyState: data.companyState + '',
        customerProp: data.customerProp,
        customerType: data.customerType,
        companyName: data.companyName,
        contactAddress: data.contactAddress,
        economicType: data.economicType,
        foreignName: data.foreignName != null ? data.foreignName + '' : '',
        isDisable: data.isDisable,
        isRetai: data.isRetai,
        isSynergyPay: data.isSynergyPay,
        legalbody: data.legalbody,
        parentCompanyId: data.parentCompanyId,
        postalCode: data.postalCode,
        registerfund: data.registerfund,
        remark: data.remark != null ? data.remark + '' : '',
        taxId: data.taxId + '',
        trade: data.trade
      }
      _this.tableContact = data.contacts
      _this.tableContactSize = data.contacts.length
      _this.tableAccount = data.accounts
      _this.tableAccountSize = data.accounts.length
      this.$refs.form.doDetails()
    },
    Test() {     
      const user = this.$store.state.user.dingUser
      alert('用户id' + user.userid + '部门id' + user.department[0])
      dingTest({
        userId: user.userid,
        depteId: user.department[1]
      }).then(
        res => {
          alert('钉钉接口调用成功')
        }
      )
      alert("当前用户"+user.name)
    },

    async handleChange(value) {
      if (value !== null && value !== '') {
        let obj = {}
        obj = self.queryTypeOptions[0].options.find(item => {
          return item.key === value
        })
        // console.log('拿到结果' + typeof obj)
        if (typeof obj !== 'object') {
          self.prompt = '输入查询数据'
          return null
        }
        self.inputShow = false
        self.selectShow = true
        self.prompt = '选择查询数据'
        return new Promise((resolve, reject) => {
          get(obj.queryField).then(res => {
            self.queryDetail = res.content
            // console.log('拿到结果' + self.queryDetail)
          })
        })
      }
      self.inputShow = true
      self.selectShow = false
      self.prompt = '请勾选类型'
      self.queryDetail = null
      self.query.value = null
    },
    toDingUrl(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.companyState === 2 || row.companyState === 5) {
        const user = this.$store.state.user.dingUser
        const companyKey = row.companyKey
        const params = {
          companyKey: companyKey,
          userid: user.userid,
          companyState: row.companyState
        }
        getDingUrl(params).then(res => {
          if (res !== null && res !== '') {
            alert(res)
            this.openNewDingWidow(res)
          }
        })
          .catch(err => {
            console.log(err.response.data.message)
          })
      }
    }
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.button-box {
  width: 200px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
 .zZindex {
    z-index:3000 !important;
  }
</style>
