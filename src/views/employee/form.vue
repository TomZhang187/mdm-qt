<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="980px">
    <el-form ref="form" :model="form" :rules="rules" size="small" class="input-box" label-width="80px">
      <!-- <el-form-item label="工号" >
        <el-input v-model="form.employeeCode" style="width: 370px;"/>
      </el-form-item> -->
      <el-form-item label="姓名" >
        <el-input v-model="form.employeeName" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="电话" >
        <el-input v-model="form.employeePhone" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="性别" >
        <el-input v-model="form.employeeSex" style="width: 370px;"/>
      </el-form-item>

      <el-form-item label="所属部门" >
        <!-- <el-select
          v-model="depts"
          multiple
          collapse-tags
          style="margin-left: 20px;"
          placeholder="请选择">
          <el-option
            v-for="item in treeDepts"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select> -->
        <treeselect v-model="form.depts" :options="treeDepts" multiple style="width: 370px;" placeholder="选择上级类目" />
        <!-- <el-input v-model="form.ubacDeptName" style="width: 370px;"/> -->
      </el-form-item>

      <el-form-item label="是否主管">
        <el-switch
          v-model="form.iLeader"
          :active-value="true"
          :inactive-value="false"
          active-text="是"
          inactive-text="否"
          style="width:   262px;" />
      </el-form-item>
      <el-form-item label="邮箱" >
        <el-input v-model="form.email" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="公司邮箱" >
        <el-input v-model="form.companyemail" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="分机号" >
        <el-input v-model="form.extensionNumber" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="办公地址" >
        <el-input v-model="form.officeAddress" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="备注" >
        <el-input v-model="form.remark" style="width: 370px;"/>

        <!-- <el-form-item label="状态" >
        <el-input v-model="form.enabled" style="width: 370px;"/>
      </el-form-item> -->
    </el-form-item></el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/employee'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getDepts, getRootDeptId } from '@/api/dept'
export default {
  components: { Treeselect },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      loading: false, dialog: false, treeDepts: [],
      form: {
        id: '',
        employeeCode: '',
        employeeName: '',
        employeePhone: '',
        employeeSex: '',
        ubacDeptCode: '',
        ubacDeptName: '',
        depts: [],
        iLeader: false,
        email: '',
        extensionNumber: '',
        officeAddress: '',
        remark: '',
        companyemail: '',
        enabled: ''
      },
      rules: {
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.loading = true
      if (this.isAdd) {
        this.doAdd()
      } else this.doEdit()
    },
    doAdd() {
      add(this.form).then(res => {
        this.resetForm()
        this.$notify({
          title: '添加成功',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.init()
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    doEdit() {
      edit(this.form).then(res => {
        this.resetForm()
        this.$notify({
          title: '修改成功',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.init()
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.form = {
        id: '',
        employeeCode: '',
        employeeName: '',
        employeePhone: '',
        employeeSex: '',
        ubacDeptCode: '',
        ubacDeptName: '',
        iLeader: false,
        email: '',
        extensionNumber: '',
        officeAddress: '',
        remark: '',
        companyemail: '',
        enabled: ''
      }
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.treeDepts = res.content
      })
    },
    setInitialPId() {
      getRootDeptId().then(res => {
        this.form.pid = res
      })
    }
  }
}
</script>

<style scoped>
 .input-box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  .inout-box .el-form-item {
    width: 50%;
  }
  .Input-tab {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  .Input-tab.el-form-item {
    width: 50%;
  }
</style>
