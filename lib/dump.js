'use strict'

const path = require('path')
const fs = require('fs')
const assign = require('object-assign')

const debug = require('debug')('http-replay:dump')



function Store(savePath) {
  this.savePath = savePath
  if (fs.existsSync(savePath)) {
    try {
      debug('not init')
      this.entity = require(savePath)
    } catch (e) {
      debug('init')
      this.entity = []
    }
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
  let store = new Store(config.savePath)

  process.on('exit', function() {
    store.flush()
  })

  return function* http_replay(next) {
    yield *next;
    if (config.enabled) {
      store.add({
        req: this.request,
        res: {
          body: this.body,
          status: this.status
        }
      })
    }
  }
}
