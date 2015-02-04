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

