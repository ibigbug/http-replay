'use strict'

const path = require('path')
const fs = require('fs')
const assign = require('object-assign')
const Stream = require('stream')

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

Store.prototype.flush = function(verbose) {
  fs.writeFileSync(this.savePath, JSON.stringify(this.entity, null, verbose ? 2 : 0))
}


module.exports = function (options) {
  let defaults = {
    enabled: true,
    savePath: path.join(process.cwd(), 'http-replay-dump.json'),
    bypassStatic: true,
    verbose: true
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
    console.info('Flushing data...')
    store.flush(config.verbose)
  })

  process.on('SIGINT', function() {
    console.info('Got SIGINT signal')
    process.exit()
  })

  return function* http_replay(next) {
    yield *next;

    let STATIC_PATH_SUFFIX_RE = /\.(css|less|js|jpg|png|svg|ico)$/g

    if (STATIC_PATH_SUFFIX_RE.test(this.request.url)) {
      if (config.bypassStatic) {
        console.info(`Bypassed url ${this.req.url} by rule [bypassStatic]`)
        return 
      }
    }

    console.info(`Dumping one request... [${this.req.method}] ${this.req.url}... [Done]`)
    let entity = {
      req: this.request,
      res: {
        type: this.type,
        status: this.status,
        body: this.body || this.message
      }
    }
    console.log(this.type)

    saveEntity(entity)

  }

  function saveEntity(entity) {

    if (entity.res.body instanceof Stream) {
      let s = ''
      entity.res.body.on('data', function(chunk) {
        s += chunk
      })
      entity.res.body.on('end', function() {
        entity.res.body = s
        store.add(entity)
      })

      return
    }

    if (Buffer.isBuffer(entity.res.body)) {
      entity.res.body = entity.res.body.toString()
    }

    store.add(entity)
  }
}


if (!module.parent) {
  let s = new Store(path.join(process.cwd(), './http-replay-dump.json'))
  s.add({
    test: 1
  })
  s.flush()
}
