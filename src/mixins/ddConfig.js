import { getDDConfig } from '@/api/dingding'
import Config from '@/config'
import * as dd from 'dingtalk-jsapi'

export default {

  data() {
    return {
      // 鉴权
      initDingConfig(url) {
        getDDConfig(url).then(res => {
          console.log('鉴权' + res)
          dd.config({
            agentId: res.agentId, // 必填，微应用ID
            corpId: Config.corpId, // 必填，企业ID
            timeStamp: res.timeStamp, // 必填，生成签名的时间戳
            nonceStr: res.nonceStr, // 必填，生成签名的随机串
            signature: res.signature, // 必填，签名
            type: 1, // 选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
            jsApiList: [
              'biz.cspace.saveFile', // 保存钉盘文件
              'biz.util.uploadAttachment', // 上传附件到钉盘文件/从钉盘选择文件
              'biz.cspace.preview', // 添加钉盘文件预览api
              'biz.cspace.chooseSpaceDir' // 选取钉盘目录
            ] // 必填，需要使用的jsapi列表，注意：不要带dd。
          })
          dd.error(function(error) {
            alert('dd error: ' + JSON.stringify(error))
          })
        })
      },
      getRequestCode() {
        dd.ready(() => {
          dd.runtime.permission.requestAuthCode({
            corpId: 'ding1d7e8b088fab194f35c2f4657eb6378f', // 企业id
            onSuccess: info => {
              this.code = info.code
              // 通过后台获取用户信息
              // getUserInfo({ requestAuthCode: info.code }).then(resp => {
              //   this.$store.dispatch('setUser', resp.data)
              //   this.$router.push({ path: '/contract' })
              // })
            }
          })
        })
      },
      // 绑定钉钉 获取 钉钉用户信息 并把信息存储到 vuex中
      setUser() {
        // alert(this._config.corpId)
        // alert('corpid' + corpid)
        // dd.ready(() => {
        //   dd.runtime.permission.requestAuthCode({ // 通过钉钉的免等接口获取请求码
        //     corpId: 'ding1d7e8b088fab194f35c2f4657eb6378f', // 企业id ding1d7e8b088fab194f35c2f4657eb6378f
        //     onSuccess: (info) => {
        //       this.code = info.code
        //       getUserInfo({ requestAuthCode: info.code }).then(resp => { // 通过该免登授权码可以获取用户身份
        //         this.$store.dispatch('setUser', resp.data) // 调用store中的set方法把用户信息保存到vuex中
        //         grantCustomSpace({ userid: this.user.userid, type: 'add' }).then(resp => { // 给当前用户 授权
        //           console.log('开始调用附件上传方法')
        //         })
        //         // this.$router.push({ path: '/contract' })
        //       })
        //     }
        //   })
        // })
      }

    }
  }
}
