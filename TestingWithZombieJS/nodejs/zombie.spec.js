var Browser = require("zombie");
var url = "http://blogposts.dev/TestingWithZombieJS/site/";
var browser = new Browser();

describe("testing with zombie", function() {

    it("should have defined headless browser", function(next){
        expect(typeof browser != "undefined").toBe(true);
        expect(browser instanceof Browser).toBe(true);
        next();
    });

    it("should visit the site and see the login form", function(next) {
        browser.visit(url, function(err) {
            expect(browser.success).toBe(true);
            expect(browser.query("input[value='Login']")).toBeDefined();
            next();
        })
    });

    it("should not be able to login with wrong credentials", function(next) {
        browser
        .fill('input[name="username"]', "wrongname")
        .fill('input[name="password"]', "wrongpassword")
        .pressButton('input[value="Login"]', function() {
            expect(browser.html("body")).not.toContain("Insanely fast, headless full-stack testing using Node.js");
            expect(browser.query("input[value='Login']")).toBeDefined();
            next();
        });
    });

    it("should be able to login with correct credentials", function(next) {
        browser
        .fill('input[name="username"]', "admin")
        .fill('input[name="password"]', "1234")
        .pressButton('input[value="Login"]', function(res) {
            expect(browser.html("body")).toContain("Insanely fast, headless full-stack testing using Node.js");
            expect(browser.query("input[value='Login']")).toBeUndefined();
            next();
        });
    });

    it("should be able to see CSS selectors page", function(next) {
        browser.visit(url + "css-selectors", function(err) {
            expect(browser.html("body")).toContain("CSS Selectors");
            next();
        });
    });

    it("should logout", function(next) {
        browser.clickLink('#logout', function() {
            expect(browser.query("input[value='Login']")).toBeDefined();
            next();
        });
    });

    it("should not be able to see CSS selectors page after the logout", function(next) {
        browser.visit(url + "css-selectors", function(err) {
            expect(browser.html("body")).not.toContain("CSS Selectors");
            next();
        });
    });

});