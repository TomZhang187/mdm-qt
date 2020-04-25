/**
 * @description 系统全局配置
 */
export default {
  /**
   * @description 记住密码状态下的token在Cookie中存储的天数，默认1天
   */
  tokenCookieExpires: 1,
  /**
   * @description 记住密码状态下的密码在Cookie中存储的天数，默认1天
   */
  passCookieExpires: 1,
  /**
   * @description 此处修改网站名称
   */
  webName: '客商管理系统',
  /**
   * @description 是否只保持一个子菜单的展开
   */
  uniqueOpened: true,
  /**
   * @description token key
   */
  TokenKey: 'LF-MDM-TOEKN',

  /**
   * @description 请求超时时间，毫秒（默认2分钟）
   */
  timeout: 1200000,

  /**
   * @description 是否显示 tagsView
   */
  tagsView: true,

  /**
   * @description 固定头部
   */
  fixedHeader: true,

  /**
   * @description 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示设置的悬浮按钮
   */
  settingBtn: false,

  /**
   * 是否显示设置的底部信息
   */
  showFooter: true,

  /**
   * 底部文字，支持html语法
   */
  footerTxt: '© 2020 LF <a href="#" target="_blank">xxx</a>',

  /**
   * 备案号
   */
  caseNumber: '备案号110',
  /**
   * 钉钉配置--企业ID
   */
  // corpId: 'dinge9c470f66b28c79535c2f4657eb6378f' // 测试环境
  
  corpId:'ding872e051ff9bb057224f2f5cc6abecb85' //正式环境

}
