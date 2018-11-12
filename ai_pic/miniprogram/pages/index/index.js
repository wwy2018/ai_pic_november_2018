//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    imgUrl: '',
    result: '',
    resShow: false
  },
  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '图片识别智能助手',
      path: '/page/index'
    }
  },
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  // 上传图片
  getRes: function (e) {
    console.log(e)
    const that = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        that.setData({
          imgUrl: filePath
        })
        const fileimg = wx.getFileSystemManager().readFileSync(filePath, "base64")
        const type = e.target.dataset.type
        wx.request({
          url: 'https://www.beetime.top:5000/getRes', //仅为示例，并非真实的接口地址
          method: 'POST',
          data: {
            fileimg: fileimg,
            type: type
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success (res) {
            const result = res.data.result[0]
            that.setData({
              result: result,
              resShow: true
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  closeRes: function () {
    this.setData({
      resShow: false
    })
  }
})
