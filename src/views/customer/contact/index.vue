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
          v-permission="['ADMIN','CONTACT_ALL','CONTACT_CREATE']"
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

    <eForm ref="form" :is-add="isAdd"/>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;" @row-dblclick = "edit">
      <el-table-column prop="contactName" label="姓名" />
      <el-table-column prop="phone" label="电话"/>
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="position" label="职务"/>
      <el-table-column :show-overflow-tooltip="true" prop="belongCompany" label="所属客商"/>
      <el-table-column prop="contactAddress" label="联系地址"/>
      <el-table-column :formatter="formatContactType" prop="contactType" label="类型"/>
      <el-table-column prop="deliveryAddress" label="收发货地址"/>
      <el-table-column :formatter="formatIsDefaultAddress" prop="isDefaultAddress" label="默认地址"/>
      <!-- <el-table-column prop="contactState" label="状态"/> -->
      <el-table-column label="状态" >
        <template slot-scope="scope">
          <el-tag
            :type="formatTagType(scope.row.contactState)"
            disable-transitions
            @click=" toDingUrl(scope.row)"
          >{{ scope.row.contactState | filterApprovalStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN','CONTACT_ALL','CONTACT_EDIT','CONTACT_DELETE'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button
            v-permission="['ADMIN','CONTACT_ALL','CONTACT_EDIT']"
            v-show="computedEdit(scope.row)"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="edit(scope.row)"/>
          <el-popover
            v-permission="['ADMIN','CONTACT_ALL','CONTACT_DELETE']"
            v-show="computedEdit(scope.row)"
            :ref="scope.row.contactKey"
            placement="top"
            width="180">
            <p>{{ scope.row | filterDeleteTop }}</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.contactKey].doClose()">取消</el-button>
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
import initContact from '@/mixins/initContact'
import { del } from '@/api/contact'
import eForm from './form'
import {
  contactDingUrl
} from '@/api/dingTalk'
import {
  contactApproval
} from '@/api/dingTalk'
export default {
  components: { eForm },
  filters: {
    // 使用状态过滤器
    filterDeleteTop: function(row) {
      if (row.contactState === 4) {
        return '申请解除绑定？'
      } else {
        return '确认删除？'
      }
    }
  },
  mixins: [initData, initContact],
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
        { key: 'contactKey', display_name: '联系人主键' },
        { key: 'contactAddress', display_name: '联系地址' },
        { key: 'email', display_name: '邮件' },
        { key: 'contactName', display_name: '姓名' },
        { key: 'phone', display_name: '电话' },
        { key: 'position', display_name: '职务' },
        { key: 'companyKey', display_name: '所属客商' },
        { key: 'contactType', display_name: '类型' },
        { key: 'deliveryAddress', display_name: '收发货地址' },
        { key: 'isDefaultAddress', display_name: '是否默认地址' },
        { key: 'contactState', display_name: '客商状态' }
      ]
    }
  },
  created() {
    this.getApprovalState()
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
    formatTagType(state) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (state === 1) return ''
      else if (state === 2 || state === 5) return 'info'
      else if (state === 3) return 'danger'
      else return 'success'
    },

    computedEdit(row) {
      if (row.contactState === 2 || row.contactState === 5) {
        return false
      } else {
        return true
      }
    },
    computeDelteIcon(row) {
      if (row.contactState === 4) {
        return 'el-icon-unlock'
      } else {
        return 'el-icon-delete'
      }
    },
    beforeInit() {
      this.url = 'api/contact'
      const sort = 'contactKey,desc'
      this.params = { page: this.page, size: this.size, sort: sort }
      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) { this.params[type] = value }
      return true
    },
    subDelete(row) {
      if (row.contactState !== 4) {
        this.delLoading = true
        del(row.contactKey).then(res => {
          this.delLoading = false
          this.$refs[row.contactKey].doClose()
          this.dleChangePage()
          this.init()
          this.$notify({
            title: '删除成功',
            type: 'success',
            duration: 2500
          })
        }).catch(err => {
          this.delLoading = false
          this.$refs[row.contactKey].doClose()
          console.log(err.response.data.message)
        })
      } else {
        const user = this.$store.state.user.dingUser

        const params = row
        params.contactName = null
        params.name = user.name
        params.userid = user.userid
        params.depteId = user.department[1]
        contactApproval(params).then(res => {
          alert('调用成功')
          this.delLoading = false
          this.$refs[row.contactKey].doClose()
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
      // _this.loadBelongCompany(data)
      _this.form = {
        contactKey: data.contactKey,
        contactAddress: data.contactAddress,
        email: data.email,
        contactName: data.contactName,
        phone: data.phone,
        position: data.position,
        companyKey: data.companyKey,
        contactType: data.contactType != null ? data.contactType + '' : '',
        deliveryAddress: data.deliveryAddress,
        isDefaultAddress: data.isDefaultAddress,
        contactState: data.contactState
      }
      _this.dialog = true
    },
    companyRounter() {
      const type = this.$route.query.to
      if (type === 'add') {
        const _this = this.$refs.form
        const data = this.$route.query.row
        _this.form = data
        this.$refs.form.dialog = true
        this.loadingRounter = false
      } else if (type === 'edit') {
        const row = this.$route.query.row

        const _this = this.$refs.form
        if (row) {
          row.contactType = row.contactType + ''
          _this.form = row
          _this.loadBelongCompany(row)
          _this.dialog = true
        }
        this.loadingRounter = false
      }
    },
    toDingUrl(row) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (row.contactState === 2 || row.contactState === 5) {
        const user = this.$store.state.user.dingUser
        const contactKey = row.contactKey
        const params = {
          contactKey: contactKey,
          userid: user.userid
        }
        contactDingUrl(params).then(res => {
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
