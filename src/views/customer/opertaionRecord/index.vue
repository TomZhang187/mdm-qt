<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery"/>
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <el-button
        class="filter-item"
        size="mini"
        type="info"
        icon="el-icon-refresh"
        @click="init">刷新</el-button>
    </div>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" >
      <el-table-column :show-overflow-tooltip="true" prop="companyName" label="客商名称" />
      <el-table-column prop="taxId" label="纳税编号" />
      <el-table-column :show-overflow-tooltip="true" prop="processId" label="审批实例ID" />
      <el-table-column :show-overflow-tooltip="true" :formatter="formatbelongCompany" prop="belongCompany" label="所属公司" />
      <el-table-column prop="createMan" label="操作人">
        <template slot-scope="scope">
          <span>{{ scope.row.createMan }}</span>
        </template>
      </el-table-column>
      <el-table-column :formatter="formatoperationType" prop="operationType" style="font-size: 10px" label="操作类型" />
      <el-table-column :formatter="formatTime" prop="approveTime" label="审批时间" />
      <el-table-column label="审批结果" >
        <template slot-scope="scope">
          <el-tag
            :type="formatTagType(scope.row.approveResult)"
            disable-transitions>{{ scope.row.approveResult }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审批详情" width="100px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="openNewDingWidow(scope.row.dingUrl)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-table-column prop="companyKey" label="公司主键"/>
      <el-table-column prop="companyProp" label="公司属性"/>
      <el-table-column prop="companyShortName" label="公司简称"/>
      <el-table-column prop="companyState" label="公司状态"/>
      <el-table-column prop="customerProp" label="公司类型"/> -->

    <!-- <el-table-column prop="contactAddress" label="联系地址"/>
      <el-table-column prop="createMan" label="创建人"/>
      <el-table-column prop="economicType" label="经济类型"/>
      <el-table-column prop="foreignName" label="外文名称"/>
      <el-table-column prop="isDisable" label="是否停用"/>
      <el-table-column prop="isRetai" label="是否散户"/>
      <el-table-column prop="isSynergyPay" label="是否协同付款"/>
      <el-table-column prop="legalbody" label="法人"/>
      <el-table-column prop="operateTime" label="操作时间"/>
      <el-table-column prop="parentCompanyId" label="总公司"/>
      <el-table-column prop="postalCode" label="邮政编码"/>
      <el-table-column prop="registerfund" label="注册资金"/>
      <el-table-column prop="remark" label="备注"/
      <el-table-column prop="trade" label="所属行业"/>  -->
    <!-- </el-table> -->
    <!--分页组件-->
    <el-pagination
      :total="total"
      :current-page="page + 1"
      style="margin-top: 8px;"
      layout="total, prev, pager, next, sizes"
      @size-change="sizeChange"
      @current-change="pageChange"/>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
export default {
  mixins: [initData],
  data() {
    return {
      operationTypeArr: {
        valueByLabel: '',
        labelByValue: ''
      },
      delLoading: false,
      queryTypeOptions: [
        { key: 'operateKey', display_name: '操作记录主键' },
        { key: 'approveResult', display_name: '审批结果' },
        { key: 'belongArea', display_name: '所属地区' },
        { key: 'belongCompany', display_name: '所属公司' },
        { key: 'companyKey', display_name: '公司主键' },
        { key: 'companyProp', display_name: '公司属性' },
        { key: 'companyShortName', display_name: '公司简称' },
        { key: 'companyState', display_name: '公司状态' },
        { key: 'customerProp', display_name: '公司类型' },
        { key: 'compayName', display_name: '公司名称' },
        { key: 'contactAddress', display_name: '联系地址' },
        { key: 'createMan', display_name: '创建人' },
        { key: 'economicType', display_name: '经济类型' },
        { key: 'foreignName', display_name: '外文名称' },
        { key: 'isDisable', display_name: '是否停用' },
        { key: 'isRetai', display_name: '是否散户' },
        { key: 'isSynergyPay', display_name: '是否协同付款' },
        { key: 'legalbody', display_name: '法人' },
        { key: 'parentCompanyId', display_name: '总公司' },
        { key: 'postalCode', display_name: '邮政编码' },
        { key: 'processId', display_name: '审批ID' },
        { key: 'registerfund', display_name: '注册资金' },
        { key: 'remark', display_name: '备注' },
        { key: 'taxId', display_name: '纳税编号' },
        { key: 'trade', display_name: '所属行业' },
        { key: 'userId', display_name: '操作人ID' }
      ]
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
    })
    // 拿到客商操作类型标签与值转换字典
    this.getOperationType(this)
  },
  methods: {
    checkPermission,
    formatTagType(state) {
      if (state === '驳回') return 'danger'
      else if (state === '通过') return 'success'
      else return ''
    },
    formatoperationType: function(row, column, cellValue, index) {
      if (row.operationType !== null && row.operationType !== '') {
        const label = this.operationTypeArr.labelByValue[row.operationType]
        if (typeof label !== 'string') {
          return row.operationType
        }
        return label
      } else {
        return '未知'
      }
    },
    formatbelongCompany: function(row, column, cellValue, index) {
      if (row.belongCompany !== null && row.belongCompany !== '') {
        const label = this.belongCompanyArr.labelByValue[row.belongCompany]
        if (typeof label !== 'string') {
          return row.belongCompany
        }
        return label
      } else {
        return '未知'
      }
    },
    formatArea: function(row, column, cellValue, index) {
      if (row.belongCompany !== null && row.belongCompany !== '') {
        const label = this.areaArr.labelByValue[row.belongArea]
        if (typeof label !== 'string') {
          return row.belongArea
        }
        return label
      } else {
        return '未知'
      }
    },

    beforeInit() {
      this.url = 'api/companyUpdate'
      const sort = 'operateKey,desc'
      const user = this.$store.state.user.dingUser
      this.params = { page: this.page, size: this.size, sort: sort }
      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) { this.params[type] = value }
      this.params.createMan = user.name
      return true
    }
  }
}
</script>

<style scoped>

</style>
