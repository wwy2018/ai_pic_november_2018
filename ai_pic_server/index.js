const Koa = require('koa')
const bodyParser=require('koa-bodyparser')
const router=require('koa-router')()
const https=require('https')
const cors = require('koa2-cors');
const fs = require('fs')
const redis = require("ioredis")
const redisclient = new redis()
const rp = require('request-promise');
const qs = require('qs')
const post = (url, params) => {
  var options = {
    method: 'POST',
    uri: url,
    form: params
  }
  return new Promise((resolve, reject) => {
    return rp(options).then(parseBody => resolve(parseBody)).catch(err => reject(err))
  })
}
let getAuth = async () => {
  const url = 'https://aip.baidubce.com/oauth/2.0/token'
  const options = {
    grant_type: 'client_credentials',
    client_id: '8ytfGYeKaimBgPoZN63qqRtr',
    client_secret: '4tznjDwwOc7SbH4O5xWHx4iUnwYWkxIN'
  }
  let res=await post(url, options)
  return res
}
let setAuthRedis = async () => {
 
  console.log('2')
}
let redisGet = (key) => {
  return new Promise((resolve, reject) => {
    return redisclient.get(key).then(res => {
      resolve(res)
    }).catch(err => reject(err))
  })
}
let redisSet = (key, val) => {
  return new Promise((resolve, reject) => {
    return redisclient.set(key, val).then(res => resolve(res)).catch(err => reject(err))
  })
}
router.post('/img', async (ctx) => {
  const date = new Date()
  let access_token = await redisGet('access_token')
  let access_date = await redisGet('access_date')
  if (!access_token || date > access_date) {
    const authres = await getAuth()
    const now = new Date()
    let access_tok = JSON.parse(authres).access_token
    let access_da = new Date().setDate(now.getDate() + 20)
    await redisSet('access_token', access_tok)
    await redisSet('access_date', access_da)
    access_token = access_tok
    access_date = access_da
  }
  const url = 'https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general'
  const fileimg = ctx.request.body.fileimg
  const res = await post(url, {
    access_token: access_token,
    image: fileimg,
    baike_num: 1
  })
  ctx.body = res
})
const app = new Koa()
app.use(cors())
app.use(bodyParser())
app.use(router.routes())
const options = {
    key: fs.readFileSync('./ssl/private.key', 'utf8'),
    cert: fs.readFileSync('./ssl/private.crt', 'utf8')
};
const httpsserver=https.createServer(options, app.callback());
httpsserver.listen(5000,'0.0.0.0');