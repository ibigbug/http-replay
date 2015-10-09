'use strict'

const fs = require('fs')
const path = require('path')

const supertest = require('supertest')
const assign = require('object-assign')

const debug = require('debug')('http-replay:test')


const defaults = {
  savePath: path.join(process.cwd(), 'http-replay-dump.json')
}
module.exports = function test(options) {
  let config = assign({}, defaults, options)
  let entity
  try {
   entity = require(config.savePath) 
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  if (!Array.isArray(entity)) {
    console.error('Invalid input data')
    process.exit(1)
  }

  let server = config.server

  let testerList = [] 
  entity.forEach(function(e) {
    let tester = supertest(server)
    let req = e.req
    let res = e.res
    testerList.push(tester[req.method.toLowerCase()](req.url).expect(res.status).expect(res.body))
  })
  
  return testerList
}

if (!module.parent) {
  module.exports({
    server: require('../test/server')
  }).forEach(function(testerList) {
    testerList.end(function(err) {
      debug(err)
    })
  })
}
