'use strict'

var path = require('path')
var fs = require('fs')
var assign = require('object-assign')


function Store(savePath) {
  this.savePath = savePath
  if (fs.existsSync(savePath)) {
    try {
      this.entity = require(savePath)
    } catch (e) {
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
  var defaults = {
    enabled: true,
    savePath: path.join(process.cwd(), 'http-replay-dump.json')
  }
  options = options || {}
  var config = assign({}, defaults, options)
  var store = new Store(config.savePath)

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
          statue: this.status
        }
      })
    }
  }
}
