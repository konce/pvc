/*!
 * page-version-control.js v0.0.15
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Redis = _interopDefault(require('redis'));
var colors = _interopDefault(require('colors'));
var fs = _interopDefault(require('fs'));
var Table = _interopDefault(require('cli-table'));

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

// import redblade from 'redblade'

var DEFAULT_PORT = 6379;
var DEFAULT_DATABASE = 6;

function print(err, reply, desc) {
  if (err) {
    console.error(desc + ' error: ' + err);
  } else if (desc) {
    console.log((desc + ': ').green + JSON.stringify(reply).blue);
  }
}

var RedisHelper = function () {
  /**
    *
    * @param config
    *
    */
  function RedisHelper(op) {
    classCallCheck(this, RedisHelper);

    this.op = op;
    this.instanceQueue = [];
    this.execQueue = [];
  }

  createClass(RedisHelper, [{
    key: 'open',
    value: function open() {
      var curConfig = this.op;
      var database = typeof curConfig.database === 'undefined' ? DEFAULT_DATABASE : curConfig.database;
      var port = curConfig.port || DEFAULT_PORT;
      var client = Redis.createClient(port, curConfig.url);
      var area = this.op.area;
      console.log((area + ' current database: ' + database).info);
      var openDefer = new Promise(function (resolve, reject) {
        client.auth(curConfig.secret, function (err, reply) {
          if (err) {
            console.log((area + ' on auth error ' + err).error);
            reject(err);
          } else {
            console.log((area + ' on auth ' + reply).info);
            // 初始化 redblade
            // redblade.init({
            //   client
            // })
            resolve();
          }
        });
      });
      client.on('error', function (err) {
        console.log((area + ' on Error ' + err).error);
      });
      client.on('ready', function () {
        console.log(area + ' on ready'.green);
      });
      client.on('connect', function () {
        console.log(area + ' on connect'.green);
      });

      this.instanceQueue.push({
        database: database,
        client: client,
        openDefer: openDefer
      });
    }
  }, {
    key: 'exists',
    value: function exists(key) {
      this.addToQueue('exists', [key], 'exists ' + key);
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

  }, {
    key: 'get',
    value: function get(key) {
      this.addToQueue('get', [key], 'get ' + key);
    }
  }, {
    key: 'Keys',
    value: function Keys(pattern) {
      this.addToQueue('keys', [pattern], 'get all keys: ' + pattern);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      this.addToQueue('set', [key, value], 'set ' + key + ' ' + value);
    }
  }, {
    key: 'hgetall',
    value: function hgetall(key) {
      this.addToQueue('hgetall', [key], 'hgetall ' + key);
    }
  }, {
    key: 'hmset',
    value: function hmset(key, value) {
      this.addToQueue('hmset', [key, value], 'hmset ' + key + ' ' + JSON.stringify(value));
    }
  }, {
    key: 'hmget',
    value: function hmget(key, value) {
      this.addToQueue('hmget', [key, value]);
    }
  }, {
    key: 'addToQueue',
    value: function addToQueue(funcName, params, msg) {
      this.execQueue.push(function (client) {
        return new Promise(function (resolve) {
          if (params.length === 1) {
            client[funcName](params[0], function (err, reply) {
              print(err, reply, msg);
              resolve(reply);
            });
          }
          if (params.length === 2) {
            client[funcName](params[0], params[1], function (err, reply) {
              print(err, reply, msg);
              resolve(reply);
            });
          }
        });
      });
    }
  }, {
    key: 'exec',
    value: function exec() {
      var _this = this;

      var autoClose = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      return new Promise(function (resolve, reject) {
        _this.instanceQueue.forEach(function (instance) {
          instance.openDefer.then(function () {
            instance.client.multi().select(instance.database, function () {
              var queen = [];
              _this.execQueue.forEach(function (func) {
                queen.push(func(instance.client));
              });
              Promise.all(queen).then(function (reply) {
                print(null, 'OK', 'exec done');
                _this.execQueue = [];
                if (autoClose) {
                  instance.client.quit();
                }
                resolve(reply);
              });
            }).exec(function (err, reply) {
              print(err, reply, 'exec begin');
            });
          });
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.instanceQueue.forEach(function (instance) {
        instance.client.quit();
      });
      this.instanceQueue = [];
    }
  }]);
  return RedisHelper;
}();

function format(x, y) {
  var z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds()
  };
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
    return ((v.length > 1 ? '0' : '') + eval('z.' + v.slice(-1))).slice(-2);
  });

  return y.replace(/(y+)/g, function (v) {
    return x.getFullYear().toString().slice(-v.length);
  });
}

var MAX_LIST_NUM = 50;

var Pvc = function () {
  function Pvc(op) {
    classCallCheck(this, Pvc);

    this.instanceQueen = [];
    this.op = op;
    this.prefix = op.prefix || 'index';
    this.keyName = this.prefix + '_version';
    this.currentKeyName = 'current_' + this.prefix + '_version';
    var redisConfig = Pvc.parseFile(op.redisPath)[op.env];
    for (var area in redisConfig) {
      if (redisConfig.hasOwnProperty(area)) {
        redisConfig[area].area = area;
        var instance = new RedisHelper(redisConfig[area]);
        this.instanceQueen.push(instance);
      }
    }
    return this;
  }

  createClass(Pvc, [{
    key: 'create',
    value: function create() {
      this.instanceQueen.forEach(function (instance) {
        instance.open();
      });
    }
  }, {
    key: 'hgetall',
    value: function hgetall(key) {
      var instance = this.instanceQueen[0];
      instance.hgetall(key);
    }
  }, {
    key: 'hmset',
    value: function hmset(key, value) {
      this.instanceQueen.forEach(function (instance) {
        instance.hmset(key, value);
      });
    }
  }, {
    key: 'hmget',
    value: function hmget(key, fields) {
      var instance = this.instanceQueen[0];
      instance.hmget(key, fields);
    }
  }, {
    key: 'get',
    value: function get(key) {
      var instance = this.instanceQueen[0];
      instance.get(key);
    }
  }, {
    key: 'exists',
    value: function exists(key) {
      var instance = this.instanceQueen[0];
      instance.exists(key);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      this.instanceQueen.forEach(function (instance) {
        instance.set(key, value);
      });
    }
  }, {
    key: 'exec',
    value: function exec() {
      var autoClose = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var first = void 0;
      this.instanceQueen.forEach(function (instance) {
        if (!first) {
          first = instance.exec(autoClose);
        } else {
          instance.exec(autoClose);
        }
      });
      return first;
    }
    // 不会自动关闭连接

  }, {
    key: 'execFirst',
    value: function execFirst() {
      var instance = this.instanceQueen[0];
      return instance.exec(false);
    }
  }, {
    key: 'Keys',
    value: function Keys(pattern) {
      this.instanceQueen.forEach(function (instance) {
        instance.Keys(pattern);
      });
    }
  }, {
    key: 'showHistory',
    value: function showHistory() {
      var _this = this;

      this.create();
      this.get(this.currentKeyName);
      var version = void 0;

      this.execFirst().then(function (currentKey) {
        currentKey = currentKey[0];
        if (currentKey) {
          console.log(('当前版本为: ' + _this.currentKeyName + ':' + currentKey).warn);
          version = parseInt(currentKey.split(':')[1]);
        } else {
          console.log(('未查找到当前版本: ' + _this.currentKeyName).warn);
          return;
        }
        var i = version - MAX_LIST_NUM;
        i = i < 1 ? 1 : i;

        var items = [];
        for (var l = version; l >= i; l--) {
          var key = _this.keyName + ':' + l;
          items.push([l, key]);
          _this.hmget(key, ['create_date', 'comment']);
        }

        _this.execFirst().then(function (rs) {
          var table = new Table({
            head: ['version', 'key', 'publish date', 'comment']
          });
          if (items.length === rs.length) {
            rs.forEach(function (arr, i) {
              arr = items[i].concat(arr);
              if (arr[2]) {
                table.push(arr);
              }
            });
          }
          try {
            console.log(('已找到当前版本(包含自身)之前的' + items.length + '条记录').warn);
            console.log(table.toString());
          } catch (e) {
            console.log(e);
          }
          _this.destroy();
        });
      });
    }
  }, {
    key: 'publish',
    value: function publish(comment) {
      var _this2 = this;

      if (!comment) {
        console.log('请填写版本说明!'.error);
        return;
      }
      var version = 1;
      this.create();
      this.get(this.currentKeyName);
      this.execFirst().then(function (currentKey) {
        currentKey = currentKey[0];
        // 最新key递增
        if (currentKey) {
          version = parseInt(currentKey.split(':')[1]) + 1;
        }
        var create_date = Pvc.makeIndexKey();
        var key = _this2.keyName + ':' + version;
        var content = Pvc.readFile(_this2.op.htmlPath);
        _this2.hmset(key, {
          create_date: create_date,
          comment: comment,
          content: content
        });
        _this2.set(_this2.currentKeyName, key);
        _this2.exec().then(function () {
          console.log('publish done:'.info);
          console.log((_this2.currentKeyName + ': ' + key).blue);
        });
      });
    }
  }, {
    key: 'prev',
    value: function prev() {
      var _this3 = this;

      this.current().then(function (rs) {
        var version = rs.version;
        // 上一个版本的索引
        version--;
        var key = _this3.keyName + ':' + version;
        _this3.exists(key);
        _this3.execFirst().then(function (rs) {
          rs = rs[0];
          if (rs) {
            console.log(('即将回退到上一个版本: ' + key).warn);
            _this3.set(_this3.currentKeyName, key);
            _this3.exec().then(function () {
              console.log(('已成功回退到上一个版本: ' + _this3.currentKeyName + ': ' + key).warn);
            });
          } else {
            console.log(('未查找到上一个版本: ' + key).warn);
            _this3.destroy();
          }
        });
      });
    }
  }, {
    key: 'next',
    value: function next() {}
  }, {
    key: 'current',
    value: function current() {
      var _this4 = this;

      var version = void 0;
      this.create();
      this.get(this.currentKeyName);
      return new Promise(function (resolve, reject) {
        _this4.execFirst().then(function (currentKey) {
          if (currentKey) {
            console.log(('当前版本为: ' + _this4.currentKeyName + ':' + currentKey).warn);
            currentKey = currentKey[0];
            version = parseInt(currentKey.split(':')[1]);
            resolve({
              version: version,
              key: currentKey
            });
          } else {
            console.log(('未查找到当前版本: ' + _this4.currentKeyName).warn);
            reject();
          }
        });
      });
    }
  }, {
    key: 'getCurrentDetail',
    value: function getCurrentDetail() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.current().then(function (obj) {
          _this5.hgetall(obj.key);
          _this5.execFirst().then(function (rs) {
            resolve(rs[0]);
            _this5.destroy();
          });
        });
      });
    }
  }, {
    key: 'rollback',
    value: function rollback(version) {
      var _this6 = this;

      this.current().then(function (rs) {
        var key = _this6.keyName + ':' + version;
        _this6.exists(key);
        _this6.execFirst().then(function (rs) {
          rs = rs[0];
          if (rs) {
            console.log(('即将回退到版本: ' + key).warn);
            _this6.set(_this6.currentKeyName, key);
            _this6.exec().then(function () {
              console.log(('已成功回退到版本: ' + _this6.currentKeyName + ': ' + key).warn);
            });
          } else {
            console.log(('回退失败!未查找到版本: ' + key).warn);
            _this6.destroy();
          }
        });
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.instanceQueen.forEach(function (instance) {
        instance.close();
      });
    }
  }], [{
    key: 'makeIndexKey',
    value: function makeIndexKey() {
      return format(new Date(), 'yyyy_MM_dd_hh_mm');
    }
  }, {
    key: 'readFile',
    value: function readFile(path) {
      return fs.readFileSync(path, 'utf8');
    }
  }, {
    key: 'parseFile',
    value: function parseFile(path) {
      return JSON.parse(fs.readFileSync(path, 'utf8'));
    }
  }]);
  return Pvc;
}();

module.exports = Pvc;
