
const assert = require('chai').assert;
const server = require('../server/server.js');

describe('Server', function () {

    describe('#generateCode()', function () {
        it('return type string', function () {
            let result = server.generateCode();
            assert.typeOf(result, 'string');
        });

        it('should return a sting of size 6', function () {
            let result = server.generateCode().length;
            assert.equal(result, 6);
        });
    });

    describe("Testing Classes", function () {
        // Lobby Class
        describe("Lobby Class", function () {

            describe('initial lobby state', function () {
                let lobby = server.createLobby("TESTID");
                it("should not be null", function () {
                    assert.isNotNull(lobby);
                });
                it("should have an empty array called players", function () {
                    assert(Array.isArray(lobby.players));
                    assert.isEmpty(lobby.players);
                });
                it("should have 0 ready players", function () {
                    assert.equal(lobby.readyPlayers, 0);
                });
                it("should have the id of TESTID", function () {
                    assert.equal(lobby.lobbyId, "TESTID");
                });
                it("should not have started the game", function () {
                    assert.isFalse(lobby.isInGame);
                });
                it("should not have a host yet", function () {
                    assert.equal(lobby.host, "");
                });
                it("should be currently joinable", function () {
                    assert.isTrue(lobby.isJoinable());
                });
                it("the player tester1 has not joined yet", function () {
                    assert.isFalse(lobby.isConnected("tester1"));
                });
            });
            
            //--------------------------------------
            // Joining and Leaving
            //--------------------------------------

            describe("Adding player \'tester1\' into the lobby", function () {
                let lobby = server.createLobby("TESTID");
                let player1 = server.createPlayer("tester1", "Tester 1", "s1id");
                before(function () {
                    lobby.joinLobby(player1);
                });
                it("should have the added player as host", function () {
                    assert.equal(lobby.host, player1);
                });
                it("should still accept players to join", function () {
                    assert.isTrue(lobby.isJoinable());
                });
                it("tester1 should be connected", function () {
                    assert.isTrue(lobby.isConnected(player1));

                });
                after(function () { lobby.leaveLobby(player1) });
            });

            // Edge Case 2 players
            describe("Adding 2 players", function () {
                let lobby = server.createLobby("TESTID");
                let player1 = server.createPlayer("tester1", "Tester 1", "s1id"),
                    player2 = server.createPlayer("tester2", "Tester 2", "s2id");
                before(function () {
                    lobby.joinLobby(player1);
                    lobby.joinLobby(player2);
                });

                it("tester1 and tester2 should be connected", function () {
                    assert.isTrue(lobby.isConnected(player1));
                    assert.isTrue(lobby.isConnected(player2));
                });

                it("should have tester1 as host and tester2 is not", function () {
                    assert.equal(lobby.host, player1);
                    assert.notEqual(lobby.host, player2);
                });

                it("should still accept players to join", function () {
                    assert.isTrue(lobby.isJoinable());
                });
                
                describe("check for reassigning host after host leaves (edge case)", function () {
                    before(function () {
                        //host leaves
                        lobby.leaveLobby(player1);
                    });
                    it("tester1 is now disconnected", function () {
                        assert.isFalse(lobby.isConnected(player1));
                    });
                    it("should have tester2 as host now", function () {
                        assert.equal(lobby.host, player2);
                    });
                    
                });
            });

            // Common Case
            describe("Adding 3 players (common case)", function () {
                let lobby = server.createLobby("TESTID");
                let player1 = server.createPlayer("tester1", "Tester 1", "s1id"),
                    player2 = server.createPlayer("tester2", "Tester 2", "s2id"),
                    player3 = server.createPlayer("tester3", "Tester 3", "s3id");
                before(function () {
                    lobby.joinLobby(player1);
                    lobby.joinLobby(player2);
                    lobby.joinLobby(player3);
                });
                it("should have tester 1, 2, and 3 connected", function () {
                    assert.isTrue(lobby.isConnected(player1));
                    assert.isTrue(lobby.isConnected(player2));
                    assert.isTrue(lobby.isConnected(player3));
                });
                it("should have tester 1 as the only host", function () {
                    assert.equal(lobby.host, player1);
                    assert.notEqual(lobby.host, player2);
                    assert.notEqual(lobby.host, player3);
                });

                it("should still accept players to join", function () {
                    assert.isTrue(lobby.isJoinable());
                });

                describe("Tester 3 disconnects", function () {
                    before(function () {
                        lobby.leaveLobby(player3);
                    });
                    it("should not have Tester 3", function () {
                        assert.isFalse(lobby.isConnected(player3));
                    });
                    it("should have Tester 1 as the only host", function () {
                        assert.equal(lobby.host, player1);
                        assert.notEqual(lobby.host, player2);
                    });
                    it("should still accept players to join", function () {
                        assert.isTrue(lobby.isJoinable());
                    });
                    after(function () {
                        lobby.joinLobby(player3);
                    });
                });

                describe("Tester 1 (host) disconnects", function () {
                    before(function () {
                        lobby.leaveLobby(player1);
                    });
                    it("should not have Tester 1", function () {
                        assert.isFalse(lobby.isConnected(player1));
                    });
                    it("should change host to Tester 2", function () {
                        assert.equal(lobby.host, player2);
                        assert.notEqual(lobby.host, player3);
                    });
                    it("should still accept players to join", function () {
                        assert.isTrue(lobby.isJoinable());
                    });
                    after(function () {
                        lobby.joinLobby(player1);
                    })
                });

            });

            //Edge Case 8 player (Max)
            describe("Adding 8 players (Edge Case)", function () {
                let lobby = server.createLobby("TESTID");
                let players = [];
                let nineth = server.createPlayer("tester9", "Tester 9", "c8");
                for (let i = 0; i < 8; i++) {
                    players.push(server.createPlayer("tester" + (i+1), "Tester " + (i+1), i+""));
                }
                before(function () {
                    for (let i = 0; i < players.length; i++) {
                        lobby.joinLobby(players[i]);
                    }
                });
                it("should have 8 players connected", function () {
                    for (let i = 0; i < 8; i++) {
                        assert.isTrue(lobby.isConnected(players[i]));
                    }
                });
                it("should have Tester 1 as host", function () {
                    assert.equal(lobby.host, players[0]);
                });
                it("should not be joinable", function () {
                    assert.isFalse(lobby.isJoinable());
                });
                    it("nineth player should not be able to join", function () {
                        assert.isFalse(lobby.joinLobby(nineth));
                    });

                describe("Host leaves the lobby, nineth player joins", function () {
                    before(function () {
                        lobby.leaveLobby(players[0]);
                    })
                    it("should have Tester 2 as the host", function () {
                        assert.equal(lobby.host, players[1]);
                    });
                    it("should allow people to join", function () {
                        assert.isTrue(lobby.isJoinable());
                    });
                    it("nineth player should be able to join", function () {
                        assert.isTrue(lobby.joinLobby(nineth));
                    });
                    describe("Checking connection", function () {
                        it("Tester 1 should be disconnected", function () {
                            assert.isFalse(lobby.isConnected(players[0]));
                        });

                        it("Tester 9 should be connected", function () {
                            assert.isTrue(lobby.isConnected(nineth));
                        });
                    })
                });
            });
        });

        // Game Class
        describe("Game Class", function () {
            
            describe('initial game state', function () {
                let game = server.createGame("TESTID",
                    [server.createPlayer("tester1", "Tester 1", "s1id")]);
                it("should not be null", function () {
                    assert.isNotNull(game);
                });
                it("should have a non-empty array called players", function () {
                    assert(Array.isArray(game.players));
                    assert.isNotEmpty(game.players);
                });
                it("should have 0 chips in the pot", function () {
                    assert.equal(game.potAmount, 0);
                });
                it("should have the id of TESTID", function () {
                    assert.equal(game.id, "TESTID");
                });
            });

            describe('#chooseWinningCard()', function () {
                let game = server.createGame("TESTID", []);
                this.beforeEach(function () {
                    game.activeCards = [server.createCard("Card 1", 300)];
                })
                it("should select the card with 300", function () {
                    let result = game.chooseWinningCard();
                    assert.equal(result, game.activeCards[0]);
                });
                it("should select the card with 500", function () {
                    game.activeCards.push(server.createCard("Card 2", 500));
                    let result = game.chooseWinningCard();
                    assert.equal(result, game.activeCards[1]);
                });
                it("should select the card with 300", function () {
                    game.activeCards.push(server.createCard("Card 2", 200));
                    let result = game.chooseWinningCard();
                    assert.equal(result, game.activeCards[0]);
                })
                it("should select the card with 888", function () {
                    game.activeCards.push(server.createCard("Card 2", 888));
                    game.activeCards.push(server.createCard("Card 3", 822));
                    let result = game.chooseWinningCard();
                    assert.equal(result, game.activeCards[1]);
                });
            })
        });
    });

    
});