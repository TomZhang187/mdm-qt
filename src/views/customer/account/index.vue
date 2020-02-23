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
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add">新增</el-button>
      </div>
      <el-button
        class="filter-item"
        size="mini"
        type="info"
        icon="el-icon-refresh"
        @click="init">刷新</el-button>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd"/>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <el-table-column :show-overflow-tooltip="true" prop="belongCompany" label="所属公司"/>
      <el-table-column prop="accountName" label="账户名"/>
      <el-table-column prop="account" label="账号"/>
      <el-table-column prop="accountBlank" label="开户行"/>
      <el-table-column :formatter="formatBlankClass" prop="blankClass" label="银行类型"/>
      <el-table-column :formatter="formatCurrency" prop="currency" label="币种"/>
      <el-table-column :formatter=" formatIsDefault" prop="isDefalut" label="是否默认"/>
      <el-table-column label="状态" >
        <template slot-scope="scope">
          <el-tag
            :type="formatTagType(scope.row.accountState)"
            disable-transitions
            @click=" toDingUrl(scope.row)"
          >{{ scope.row.accountState | filterApprovalStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN','ACCOUNT_ALL','ACCOUNT_EDIT','ACCOUNT_DELETE'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button
            v-show="computedEdit(scope.row)"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="edit(scope.row)"/>
          <el-popover
            v-show="computedEdit(scope.row)"
            :ref="scope.row.accountKey"
            placement="top"
            width="180">
            <p>{{ scope.row | filterDeleteTop }}</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.accountKey].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" :icon="computeDelteIcon(scope.row)" type="danger" size="mini"/>
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
      @current-change="pageChange"/>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initAccount from '@/mixins/initAccount'
import { del } from '@/api/account'
import eForm from './form'
import {
  accountApproval, accountDingUrl
} from '@/api/dingTalk'
export default {
  components: { eForm },
  filters: {
    // 使用状态过滤器
    filterDeleteTop: function(row) {
      if (row.accountState === 4) {
        return '申请解除绑定？'
      } else {
        return '确认删除？'
      }
    }
  },
  mixins: [initAccount, initData],
  beforeRouteEnter(to, from, next) {
    if (from.fullPath === '/customer/company' && typeof to.query.to !== 'undefined') {
      next(vm => {
        vm.loadingRounter = true
      })
    }
    next()
  },
  data() {
    return {
      delLoading: false,
      loadingRounter: false,
      queryTypeOptions: [
        { key: 'accountKey', display_name: '账户主键' },
        { key: 'account', display_name: '账号' },
        { key: 'accountBlank', display_name: '开户行' },
        { key: 'blankClass', display_name: '银行类型' },
        { key: 'currency', display_name: '币种' },
        { key: 'isDefalut', display_name: '是否默认' },
        { key: 'name', display_name: '账户名' }
      ]
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
    })
  },
  updated() {
    if (this.loadingRounter) {
      this.companyRounter()
    }
  },
  methods: {
    checkPermission,
    computeDelteIcon(row) {
      if (row.accountState === 4) {
        return 'el-icon-unlock'
      } else {
        return 'el-icon-delete'
      }
    },
    computedEdit(row) {
      if (row.accountState === 2 || row.accountState === 5) {
        return false
      } else {
        return true
      }
    },
    beforeInit() {
      this.url = 'api/account'
      const sort = 'accountKey,desc'
      this.params = { page: this.page, size: this.size, sort: sort }
      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) { this.params[type] = value }
      return true
    },
    subDelete(row) {
      if (row.accountState !== 4) {
        this.delLoading = true
        del(row.accountKey).then(res => {
          this.delLoading = false
          this.$refs[row.accountKey].doClose()
          this.dleChangePage()
          this.init()
          this.$notify({
            title: '删除成功',
            type: 'success',
            duration: 2500
          })
        }).catch(err => {
          this.delLoading = false
          this.$refs[row.accountKey].doClose()
          console.log(err.response.data.message)
        })
      } else {
        const user = this.$store.state.user.dingUser
        const params = row
        params.accountName = null
        params.name = user.name
        params.userid = user.userid
        params.depteId = user.department[1]
        accountApproval(params).then(res => {
          alert('调用成功')
          this.delLoading = false
          this.$refs[row.accountKey].doClose()
          this.dleChangePage()
          this.init()
          this.$notify({
            title: '提交成功',
            type: 'success',
            duration: 2500
          })
        }).catch(err => {
          this.$notify({
            title: '提交失败',
            type: 'error',
            duration: 2500
          })
          console.log(err.response.data.message)
        })
      }
    },
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.loadBelongCompany(data)
      _this.form = {
        accountKey: data.accountKey,
        account: data.account,
        accountBlank: data.accountBlank,
        blankClass: data.blankClass != null ? data.blankClass + '' : '',
        currency: data.currency != null ? data.currency + '' : '',
        isDefalut: data.isDefalut,
        accountName: data.accountName,
        accountState: data.accountState,
        companyKey: data.companyKey,
        belongCompany: data.belongCompany

      }
      _this.dialog = true
    },
    companyRounter() {
      const type = this.$route.query.to
      if (type === 'add') {
        const _this = this.$refs.form
        const data = this.$route.query.row
        _this.form = data
        // _this.loadBelongCompany(data)
        this.$refs.form.dialog = true
        this.loadingRounter = false
      } else if (type === 'edit') {
        const row = this.$route.query.row
        const _this = this.$refs.form
        if (row) {
          row.currency = row.currency + ''
          row.blankClass = row.blankClass + ''
          _this.form = row
          // _this.loadBelongCompany(row)
          _this.dialog = true
        }
        this.loadingRounter = false
      }
    },
    toDingUrl(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.accountState === 2 || row.accountState === 5) {
        const user = this.$store.state.user.dingUser
        const accountKey = row.accountKey
        const params = {
          accountKey: accountKey,
          userid: user.userid
        }
        accountDingUrl(params).then(res => {
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

<style scoped>

</style>
