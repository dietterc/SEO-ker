
# [1] Feature 1 Development Tasks
## [1.1] As a user, I want to be able to create a user profile with a username and password, so that I can have my game statistics and information stored.
* ### Development Tasks
    * TBD
## [1.1 Alternative] As a user, I want to be able to login to the site with a custom username, so I can show off my personality
* ### Development Tasks
    * [1.1.1] Make "Login page" on client side
    * [1.1.2] Send the server the login request
        * Extract data from textbox on client side
        * Send request from client side to server
    * [1.1.3] Authenticate on server side - check to see if unique name
    * [1.1.4] Server sends response to client
## [1.2] As a user, I want the application to remember me so I can get into a game quickly.
* ### Development Tasks
    * [1.2.1] Save cookies after 1st login, storing username 
    * [1.2.2] Go straight to lobby if there are cookies saved
## [1.3] As a user, I want to be able to upload a profile picture to flex my beauty
### Development Tasks
* [1.3.1] Create a profile picture spot in lobby
    * Display photo from DB
* [1.3.2] Create a profile picture spot in game scene
    * Display photo from DB
* [1.3.3] Create a "Upload profile picture" dialog
    * Uploads a photo to DB
* [1.3.4] Short term implementation? - create auto assigned photos in lobby
    * Upload the photos to next/photos, server assigns to player on join-lobby

## [1.4] As a user, I want the game to differentiate me from other players in the game, so I know who is who. 
* ### Development Tasks
    * [1.4.1] Create UI elements for connected player names in Lobby
    * [1.4.2] Create UI elements for connected player names in Game Scene
    * [1.4.3] Assign player object a unique name on join-lobby message, using their chosen username

# [2] Feature 2 Development Tasks
## [2.1] As a user, I want to be able to host a multiplayer lobby so I can play with my friends. 
* ### Development Tasks
    * [2.1.1] Create a launcher page with options to "Host" or "Join"
    * [2.1.2] Use Socket.io to manage incoming connections
        * Add functionality for server.js to handle "host-lobby" messages
        * Create a new lobby when player requests to host, then add that user to the lobby as the host.
    * [2.1.3] Start game button
        * Brings all connected players into the game
        * Will delete the lobby page, and create a game instance of the lobby in its place

## [2.2] As a user, I want to be able to join a multiplayer lobby so I can play with my friends. 
* ### Development Tasks
    *  [2.2.1] On homepage, have "Join" button with associated text box that sends a join-lobby message to client when clicked
        * Extract data from text box and send it along with join-lobby
    * [2.2.2] Server side accepts message from client side, adds user to lobby based on code. 
        * Needs to account for invalid code
    * [2.2.3] On join-lobby message, user needs their view updated to show the newly joined lobby
## [2.3] As a user, I want the game to generate a code so I can invite my friends easily. 
* ### Development Tasks
    * [2.3.1] Server generates code when it recieces a "host-lobby" message
        * Ensure code is unique
    * [2.3.2] Create new lobby with that code as an identifier (lobbyId)
    * [2.3.3] Display code on client side so the host can share it.

# [3] Feature 3 User Stories
## [3.1] As a player, I expect the game to have well defined rules, so I am not surprised by mechanics
* ### Development Tasks
    * [3.1.1] Create a game class that will:
        * Manage Turn order
        * TBD
## [3.2] As a player, I expect to have the rules explained to me, so I know how to play
* ### Development Tasks
    * [3.2.1] Create a button for game rules
    * [3.2.2] Create client side page that shows the rules
## [3.3] As a player, I want to be able to set a custom bet, so I can bluff and trick my friends
* ### Development Tasks
    * [3.3.1] Create a button that confirms bet
    * [3.3.2] Text field/ui for setting bet
    * [3.3.3] Send bet to server, server updates the bet, 
## [3.4] As a player, I want an interactive UI so that I can easily interact with the game.
* ### Development Tasks
    * TBD 
## [3.5] As a player, I want to be able to play cards so that the game works as intended. 
* ### Development Tasks
    * TBD
## [3.6] As a player, I want to know how many chips I have, so I can make judgement calls.
* ### Development Tasks
    * TBD
## [3.7] As a player, I want  to know how many chips others have and how much they are betting, so I can guess if they are bluffing or not. 
* ### Development Tasks
    * TBD
## [3.8] As a player, I want the game to end so I have time to do the dishes.
* ### Development Tasks
    * TBD
## [3.9] As a host, I want to be able to reset the lobby so I can quickly play another game without sending out fresh invites.
* ### Development Tasks
* [3.9.1] Add restart game button.
    *  Button sends message to server to reset the game loop
# [4] Feature 4 User Stories
## [4.1] As a player, I want the search statistics to be accurate and relevant, so I can make informed guesses on the value of my cards.
* ### Development Tasks
    * TBD