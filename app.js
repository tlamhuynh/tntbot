#!/usr/bin/env node

"use strict";
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');

const port = process.env.PORT || 5000;
const Config = require('./const.js');
const BotActions = require('./botactions.js')
const Botly = require("botly");
const botly = new Botly({
    verifyToken: Config.FB_VERIFY_TOKEN,
    accessToken: Config.FB_PAGE_TOKEN
});

const botActions = new BotActions();

let Wit = null;
let log = null;
Wit  = require('node-wit').Wit;
log =  require('node-wit').log;
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};





const actions = {
  send({sessionId}, {text}) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      botly.sendText({id: recipientId, text: text}, function (err, data) {
        //log it
      });

    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  priceCoffee({sessionId, context, text, entities}) {
      console.log(`Session ${sessionId} received ${text}`);
      console.log(`The current context is ${JSON.stringify(context)}`);
      console.log(`Wit extracted ${JSON.stringify(entities)}`);
      return Promise.resolve(context);
    },
  sayHiCustomer({sessionId,context,entities}){
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      botly.getUserProfile(sender, function (err, info) {
        context.customer_name = info.first_name
        return Promise.resolve(context);
      });


    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};

// Setting up our bot
const wit = new Wit({
  accessToken: Config.WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});



var app = express();

var users = {};

botly.on('message', (sender, message, data) => {
    let text = data.text;
    const sessionId = findOrCreateSession(sender);

    wit.runActions(
               sessionId, // the user's current session
               text, // the user's message
               sessions[sessionId].context // the user's current session state
             ).then((context) => {
               // Our bot did everything it has to do.
               // Now it's waiting for further messages to proceed.
               console.log('Waiting for next user messages');

               // Based on the session state, you might want to reset the session.
               // This depends heavily on the business logic of your bot.
               // Example:
               // if (context['done']) {
               //   delete sessions[sessionId];
               // }

               // Updating the user's current session state
               sessions[sessionId].context = context;
             })
             .catch((err) => {
               console.error('Oops! Got an error from Wit: ', err.stack || err);
             })
    /*if (users[sender]) {


    }
    else {
        botly.getUserProfile(sender, function (err, info) {
            users[sender] = info;

            botly.sendText({id: sender, text: `${text} ${users[sender].first_name}`}, function (err, data) {
                console.log("send text cb:", err, data);
            });
        });
    }*/
});

botly.on('postback', (sender, message, postback) => {
	 console.log(postback);
    if(postback && postback.indexOf("PRODUCT_BY_CATEGORY_") !== -1){
       let categoryId = parseInt(postback.replace('PRODUCT_BY_CATEGORY_',''))
       console.log(categoryId)
       botActions.sendProducts(sender,categoryId);
    }else{
      switch (postback) {
  			case 'start_shopping':
  				botActions.sendCategoriesList(sender)
  				break;


  		}
    }

    //console.log("postback:", sender, message, postback);
});

botly.on('delivery', (sender, message, mids) => {
    //console.log("delivery:", sender, message, mids);
});

botly.on('optin', (sender, message, optin) => {
    //console.log("optin:", sender, message, optin);
});

botly.on('error', (ex) => {
    console.log("error:", ex);
});

var pageId = '115560315450397'
if (pageId) {
    botly.setGetStarted({pageId: pageId, payload: 'GET_STARTED_CLICKED'}, function (err, body) {
        console.log("welcome cb:", err, body);
    });
		var buttons = [
				botly.createPostbackButton('Bắt đầu mua sắm', 'start_shopping'),
				botly.createPostbackButton('View Website', 'view_website'),
				botly.createPostbackButton('Top selling', 'show_top_selling')
		]
    botly.setPersistentMenu({pageId: pageId, buttons: buttons}, function (err, body) {
        //console.log("persistent menu cb:", err, body);
    })
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/webhook', botly.router());
app.set('port', port);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

const server = http.createServer(app);

server.listen(port);
