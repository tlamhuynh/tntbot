#!/usr/bin/env node

"use strict";
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');

const port = process.env.PORT || 5000;
const Config = require('./const.js');
const actions = require('./actions.js')
const Botly = require("botly");
const botly = new Botly({
    verifyToken: Config.FB_VERIFY_TOKEN,
    accessToken: Config.FB_PAGE_TOKEN
});

var app = express();

var users = {};

botly.on('message', (sender, message, data) => {
    let text = `echo: ${data.text}`;

    if (users[sender]) {
        if (data && data.text && data.text.indexOf("image") !== -1) {
            botly.sendImage({id: sender, url:"https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg"}, function (err, whatever) {
                console.log(err);
            });
        }
        else if (data && data.text &&data.text.indexOf("buttons") !== -1) {
            let buttons = [];
            buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
            buttons.push(botly.createPostbackButton("Continue", "continue"));
            botly.sendButtons({id: sender, text: "What do you want to do next?", buttons: buttons}, function (err, data) {
                console.log("send buttons cb:", err, data);
            });
        }
        else if (data && data.text && data.text.indexOf("generic") !== -1) {
            let buttons = [];
            buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
            buttons.push(botly.createPostbackButton("Continue", "continue"));
            let element = {
                title: 'What do you want to do next?',
                item_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                image_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                subtitle: 'Choose now!',
                buttons: [botly.createWebURLButton('Go to Askrround', 'http://askrround.com')]
            };
            botly.sendGeneric({id: sender, elements:element}, function (err, data) {
                console.log("send generic cb:", err, data);
            });
        }
        else if (data && data.text && data.text.indexOf("list") !== -1) {
            let element = botly.createListElement({
                title: "Classic T-Shirt Collection",
                image_url: "https://peterssendreceiveapp.ngrok.io/img/collection.png",
                subtitle: "See all our colors",
                buttons: [
                    {title: "DO WORK", payload: "DO_WORK"},
                ],
                default_action: {
                    "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
                }
            });
            let element2 = botly.createListElement({
                title: "Number 2",
                image_url: "https://peterssendreceiveapp.ngrok.io/img/collection.png",
                subtitle: "See all our colors",
                buttons: [
                    {title: "Go to Askrround", url: "http://askrround.com"},
                ],
                default_action: {
                    "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
                }
            });
            botly.sendList({id: sender, elements: [element, element2], buttons: botly.createPostbackButton("Continue", "continue"), top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.LARGE},function (err, data) {
                console.log("send list cb:", err, data);
            });
        }
        else if (data && data.text && data.text.indexOf("quick") !== -1) {
            botly.sendText({id: sender, text:"some question?", quick_replies: [botly.createQuickReply('option1', 'option_1')]}, function (err, data) {
                console.log("send generic cb:", err, data);
            });
        }
        else if (data && data.text && data.text.indexOf("receipt") !== -1) {
            let payload = {
                "recipient_name": "Stephane Crozatier",
                "order_number": "12345678902",
                "currency": "USD",
                "payment_method": "Visa 2345",
                "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
                "timestamp": "1428444852",
                "elements": [
                    {
                        "title": "Classic White T-Shirt",
                        "subtitle": "100% Soft and Luxurious Cotton",
                        "quantity": 2,
                        "price": 50,
                        "currency": "USD",
                        "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
                    },
                    {
                        "title": "Classic Gray T-Shirt",
                        "subtitle": "100% Soft and Luxurious Cotton",
                        "quantity": 1,
                        "price": 25,
                        "currency": "USD",
                        "image_url": "http://petersapparel.parseapp.com/img/grayshirt.png"
                    }
                ],
                "address": {
                    "street_1": "1 Hacker Way",
                    "street_2": "",
                    "city": "Menlo Park",
                    "postal_code": "94025",
                    "state": "CA",
                    "country": "US"
                },
                "summary": {
                    "subtotal": 75.00,
                    "shipping_cost": 4.95,
                    "total_tax": 6.19,
                    "total_cost": 56.14
                },
                "adjustments": [
                    {
                        "name": "New Customer Discount",
                        "amount": 20
                    },
                    {
                        "name": "$10 Off Coupon",
                        "amount": 10
                    }
                ]
            };
            botly.sendReceipt({id: sender, payload: payload}, function (err, data) {
                console.log("send generic cb:", err, data);
            });
        }
        else {
            botly.send({id: sender, message: {
                text: `${users[sender].last_name}, try sending 'list'/'generic'/'receipt'/'quick'/'image'/'buttons' to try out the different types of messages`
            }}, function (err, data) {
                console.log("regular send cb:", err, data);
            });
        }
    }
    else {
        botly.getUserProfile(sender, function (err, info) {
            users[sender] = info;

            botly.sendText({id: sender, text: `${text} ${users[sender].first_name}`}, function (err, data) {
                console.log("send text cb:", err, data);
            });
        });
    }
});

botly.on('postback', (sender, message, postback) => {
	 console.log(postback);
		switch (postback) {
			case 'start_shopping':
				actions.sendCategoriesList(sender)
				break;


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
