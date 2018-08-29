// dependencies
var restify = require('restify');
var builder = require('botbuilder');
//var natural = require('natural');
var request = require('request');

// Global String Array
var record = ""

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// create the bot
var bot = new builder.UniversalBot(connector);

// Listen for messages from users
server.post('/Titanic', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
      // Echo back users text
      session.send("Welcome to titanic, type y to get started");
});

bot.dialog('', [
	function (session) {
        builder.Prompts.text(session, "Please tell me your class in society: ");
    }, function (session, results) {
        record = results.response + ",";
        builder.Prompts.text(session, "Please tell me your gender: "); 
    }, function (session, results) {
        record += results.response + ",";
        builder.Prompts.text(session, "Please tell me your age: "); 
    }, function (session, results) {
        record += results.response + ",";
        builder.Prompts.text(session, "How much would you pay for a ticket (£5 - £500): "); 
    },
    function (session, results) {
        record += results.response;
        request.post({
            url: 'http://127.0.0.1:5000/predict',
            body: record
        }, function (r1, r2) {
            response_value = r2.body;
            if (response_value == "1.0"){
                var msg = new builder.Message(session)
                .text("Survived")
                .attachments([{
                    contentType: "image/jpeg",
                    contentUrl: "https://www.mera-petfood.com/files/_processed_/a/4/csm_iStock-521697453_0d594833da.jpg"
                }]);
                session.endDialog(msg);
            } else {
                var msg = new builder.Message(session)
                .text("Died")
                .attachments([{
                    contentType: "image/gif",
                    contentUrl: "https://media.giphy.com/media/g2e22SIHPcQw0/giphy.gif"
                }]);
                session.endDialog(msg);
            }
        })
    }
]).triggerAction({
    matches: /^y$/i
});

// exercise - add help dialog

