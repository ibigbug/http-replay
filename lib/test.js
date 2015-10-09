var fs = require('fs')
var path = require('path')

var supertest = require('supertest')
var assign = require('object-assign')


var defaults = {
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

  let server = config.server
  supertest()
}
