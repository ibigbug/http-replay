'use strict'

const fs = require('fs')
const path = require('path')

const supertest = require('supertest')
const assign = require('object-assign')

const debug = require('debug')('http-replay:test')


const defaults = {
  savePath: path.join(process.cwd(), 'http-replay-dump.json'),
  fuzzyHtml: true
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
    debug(req, res)
    
    let t = tester[req.method.toLowerCase()](req.url)

    for (let field in req.header) {
      t.set(field, req.header[field])
    }

    t.expect(res.status)
    if (is(res, 'html')) {
      if (config.fuzzyHtml) {
        t.expect(/^\s*<html/)
      } else {
        t.expect(res.body)
      }
    } else {
      t.expect(res.body)
    }

  })
  
  let promise = []
  testerList.forEach(function(tester) {
    promise.push(new Promise(function(resolve) {
      tester.end(function(err, res) {
        console.log(err)
        if (err) {
          resolve({err, res})
        } else {
          resolve({err: null, res: res})
        }
      })
    }))
  })

  return {
    promise: Promise.all(promise),
    driver: testerList
  }
}

if (!module.parent) {
  module.exports({
    server: require('../test/server')
  }).forEach(function(testerList) {
    testerList.end(function(err) {
      console.error(err)
    })
  })
}

function is(res, type) {
  return res.type && !!res.type.match(type)
}
