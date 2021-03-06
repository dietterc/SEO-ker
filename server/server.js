//import { connectToDatabase } from "../../util/mongodb"

//const connectToDatabase = require("../util/mongodb").connectToDatabase
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()


//list of active lobbies
var activeLobbies = []
//List of active games
var activeGames = []

//assign player ID's based on an incrementing variable for now, will change to usernames later
var nextPlayerId = 1
const lobbyCards = 1000


//----------objects----------
class Lobby {
  constructor(id) {
    this.players = []
    this.readyPlayers = 0
    this.lobbyId = id
    this.host = "" //blank if no host is set yet
    this.isInGame = false
    this.cardsList = []

    asyncGetCards(lobbyCards).then(data => this.cardsList = data).then(() => io.to(this.lobbyId).emit('cards-set'))
    

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.isJoinable()) {

        this.players.push(player)
        player.lobbyId = this.lobbyId

        //if they are the first to join set them as the host
        if(this.players.length == 1){
            this.host = player;
            io.to(this.host.socketId).emit('promote-to-host');
        }
        return true
      }
      else {
        console.log(player.displayName + ' cannot join the lobby, lobby is full')
        return false
      }
    }

    //remove player from this lobby
    this.leaveLobby = function (player) {
        var index = this.players.indexOf(player)
        if (this.host == player && this.players.length > 1) {
            if (index == 0) {
                this.host = this.players[index + 1]
            } else {
                this.host = this.players[0]
            }
            io.to(this.host.socketId).emit('promote-to-host');
            asyncGetCards(lobbyCards).then(data => this.cardsList = data).then(() => io.to(this.lobbyId).emit('cards-set'))
        }
      this.players.splice(index, 1)

      if(this.players.length == 0) {
        this.host = ""
      }

    }

    this.isJoinable = function() {
      return this.players.length < 8 && !this.isInGame
    }
    

    this.isConnected = function (player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].playerId === player.playerId) {
                return true
            }
        }
        return false
    }
  }
}

class Player {
  constructor(id,displayName,socketId, startingChips) {
    this.displayName = displayName
    this.playerId = id           //this is the player id, (0,1,,2,3,4....) that identifies them uniquely.
    this.socketId = socketId  //this is the socket id for the player.
    this.lobbyId = ""          //the lobby they are connected to
    this.cards = []
    this.chips = startingChips 
    this.index = ""
    this.image = ""
    this.lastBet = 0
  }
}

class Card {
  constructor(searchString,searchValue) {
    this.searchString = searchString
    this.searchValue = searchValue
  }
}

class GameInfo {
  constructor(id, activePlayer, potAmount, dealer) {
    this.id = id
    this.activePlayer = activePlayer
    this.betAmount = 0
    this.activeCard = null
    this.potAmount = potAmount
    this.dealer = dealer
  }
}

