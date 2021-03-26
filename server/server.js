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
var nextPlayerId = 1;

const startingChips = 1000;


//----------objects----------
class Lobby {
  constructor(id) {
    this.players = [];
    this.readyPlayers = 0;
    this.lobbyId = id;
    this.host = ""; //blank if no host is set yet
    this.isInGame = false;
    this.cardsList = [];

    asyncGetCards(100).then(data => this.cardsList = data).then(() => console.log("...finished returning"))
    

    //add player to this lobby
    this.joinLobby = function (player) {
      if(this.isJoinable()) {

        this.players.push(player);
        player.lobbyId = this.lobbyId;

        //if they are the first to join set them as the host
        if(this.players.length == 1){
          this.host = player;
        }
        return true;
      }
      else {
        console.log(player.displayName + ' cannot join the lobby, lobby is full')
        return false;
      }
    }

    //remove player from this lobby
    this.leaveLobby = function (player) {
        var index = this.players.indexOf(player)
        if (this.host == player && this.players.length > 1) {
            if (index == 0) {
                this.host = this.players[index + 1];
            } else {
                this.host = this.players[0];
            }
        }
      this.players.splice(index, 1)

      if(this.players.length == 0) {
        this.host = ""
      }

    }

    this.isJoinable = function() {
      return this.players.length < 8 && !this.isInGame; 
    }
    

    this.isConnected = function (player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].playerId === player.playerId) {
                return true;
            }
        }
        return false;
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
  constructor(id,players,cardsList) {
    this.id = id;
    this.players = players;
    this.dealerIndex = Math.floor(Math.random() * this.players.length)
    this.dealer = players[this.dealerIndex];
    this.activePlayerIndex = (this.dealerIndex + 1) % this.players.length; //player to the "left" ..or right?
    this.activePlayer = this.players[this.activePlayerIndex];
    this.potAmount = 0;
    this.activeCards = []; //the cards currently played
    
    //for giving out cards
    this.allCards=[];
    this.cardsIndex = 0; 
    //our current index in the above list
    //Populate the list of all cards 

    
    this.allCards = cardsList;  
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

    //get three unique cards from allCards
    this.getCards = function() {
      let hand = [] //the 'hand' of cards to give out

      //check if there are enough cards to give out
      
      if(this.cardsIndex + 3 <= this.allCards.length) {
        hand.push(this.allCards[this.cardsIndex]);
        hand.push(this.allCards[this.cardsIndex + 1]);
        hand.push(this.allCards[this.cardsIndex + 2]);
        this.cardsIndex += 3;
      }
      if(hand.length != 0) {
        return hand;
      }
      else {
        return null;
      }
    }
  }
}

