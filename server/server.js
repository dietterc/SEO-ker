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
var activeLobbies = [];
//List of active games
var activeGames = [];

//assign player ID's based on an incrementing variable for now, will change to usernames later
var nextPlayerId = 0;

const startingChips = 1000;


//----------objects----------
class Lobby {
  constructor(id) {
    this.players = [];
    this.readyPlayers = 0;
    this.lobbyId = id;
    this.host = ""; //blank if no host is set yet
    this.isInGame = false;

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.isJoinable()) {

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
        return true;
      }
      else {
        console.log(player + ' cannot join the lobby, lobby is full')
        return false;
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
  
    this.isJoinable = function() {
      return this.players.length <= 8 && !this.isInGame; 
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
    this.cards = []
    this.originalCards = []
    this.chips = startingChips 

    asyncGetCards(3).then(data => {this.cards = data})

  }
}

class Card {
  constructor(searchString,searchValue) {
    this.searchString = searchString;
    this.searchValue = searchValue;
  }
}

class GameInfo {
  constructor(id, activePlayer, potAmount, dealer) {
    this.id = id;
    this.activePlayer = activePlayer;
    this.betAmount = 0;
    this.activeCard = null;
    this.potAmount = potAmount;
    this.dealer = dealer;

  }
}

class Game {
  constructor(id,players) {
    this.id = id;
    this.players = players;
    this.dealerIndex = Math.floor(Math.random() * this.players.length)
    this.dealer = players[this.dealerIndex];
    this.activePlayerIndex = (this.dealerIndex + 1) % this.players.length; //player to the "left" ..or right?
    this.activePlayer = this.players[this.activePlayerIndex];
    this.potAmount = 0;
    this.activeCards = []; //the cards currently played
    
    //for giving out cards
    this.playersCards = [];
    this.cardsIndex = 0;
    
    for(let i=0;i<this.players.length;i++) {

        
        this.playersCards.push(this.players[i].cards)
    }

    //-----functions-----
    //Returns the highest card in activeCards
    //needs to check for dupes
    this.chooseWinningCard = function() {
      let highestCard = new Card("null",-1);

      for(let i=0;i<this.activeCards.length;i++) {
        if(this.activeCards[i].searchValue > highestCard.searchValue) {
          highestCard = this.activeCards[i]
        }
      }
      return highestCard;
    }

    this.startGame = function() {
      let gameInfo = new GameInfo(this.id,this.activePlayer,this.potAmount,this.dealer)
      io.to(this.id).emit("start-turn", gameInfo);
    }

    this.removePlayer = function(player) {
      var index = this.players.indexOf(player)
      this.players.splice(index, 1)

      if(index == this.dealerIndex) {
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length
        this.dealer = this.players[this.dealerIndex];
      }

      if(index == this.activePlayerIndex) {
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length
        this.activePlayer = this.players[this.activePlayerIndex];
      }
      io.to(this.id).emit("game-player-left", this.players, this.dealer, this.activePlayer);
    }

    this.getCards = function() {
      if(this.cardsIndex < this.playersCards.length) {
        this.players[this.cardsIndex].cards = this.playersCards[this.cardsIndex];
        for(let i=0;i<this.playersCards[this.cardsIndex].length;i++) {
          this.players[this.cardsIndex].originalCards.push(this.playersCards[this.cardsIndex][i].searchString)
          console.log(this.playersCards[this.cardsIndex][i].searchString)
        }
        return this.playersCards[this.cardsIndex++];
      }
      else {
        return null;
      }
    }
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
    for(var i=0;i<activeLobbies.length;i++) {
      if(activeLobbies[i].lobbyId == code) {
        codeFound = false;
      }
    }
  }

