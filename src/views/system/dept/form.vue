<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增部门' : '编辑部门'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" style="width: 370px;"/>
      </el-form-item>
      <el-form-item v-if="form.pid !== 0" label="状态" prop="enabled">
        <el-radio v-for="item in dicts" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
      </el-form-item>
      <el-form-item v-if="form.pid !== 0" label="上级部门">
        <treeselect v-model="form.pid" :options="depts" style="width: 370px;" placeholder="选择上级类目" />
      </el-form-item>

      <el-form-item v-if="form.pid !== 0" v-show="managertShow" label="分配主管" prop="deptManagerUseridList">
        <el-select
          v-model="form.deptManagerUseridList"
          filterable
          multiple
          clearable
          placeholder="请勾选人员"
          style="width: 370px;"
          class="filter-item"
        >
          <el-option
            v-for="item in employees"
            :key="item.dingId"
            :label="item.label"
            :value="item.dingId"
          />
        </el-select>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit, getDepts, getRootDeptId } from '@/api/dept'
import { allEmployee } from '@/api/employee'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  components: { Treeselect },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    dicts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      loading: false, dialog: false, depts: [], employees: [], managertShow: false,
      form: {
        id: '',
        name: '',
        pid: '',
        enabled: 'true',
        deptManagerUseridList: '',
        dingId: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      // console.log(this.form.deptManagerUseridList)
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.pid !== undefined) {
            this.loading = true
            if (this.isAdd) {
              this.doAdd()
            } else this.doEdit()
          } else {
            this.$message({
              message: '上级部门不能为空',
              type: 'warning'
            })
          }
        }
      })
    },
    doAdd() {
      const data = this.form
      data.deptManagerUseridList = this.form.deptManagerUseridList.toString

      add(data).then(res => {
        console.log('调用了')
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
      const data = this.form
      data.deptManagerUseridList = this.form.deptManagerUseridList.toString()
      console.log(data)
      edit(data).then(res => {
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
      this.managertShow = false
      this.$refs['form'].resetFields()
      this.form = {
        id: '',
        name: '',
        enabled: 'true'
      }
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    setInitialPId() {
      getRootDeptId().then(res => {
        this.form.pid = res
      })
    },
    loadiEmpoyees(dingId) {
      const _this = this
      // console.log(node)
      const params = {
        dingBelongDepts: dingId
      }

      allEmployee(params).then(res => {
        _this.employees = res
        _this.employees.map((item) => {
          item.label = '工号：' + item.employeeCode + '  姓名：' + item.employeeName
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
