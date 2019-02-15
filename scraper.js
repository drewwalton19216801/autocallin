var casper = require('casper').create();
var x = require('casper').selectXPath;
var formSelector = x('//*[@role="form"]');
var submitSelector = x('//button[@type="submit"]');

casper.start('https://mycallin.com/index.html', function() {
    // wait for initial page load
    this.waitForSelector(formSelector);
});

casper.then(function() {
    // fill form from CLI options
    this.fill(formSelector, {
        phone: casper.cli.args[0],
        last_name: casper.cli.args[1],
        ivr_code: casper.cli.args[2],
    }, true);
});

casper.then(function() {
    // submit first form
    this.click(submitSelector);
});

casper.then(function() {
    // wait for the confirmation button to appear
    this.waitForSelector('#confirm.btn', function _then() {
        this.click('#confirm.btn');
    }, function _onTimeout(){
        // if we didn't get a selector (aka we got a timeout), then there was an error message.
        // the error message will be contained in a selector
        this.waitForSelector('div.has-error');
        var text = this.evaluate(function() {
            return document.querySelector('div.has-error p').textContent;
        });
        // print the error and exit
        this.echo(text);
        this.exit();
    });
});

casper.then(function() {
    // wait for the panel to appear
    casper.waitForSelector('div.panel.panel-default');
});

casper.then(function() {
    var text = "";
    // whomever made mycallin.com is using different panel classes for different results. WEAK.
    // anyway, let's check which one appears
    if (this.exists('div.panel-body.text-success.bg-success strong')) {
        // a wild success panel appears, meaning client does not test today
        text = this.evaluate(function() {
            return document.querySelector('div.panel-body.text-success.bg-success strong').textContent;
        });
    } else if (this.exists('div.panel-body.text-danger.bg-danger strong')) {
        // danger panel is dangerious, better go test today!
        text = this.evaluate(function() {
            return document.querySelector('div.panel-body.text-danger.bg-danger strong').textContent;
        });
    }

    // spit out the text content of the aforementioned panel
    this.echo(text);
});

casper.run();