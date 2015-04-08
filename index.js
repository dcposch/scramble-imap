var EventEmitter = require('events').EventEmitter
var Imap = require('imap')
var inherits = require('util').inherits

/**
 * Wrapper around node-imap that simplifies handling different mail services.
 *
 * Translates IMAP 'boxes' (such as gmails '[Gmail]/All Mail') to Scramble boxes.
 *
 * Emits the following events:
 * * box (box)
 * * message ({attributes, bodyInfo, bodyInfo, numFetched})
 * * error (err)
 *
 * TODO: assumes Gmail for now
 */
module.exports = ScrambleImap

function ScrambleImap (options) {
  EventEmitter.call(this)
  this.imap = new Imap(options)
}
inherits(ScrambleImap, EventEmitter)

/**
 * Returns an IMAP connection to Gm
 */
ScrambleImap.createForGmail = function (user, password) {
  if (!/@gmail.com$/.test(user)) {
    user = user + '@gmail.com'
  }
  return new ScrambleImap({
    user: user,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  })
}

ScrambleImap.prototype.fetchAll = function () {
  var numFetched = 0
  console.time('fetchAll')
  var self = this
  var imap = this.imap

  imap.once('ready', function () {
    console.log('Connected...')

    imap.getBoxes(function (err, boxes) {
      if (err) return self.emit('error', err)
      console.log('Got boxes...')
      console.log(Object.keys(boxes['[Gmail]'].children))
    })

    imap.openBox('[Gmail]/All Mail', true, function (err, box) {
      if (err) return self.emit('error', err)

      self.emit('box', box)

      // Fetch all mail, from the beginning
      var f = imap.seq.fetch('1:*', {
        bodies: ''
      })
      f.on('message', function (msg, seqno) {
        var attrs, stream, info
        msg.on('attributes', function (a) {
          attrs = a
          if (stream) {
            writeMessage()
          }
        })
        msg.on('body', function (s, i) {
          stream = s
          info = i
          if (attrs) {
            writeMessage()
          }
        })

        function writeMessage () {
          numFetched++
          self.emit('message', {
            attributes: attrs,
            bodyStream: stream,
            bodyInfo: info,
            numFetched: numFetched
          })
          if (numFetched === box.messages.total) {
            console.timeEnd('fetchAll')
          }
        }
      })
      f.once('error', function (err) {
        console.error('Error fetching inbox: ' + err)
        self.emit('error', err)
      })
      f.once('end', function () {
        console.log('Done fetching inbox')
      })
    })
  })

  imap.once('error', function (err) {
    console.error(err)
    self.emit('error', err)
  })

  imap.once('end', function () {
    self.emit('error', 'Connection closed')
  })

  imap.connect()
}

ScrambleImap.prototype.disconnect = function () {
  this.imap.disconnect()
}
