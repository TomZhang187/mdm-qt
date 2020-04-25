<template>
  <div>
    <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" title="新增验证" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="纳税编号" prop="taxId">
          <el-input v-model="form.taxId" placeholder="请输入准确" clearable style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="showPermissButton?true:false" type="text" @click="beforeApprovalPermission">{{ permissionText }}</el-button>
        <el-button type="text" @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="forward">下一步</el-button>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancelAdd" :visible.sync="dialogAdd" :title="title" width="1067px">
      <el-dialog :visible.sync="contactVisible" width="1000px" title="联系人详情" append-to-body>
        <div style="display: inline-block;margin: 0px 2px;">
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="toContactAdd">新增</el-button>
        </div>
        <el-table :data="tableContact" style="width:100%">
          <el-table-column label="姓名" prop="contactName"/>
          <el-table-column label="职务" prop="position"/>
          <el-table-column :formatter="formatContactType" label="类型" prop="contactType"/>
          <el-table-column label="邮箱" prop="email"/>
          <el-table-column label="电话" prop="phone"/>
          <el-table-column label="联络地址" prop="contactAddress"/>
          <el-table-column label="收发货地址" prop="deliveryAddress"/>
          <el-table-column label="是否为默认地址">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.isDefaultAddress"
                :active-value="1"
                :inactive-value="0"
                disabled/>
            </template>
          </el-table-column>
          <el-table-column label="状态" >
            <template slot-scope="scope">
              <el-tag
                :type="formatTagType(scope.row.contactState)"
                disable-transitions
                @click=" toDingUrl(scope.row)"
              >{{ scope.row.contactState | filterApprovalStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" >
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="toContactEdit(scope.row)" />
            </template>
          </el-table-column>
        </el-table>

      </el-dialog>

      <el-dialog :visible.sync="accountVisible" width="1000px" title="账户详情" append-to-body>
        <div style="display: inline-block;margin: 0px 2px;">
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="toAccountAdd">新增</el-button>
        </div>
        <el-table :data="tableAccount" style="width:100%">
          <!-- <el-table-column label="账户主键" prop="accountKey"/> -->
          <el-table-column :formatter="formatBlankClass " label="银行类型" prop="blankClass"/>
          <el-table-column label="开户行" prop="accountBlank"/>
          <el-table-column label="账号" prop="account"/>
          <el-table-column label="账户名" prop="accountName"/>
          <el-table-column :formatter="formatCurrency" label="币种" prop="currency"/>
          <el-table-column label="是否为默认账户">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.isDefalut" :active-value="1" :inactive-value="0" disabled/>
            </template>
          </el-table-column>
          <el-table-column label="状态" >
            <template slot-scope="scope">
              <el-tag
                :type="formatTagType(scope.row.accountState)"
                disable-transitions
                @click=" toDingUrl(scope.row)"
              >{{ scope.row.accountState | filterApprovalStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" >
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click=" toAccountEdit(scope.row)" />
            </template>
          </el-table-column>
        </el-table>

      </el-dialog>

      <el-form
        ref="formAdd"
        :model="formAdd"
        :rules="rulesAdd"
        size="small"
        label-width="80px"
        class="input-box"
      >
        <el-form-item v-show="false" label="客商主键" prop="companyKey">
          <el-input v-model="formAdd.companyKey " clearable style="width: 380px;" />
        </el-form-item>

        <el-form-item label="纳税编号" prop="taxId">
          <el-input v-show="!dialogAdd" v-model="formAdd.taxId" style="width: 262px;" />
          <span v-show="dialogAdd" style="width:262px;float:left">{{ formAdd.taxId }}</span>
        </el-form-item>

        <el-form-item label="客商名称" prop="companyName">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.companyName" clearable style="width:  262px;"/>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.companyName }}</span>
        </el-form-item>

        <el-form-item label="客商简称" prop="companyShortName">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.companyShortName" clearable style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.companyShortName }}</span>
        </el-form-item>

        <!-- <el-form-item v-if="false"   label="上级公司" prop="parentCompanyId">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.parentCompanyId"
            :remote-method="getCompanyDict"
            remote
            filterable
            clearable
            placeholder="请勾选上级公司"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in companyDicts"
              :key="item.companyKey"
              :label="item.companyName"
              :value="item.companyKey"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.parentCompanyId | filterParentCompany }}</span>
        </el-form-item> -->

        <el-form-item v-if="false" label="所属公司" prop="belongCompany">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.belongCompany"
            filterable
            clearable
            placeholder="请勾选所属公司"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictCompanys"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.belongCompany | filterbelongCompany }}</span>
        </el-form-item>

        <el-form-item label="外文名称" prop="foreignName">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.foreignName" clearable style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.foreignName }}</span>
        </el-form-item>

        <el-form-item label="所属地区" prop="belongArea">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.belongArea"
            filterable
            clearable
            placeholder="请勾选所属地区"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictAreas"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.belongArea | filterArea }}</span>

        </el-form-item>

        <el-form-item label="公司属性" prop="companyProp">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.companyProp"
            filterable
            clearable
            placeholder="请勾选公司属性"
            style="width:  262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictCompanyProp"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.companyProp | filtercompanyProp }}</span>
        </el-form-item>

        <el-form-item label="客商类型" prop="customerType">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.customerType"
            filterable
            clearable
            placeholder="请勾选公司类型"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictCustomerType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.customerType | filtercustomerType }}</span>
        </el-form-item>

        <el-form-item label="客商属性" prop="customerProp">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.customerProp"
            filterable
            clearable
            placeholder="请勾选公司类型"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictCustomerProp"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.customerProp | filtercustomerProp }}</span>
        </el-form-item>

        <el-form-item label="所属行业" prop="trade">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.trade"
            filterable
            clearable
            placeholder="请勾选行业"
            style="width:  262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictTrades"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.trade | filterTrade }}</span>
        </el-form-item>

        <el-form-item label="经济类型" prop="economicType">
          <el-select
            v-show="detailsShow?true:false"
            v-model="formAdd.economicType"
            filterable
            clearable
            placeholder="请勾选行业"
            style="width: 262px;"
            class="filter-item"
          >
            <el-option
              v-for="item in dictTrades"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.economicType | filterEconomicType }}</span>
        </el-form-item>

        <!-- <el-form-item label="散户" prop="isRetai">
          <el-switch
            v-show="detailsShow?true:false"
            v-model="formAdd.isRetai"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
            style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.isRetai | filterIsRetai }}</span>
        </el-form-item> -->

        <el-form-item label="协同付款" prop="isDisable">
          <el-switch
            v-show="detailsShow?true:false"
            v-model="formAdd.isSynergyPay"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
            style="width:   262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.isSynergyPay | filterIsSynergyPay }}</span>
        </el-form-item>

        <el-form-item v-show="formAdd.companyState === '4'" v-if="detailsShow?false:true" label="使用状态" prop="isDisable">
          <el-switch
            v-show="detailsShow?true:false"
            v-model="formAdd.isDisable"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
            style="width:262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.isDisable | filterIsDisable }}</span>
        </el-form-item>

        <el-form-item label="联系地址" prop="contactAddress">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.contactAddress" :title="formAdd.contactAddress" clearable style="width: 262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.contactAddress }}</span>
        </el-form-item>

        <el-form-item label="法人" prop="legalbody">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.legalbody" clearable style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.legalbody }}</span>
        </el-form-item>

        <el-form-item label="邮政编码" prop="postalCode">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.postalCode" clearable style="width:   262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.postalCode }}</span>
        </el-form-item>

        <el-form-item label="注册资金" prop="registerfund">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.registerfund" type="number" placeholder="单位万" clearable style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.registerfund }}</span>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-show="detailsShow?true:false" v-model="formAdd.remark" type="textarea" clearable style="width:  262px;" />
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.remark }}</span>
        </el-form-item>

        <el-form-item v-show="detailsShow?false:true" label="创建人" prop="createMan">
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.createMan }}</span>
        </el-form-item>

        <el-form-item v-show="detailsShow?false:true" label="创建时间" prop="createTime">
          <span style="width:262px;float:left">{{ formAdd.createTime | filterTime }}</span>
        </el-form-item>

        <el-form-item v-show="detailsShow?false:true" label="修改人" prop=" updateMan">
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.updateMan }}</span>
        </el-form-item>

        <el-form-item v-show="detailsShow?false:true" label="修改时间" prop="updateTime">
          <span style="width:262px;float:left">{{ formAdd.updateTime | filterTime }}</span>
        </el-form-item>

        <el-form-item v-show="formAdd.companyState === '4'" v-if="detailsShow?false:true" label="批准时间" prop="approveTime">
          <span v-show="detailsShow?false:true" style="width:262px;float:left">{{ formAdd.approveTime | filterTime }}</span>
        </el-form-item>

        <el-form-item v-show="detailsShow?false:true" label="客商状态" prop="companyState">

          <span style="width:262px;float:left"><el-tag
            :type="formatTagType(formAdd.companyState)"
            disable-transitions>{{ formAdd.companyState | filterApprovalStatus }}</el-tag></span>
        </el-form-item>

        <el-form-item v-show="showBadge" label="联系人" prop="companyShortName" >
          <div style="width:262px;float:left"> <el-badge :value="tableContactSize" class="item" >
            <el-button type="info" plain @click="contactVisible = true" >点击查看</el-button>
          </el-badge></div>
        </el-form-item>

        <el-form-item v-show="showBadge" label="账户" prop="companyShortName" >
          <div style="width:262px;float:left"> <el-badge :value="tableAccountSize" class="item" >
            <el-button type="info" plain @click="accountVisible = true">点击查看</el-button>
          </el-badge></div>

        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button v-show="showButton" type="text" @click="cancelAdd">取消</el-button>
        <el-button v-show="showButton" :loading="loading" type="primary" @click="doSave">保存</el-button>
        <el-button v-show="showButton" :loading="loading" type="danger" @click="doAddApprove">提交审批</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  add, VerifyPermission
} from '@/api/companyInfo'
import {
  companyApprove
} from '@/api/dingTalk'
import initData from '@/mixins/initData'
import initAccount from '@/mixins/initAccount'
import initContact from '@/mixins/initContact'