class Game {
  constructor(id,players,cardsList, startingChips) {
    this.id = id
    this.players = players
    this.dealerIndex = Math.floor(Math.random() * this.players.length)
    this.dealer = players[this.dealerIndex]
    this.activePlayerIndex = (this.dealerIndex + 1) % this.players.length //player to the "left" ..or right?
    this.activePlayer = this.players[this.activePlayerIndex]
    this.potAmount = 0
    this.startingChips = startingChips

    this.activeTurns = []
    
    //for giving out cards
    this.allCards=cardsList
    this.cardsIndex = 0
    //our current index in the above list
    //Populate the list of all cards 

    
    //-----functions-----


    this.startGame = function() {
      let gameInfo = new GameInfo(this.id,this.activePlayer,this.potAmount,this.dealer)
      io.to(this.id).emit("start-turn", gameInfo)
    }

    this.removePlayer = function(player) {
      var index = this.players.indexOf(player)


      this.players.splice(index, 1)

      if(index == this.dealerIndex) {
        if(index == this.players.length) {
          this.dealerIndex = 0;
        }
        this.dealer = this.players[this.dealerIndex]

        if(index == this.activePlayerIndex) {

          endRound(this)

        }
      }

      if(index == this.activePlayerIndex) {
        if(index == this.players.length) {
          this.activePlayerIndex = 0;
        }
        this.activePlayer = this.players[this.activePlayerIndex]
      }
      io.to(this.id).emit("game-player-left", this.players, this.dealer, this.activePlayer)
    }

    //get three unique cards from allCards
    this.getCards = function() {
      let hand = [] //the 'hand' of cards to give out

      //check if there are enough cards to give out
      //convert to for loop?
      if(this.cardsIndex + 3 <= this.allCards.length) {
        hand.push(this.allCards[this.cardsIndex])
        hand.push(this.allCards[this.cardsIndex + 1])
        hand.push(this.allCards[this.cardsIndex + 2])
        this.cardsIndex += 3
      }
      else {
        this.cardsIndex = 0;

        hand.push(this.allCards[this.cardsIndex])
        hand.push(this.allCards[this.cardsIndex + 1])
        hand.push(this.allCards[this.cardsIndex + 2])
        this.cardsIndex += 3
      }

      if(hand.length != 0) {
        return hand
      }
      else {
        return null
      }
    }

    this.dealCards = function(){
      for(let i = 0; i< this.players.length; i++){
        if(this.players[i].chips > 0){
          let newHand = []
          newHand = this.getCards()
          this.players[i].cards = newHand
          var playerSocket = this.players[i].socketId
          io.to(playerSocket).emit('set-cards', this.players[i].cards)
        }
      }
    }

    this.resetLastBets = function() {
      for(let i = 0; i< this.players.length; i++){
        this.players[i].lastBet = 0;
      }
    }

    //pass true if its the beginning of the next round and the 
    //next active player is the player after the dealer
    this.getNextActivePlayer = function(isNewRound){
      if( isNewRound ){
        this.activePlayerIndex = this.dealerIndex
      }
      do {this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length}
      while( this.players[this.activePlayerIndex].chips == 0 )
  
      this.activePlayer = this.players[this.activePlayerIndex]
    }

    this.getNextDealer = function(){
      do {this.dealerIndex = (this.dealerIndex + 1) % this.players.length}
      while( this.players[this.dealerIndex].chips == 0 )
  
      this.dealer = this.players[this.dealerIndex]
    }

    this.chooseWinners = function(){

      let highestCard = new Card("null",-1);

      let winningTurns = []

      for(let i=0;i<this.activeTurns.length;i++) {
        if(parseInt(this.activeTurns[i].card.searchValue) > parseInt(highestCard.searchValue)) {
          highestCard = this.activeTurns[i].card
          winningTurns = [this.activeTurns[i]]
        }
        else if(this.activeTurns[i].card.searchValue == highestCard.searchValue){
          winningTurns.push(this.activeTurns[i])
        }
      }

      return winningTurns;
    }

    this.playTurn = function(turn){
      this.activeTurns.push(turn)
    }

    this.getTurns = function(){
     return this.activeTurns;
    }

    this.resetPot = function(){
      this.potAmount = 0 //reset the pot for next round
    }

    this.resetTurns = function(){
      this.activeTurns = []
    }
  }
}

// This array is used to expose functions and classes for testing
let moduleExports = {}
moduleExports.generateCode = function () {
  var codeFound = false
  var code = ""

  while(!codeFound) {
    code = ""
    for(var i=0;i<6;i++) {
      r1 = Math.floor(Math.random() * 2);
      if(r1 == 0) {
        r2 = Math.floor(Math.random() * 10);
      }
      else {
        r2 = String.fromCharCode(Math.floor(Math.random() * 25) + 66)
      }
      code += r2
    }
    codeFound = true;
    for(var i=0;i<activeLobbies.length;i++) {
      if(activeLobbies[i].lobbyId == code) {
        codeFound = false
      }
    }
  }

  return code

}

moduleExports.findGame = function (code, activeGames){
  for(var i=0;i<activeGames.length;i++) {
    if(activeGames[i].id == code) {
      return activeGames[i]
    }
  }
  return null
}

function findLobby(code, activeLobbies){
  for(var i=0;i<activeLobbies.length;i++) {
    if(activeLobbies[i].lobbyId == code) {
      return activeLobbies[i]
    }
  }
  return null
}

function endRound(game) {
  let winners = game.chooseWinners()
  console.log(winners)
  let lastPlayerStanding = false

  winners.forEach(winner => {
    winner.player.chips += Math.floor(game.potAmount / winners.length) //split the pot between all winners 
    io.to(winner.player.socketId).emit("set-chips", winner.player.chips)
  })

  //check if only one player with chips remains.
  let pwc = 0; //players with chips
  for(let i=0;i<game.players.length;i++) {
    if(game.players[i].chips != 0) {
      pwc += 1
    }
  }
  if(pwc == 1) {
    lastPlayerStanding = true
  }

  let turns = game.getTurns()

  //if only one player remains send a slightly different round-over message (last param = true)
  io.to(game.id).emit("round-over", turns, winners, game.potAmount, lastPlayerStanding);

  game.resetPot()
  game.resetTurns()

  //have to do this to update the chips on the client side
  io.to(game.id).emit("update-players", game.players)
}

