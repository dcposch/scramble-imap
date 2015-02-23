var ScrambleImap = require('./index.js')
var fs = require('fs')
var util = require('util')
var mkdirp = require('mkdirp')
var readlineSync = require('readline-sync')
var ProgressBar = require('progress')

console.log('Welcome to scramble-imap')
console.log('This example downloads all your email from Gmail to a folder')
console.log('(If you have 2FA enabled, go to https://www.google.com/accounts/b/0/ManageAccount > ' +
    'Authorizing > Generate an app-specific password to get an IMAP password.)')
var gmailUser = readlineSync.question('Gmail username: ')
var gmailPassword = readlineSync.question('Password: ')
var outputDir = gmailUser

// Connect to Gmail IMAP and start downloading all mail
var imap = ScrambleImap.createForGmail(gmailUser, gmailPassword)
var progressBar
var outputStream
imap.fetchAll()

// Once we successfully connect, show a progress bar
imap.on('box', function (box) {
  console.log('Got All Mail box...')
  console.log(util.inspect(box))
  console.log('Starting download. You probably want to let this run overnight!')
  progressBar = new ProgressBar('Fetching All Mail [:bar] :current/:total :etas', {
    total: box.messages.total,
    width: 50
  })
  mkdirp.sync(outputDir)
})

// For every message successfully downloaded, save it to a file and increment the progress bar
imap.on('message', function (msg) {
  progressBar.tick()

  var gmailMsgId = msg.attributes['x-gm-msgid']
  // var gmailThrId = msg.attributes['x-gm-thrid']
  var uid = gmailMsgId || msg.attributes.uid

  outputStream = fs.createWriteStream(outputDir + '/' + uid + '.txt')
  msg.bodyStream.pipe(outputStream)
})

// Once we're done, wait for the last file to finish saving, then exit successfully
imap.once('done', function () {
  console.log('Finished downloading mail for ' + gmailUser)
  outputStream.on('close', function () {
    process.exit(0)
  })
})

// On error, exit unsuccessfully
imap.once('error', function (err) {
  console.log(err)
  process.exit(1)
})
