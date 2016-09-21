# pvc

> Page Version Control with redis 页面版本控制(通过redis)

## 解决了什么问题
webpack 打包后的页面里面包含css/js的地址和版本hash值, 我们通过相应的key把这个模板存入到redis里面, 后端通过指定的key从redis中读取这个模板信息渲染页面, 我们通过管理这些key达到前端自由管理版本的目的, 前端发布版本不需要后端做任何变更, 还可以即时切换/回退版本



## 注意事项
* 初始配置的参数prefix必须是唯一的, 是作为区分不同页面的id存在的
* 连接redis 只能在部署redis的机器上链接

## 版本控制原理
 以初始设置prefix为icefire为例
 1. 在redis里存储一个key为current_icefire_version的set
 2. 每次发版本都会往redis里存一个hash, 把当前版本内容对应的hash的key作为第一步里的set的value存储起来
 3. 版本的更新和回退都是通过直接修改第一步里的set的value来完成

## 如何从redis中读取当前版本的模板
 以初始设置prefix为icefire为例
 1. 当前版本的key为current_icefire_version
 2. current_icefire_version对应的value就是 存取当前版本内容的hash的key
 3. 通过第二步里的value 读取hash的值 里面就包含了当前版本对应的详细信息, 包括模板内容等
 
## 需要的redis配置格式
> 通过json配置来读写redis, 格式如下:


```js
// 默认端口 6379
// 默认数据库 6
// $link: redis连接地址
// $name: redis实例名称
// $key:  redis密码
// hz, us 为区域名称示例， 1个或多个都可以 

{
  "dbeta": {
    "hz": {
      "url": "$link",
      "secret": "$name:$key",
      "port": 6379,
      "database": 6
    },
    "us": {
      "url": "$link",
      "secret": "$name:$key",
      "port": 6379,
      "database": 6
    }
  },
  "release": {
    "hz": {
      "url": "$link",
      "secret": "$name:$key",
      "port": 6379,
      "database": 6
    },
    "us": {
      "url": "$link",
      "secret": "$name:$key",
      "port": 6379,
      "database": 6
    }
  }
}
```

## 安装

全局安装(可直接使用命令行)
```
$ npm install -g page-version-control
```
直接使用命令行的话 就不需要书写调用代码, 直接在与node_modules平级的目录下放置下面这个配置文件即可:
pvc.config.js
```
var path = require('path')

module.exports = {
  redisPath: path.resolve(__dirname, './redis.json'),
  htmlPath: path.resolve(__dirname, './dist/index.html'),
  prefix: 'your custom name'
}

```
局部安装
```
$ npm install --save-dev page-version-control
```

## 通过命令行调用
pvc -h 帮助信息 <br>
pvc -v 当前版本 <br>
pvc publish <e> <d> <br>
pvc history <e> <br>
pvc prev <e> <br>
pvc rollback <e> <t> <br>

## 通过API调用
### 引入
```js
// cjs
var pvc = require('page-version-control')
// es6
import pvc from 'page-version-control'
```
### 创建实例
```js
let env = 'dbeta'
let redisPath = path.resolve(__dirname, './redis.json')
let htmlPath = path.resolve(__dirname, './index.html')
var pvc = new Pvc({
  htmlPath,
  redisPath,
  env,
  prefix: 'icefire'
})
```
### 查看历史
![image](https://github.com/4f2e/pvc/raw/master/assets/history.png)
```js
// 只取当前版本之前的50条数据
pvc.showHistory()
```
### 获取当前版本的详细信息(模板内容等)
```js
pvc.getCurrentDetail().then(rs => {
  console.log(rs)
})
```

### 发布版本
![image](https://github.com/4f2e/pvc/raw/master/assets/pub.png)
```js
// comment参数为必须
pvc.publish('comment.....')
```
### 回退到上一版本
![image](https://github.com/4f2e/pvc/raw/master/assets/prev.png)
```js
pvc.prev()
```
### 回退到指定版本
![image](https://github.com/4f2e/pvc/raw/master/assets/rollback.png)
```js
// 48为版本索引
pvc.rollback(48)
```
## 基础API
#### 基础redis操作
1. exists
2. keys
3. get
4. set
5. hmget
6. hmset
7. hgetall

#### 队列化后执行
1. exec

```js
// 例子
pvc.create()
pvc.set('key1', '001')
pvc.set('key2', '002')
pvc.set('key3', '003')
pvc.getAllKeys()
pvc.get('key1')
pvc.get('key2')
pvc.get('key3')
pvc.hmset('key4', {
  name: 'yoyo',
  gender: 2
})
pvc.hgetall('key4')
pvc.exec().then(rs => {
  console.log(rs)
})
```


