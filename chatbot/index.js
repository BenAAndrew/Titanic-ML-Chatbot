// This loads the environment variables from the .env file
require('dotenv').config();
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Promise = require('bluebird');
var request = require('request-promise').defaults({ encoding: null });

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages
server.post('/api/messages', connector.listen());

// Bot Storage
var inMemoryStorage = new builder.MemoryBotStorage();


var bot = new builder.UniversalBot(connector, function (session) {

    var msg = session.message;
    if (msg.attachments.length) {   

        // Message with attachment, proceed to download it.
        // Skype & MS Teams attachment URLs are secured by a JwtToken, so we need to pass the token from our bot.
        var attachment = msg.attachments[0];
        var fileDownload = checkRequiresToken(msg)
            ? requestWithToken(attachment.contentUrl)
            : request(attachment.contentUrl);

        fileDownload.then(
            
            postData(fileDownload, function(response){
                // Send reply with attachment type & size
                var reply = new builder.Message(session)
                .text('This Image is a  %s.', response);
                session.send(reply);

            }))
    } else {

        // No attachments were sent
        var reply = 'I predict if images are cats or dogs, send me an image.';
        session.endDialog(reply);
    }
}).set('storage', inMemoryStorage); // Register in memory storage

// Request file with Authentication Header
var requestWithToken = function (url) {
    return obtainToken().then(function (token) {
        return request({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            }
        });
    });
};

// Promise for obtaining JWT Token (requested once)
var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

var checkRequiresToken = function (message) {
    return message.source === 'skype' || message.source === 'msteams';
};

function postData(data, cb){

    request.post({
  	    url: 'http://localhost:5000/post_image',
        body: data
         
	}, function(error, response, body){
             cb(body)
             //callback cat/dog
	});
}
