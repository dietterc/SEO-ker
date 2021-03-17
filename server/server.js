  
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()


//list of active lobbies
var activeGameLobbies = [];
//assign player ID's based on an incrementing variable for now, will change to usernames later
var nextPlayerId = 0;


//----------objects----------
class Lobby {
  constructor(id) {
    this.players = [];
    this.lobbyId = id;
    this.host = ""; //blank if no host is set yet

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.players.length <= 30) { //changed to 30 for live demo
        this.players.push(player);
        player.lobbyId = this.lobbyId;
        console.log(player.displayName + ' joined lobby ' + this.lobbyId + ' (' + player.playerId + ')');
        console.log("Players now in lobby:");
        for(var i=0;i<this.players.length;i++) {
          console.log(this.players[i]);
        }

        //if they are the first to join set them as the host
        if(this.players.length == 1){
          this.host = player;
        }
      }
      else {
        console.log(player + ' cannot join the lobby, lobby is full')
      }
    }

    //remove player from this lobby
    this.leaveLobby = function (player) {
      var index = this.players.indexOf(player)
      this.players.splice(index, 1)
      console.log(player.displayName + ' left lobby ' + this.lobbyId + ' (' + player.playerId + ')')

      if(this.players.length != 0) {
        console.log("Players now in lobby:")
        for(var i=0;i<this.players.length;i++) {
          console.log(this.players[i])
        }
      }

      //if only one player remains set them to be the host
      if(this.players.length == 1) {
        this.host = this.players[0]
      }
      if(this.players.length == 0) {
        this.host = ""
      }

    }

    this.isConnected = function (playerId) {
      for(var i;i<this.players.length;i++) {
        if(this.players[i].playerId == playerId) {
          return true
        }
      }
    }
  }
}

class Player {
  constructor(id,displayName,socketId) {
    this.displayName = displayName;
    this.playerId = id;                //same as socket?
    this.socketId = socketId;
    this.lobbyId = ""          //the lobby they are connected to
  }
}

function generateCode() {
  var codeFound = false
  var code = "";

  while(!codeFound) {
    code = "";
    for(var i=0;i<6;i++) {
      r1 = Math.floor(Math.random() * 2);
      if(r1 == 0) {
        r2 = Math.floor(Math.random() * 10);
      }
      else {
        r2 = String.fromCharCode(Math.floor(Math.random() * 25) + 66);
      }
      code += r2
    }
    codeFound = true;
    for(var i=0;i<activeGameLobbies.length;i++) {
      if(activeGameLobbies[i].lobbyId == code) {
        codeFound = false;
      }
    }
  }

  return code;

}



//----------socket.io server-side----------
io.on('connection', (socket) => {

  console.log(socket.id + ' connected');

  /*
  args[0]: playerId
  args[1]: display name

  sends a join-lobby signal to the client who sent this
  */
  socket.on('host-lobby', (...args) => {
    var lobbyId = generateCode();
    
    player = new Player(nextPlayerId++,args[1],socket.id);
    lobby = new Lobby(lobbyId);
    lobby.joinLobby(player);
    activeGameLobbies.push(lobby);

    socket.emit("join-lobby", lobby);
    console.log("received host-lobby signal\nActive lobbies:");
    for(var i=0;i<activeGameLobbies.length;i++) {
      console.log(activeGameLobbies[i].lobbyId);
    }

  })

  /*
  args[0]: playerId
  args[1]: display name
  args[2]: lobby code
  */
  socket.on('join-lobby', (...args) => {

    lobby = null
    let code = args[2].toUpperCase().trim();

    for(var i=0;i<activeGameLobbies.length;i++) {
      if(activeGameLobbies[i].lobbyId == code) {
        lobby = activeGameLobbies[i];
      }
    }

    if(lobby == null) {
      console.log('Error, user' + args[1] + ' tried to join a non-existent lobby');
      socket.emit("lobby-not-found");
      return
    }

    player = new Player(args[0],"" + args[1],socket.id)  
    lobby.joinLobby(player)

    socket.emit("join-lobby", lobby);

    for(var i=0;i<lobby.players.length;i++) {
      if(lobby.players[i].playerId != args[0]) {
        io.to(lobby.players[i].socketId).emit("lobby-player-joined", lobby);
      }
    }

  })

  socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected');
      
      //find the lobby they were in
      for(var i=0;i<activeGameLobbies.length;i++) {
        for(var j=0;j<activeGameLobbies[i].players.length;j++) {
          if(activeGameLobbies[i].players[j].socketId == socket.id) {
            player = activeGameLobbies[i].players[j]
            lobby = activeGameLobbies[i]

            lobby.leaveLobby(player)

            for(var k=0;k<lobby.players.length;k++) {
              if(lobby.players[k].playerId != player.playerId) {
                if(lobby.players[k] != null && lobby.players[k].socketId != null) {
                  io.to(lobby.players[k].socketId).emit("lobby-player-left", lobby);
                }
              }
            }

            if(lobby.players.length == 0) {
              //code to shutdown lobby (remove any pointers to it, js should handle the rest)
              console.log("lobby " + lobby.lobbyId + " deleted")

              activeGameLobbies.splice(lobby, 1)
            }
            return
          }
        } 
      }
  })

    
});


nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res);
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`);
  })
})
