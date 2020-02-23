<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <!-- <el-form-item label="所属公司" >
        <el-input v-model="form.companyKey" clearable style="width: 370px;"/>
      </el-form-item> -->
      <el-form-item label="所属公司" prop="companyKey">
        <el-select v-model="form.companyKey" clearable placeholder="请勾选类型" filterable style="width: 370px;">
          <el-option v-for="item in companyDicts" :key="item.companyKey" :label="item.companyName" :value="item.companyKey" dict-companys />
        </el-select>
      </el-form-item>
      <el-form-item label="账户名" prop="accountName" >
        <el-input v-model="form.accountName" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="账号" prop="account" >
        <el-input v-model="form.account" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="开户行" prop="accountBlank" >
        <el-input v-model="form.accountBlank" clearable style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="银行类型" prop="blankClass">
        <el-select v-model="form.blankClass" placeholder="请勾选银行类型" filterable clearable style="width: 370px;">
          <el-option v-for="item in dictBlankClass" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="币种" prop="currency" >
        <el-select v-model="form.currency" filterable clearable placeholder="请勾选币种" style="width: 370px;">
          <el-option v-for="item in dictCurrency" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否默认">
        <el-switch
          v-model="form.isDefalut"
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
import { add, edit } from '@/api/account'
import initData from '@/mixins/initData'
import initAccount from '@/mixins/initAccount'
import {
  accountApproval
} from '@/api/dingTalk'
export default {
  mixins: [initData, initAccount],
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    var validateAccount = (rule, value, callback) => {
      console.log(this.isVerifBelongCompany)
      if (value === '') {
        callback(new Error('请输入公司账号'))
      } else {
        if (value !== '') {
          // 银行卡验证
          var reg = /^([1-9]{1})(\d{14}|\d{18})$/
          if (!reg.test(value)) {
            callback(new Error('请输入有效的账号'))
          }
        }
        callback()
      }
    }
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
      form: {
        accountKey: '',
        account: '',
        accountBlank: '',
        blankClass: '',
        currency: '',
        isDefalut: '',
        accountName: '',
        accountState: '',
        belongCompany: '',
        companyKey: ''

      },
      rules: {
        account: [{
          validator: validateAccount,
          required: true,
          trigger: ['blur', 'change']
        }],
        // companyKey: [{
        //   validator: validateBlongCompany,
        //   required: true,
        //   trigger: ['blur', 'change']
        // }],
        accountBlank: [
          { required: true, message: '请输入开户行', trigger: 'blur' }

        ],
        blankClass: [
          { required: true, message: '请勾选银行类别', trigger: ['blur', 'change'] }
        ],
        currency: [
          { required: true, message: '请勾选币种', trigger: ['blur', 'change'] }
        ],
        accountName: [
          { required: true, message: '请输入账户名', trigger: ['blur', 'change'] }
        ]

      }
    }
  },
  computed: {
    computedSaveShow: function() {
      if (this.form.accountKey !== '' && this.form.accountState === 4) {
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
    cancel() {
      this.resetForm()
    },

    doApproval() {
      this.isVerifBelongCompany = true
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.isVerifBelongCompany = false
          return valid
        } else {
          const user = this.$store.state.user.dingUser
          const params = this.form
          params.name = user.name
          params.userid = user.userid
          params.depteId = user.department[1]
          accountApproval(params).then(res => {
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
        accountKey: '',
        account: '',
        accountBlank: '',
        blankClass: '',
        currency: '',
        isDefalut: '',
        accountName: '',
        accountState: '',
        companyKey: '',
        belongCompany: ''
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
