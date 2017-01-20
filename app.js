#!/usr/bin/env node

"use strict";
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');

const port = process.env.PORT || 5000;
const Config = require('./const.js');
const WooAPI = require('./wooapi.js')
const wooAPI = new WooAPI();
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

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};



const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const recipientId = sessions[sessionId].fbid;
    const {text, quickreplies} = response;
    let quick_replies = [];
    if(quickreplies){
      quick_replies = quickreplies.map(function(x){
        return botly.createQuickReply(x,"empty");
      });
    }
    return new Promise(function(resolve, reject) {
        console.log('user said...', request.text);
        console.log('sending...', JSON.stringify(response));
        if(quick_replies.length > 0){
          botly.sendText({id: recipientId, text: text, quick_replies: quick_replies}, function (err, data) {
          //log it
            console.log(err);
          });
        }else{
          botly.sendText({id: recipientId, text: text}, function (err, data) {
          //log it
            console.log(err);
          });
        }

        return resolve();
    });
  },
  ['coffee-price']({sessionId, text, context,entities}) {
      console.log(`in actions price-coffee`);
      console.log(`Session ${sessionId} received ${text}`);
      console.log(`The current context is ${JSON.stringify(context)}`);
      console.log(`Wit extracted ${JSON.stringify(entities)}`);

      return new Promise(function(resolve, reject) {
          let coffee = firstEntityValue(entities,'cafe');
          if (coffee) {
            context.coffee = coffee
            wooAPI.productsPriceByName(coffee).then(function(product){
              context.cost = product[0].price +' VNĐ'; // we should call a weather API here
              delete context.missingCoffee;
              return resolve(context);
            })
          }else{
            context.missingCoffee = true;
            delete context.price;
            return resolve(context);
          }

      });


    },
 ['send-link-coffee']({sessionId, context,entities}) {
   const recipientId = sessions[sessionId].fbid;
   let coffee = context.coffee ;
   console.log(context);
   console.log('send-link_coffee');
   botActions.sendProduct(recipientId,coffee);
 },
 ['fetch-customer']({context,entities}) {
      // Here should go the api call, e.g.:
      // context.forecast = apiCall(context.loc)
      //context.customer = 'Lam';
      //return Promise.resolve(context);
      return new Promise(function(resolve, reject) {
          const customer = 'Lâm Huỳnh';
          if (customer) {
            context.customer = customer;
          }
          //call the API here
          return resolve(context);
      });
  },
  ['tim-san-pham']({sessionId, context,entities}) {
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);
    return new Promise(function(resolve, reject) {

        return resolve(context);
    });
  },
  ['table-price-coffee']({sessionId, context,entities}) {

    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);
    return new Promise(function(resolve, reject) {

        return resolve(context);
    });
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
    console.log("message:", sender, message, data);
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
   console.log(message);
   if(message.message && message.message.quick_reply.payload == 'empty'){
     const sessionId = findOrCreateSession(sender);
     wit.runActions(
                sessionId, // the user's current session
                message.message.text, // the user's message
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
   }else if(postback && postback.indexOf("PRODUCT_BY_CATEGORY_") !== -1){
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
    console.log("optin:", sender, message, optin);
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
