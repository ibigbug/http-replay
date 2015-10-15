http-replay
------

> A simple http dump-replay tool for testing koa-based apps.


## Install

    `$ npm instal http-replay --save-dev`

## Usage

### Dump

```js

const dump_request = require('http-replay').dump

app.use(dump_request({
  enabled: DEBUG_MODE,
  bypassStatic: true
}))


```

### Testing with supertest

```js

let server = require('./app')
let tester = require('http-replay').test

describe('Application', function() {
  this.timeout(10000)

  it('should replay requests', function(done) {

    tester({
      server: server,
      savePath: path.join(process.cwd(), 'http-replay-dump.json'),
      fuzzyHtml: false
    }).promise.then(function(results) {
      let errs = results.filter(function(e){ return e.err })
      if (errs.length) {
        done(new Error(errs.map(function(e){ return `Path: ${e.res.req.path} \t ${e.err}`}).join('\n')))
      } else {
        done()
      }
    })

  })
})

```


## Options

### Dump

* enabled - Bool
* savePath - String, path to save dump data
* bypassStatic - Bool, Bypath static file or not
* verbose: Bool, pretty print dump data or not


### Test

* savePath - String, where your dump data stores
* fuzzyHtml - String, fuzzy expect(body) when Content-Type is `html`


## License

MIT
