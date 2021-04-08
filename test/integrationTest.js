const assert = require('chai').assert;
const server = require('../server/server.js');

describe('Integration Test', function () {
    
    describe("Game Class with Players and Cards", function () {
        describe('#chooseWinners()', function () {
            let game = server.createGame("TESTID", []);
            this.beforeEach(function () {
                game.activeTurns = [{ player: server.createPlayer(1,"tester1","SID"), card: server.createCard("Card 1", 300) }];
            });
            it("should be able to select the only turn as winner", function () {
                let result = game.chooseWinners();
                assert.equal(result.length, 1);
                assert.equal(result[0], game.activeTurns[0]);
            });
            it("should be able to select the right most turn as winner", function () {
                game.activeTurns.push({ player: server.createPlayer(2, "tester2", "SID2"), card: server.createCard("Card 2", 500) });
                let result = game.chooseWinners();
                assert.equal(result.length, 1);
                assert.equal(result[0], game.activeTurns[1]);
            });
            it("should be able to select the left most turn as winner", function () {
                game.activeTurns.push({ player: server.createPlayer(2, "tester2", "SID2"), card: server.createCard("Card 2", 200) });
                let result = game.chooseWinners();
                assert.equal(result.length, 1);
                assert.equal(result[0], game.activeTurns[0]);
            });
            it("should be able to select the middle turn as winner", function () {
                game.activeTurns.push({ player: server.createPlayer(2, "tester2", "SID2"), card: server.createCard("Card 2", 1888) });
                game.activeTurns.push({ player: server.createPlayer(3, "tester3", "SID3"), card: server.createCard("Card 3", 882) });
                let result = game.chooseWinners();
                assert.equal(result.length, 1);
                assert.equal(result[0], game.activeTurns[1]);
            });
            it("should be able to select multiple of the highest turns as winner (all cases)", function () {
                // only 2 cards and they tie
                game.activeTurns.push({ player: server.createPlayer(2, "tester2", "SID2"), card: server.createCard("Card 2", 300) });
                let result = game.chooseWinners();
                assert.deepEqual(result, game.activeTurns);

                // 3 cards where left most 2 ties
                game.activeTurns.push({ player: server.createPlayer(3, "tester3", "SID3"), card: server.createCard("Card 3", 100) });
                result = game.chooseWinners();
                assert.deepEqual(result, [game.activeTurns[0], game.activeTurns[1]]);

                // 3 cards where right most 2 ties
                game.activeTurns[0].card.searchValue = 100;
                game.activeTurns[2].card.searchValue = 300;
                result = game.chooseWinners();
                assert.deepEqual(result, [game.activeTurns[1], game.activeTurns[2]]);

                // 3 cards where left most and right most is the highest and ties
                game.activeTurns[0].card.searchValue = 500;
                game.activeTurns[2].card.searchValue = 500;
                result = game.chooseWinners();
                assert.deepEqual(result, [game.activeTurns[0], game.activeTurns[2]]);

                // all 3 cards ties
                game.activeTurns[1].card.searchValue = 500;
                result = game.chooseWinners();
                assert.deepEqual(result, game.activeTurns);
            });
        });
    })
});
            
