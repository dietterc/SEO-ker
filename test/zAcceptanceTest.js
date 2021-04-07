const { expect } = require("chai");
const { Builder, By, Key, util } = require("selenium-webdriver");
require("geckodriver");

describe("Acceptance Testing", function () {
    let driver = new Builder().forBrowser("firefox").build();
    let hostDriver = new Builder().forBrowser("firefox").build();
    let lobbyCode = "";

    it("User Story: Create a User with a Username", async () => {
        await driver.get("localhost:3000/");
        await driver.findElement(By.name("username")).sendKeys("Selenium", Key.RETURN);
        await driver.sleep(1000);
        let result = await driver.findElement(By.name("welcome")).getText();

        expect(result).to.equal("Welcome, Selenium.");
    });
    it("User Story: Host a Lobby", async () => {
        await hostDriver.get("localhost:3000/");
        await hostDriver.findElement(By.name("username")).sendKeys("Selenium Host", Key.RETURN);
        await hostDriver.sleep(1000);
        await hostDriver.findElement(By.id("host-lobbyButton")).click();
        let result = await hostDriver.findElement(By.id("lobby-code")).getText();
        result = result.split(":");
        lobbyCode = result[1].trim();
        result = result[0];
        expect(result).to.equal("Lobby Code");
    });
    it("User Story: Join an Active Lobby", async () => {
        expect(lobbyCode).to.not.equal("");
    });

    it("User Story: Host can Start a Game", async () => {

    });
    it("Closing Browsers",async () => {
        driver.quit();
        hostDriver.quit();
    });
});