// for testing purposes
moduleExports.createLobby = function (id) {
    return new Lobby(id)
}

moduleExports.createPlayer = function (id, displayName, socketId) {
    return new Player(id, displayName, socketId, 0)
}

moduleExports.createGame = function (id, players, cards, startingChips) {
    return new Game(id, players, cards, startingChips)
}

moduleExports.createCard = function (searchString, searchValue) {
    return new Card(searchString, searchValue)
}
//----------socket.io server-side----------
io.on('connection', (socket) => {

  console.log(socket.id + ' connected')

  socket.on('host-lobby', (...args) => {
    var lobbyId = moduleExports.generateCode();
    
    player = new Player(nextPlayerId++,args[1],socket.id, 0);
    lobby = new Lobby(lobbyId)
    lobby.joinLobby(player)
    activeLobbies.push(lobby)

    socket.emit("join-lobby", lobby, player.playerId);
    socket.join(lobbyId)
    console.log("Active lobbies:")
    for(var i=0;i<activeLobbies.length;i++) {
      console.log(activeLobbies[i].lobbyId)
    }

  })

  socket.on('join-lobby', (...args) => {

    let code = args[2].toUpperCase().trim()
    lobby = findLobby(code, activeLobbies)

    if(lobby == null) {
      console.log('Error, user' + args[1] + ' tried to join a non-existent lobby')
      socket.emit("lobby-not-found")
      return
    }

    player = new Player(nextPlayerId++,"" + args[1],socket.id, 0)  
    if(lobby.joinLobby(player)){
      socket.emit("join-lobby", lobby, player.playerId)
    
      socket.join(lobby.lobbyId) 
      io.to(lobby.lobbyId).emit("lobby-player-joined", lobby)
      console.log(args[1] + " joined lobby " + lobby.lobbyId)
    }
    else{
      socket.emit("lobby-full")
    }
   

  })

  socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected');
      
      //first check if they were in an active game:
      for(var i=0;i<activeGames.length;i++) {
        for(var j=0;j<activeGames[i].players.length;j++) {
          if(activeGames[i].players[j].socketId == socket.id) {

            player = activeGames[i].players[j]
            game = activeGames[i]
            game.removePlayer(player)
            if(game.players.length == 0){
              activeGames.splice(i, 1)
              console.log("game "+game.id+" deleted")
            }
            break;
            //message 'game-player-left' sent in above method

          }
        }
      }

      //if not in an active game, 
      //find the lobby they were in
      for(var i=0;i<activeLobbies.length;i++) {
        for(var j=0;j<activeLobbies[i].players.length;j++) {
          if(activeLobbies[i].players[j].socketId == socket.id) {
            player = activeLobbies[i].players[j]
            lobby = activeLobbies[i]

            lobby.leaveLobby(player)

            io.to(lobby.lobbyId).emit("lobby-player-left", lobby)

            if(lobby.players.length == 0) {
              //code to shutdown lobby (remove any pointers to it, js should handle the rest)
              console.log("lobby " + lobby.lobbyId + " deleted")

              activeLobbies.splice(lobby, 1)
            }
            return
          }
        } 
      }
      
  })

  socket.on('host-started-game', (lobbyId, startingChips) => {
    let code = lobbyId.toUpperCase().trim()
    lobby = findLobby(code, activeLobbies)

    io.to(lobby.lobbyId).emit("host-started-game", lobby.lobbyId)

    lobby.isInGame = true;
    for(var i = 0; i<lobby.players.length; i++){

        lobby.players[i].index = i+1;
        lobby.players[i].image = "/PlayerImages/poker"+ (i+1) + ".png"
        console.log(lobby.players[i].image)
    }

    var game = new Game(lobby.lobbyId,lobby.players, lobby.cardsList, startingChips)
    
    activeGames.push(game)
  });


  socket.on('player-joined-game', (lobbyId, playerId) => {
    if(lobbyId == null || playerId == null) {
      return
    }
    let code = lobbyId.toUpperCase().trim()

    var game = moduleExports.findGame(code, activeGames)
    if(game == null) {
      return
    }

    var cards = game.getCards()

    //socket refreshes on page change, so assign that player their new socket.id 
    //hand them new cards and chips too for sick optimization
    for(var i=0;i<game.players.length;i++) {
      if(game.players[i].playerId == playerId){
        game.players[i].socketId = socket.id
        game.players[i].cards = cards
        game.players[i].chips = game.startingChips
        break
      }
    }


    //subscribe the socket to the room called lobbyId
    socket.join(lobbyId)

    //send them their cards and chips


    socket.emit("set-cards", cards)
    socket.emit("set-chips", game.startingChips)

    //send everyone in the room an updated list of players
    io.to(lobby.lobbyId).emit("update-players", game.players )

    lobby.readyPlayers += 1
    if(lobby.players.length == lobby.readyPlayers) {
      //all players have joined, start the game for this lobby.
      game.startGame()
    }
  });

  socket.on('turn-played', (gameInfo) => {

    game = moduleExports.findGame(gameInfo.id, activeGames);

    if(game == null) {
      console.log("turn played for non existing game " + gameInfo.id)
      return
    }
    
    if(gameInfo.activeCard != null) {
      console.log(game.activePlayer.displayName + " played "+ gameInfo.activeCard.searchString+" for game " + gameInfo.id)
    }

    //subtract their bet from their chips
    if(gameInfo.betAmount <= game.activePlayer.chips){
      game.activePlayer.chips -= parseInt(gameInfo.betAmount)
      socket.emit("set-chips", game.activePlayer.chips) //tell the client to update chip amount
      game.activePlayer.lastBet = parseInt(gameInfo.betAmount)  
    }
    else{
      console.log(game.activePlayer+" bet "+gameInfo.betAmount+" chips when they had "+game.activePlayer.chips)
      socket.emit("invalid-bet")
    }
    
    //update active cards and the pot
    if(gameInfo.activeCard != null) {
      let turn = {
        player: game.activePlayer,
        card: gameInfo.activeCard
      }
      game.playTurn(turn)
      game.potAmount += parseInt(gameInfo.betAmount)
    }

    //check if it was the dealers turn, if true then the round is over and winners are chosen
    if(game.activePlayerIndex == game.dealerIndex) {
      endRound(game)
    }
    else {
      game.getNextActivePlayer(false); 
      
      gameInfo.activePlayer = game.activePlayer
      gameInfo.betAmount = 0
      gameInfo.activeCard = null
      gameInfo.potAmount = game.potAmount
      //have to do this to update the chips on the client side
      
      io.to(game.id).emit("update-players", game.players)
      io.to(game.id).emit("start-turn", gameInfo)
    }

  });

  socket.on('next-round', (gameId) => {

    game = moduleExports.findGame(gameId, activeGames);
  
    io.to(gameId).emit("restart-round")

    game.getNextDealer()

    game.getNextActivePlayer(true)

    game.dealCards()

    game.resetLastBets()

    gameInfo = new GameInfo(gameId, game.activePlayer, 0, game.dealer)
    //have to do this to update the chips on the client side
    io.to(gameId).emit("update-players", game.players)
    io.to(gameId).emit("start-turn", gameInfo)
  });

  socket.on('return-to-lobby', (gameId) => {

    
    game = moduleExports.findGame(gameId, activeGames)
    
    //delete the old game and lobby
    activeGames.splice(game, 1)
    

    //create a new lobby
    var lobbyId = moduleExports.generateCode()
    lobby = new Lobby(lobbyId)
    activeLobbies.push(lobby)

    socket.join(lobbyId)
    console.log("Active lobbies:")
    for(var i=0;i<activeLobbies.length;i++) {
      console.log(activeLobbies[i].lobbyId)
    }

    io.to(gameId).emit("move-to-homepage",lobbyId)
  });
});

// database connection 
//uses an internal API call to get numCards.
async function asyncGetCards(numCards){
  const response = await fetch(`http://localhost:${port}/api/cards`)
  const json = await response.json()

  let indexes = [] // array for making sure there are no duplicates
  let cards = [] // list to store cards in

    for(var i=0; i< numCards;i++){ //loop numCards times
      var dupe = false
       
        do{ //do while loop - while dupe is true
        var randomCard = Math.floor(Math.random()*json.length)

        dupe = false;
          //loop through all cards already chosen, check their index, if it's a match, set dupe to true
          for(var j = 0; j < indexes.length && !dupe ; j++){ 
            if(indexes[j]==randomCard){
              dupe = true
            }
          }
        }while(dupe)

        //just in case
        if(dupe){
          console.log("error, dupe is true")
        }
        //add succesful random index to indexes list
      indexes.push(randomCard);
        //push new cards to database
      cards.push(new Card(json[randomCard].searchString, json[randomCard].searchValue))
    }
  return cards
}


nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

module.exports = moduleExports;
