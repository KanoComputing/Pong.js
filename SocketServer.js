var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);

// Add headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

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

io.sockets.on('connection', function (socket) {
  console.log('A user has connected!', socket.id)

  socket.on('disconnect', function () {
    console.log('A user has disconnected!', socket.id)
  })

  // Game start/reset event
  socket.on('game-start', function (data) {
    if (data.started) {
      io.emit('game-started')
      console.log('The game has started.', socket.id)
    } else {
      io.emit('game-ended')
      console.log('The game has ended.', socket.id)
    }
  });

  // Game score update event
  socket.on('update-score', function (data) {
    io.emit('p2-update-score', {
      player1: data.player1,
      player2: data.player2
    })
  })

  // Pad position pdate event
  socket.on('pad-movement', function (data) {
    if (data.currentPlayer === 'player1') {
      io.emit('p1-pad-update', {
        position: data.position
      })
    } else {
      io.emit('p2-pad-update', {
        position: data.position
      })
    }
  });

  // Ball position update
  socket.on('ball-movement', function (data) {
    io.emit('ball-update', {
      position: data.position
    })
  })
});