import {
  verifyAdd, getPermission
} from '@/api/companyInfo'
import { saveByCompanyKey, findPermissionRecord } from '@/api/companyUpdate'
export default {
  mixins: [initData, initAccount, initContact],
  props: {
    // isAdd: {
    //   type: Boolean,
    //   required: true
    // }
  },
  data() {
    var checktaxId = (rule, value, callback) => {
      const reg = /^[0-9a-zA-z_]{18}$/
      if (!value) {
        callback(new Error('纳税编号不能为空'))
      } else if (reg.test(value)) {
        
        verifyAdd(this.form).then(res => {
           console.log(res)    
           if(res.companyKey === null){
               callback()
           }else{
              this.showPermissButton = true
          this.permissionText = '申请管理权限'
            if (res.isDisable === 0) {
              callback(new Error('公司已有该客商' + '  ' + '状态' + '停用'))
              this.verifyPermission(res)
            } else {
              callback(
                new Error(
                  '公司已有该客商' +
                    '  ' +
                    '状态:' +
                   this.statusArr.labelByValue[res.companyState]
                )
              )
              this.verifyPermission(res)
            }
            }
          
        })

      
      } else {
        callback(new Error('纳税编号不合法'))
        this.showPermissButton = false
      }
    }
    
    var checkBelongCompany = (rule, value, callback) => {
      this.showPermissButton = false
      if (!value) {
        callback(new Error('所属公司不能为空'))
      } else {
        this.permissionText = '申请管理权限'
        verifyAdd(this.form).then(res => {
         
          if (bc === value) {
            if (res.isDisable === 0) {
              callback(new Error('公司已有该客商' + '  ' + '状态' + '停用'))
              this.verifyPermission(res)
            } else {
              callback(
                new Error(
                  '公司已有该客商' +
                    '  ' +
                    '状态:' +
                   this.statusArr.labelByValue[res.companyState]
                )
              )
              this.verifyPermission(res)
            }
          }
          callback()
        })
      }
    }
    // 检查不为空
    var checkNotNull = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('不能为空'))
      } else {
        callback()
      }
    }
    // // 邮编验证
    // var checkPostCode = (rule, value, callback) => {
    //   const reg = /^[0-9]{6}$/
    //   if (!value) {
    //     return callback(new Error('不能为空'))
    //   } else if (reg.test(value)) {
    //     callback()
    //   } else {
    //     callback(new Error('邮政编码不合法'))
    //   }
    // }

    return {
      loading: false,
      dialog: false,
      dialogAdd: false,
      // 客商权限管理按钮
      showPermissButton: false,
      // 客商权限管理按钮标题
      permissionText: '申请管理权限',
      // 联系人和账户按钮的显示与隐藏
      showBadge: true,
      // 联系人和账户对话框的显示与隐藏
      contactVisible: false,
      accountVisible: false,
      contactAddVisible: false,
      contactUpdateShow: false,
      contactAddShow: true,
      // 详情对话框元素的隐藏
      detailsShow: true,
      // 修改对话框元素的隐藏
      updateShow: false,
      // 新增对话框元素的隐藏
      addShow: false,
      // 对话框按钮显示
      showButton: true,
      title: '客商新增',
      formContact: {
        index: '',
        contactKey: '',
        name: '',
        position: '',
        contactAddress: '',
        email: '',
        phone: '',
        contactType: '',
        deliveryAddress: '',
        isDefaultAddress: '',
        companyKey: '',
        belongCompany: ''
      },
      tableContactSize: '0',
      tableContact: [],
      tableAccountSize: '0',
      tableAccount: [],

      editableTabsValue: '2',
      tabIndex: '2',
      read: '',
      form: {
        belongCompany: '',
        taxId: '91610132766990300F',
        companyKey: ''
      },
      formAdd: {
        companyKey: '',
        taxId: '',
        companyName: '',
        companyShortName: '',
        parentCompanyId: '',
        belongCompany: '',
        foreignName: '',
        belongArea: '',
        companyProp: '',
        customerType: '',
        customerProp: '',
        trade: '',
        economicType: '',
        isSynergyPay: '',
        isDisable: '',
        contactAddress: '',
        legalbody: '',
        postalCode: '',
        registerfund: '',
        remark: '',
        createMan: '',
        createTime: '',
        updateMan: '',
        updateTime: '',
        approveTime: '',
        companyState: ''
      },
      rules: {
        taxId: [{
          validator: checktaxId,
          trigger: ['blur', 'change']
        }],
        belongCompany: [{
          validator: checkBelongCompany,
          trigger: ['blur', 'change']
        }]
      },
      rulesAdd: {
        // 新增客商表单验证
        // taxId: [{
        //   validator: checktaxId,
        //   trigger: ['blur', 'change']
        // }],
        // belongCompany: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        companyName: [{
          validator: checkNotNull,
          trigger: ['blur', 'change']
        }],

        belongArea: [{
          validator: checkNotNull,
          trigger: ['blur', 'change']
        }]
        // companyProp: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }]
        // customerProp: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],

        // contactAddress: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        // economicType: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        // legalbody: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        // parentCompanyId: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        // 邮政编码验证
        // postalCode: [{
        //   validator: checkPostCode,
        //   trigger: ['blur', 'change']
        // }],
        // registerfund: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }],
        // trade: [{
        //   validator: checkNotNull,
        //   trigger: ['blur', 'change']
        // }]
      }
    }
  },
  beforeCreate() { // 全局this

  },
  mounted() {
    // 内部公司字典对象加载
    this.getDictCompanys()
    // 公司状态字典对象加载
    // 公司地区字典对象加载
    this.getDictArea()
    // 公司属性字典对象加载
    this.getDictCompanyProp()
    // 客商属性字典对象加载
    this.getDictCustomerProp()
    // 客商类型字典对象加载
    this.getDictCustomerType()
    // 行业字典对象加载
    this.getDictTrade()
    // 所有上级公司对象加载
    this.getDictParentCompany()
  },
  methods: {
    celldblclick(row, column, cell, event) {
      console.log(row, column, cell, event)
      if (typeof (row.status) === 'undefined') {
        row.status = true
      } else {
        row.status = false
      }
    },
    formatTagType(state) {
      // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
      if (state === '1') return ''
      else if (state === '2' || state === '5') return 'info'
      else if (state === '3') return 'danger'
      else return 'success'
    },
    cancel() {
      this.resetForm()
    },
    cancelAdd() {
      if (this.addShow) {
        this.dialogAdd = false
        clearTimeout(this.timer) // 清除延迟执行
        this.timer = setTimeout(() => {
          // 设置延迟执行
          this.addShow = false
          this.dialogShow()
        }, 500)
      } else {
        this.resetForm()
        clearTimeout(this.timer) // 清除延迟执行
        this.timer = setTimeout(() => {
          // 设置延迟执行
          this.resetFormAdd()
          this.showBadge = true
        }, 300)
      }
    },
    // 对话框的元素隐藏和显示
    dialogShow() {
      if (!this.detailsShow) {
        this.detailsShow = true
        this.showButton = true
      } else {
        if (!this.showBadge) {
          this.showBadge = true
        }
        this.resetFormAdd()
      }
    },
    forward() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        } else {
           
          this.formAdd.taxId = this.form.taxId
          this.title = '新增客商'
          this.showBadge = false
          this.dialogAdd = true
        }
      })
    },
    doSave(formName) {
      // alert('验证调用')
      this.$refs.formAdd.validate(valid => {
        if (!valid) {
          return
          // 1 新增 2 新增审批 3驳回 4审批通过 5变更审批
        } else if (this.formAdd.companyState !== '4') {
          this.save()
          return
        } else {
          this.saveRecord()
          return
        }
      })
    },
    // 修改记录新增
    saveRecord() {
      console.log('客商记录新增')
      const user = this.$store.state.user.dingUser
      const params = this.formAdd
      params.approveTime = null
      params.createTime = null
      params.name = user.name
      params.userid = user.userid
      saveByCompanyKey(params)
        .then(res => {
          this.cancelAdd()
          this.$notify({
            title: '保存成功',
            type: 'success',
            duration: 2500
          })
          this.loading = false
          this.$parent.init()
        })  
        .catch(err => {
          this.loading = false
          console.log(err.response.data.message)
        })
    },
    doUpdate() {
      this.title = '修改客商数据'
      this.addShow = true
      this.dialogAdd = true
    },
    doDetails() {
      this.title = '客商详情'
      this.dialogAdd = true
      this.detailsShow = false
      this.showButton = false
      this.addShow = true
    },
    // 客商新增
    save() {
      this.formAdd.contacts = this.tableContact
      this.formAdd.accounts = this.tableAccount
      add(this.formAdd)
        .then(res => {
          this.cancelAdd()
          this.$notify({
            title: '保存成功',
            type: 'success',
            duration: 2500
          })
          this.loading = false
          this.$parent.init()
        })
        .catch(err => {
          this.loading = false
          console.log(err.response.data.message)
        })
    },
    // 客商新增界面 保存并提交审批
    doAddApprove() {
     
      this.$refs.formAdd.validate(valid => {
        if (!valid) {
          return valid
        }
      })
     
      const user = this.$store.state.user.dingUser
      const params = this.formAdd
      params.name = user.name
      params.approveTime = null
      params.createTime = null
      params.userid = user.userid
      params.depteId = user.department[0]
     
      companyApprove(params).then(res => {
        this.$notify({
          title: '提交成功',
          type: 'success',
          duration: 2500
        })
        this.cancelAdd()
        this.$parent.init()
      })
        .catch(err => {
          this.$notify({
            title: '提交失败',
            type: 'error',
            duration: 2500
          })
          console.log(err.response.data.message)
        })
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
    },
    resetFormAdd() {
      this.dialogAdd = false
      this.$refs['formAdd'].resetFields()
      // this.formAdd = {
      //   belongCompany: '',
      //   taxId: ''
      // }
    },
    toContactAdd() {
      const row = {}
      if (this.formAdd.companyState === '4') {
        row.companyKey = this.formAdd.companyKey
        row.belongCompany = this.formAdd.companyName
      }
      this.$router.push({ path: '/customer/contact', query: { to: 'add', row: row }})
    },
    toContactEdit(row) {
      row.belongCompany = this.formAdd.companyName
      this.$router.push({ path: '/customer/contact', query: { to: 'edit', row: row }})
    },

    toAccountAdd() {
      let row = null
      if (this.formAdd.companyState === '4') {
        row = {
          companyKey: this.formAdd.companyKey,
          belongCompany: this.formAdd.companyName
        }
      }
      this.$router.push({ path: '/customer/account', query: { to: 'add', row: row }})
    },
    toAccountEdit(row) {
      row.belongCompany = this.formAdd.companyName
      this.$router.push({ path: '/customer/account', query: { to: 'edit', row: row }})
    },
    // 客商管理权限验证
    verifyPermission(data) {
      this.form.companyKey = data.companyKey
      const params = {
        companyKey: data.companyKey
      }

      VerifyPermission(params).then(res => {
        if (res === '' || res === null) {
          this.showPermissButton = true
        }
      })
    },
    doApprovalPermission() {
      // alert(this.form.companyKey)
      const user = this.$store.state.user.dingUser
      const params = this.form
      params.name = user.name
      params.userid = user.userid
      getPermission(params).then(res => {
        this.$notify({
          title: '提交成功',
          type: 'success',
          duration: 2500
        })
        this.cancel()
        this.$parent.init()
      })
        .catch(err => {
          this.$notify({
            title: '提交失败',
            type: 'error',
            duration: 2500
          })
          this.cancel()
          console.log(err.response.data.message)
        })
    },
    beforeApprovalPermission() {
      const params = this.form
      // alert('调用了')
      findPermissionRecord(params).then(res => {
        // alert('调用了')
        this.permissionText = '申请管理权限'
        if (res === '' || res === null) {
          this.doApprovalPermission()
        } else {
          this.permissionText = '权限审批中'
          if (res.dingUrl !== '' && res.dingUrl !== null) {
            this.openNewDingWidow(res.dingUrl)
          }
        }
      })
    }
  }
}
</script>

<style>
  .input-box {
    width: 100%;
    display: flex;
    flex-direction: row;
    /* justify-content: space-between; */
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
