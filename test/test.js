var request = require('supertest')
var server = require('./server')

describe('test', function() {
  it('should work', function(done) {
    request(server).get('/')
    .expect('Hello.', done)
  })
})
