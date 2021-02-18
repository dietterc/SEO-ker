  
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

// game objects/stuff

class Lobby {
  constructor(id) {
    this.players = []
    this.lobby_id = id //0 if not made yet?

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.players.length <= 8) {
        this.players.push(player)
        console.log(player + ' joined the lobby')
      }
      else {
        console.log(player + ' cannot join the lobby, lobby is full')
      }
    }

    //remove player from this lobby
    this.leaveLobby = function (player) {
      var index = this.players.indexOf(player)
      this.players.splice(index, 1)
      console.log(player + ' left the lobby')
    }
  }
}

//just one game lobby for now
const gameLobby = new Lobby(1)


// socket.io server
io.on('connection', (socket) => {
  console.log('connection');
  gameLobby.joinLobby(socket.id)
  socket.broadcast.emit("client-connection", gameLobby);


  socket.on('disconnect', () => {
      console.log('client disconnected');
      gameLobby.leaveLobby(socket.id)
      socket.broadcast.emit("client-connection", gameLobby);
  })
});


nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
