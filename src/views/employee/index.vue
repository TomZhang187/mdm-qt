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
      <!-- 新增 -->
      <!-- <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          v-permission="['ADMIN','EMPLOYEE_ALL','EMPLOYEE_CREATE']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add">新增</el-button>
      </div> -->
      <!-- 数据刷新 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          class="filter-item"
          size="mini"
          type="info"
          icon="el-icon-refresh"
          @click="init">刷新</el-button>
        <!-- 同步钉钉数据 -->
        <el-popover
          v-model="visible"
          placement="top"
          width="160">
          <p>本地数据将被钉钉数据覆盖？</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="visible = false">取消</el-button>
            <el-button type="primary" :loading="sysLoading" size="mini" @click="syncDdingData">确定</el-button>
          </div>
          <el-button slot="reference" size="mini" class="filter-item"  icon="el-icon-download" type="danger">同步钉钉</el-button>
        </el-popover>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd"/>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <el-table-column prop="employeeCode" label="工号"/>
      <el-table-column :show-overflow-tooltip="true" prop="dingId" label="钉钉ID"/>
      <el-table-column prop="employeeName" label="姓名"/>
      <el-table-column prop="employeePhone" label="电话"/>
      <el-table-column :show-overflow-tooltip="true" prop="pageBelongDepts" label="所属部门"/>
      <el-table-column :formatter="formatIsLeader" prop="iLeader" label="是否主管"/>
      <el-table-column prop="email" label="邮箱"/>
      <el-table-column prop="extensionNumber" label="分机号"/>
      <el-table-column prop="officeAddress" label="办公地址"/>
      <el-table-column prop="remark" label="备注"/>
      <el-table-column prop="companyEmail" label="公司邮箱"/>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <div v-for="item in dicts" :key="item.id">
            <el-tag v-if="scope.row.enabled.toString() === item.value" :type="scope.row.enabled ? '' : 'info'">{{ item.label }}</el-tag>
          </div>
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
      @current-change="pageChange"/>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initDict from '@/mixins/initDict'
import { del } from '@/api/employee'
import {
  syncDingUser
} from '@/api/dingTalk'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData, initDict],
  data() {
    return {
      delLoading: false,
      sysLoading:false,
      visible: false,
      queryTypeOptions: [
        { key: 'employeeCode', display_name: '工号' },
        { key: 'employeeName', display_name: '姓名' },
        { key: 'employeePhone', display_name: '电话' },
        { key: 'leader', display_name: '是否所属部门主管' },
        { key: 'email', display_name: '邮件' },
        { key: 'extensionNumber', display_name: '分机号' },
        { key: 'officeAddress', display_name: '办公地点' },
        { key: 'remark', display_name: '备注' },
        { key: 'enabled', display_name: '状态' },
        { key: 'companyEmail', display_name: '公司邮箱' },
        { key: 'pageBelongDepts', display_name: '所属部门' }
      ]
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
      this.getDict('employee_state')
    })
  },
  methods: {
    checkPermission,
    beforeInit() {
      this.url = 'api/employee'
      const sort = 'id,desc'
      this.params = { page: this.page, size: this.size, sort: sort }
      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) { this.params[type] = value }
      return true
    },
    formatIsLeader: function(row, column, cellValue, index) {
      const value = row.leader
      if (typeof value !== 'boolean') {
        return '未知'
      } else if (value) {
        return '是'
      } else {
        return '否'
      }
    },
    subDelete(id) {
      this.sysLoading= true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
        this.sysLoading = false
        this.$refs[id].doClose()
        console.log(err.response.data.message)
      })
    },
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        employeeCode: data.employeeCode,
        employeeName: data.employeeName,
        employeePhone: data.employeePhone,
        ubacDeptCode: data.ubacDeptCode,
        ubacDeptName: data.ubacDeptName,
        leader: data.leader,
        email: data.email,
        extensionNumber: data.extensionNumber,
        officeAddress: data.officeAddress,
        remark: data.remark,
        enabled: data.enabled,
        companyEmail: data.companyEmail,
        dingId: data.dingId,
        dingBelongDepts: data.dingBelongDepts,
        pageBelongDepts: data.pageBelongDepts
      }
      _this.dialog = true
    },
    syncDdingData() {
      this.sysLoading= true
      syncDingUser().then(res => {
       this.sysLoading = false
        this.visible = false
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '同步成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
       this.sysLoading = false
        this.visible = false
        this.$notify({
          title: '同步失败',
          type: 'error',
          duration: 2500
        })
        console.log(err.response.data.message)
      })
    }
  }
}
</script>

<style scoped>

</style>
