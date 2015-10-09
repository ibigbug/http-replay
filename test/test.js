'use strict'


const request = require('supertest')
const server = require('./server')

describe('dump', function() {
  it('should work', function(done) {
    request(server).get('/')
    .expect('Hello.', done)
  })
})

describe('test', function() {
  it('should work', function(done) {
    let tester = require('..').test
    let errors = []
    tester({server: server}).forEach(function(tester) {
      errors.push(new Promise(function(resolve) {
        tester.end(function(err) {
          if (err) {
            resolve(err)
          } else {
            resolve(null)
          }
        })
      }))
    })

    Promise.all(errors).then(function(errs) {
      errs = errs.filter(function(e){ return e})
      if (errs.length) {
        done(new Error(errs.join('\n')))
      } else {
        done()
      }
    })
  })
})
