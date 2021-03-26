# Acceptance Test
Team Integer N

## Host a Lobby
1. Go to seoker.herokuapp.com
2. Type a name in the text box (That says 'Enter Display Name')
3. Click 'Confirm'
4. Click 'Host Game' (take note of the lobby code)

## Join a Lobby
1. Go through the 'Host a Lobby' test
2. Open a new tab in the browser
3. Go to seoker.herokuapp.com
4. Type a name in the text box (That says 'Enter Display Name')
5. Enter the lobby code from the host
6. Click 'Join Game'

## Leave a Lobby
1. Go through 'Join a Lobby' 3 times, where instruction (1) is only executed once
2. Choose a player that is not the host and close the tab. Other players will see the lobby update.
3. Close the tab from the lobby. A new player will be chosen as the host.
4. Start the game with the new host.

## Play a Round
1. Go through the 'Join a Lobby' test
2. Go back to the Host tab
3. Click 'Start Game'
4. The current player has an * by their name. Go to that players tab, and click a card.
5. Type in a bet amount. (In the range of the players chips)
6. Click 'Confirm Turn'
7. Repeat 4 to 6 for each player until all player has placed a bet
8. The winner of the round will be displayed after the last bet is placed

## Play a Game
1. Go through the 'Play a Round' test
2. After each round, a player will have 'Play next round'. Click it
3. Play though the rounds until someone gets all the chips. The game ends here.
