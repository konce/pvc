import RedisHelper from './redis-helper'
import fs from 'fs'
import colors from './colors'
import Table from 'cli-table'

function format(x, y){
  var z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds()
  }
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
    return ((v.length > 1 ? '0' : '') + eval('z.' + v.slice(-1))).slice(-2)
  })

  return y.replace(/(y+)/g, function(v) {
    return x.getFullYear().toString().slice(-v.length)
  })
}

const MAX_LIST_NUM = 50

export default class Pvc {
  constructor (op) {
    this.instanceQueen = []
    this.op = op
    this.prefix = op.prefix || 'index'
    this.keyName = this.prefix + '_version'
    this.currentKeyName = `current_${this.prefix}_version`
    let redisConfig = Pvc.parseFile(op.redisPath)[op.env]
    for (let area in redisConfig) {
      if (redisConfig.hasOwnProperty(area)) {
        redisConfig[area].area = area
        let instance = new RedisHelper(redisConfig[area])
        this.instanceQueen.push(instance)
      }
    }
    return this
  }
  create () {
    this.instanceQueen.forEach(instance => {
      instance.open()
    })
  }
  static makeIndexKey () {
    return format(new Date(), 'yyyy_MM_dd_hh_mm')
  }
  static readFile (path) {
    return fs.readFileSync(path, 'utf8')
  }
  static parseFile (path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  }
  hgetall (key) {
    let instance = this.instanceQueen[0]
    instance.hgetall(key)
  }
  hmset (key, value) {
    this.instanceQueen.forEach(instance => {
      instance.hmset(key, value)
    })
  }
  hmget (key, fields) {
    let instance = this.instanceQueen[0]
    instance.hmget(key, fields)
  }
  get (key) {
    let instance = this.instanceQueen[0]
    instance.get(key)
  }
  exists (key) {
    let instance = this.instanceQueen[0]
    instance.exists(key)
  }
  set (key, value) {
    this.instanceQueen.forEach(instance => {
      instance.set(key, value)
    })
  }
  exec (autoClose = true) {
    let first
    this.instanceQueen.forEach(instance => {
      if (!first) {
        first = instance.exec(autoClose)
      } else {
        instance.exec(autoClose)
      }
    })
    return first
  }
  // 不会自动关闭连接
  execFirst () {
    let instance = this.instanceQueen[0]
    return instance.exec(false)
  }
  Keys (pattern) {
    this.instanceQueen.forEach(instance => {
      instance.Keys(pattern)
    })
  }
  showHistory () {
    this.create()
    this.get(this.currentKeyName)
    let version

    this.execFirst().then(currentKey => {
      currentKey = currentKey[0]
      if (currentKey) {
        console.log(`当前版本为: ${this.currentKeyName}:${currentKey}`.warn)
        version = parseInt(currentKey.split(':')[1])
      } else {
        console.log(`未查找到当前版本: ${this.currentKeyName}`.warn)
        return
      }
      let i = version - MAX_LIST_NUM
      i = i < 1 ? 1 : i

      let items = []
      for (let l = version; l >= i; l--) {
        let key = `${this.keyName}:${l}`
        items.push([l, key])
        this.hmget(key, ['create_date', 'comment'])
      }

      this.execFirst().then(rs => {
        let table = new Table({
          head: ['version', 'key', 'publish date', 'comment']
        })
        if (items.length === rs.length) {
          rs.forEach((arr, i) => {
            arr = items[i].concat(arr)
            if (arr[2]) {
              table.push(arr)
            }
          })
        }
        try {
          console.log(`已找到当前版本(包含自身)之前的${items.length}条记录`.warn)
          console.log(table.toString())
        } catch (e) {
          console.log(e)
        }
        this.destroy()
      })
    })
  }
  publish (comment) {
    if (!comment) {
      console.log('请填写版本说明!'.error)
      return
    }
    let version = 1
    this.create()
    this.get(this.currentKeyName)
    this.execFirst().then(currentKey => {
      currentKey = currentKey[0]
      // 最新key递增
      if (currentKey) {
        version = parseInt(currentKey.split(':')[1]) + 1
      }
      let create_date = Pvc.makeIndexKey()
      let key = `${this.keyName}:${version}`
      let content = Pvc.readFile(this.op.htmlPath)
      this.hmset(key, {
        create_date,
        comment,
        content
      })
      this.set(this.currentKeyName, key)
      this.exec().then(() => {
        console.log('publish done:'.info)
        console.log(`${this.currentKeyName}: ${key}`.blue)
      })
    })
  }
  prev () {
    this.current().then(rs => {
      let version = rs.version
      // 上一个版本的索引
      version--
      let key = `${this.keyName}:${version}`
      this.exists(key)
      this.execFirst().then(rs => {
        rs = rs[0]
        if (rs) {
          console.log(`即将回退到上一个版本: ${key}`.warn)
          this.set(this.currentKeyName, key)
          this.exec().then(() => {
            console.log(`已成功回退到上一个版本: ${this.currentKeyName}: ${key}`.warn)
          })
        } else {
          console.log(`未查找到上一个版本: ${key}`.warn)
          this.destroy()
        }
      })
    })
  }
  next () {

  }
  current () {
    let version
    this.create()
    this.get(this.currentKeyName)
    return new Promise((resolve, reject) => {
      this.execFirst().then(currentKey => {
        if (currentKey) {
          console.log(`当前版本为: ${this.currentKeyName}:${currentKey}`.warn)
          currentKey = currentKey[0]
          version = parseInt(currentKey.split(':')[1])
          resolve({
            version,
            key: currentKey
          })
        } else {
          console.log(`未查找到当前版本: ${this.currentKeyName}`.warn)
          reject()
        }
      })
    })
  }
  getCurrentDetail () {
    return new Promise((resolve, reject) => {
      this.current().then(obj => {
        this.hgetall(obj.key)
        this.execFirst().then(rs => {
          resolve(rs[0])
          this.destroy()
        })
      })
    })
  }
  rollback (version) {
    this.current().then(rs => {
      let key = `${this.keyName}:${version}`
      this.exists(key)
      this.execFirst().then(rs => {
        rs = rs[0]
        if (rs) {
          console.log(`即将回退到版本: ${key}`.warn)
          this.set(this.currentKeyName, key)
          this.exec().then(() => {
            console.log(`已成功回退到版本: ${this.currentKeyName}: ${key}`.warn)
          })
        } else {
          console.log(`回退失败!未查找到版本: ${key}`.warn)
          this.destroy()
        }
      })
    })
  }
  destroy () {
    this.instanceQueen.forEach(instance => {
      instance.close()
    })
  }
}
