import { expect } from 'chai'
import path from 'path'

import Pvc from '../src/index'

// describe('Pvc', () => {
//   describe('Pvc.open()', () => {
//     it('should return welcome message for a guest user', () => {
//       const greeting = new Greeting()
//       const message = greeting.hello()
//       expect(message).to.be.equal('Welcome, Guest!')
//     })
//
//     it('should return welcome message for a named user', () => {
//       const greeting = new Greeting('John')
//       const message = greeting.hello()
//       expect(message).to.be.equal('Welcome, John!')
//     })
//   })
// })

let env = 'dbeta'
let redisPath = path.resolve(__dirname, './redis.json')
let htmlPath = path.resolve(__dirname, './index.html')
var pvc = new Pvc({
  htmlPath,
  redisPath,
  env,
  prefix: 'icefire'
})

// basic api
// pvc.create()
// pvc.set('key1', '001')
// pvc.set('key2', '002')
// pvc.set('key3', '003')
// pvc.getAllKeys()
// pvc.get('key1')
// pvc.get('key2')
// pvc.get('key3')
// pvc.hmset('key4', {
//   name: 'yoyo',
//   gender: 2
// })
// pvc.hgetall('key4')
// pvc.exec()

// advanced api
// show history 50
// pvc.showHistory()
// 发布版本
// pvc.publish('just another new version')
// 回退到上一个版本
// pvc.prev()
// 前进到下一个版本(如果有的话)
// pvc.next()
// 回退到指定版本
// pvc.rollback(10)
// 获取当前版本的模板
// pvc.getCurrentDetail().then(rs => {
//   console.log(rs)
// })



