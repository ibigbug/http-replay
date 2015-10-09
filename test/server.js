'use strict'

var dump = require('..').dump
var http = require('http')
var koa = require('koa')

var app = koa()
app.use(dump())

app.use(function*() {
  this.body = 'Hello.'
})

module.exports = http.createServer(app.callback())

if (!module.parent) {
  module.exports.listen(8975)
}
