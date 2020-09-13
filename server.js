var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
 
var players = {};
var colors = ['black', 'white']
var player_count = 0;


// Use current directory as static folder
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) 
{
  if(player_count < 2)
  {
    console.log('a user connected');
    // console.log('Players joined so far:', players.length)
    
    // create a new player and add it to our players object
    players[socket.id] = {
      position: 0,
      playerId: socket.id,
      color: colors[player_count], // pick the color for this player from the colors array
      is_active: (player_count === 0) // Only first player is active at first
    };

    console.log('Players joined so far: ', player_count)
    console.log('Players : ', players)

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    
    player_count += 1; // Increment player count
  }
  
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    player_count -= 1; 
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (pos) {
    players[socket.id].position = pos;
    players[socket.id].is_active = 0;

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

});


server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});