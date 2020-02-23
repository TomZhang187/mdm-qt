<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="姓名" prop="contactName">
        <el-input v-model="form.contactName" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="电话" prop="phone" >
        <el-input v-model="form.phone" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="邮箱" prop="email" >
        <el-input v-model="form.email" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="职务" prop="position">
        <el-input v-model="form.position" clearable style="width: 370px;"/>
      </el-form-item>
      <!-- <el-form-item label="所属公司" prop="companyKey">
        <el-input v-model="form.companyKey" clearable style="width: 370px;"/>
      </el-form-item> -->

      <el-form-item label="所属客商" prop="companyKey">
        <el-select v-model="form.companyKey" clearable placeholder="请勾选类型" filterable style="width: 370px;">
          <el-option v-for="item in companyDicts" :key="item.companyKey" :label="item.companyName" :value="item.companyKey" />
        </el-select>
      </el-form-item>

      <el-form-item label="联系地址" prop="contactAddress">
        <el-input v-model="form.contactAddress" clearable style="width: 370px;"/>
      </el-form-item>

      <el-form-item label="类型" prop="contactType">
        <el-select v-model="form.contactType" clearable placeholder="请勾选类型" filterable style="width: 370px;">
          <el-option v-for="item in contactType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="收发货地址" prop="deliveryAddress" >
        <el-input v-model="form.deliveryAddress" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="默认地址" >
        <el-switch
          v-model="form.isDefaultAddress"
          :active-value="1"
          :inactive-value="0"
          active-text="是"
          inactive-text="否"
          style="width: 370px;" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button v-if="computedSaveShow" :loading="loading" type="primary" @click="doSubmit">保存</el-button>
      <el-button :loading="loading" type="danger" @click="doApproval">提交审批</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/contact'
import initContact from '@/mixins/initContact'
import initData from '@/mixins/initData'
import {
  contactApproval
} from '@/api/dingTalk'
export default {
  mixins: [initData, initContact],
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    var validateMobilePhone = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else {
        if (value !== '') {
          var reg = /^1[3456789]\d{9}$/
          if (!reg.test(value)) {
            callback(new Error('请输入有效的手机号码'))
          }
        }
        callback()
      }
    }
    // var validateMobileEmail = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error('请输入邮箱'))
    //   } else {
    //     if (value !== '') {
    //       var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    //       if (!reg.test(value)) {
    //         callback(new Error('请输入有效的邮箱'))
    //       }
    //     }
    //     callback()
    //   }
    // }
    // var validateBlongCompany = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error('请分配客商'))
    //   } else {
    //     const params = {
    //       companyKey: String(value)
    //     }
    //     verifyPermissions(params).then(res => {
    //       if (res === '' || res === null) {
    //         callback(new Error('你没有该客商管理权限'))
    //       } else {
    //         callback()
    //       }

    //       callback()
    //     })
    //   }
    // }
    return {
      loading: false, dialog: false,
      isVerifBelongCompany: false,
      loadRouter: true,
      form: {
        contactKey: '',
        contactAddress: '',
        email: '',
        contactName: '',
        phone: '',
        position: '',
        belongCompany: '',
        companyKey: '',
        contactType: '',
        deliveryAddress: '',
        isDefaultAddress: '',
        contactState: ''
      },
      rules: {
        contactName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
          // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // companyKey: [{
        //   validator: validateBlongCompany,
        //   required: true,
        //   trigger: ['blur', 'change']
        // }],
        phone: [{
          validator: validateMobilePhone,
          required: true,
          trigger: ['blur', 'change']
        }]
        // email: [{
        //   validator: validateMobileEmail,
        //   required: true,
        //   trigger: ['blur', 'change']
        // }]
      }
    }
  },
  computed: {
    computedSaveShow: function() {
      if (this.form.contactKey !== '' && this.form.contactState === 4) {
        return false
      } else {
        return true
      }
    }
  },
  created() {
    // 查询当前用户权限客商集合
    this.findPermissonCompany()
  },
  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
      } else {
        this.options = []
      }
    },
    cancel() {
      this.resetForm()
    },
    doApproval() {
      this.isVerifBelongCompany = true
      this.$refs.form.validate(valid => {
        if (!valid) {
          return valid
        } else {
          const user = this.$store.state.user.dingUser
          const params = this.form
          params.name = user.name
          params.userid = user.userid
          params.depteId = user.department[1]
          contactApproval(params).then(res => {
            alert('调用成功')
            this.$notify({
              title: '提交成功',
              type: 'success',
              duration: 2500
            })
            this.isVerifBelongCompany = false
            this.cancel()
            this.$parent.init()
          })
            .catch(err => {
              this.$notify({
                title: '提交失败',
                type: 'error',
                duration: 2500
              })
              this.isVerifBelongCompany = false
              console.log(err.response.data.message)
            })
        }
      })
    },
    doSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        } else {
          this.loading = true
          if (this.isAdd) {
            this.doAdd()
          } else this.doEdit()
        }
      })
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
        contactKey: '',
        contactAddress: '',
        contactState: '',
        email: '',
        contactName: '',
        phone: '',
        position: '',
        belongCompany: '',
        companyKey: '',
        contactType: '',
        deliveryAddress: '',
        isDefaultAddress: ''
      }
    },
    loadBelongCompany(data) {
      this.form.companyKey = data.companyKey
      this.getCompanyDict(data.belongCompany)
    }

  }
}
</script>

<style scoped>

</style>
