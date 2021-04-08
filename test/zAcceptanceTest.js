const { expect } = require("chai");
const { Builder, By, Key, util } = require("selenium-webdriver");
require("geckodriver")
const firefox = require("selenium-webdriver/firefox");
const options = new firefox.Options().addArguments('-headless');
describe("Acceptance Testing", function () {
    let driver = new Builder()
        .forBrowser("firefox")
        .setFirefoxOptions(options)
        .build();
    let hostDriver = new Builder()
        .forBrowser("firefox")
        .setFirefoxOptions(options)
        .build();
    let lobbyCode = "";
    describe("Feature 1 - User Creation", async () => {
        it("Create a User with a Username", async () => {
            await driver.sleep(4000);
            await driver.get("http://localhost:3000/");
            await driver.sleep(100);
            await driver.findElement(By.name("username")).sendKeys("Selenium", Key.RETURN);
            let result = await driver.findElement(By.name("welcome")).getText();

            expect(result).to.equal("Welcome, Selenium.");
        });
    });

    describe("Feature 2 - Host/Join a Lobby", async () => {
        it("Host a Lobby", async () => {
            await hostDriver.get("http://localhost:3000/");
            await hostDriver.sleep(100);
            await hostDriver.findElement(By.name("username")).sendKeys("Selenium Host", Key.RETURN);
            await hostDriver.findElement(By.id("host-lobbyButton")).click();
            let result = await hostDriver.findElement(By.id("lobby-code")).getText();
            result = result.split(":");
            lobbyCode = result[1].trim();
            result = result[0];
            expect(result).to.equal("Lobby Code");
        });
        it("Join an Active Lobby", async () => {
            expect(lobbyCode).to.not.equal("");
            await driver.sleep(100);
            await driver.findElement(By.id("lobbyCodeInput")).sendKeys(lobbyCode);
            await driver.findElement(By.id("join-lobbyButton")).click();
            let result = await driver.findElement(By.id("lobby-code")).getText();
            result = result.split(":");
            expect(result[0]).to.equal("Lobby Code");
            result = result[1].trim();
            expect(result).to.equal(lobbyCode);
        });
    });
    
    describe("Feature 3 - Play the Game", async () => {
        let playerOne = { name: "Selenium Host", chips: 1000 },
            playerTwo = { name: "Selenium", chips: 1000 };
        it("Host can Start a Game", async () => {
            let element = await hostDriver.findElement(By.id("startGame")).getText();
            while (element == "loading...") {
                await hostDriver.sleep(100);
                element = await hostDriver.findElement(By.id("startGame")).getText();
            }
            await hostDriver.findElement(By.id("startGameButton")).click();
            let loaded = false;
            let result = "";
            while (!loaded) {
                try {
                    result = await hostDriver.findElement(By.id("potAmount")).getText();
                    loaded = true;
                } catch (err) {
                    await hostDriver.sleep(10);
                }
            }
            result = result.split(":");
            result = result[0].trim();
            expect(result).to.equal("Pot amount");
            try {
                result = await driver.findElement(By.id("potAmount")).getText();
            } catch (err) {
                expect("").to.equal("Joined person did not join!")
            }
        });

        it("Play a round", async () => {
            await hostDriver.findElement(By.id("0")).click();
            await driver.findElement(By.id("0")).click();
            let hostPlayer = false;
            try {
                await hostDriver.findElement(By.id("confirmTurn"));
                hostPlayer = true;
            } catch (err) {
                // Not the host players turn
            }
            let driverToUse;
            if (hostPlayer) {
                driverToUse = hostDriver;
            } else {
                driverToUse = driver;
            }
            await driverToUse.findElement(By.id("betInput")).sendKeys("0");
            let result = await driverToUse.findElement(By.id("invalidBet")).getText();
            result = result.split(".");
            expect(result[0]).to.equal("Please input a valid bet");

            await driverToUse.findElement(By.id("betInput")).sendKeys("500");
            await driverToUse.findElement(By.id("confirmTurn")).click();
            if (hostPlayer) {
                driverToUse = driver;
            } else {
                driverToUse = hostDriver;
            }

            await driverToUse.findElement(By.id("betInput")).sendKeys("500");
            await driverToUse.findElement(By.id("confirmTurn")).click();
            playerOne.chips = playerOne.chips - 500;
            playerTwo.chips = playerTwo.chips - 500;

            await driverToUse.sleep(100);
            //Now expect that round ended has shown up
            let tie = false;
            try {
                await driverToUse.findElement(By.id("winner1"));
                tie = true;
            } catch (err) {
                //not a tie
            }
            if (tie) {
                playerOne.chips = playerOne.chips + 500;
                playerTwo.chips = playerTwo.chips + 500;
                result = await driverToUse.findElement(By.id("winner0")).getText();
            } else {
                result = await driverToUse.findElement(By.id("winner0")).getText();
                result = result.split("won");
                let amount = parseInt(result[1].split("chips")[0].trim());
                result = result[0].trim();
                expect(amount).to.equal(1000);
                if (result == playerTwo.name) {
                    playerTwo.chips = playerTwo.chips + amount;
                } else {
                    playerOne.chips = playerOne.chips + amount;
                    expect(result).to.equal(playerOne.name);
                }
            }
            
        });
    });


    after("Closing Browsers",async () => {
        driver.quit();
        hostDriver.quit();
    });
});