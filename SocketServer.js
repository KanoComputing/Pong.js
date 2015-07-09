var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './examples', 'player-vs-player.html'));
});

app.get('/build/Pong.js', function (req, res) {
  res.sendFile(path.join(__dirname, './build', 'Pong.js'));
})

app.get('/styles.css', function (req, res) {
  res.sendFile(path.join(__dirname, './examples', 'styles.css'));
})

app.get('/fonts/8-bit_wonder-webfont.woff', function (req, res) {
  res.sendFile(path.join(__dirname, './examples', 'styles.css'));
});

app.get('/fonts/8-bit_wonder-webfont.ttf', function (req, res) {
  res.sendFile(path.join(__dirname, './examples', 'styles.css'));
});

io.on('connection', function (socket) {

  socket.on('game-start', function (data) {
    if (data.started) {
      socket.emit('game-started')
    } else {
      socket.emit('game-ended')
    }
  });

  socket.emit('p2-connected', {p2: 'connected'})
    socket.on('pad-movement', function (data) {
      socket.emit('p2-pad-update', {} )
    });

  socket.on('ball-movement', function (data) {
    socket.sockets.emit('ball-update', {})
  })
});
