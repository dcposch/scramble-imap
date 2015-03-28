scramble-imap
====

### Try it out

Clone the repo, then run

    npm install
    node example.js

This will take Gmail credentials, then connect via IMAP and download *all* your mail to a folder. For my ~13GB inbox, it took about an hour.
Then, you can see what raw email looks like (not pretty). Grep it, load it, paste it, save it and so on.

### Downloading mail with `scramble-imap`

    var imap = require('scramble-imap').createForGmail('bob', 'iforgot')
    imap.fetchAll()
    imap.on('message', function(msg){
      console.log("Downloading: " + msg.attributes['subject'])
      msg.bodyStream.stream(myFile)
    })

### Using `node-imap` directly

    var imap = require('node-imap')({
      user:'bob@gmail.com',
      password:'iforgot',
      host:'imap.gmail.com',
      port:993,
      tls:true
    })
    imap.connect()
    imap.once('ready', function(){
      imap.openBox('[Gmail]/All Mail', true, function(err, box) {
        ... etc


### Methods

#### Constructor

Takes the same as options object as `node-imap`. 

#### `ScrambleIMAP.createForGmail(email, password)`

Helper to connect to gmail account more easily.

The first parameter can be either a username (eg 'bob') or an email ('bob@gmail.com').

Returns a ScrambleIMAP connection.

#### `fetchAll()`

Asynchronously tries to connect to the IMAP server and download all messages.

Useful for initial account syncing. Guaranteed to fire either the `box` event or `error`.


### Events

#### box

Fires when we've successfully connected to the IMAP server and gotten back a box listing. A box might be an inbox, all mail, sent mail, and so on.

#### message

Fires after each message successfully downloaded.

#### error

Fires on any kind of error. For example: when the IMAP server is unreachable, when the login credentials are rejected by the server, or if the connection dies while downloading mail.