// This array is used to expose functions and classes for testing
let moduleExports = {};
moduleExports.generateCode = function () {
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

moduleExports.createLobby = function (id) {
    return new Lobby(id);
}

moduleExports.createPlayer = function (id, displayName, socketId) {
    return new Player(id, displayName, socketId);
}
//----------socket.io server-side----------
io.on('connection', (socket) => {

  console.log(socket.id + ' connected');

  socket.on('host-lobby', (...args) => {
    var lobbyId = moduleExports.generateCode();
    
    player = new Player(nextPlayerId++,args[1],socket.id);
    lobby = new Lobby(lobbyId);
    lobby.joinLobby(player);
    activeLobbies.push(lobby);

    socket.emit("join-lobby", lobby, player.playerId);
    socket.join(lobbyId)
    console.log("Active lobbies:");
    for(var i=0;i<activeLobbies.length;i++) {
      console.log(activeLobbies[i].lobbyId);
    }

  })

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
      socket.emit("join-lobby", lobby, player.playerId);
    
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

  socket.on('host-started-game', (lobbyId) => {
    let code = lobbyId.toUpperCase().trim();
    lobby = findLobby(code, activeLobbies)

    io.to(lobby.lobbyId).emit("host-started-game", lobby.lobbyId);

    lobby.isInGame = true;

    var game = new Game(lobby.lobbyId,lobby.players, lobby.cardsList)
    
    activeGames.push(game)
  });


  socket.on('player-joined-game', (lobbyId, playerId) => {
    if(lobbyId == null || playerId == null) {
      return
    }
    //var game = null
    let code = lobbyId.toUpperCase().trim();

    var game = findGame(code, activeGames)

    var cards = game.getCards()
    console.log("getCards returns")

    //socket refreshes on page change, so assign that player their new socket.id 
    //hand them new cards to for sick optimization
    for(var i=0;i<game.players.length;i++) {
      if(game.players[i].playerId == playerId){
        game.players[i].socketId = socket.id
        game.players[i].cards = cards
      }
    }


    //subscribe the socket to the room called lobbyId
    socket.join(lobbyId)

    //send everyone in the room an updated list of players
    io.to(lobby.lobbyId).emit("update-players", game.players );

    //send them their cards and chips

    socket.emit("set-cards", cards);
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
    
    if(gameInfo.activeCard != null) {
      console.log(game.activePlayer.displayName + " played "+ gameInfo.activeCard.searchString+" for game " + gameInfo.id);
    }

    let index = game.activePlayer.cards.indexOf(gameInfo.activeCard)
    if(index > -1){
      //game.activePlayer.cards.splice(index, 1) //remove card they played from hand
    }

    //subtract their bet from their chips
    game.activePlayer.chips -= parseInt(gameInfo.betAmount)
    socket.emit("set-chips", game.activePlayer.chips) //tell the client to update chip amount

    //update active cards and the pot
    if(gameInfo.activeCard != null) {
      game.activeCards.push(gameInfo.activeCard);
      game.potAmount += parseInt(gameInfo.betAmount);
    }

    //check if it was the dealers turn
    if(game.activePlayerIndex == game.dealerIndex) {
      winningCard = game.chooseWinningCard();
      if(winningCard.searchValue != -1) {
        //find out who's card it was 
        winningPlayer = null
        for(let i=0;i<game.players.length;i++) {
          for(let j=0;j<game.players[i].cards.length;j++) {
            console.log(game.players[i].cards[j].searchString + ", " + winningCard.searchString)
            if(game.players[i].cards[j].searchString == winningCard.searchString) {
              winningPlayer = game.players[i];
              winningPlayer.chips += game.potAmount // give the winner their earnings
            }
          }
        }
        if(winningPlayer == null) {
          //no winning player was found, did they leave the game?
          console.log("Error: No winning player found")
        }
        else {
          io.to(game.id).emit("round-over", game.activeCards, winningPlayer, winningCard, game.potAmount);
          io.to(winningPlayer.socketId).emit("set-chips", winningPlayer.chips + game.potAmount);

          game.potAmount = 0 //reset the pot for next round
          game.activeCards = []
        }
      }
      //have to do this to update the chips on the client side
      io.to(game.id).emit("update-players", game.players);
    }
    else {
      do {game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length;}
      while(game.players[game.activePlayerIndex].chips == 0) //player to the "left" ..or right?
      //game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length;
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


  socket.on('next-round', (gameId) => {

    console.log(gameId)

    game = findGame(gameId, activeGames);

  
    io.to(gameId).emit("restart-round");

    do {game.dealerIndex = (game.dealerIndex + 1) % game.players.length;}
    while( game.players[game.dealerIndex].chips == 0 )

    game.dealer = game.players[game.dealerIndex];

    game.activePlayerIndex = game.dealerIndex;
    do {game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length;}
    while(game.players[game.activePlayerIndex].chips == 0) //player to the "left" ..or right?
    game.activePlayer = game.players[game.activePlayerIndex];
    
    for(let i = 0; i< game.players.length; i++){
      let newHand = [];
      newHand = game.getCards();
      game.players[i].cards = newHand;
      var playerSocket = game.players[i].socketId;
      io.to(playerSocket).emit('set-cards', newHand);
      console.log("new cards sent:" + newHand);
    };

    gameInfo = new GameInfo(gameId, game.activePlayer, 0, game.dealer)
    //have to do this to update the chips on the client side
    io.to(gameId).emit("update-players", game.players);
    io.to(gameId).emit("start-turn", gameInfo);
  });

});


// database connection methods by john



async function asyncGetCards(numCards){
  const response = await fetch(`http://localhost:${port}/api/cards`)
  const json = await response.json()

  
  let cards = []
    for(var i=0; i< numCards;i++){
      cards.push(new Card(json[i].searchString, json[i].searchValue));
    }
    console.log("asyncGetCardsReturning...")
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

module.exports = moduleExports;
