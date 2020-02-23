<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import * as dd from 'dingtalk-jsapi'
import { getUserInfo } from '@/api/login'
import Config from '@/config'
export default {
  name: 'App',
  created() {
    // 在页面加载时读取用户信息
    dd.ready(() => {
      dd.runtime.permission.requestAuthCode({
        corpId: Config.corpId, // 企业id
        onSuccess: info => {
          getUserInfo({ requestAuthCode: info.code }).then(res => { // 通过该免登授权码可以获取用户身份
            this.$store.dispatch('setDingUser', res.data) // 调用store中的set方法把钉钉用户信息保存到vuex中
          })
        },
        onFail: err => {
          alert(JSON.stringify(err))
        }
      })
    })
  }
}
</script>