  return code;

}

function findGame(code, activeGames){
  for(var i=0;i<activeGames.length;i++) {
    if(activeGames[i].id == code) {
      return activeGames[i];
    }
  }
  return null
}

function findLobby(code, activeLobbies){
  for(var i=0;i<activeLobbies.length;i++) {
    if(activeLobbies[i].lobbyId == code) {
      return activeLobbies[i];
    }
  }
  return null
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
    activeLobbies.push(lobby);

    socket.emit("join-lobby", lobby);
    socket.join(lobbyId)
    console.log("Active lobbies:");
    for(var i=0;i<activeLobbies.length;i++) {
      console.log(activeLobbies[i].lobbyId);
    }

  })

  /*
  args[0]: playerId
  args[1]: display name
  args[2]: lobby code
  */
  socket.on('join-lobby', (...args) => {

    let code = args[2].toUpperCase().trim();
    lobby = findLobby(code, activeLobbies)

    if(lobby == null) {
      console.log('Error, user' + args[1] + ' tried to join a non-existent lobby');
      socket.emit("lobby-not-found");
      return
    }

    player = new Player(nextPlayerId++,"" + args[1],socket.id)  
    if(lobby.joinLobby(player)){
      socket.emit("join-lobby", lobby);
    
      socket.join(lobby.lobbyId) 
      io.to(lobby.lobbyId).emit("lobby-player-joined", lobby);
    }
    else{
      socket.emit("lobby-full");
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
            socket.to(lobby.lobbyId).emit("lobby-player-left", lobby)

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

  /*
  args[0] lobbyID
  */
  socket.on('host-started-game', (lobbyId) => {
    let code = lobbyId.toUpperCase().trim();
    lobby = findLobby(code, activeLobbies)

    io.to(lobby.lobbyId).emit("host-started-game", lobby.lobbyId);

    lobby.isInGame = true;

    var game = new Game(lobby.lobbyId,lobby.players)

    activeGames.push(game)
  });

  /*
  args[0] lobbyID
  args[1] socketID
  */
  socket.on('player-joined-game', (lobbyId, username) => {
    if(lobbyId == null || username == null) {
      return
    }
    //var game = null
    let code = lobbyId.toUpperCase().trim();

    var game = findGame(code, activeGames)
    
    //socket refreshes on page change, so assign that player their new socket.id 
    for(var i=0;i<game.players.length;i++) {
      if(game.players[i].username == username){
        game.players[i].socketId = socket.id
      }
    }
    
    //subscribe the socket to the room called lobbyId
    socket.join(lobbyId)
    //send everyone in the room an updated list of players
    io.to(lobby.lobbyId).emit("update-players", game.players );

    //send them their cards and chips
    socket.emit("set-cards", game.getCards());
    socket.emit("set-chips", startingChips);


    lobby.readyPlayers += 1;
    if(lobby.players.length == lobby.readyPlayers) {
      //all players have joined, start the game for this lobby.
      game.startGame()
    }
  });

  socket.on('turn-played', (gameInfo) => {

    game = findGame(gameInfo.id, activeGames);

    if(game == null) {
      console.log("turn played for non existing game " + gameInfo.id);
      return
    }

    console.log(game.activePlayer.displayName + " played "+ gameInfo.activeCard.searchString+" for game " + gameInfo.id);

    let index = game.activePlayer.cards.indexOf(gameInfo.activeCard)
    if(index > -1){
      game.activePlayer.cards.splice(index, 1) //remove card they played from hand
    }

    //subtract their bet from their chips
    game.activePlayer.chips -= gameInfo.betAmount
    socket.emit("set-chips", game.activePlayer.chips) //tell the client to update chip amount

    //update active cards and the pot
    game.activeCards.push(gameInfo.activeCard);
    game.potAmount += gameInfo.betAmount;

    //check if it was the dealers turn
    if(game.activePlayerIndex == game.dealerIndex) {
      winningCard = game.chooseWinningCard();
      if(winningCard.searchValue != -1) {
        //find out who's card it was 
        winningPlayer = null
        for(let i=0;i<game.players.length;i++) {
          for(let j=0;j<game.players[i].originalCards.length;j++) {
            if(game.players[i].originalCards[j] == winningCard.searchString) {
              winningPlayer = game.players[i];
              winningPlayer.chips += game.potAmount // give the winner their earnings
            }
          }
        }
        if(winningPlayer == null) {
          //no winning player was found, did they leave the game?
        }
        else {
          io.to(game.id).emit("round-over", game.activeCards, winningPlayer, winningCard, game.potAmount);
          game.potAmount = 0 //reset the pot for next round
        }
      }
      //have to do this to update the chips on the client side
      io.to(game.id).emit("update-players", game.players);
    }
    else {
      game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length
      game.activePlayer = game.players[game.activePlayerIndex];
      
      gameInfo.activePlayer = game.activePlayer;
      gameInfo.betAmount = 0;
      gameInfo.activeCard = null;
      gameInfo.potAmount = game.potAmount;
      //have to do this to update the chips on the client side
      io.to(game.id).emit("update-players", game.players);
      io.to(game.id).emit("start-turn", gameInfo);
    }

  });
});


// database connection methods by john



async function asyncGetCards(numCards){
  const response = await fetch('http://localhost:3000/api/cards')
  const json = await response.json()

  console.log(json);
  let cards = []
    for(var i=0; i< numCards;i++){
      cards.push(new Card(json[i].searchString, json[i].searchValue));
    }
  return cards
}


nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res);
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`);
  })
})

