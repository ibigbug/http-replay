'use strict'

const path = require('path')
const fs = require('fs')
const assign = require('object-assign')

const debug = require('debug')('http-replay:dump')



function Store(savePath) {
  this.savePath = savePath
  if (fs.existsSync(savePath)) {
    try {
      this.entity = require(savePath)
      debug('not init')
    } catch (e) {
      console.error(e)
      this.entity = []
      debug('init')
    }
  } else {
    this.entity = []
    debug('wb')
  }
}

Store.prototype.add = function(req) {
  this.entity.push(req)
}

Store.prototype.flush = function() {
  fs.writeFileSync(this.savePath, JSON.stringify(this.entity))
}


module.exports = function (options) {
  let defaults = {
    enabled: true,
    savePath: path.join(process.cwd(), 'http-replay-dump.json')
  }
  options = options || {}
  let config = assign({}, defaults, options)

  if (!config.enabled) {
    return function*(next) {
      yield *next
    }
  }


  let store = new Store(config.savePath)

  process.on('exit', function() {
    store.flush()
  })

  return function* http_replay(next) {
    yield *next;
    store.add({
      req: this.request,
      res: {
        body: this.body,
        status: this.status
      }
    })
  }
}


if (!module.parent) {
  let s = new Store(path.join(process.cwd(), './http-replay-dump.json'))
  s.add({
    test: 1
  })
  s.flush()
}
