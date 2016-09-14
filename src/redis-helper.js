import Redis from 'redis'
import colors from './colors'
// import redblade from 'redblade'

const DEFAULT_PORT = 6379
const DEFAULT_DATABASE = 6

function print (err, reply, desc) {
  if (err) {
    console.error(desc + ' error: ' + err)
  } else if (desc) {
    console.log((desc + ': ').green + JSON.stringify(reply).blue)
  }
}

export default class RedisHelper {
	/**
   *
   * @param config
   *
   */
  constructor (op) {
    this.op = op
    this.instanceQueue = []
    this.execQueue = []
  }

  open () {
    let curConfig = this.op
    let database = typeof curConfig.database === 'undefined' ? DEFAULT_DATABASE : curConfig.database
    let port = curConfig.port || DEFAULT_PORT
    let client = Redis.createClient(port, curConfig.url)
    let area = this.op.area
    console.log(`${area} current database: ${database}`.info)
    let openDefer = new Promise((resolve, reject) => {
      client.auth(curConfig.secret, (err, reply) => {
        if (err) {
          console.log((area + ' on auth error ' + err).error)
          reject(err)
        } else {
          console.log((area + ' on auth ' + reply).info)
          // 初始化 redblade
          // redblade.init({
          //   client
          // })
          resolve()
        }
      })
    })
    client.on('error', err => {
      console.log((area + ' on Error ' + err).error)
    })
    client.on('ready', () => {
      console.log(area + ' on ready'.green)
    })
    client.on('connect', () => {
      console.log(area + ' on connect'.green)
    })

    this.instanceQueue.push({
      database,
      client,
      openDefer
    })
  }
  exists (key) {
    this.addToQueue('exists', [key], `exists ${key}`)
  }
  // schema (name, obj) {
  //   redblade.schema(name, obj)
  // }
  //
  // insert (name, obj) {
  //   this.execQueue.push(() => {
  //     return new Promise(resolve => {
  //       redblade.insert(name, obj, (err, reply) => {
  //         print(err, reply, `insert to ${name}`)
  //         resolve(reply)
  //       })
  //     })
  //   })
  // }
  // update (name, obj) {
  //   this.execQueue.push(() => {
  //     return new Promise(resolve => {
  //       redblade.update(name, obj, (err, reply) => {
  //         print(err, reply, `update ${name}`)
  //         resolve(reply)
  //       })
  //     })
  //   })
  // }
  // select (name, obj) {
  //   this.execQueue.push(() => {
  //     return new Promise(resolve => {
  //       redblade.select(name, obj, (err, reply) => {
  //         print(err, reply, `select from ${name}`)
  //         resolve(reply)
  //       })
  //     })
  //   })
  // }
  // remove (name, obj) {
  //   this.execQueue.push(() => {
  //     return new Promise(resolve => {
  //       redblade.remove(name, obj, (err, reply) => {
  //         print(err, reply, `remove from ${name}`)
  //         resolve(reply)
  //       })
  //     })
  //   })
  // }
  get (key) {
    this.addToQueue('get', [key], `get ${key}`)
  }

  Keys (pattern) {
    this.addToQueue('keys', [pattern], `get all keys: ${pattern}`)
  }

  set (key, value) {
    this.addToQueue('set', [key, value], `set ${key} ${value}`)
  }
  hgetall (key) {
    this.addToQueue('hgetall', [key], `hgetall ${key}`)
  }
  hmset (key, value) {
    this.addToQueue('hmset', [key, value], `hmset ${key} ${JSON.stringify(value)}`)
  }
  hmget (key, value) {
    this.addToQueue('hmget', [key, value])
  }
  addToQueue (funcName, params, msg) {
    this.execQueue.push((client) => {
      return new Promise(resolve => {
        if (params.length === 1) {
          client[funcName](params[0], (err, reply) => {
            print(err, reply, msg)
            resolve(reply)
          })
        }
        if (params.length === 2) {
          client[funcName](params[0], params[1], (err, reply) => {
            print(err, reply, msg)
            resolve(reply)
          })
        }
      })
    })
  }

  exec (autoClose = true) {
    return new Promise((resolve, reject) => {
      this.instanceQueue.forEach(instance => {
        instance.openDefer.then(() => {
          instance.client.multi().select(instance.database, () => {
            let queen = []
            this.execQueue.forEach(func => {
              queen.push(func(instance.client))
            })
            Promise.all(queen).then(reply => {
              print(null, 'OK', 'exec done')
              this.execQueue = []
              if (autoClose) {
                instance.client.quit()
              }
              resolve(reply)
            })
          }).exec((err, reply) => {
            print(err, reply, 'exec begin')
          })
        })
      })
    })
  }

  close () {
    this.instanceQueue.forEach(instance => {
      instance.client.quit()
    })
    this.instanceQueue = []
  }
}
