'use strict'


const path = require('path')

const should = require('should')

const request = require('supertest')
const server = require('./server')

describe('dump', function() {
  it('should dump get', function(done) {
    request(server).get('/')
    .expect('Hello.', done)
  })

  it('should dump post', function(done) {
    request(server).post('/')
    .expect('Hello.', done)
  })

  it('should dump put', function(done) {
    request(server).put('/')
    .expect('Hello.', done)
  })

  it('should dump delete', function(done) {
    request(server).delete('/')
    .expect('Hello.', done)
  })

  it('should get data dumped', function(done) {
    let entity = require(path.join(process.cwd(), 'http-replay-dump.json'))
    entity.forEach(function(e) {
      e.should.have.property('req')
      e.should.have.property('res')
    })
    done()
  })
})

describe('test', function() {
  it('should work', function(done) {
    let tester = require('..').test
    let errors = []
    tester({server: server, savePath: path.join(process.cwd(), './test/data/http-replay-dump.json')}).forEach(function(tester) {
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
