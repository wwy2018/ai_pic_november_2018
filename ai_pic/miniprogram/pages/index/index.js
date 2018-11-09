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
    result: ''
  },
  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
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
  doUpload: function () {
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
        wx.request({
          url: 'https://localhost:5000/img', //仅为示例，并非真实的接口地址
          method: 'POST',
          data: {
            fileimg: fileimg
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success (res) {
            const result = res.data.result
            result.map(item => {
              item.score = item.score.toFixed(4)*100
            })
            console.log('r', result)
            that.setData({
              result: [...result]
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

})
