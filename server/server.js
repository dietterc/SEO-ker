  
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
    this.lobbyId = id //0 if not made yet?
    this.host = "" //blank if no host is set yet

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.players.length <= 8) {
        this.players.push(player)
        console.log(player.displayName + ' joined the lobby (' + player.playerId + ')')
        
        //if they are the first to join set them as the host
        if(this.players.length == 1){
          this.host = player
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
      console.log(player.displayName + ' left the lobby (' + player.playerId + ')')

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
  constructor(id,displayName) {
    this.displayName = displayName
    this.playerId = id
    this.chips = 0
    this.cards = []
    this.activeCard = "" //the card they have played for the round

    //set the played card as active and subtract the bet amount from chips
    this.playCard = function (card,bet) {
      this.activeCard = card
      this.chips -= bet
    }
  }
}

class Game {
  constructor(id,players) {
    this.id = id
    this.players = players
    this.cards = []
    this.dealer = players[Math.floor(Math.random() * this.players.length)]
    this.potValue = 0
    this.activePlayerIndex = players.indexOf(this.dealer)
  }
}



//just one game lobby for now
const gameLobby = new Lobby(1)
const gameList = []

// socket.io server
io.on('connection', (socket) => {
  var player = new Player(socket.id,"Default name")

  gameLobby.joinLobby(player)
  socket.emit("client-connection", gameLobby);
  socket.broadcast.emit("client-connection", gameLobby);

  socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected');
      if(gameLobby.isConnected(socket.id)) {
        gameLobby.leaveLobby(socket.id)
        socket.broadcast.emit("client-disconnect", gameLobby);
      }
  })

  socket.on('request-start-game', (...args) => {
    if(args[0] != gameLobby.lobbyId) {
      console.log('error, no lobby given');
      return
    }

    console.log('Starting game for lobby ' + args[0]);
    game = new Game(args[0],gameLobby.players)
    gameList.push(game)

    socket.emit("game-start", game);
    socket.broadcast.emit("game-start", game);

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
