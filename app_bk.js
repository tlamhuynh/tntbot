
'use strict'

const express = require('express')
const jsonfile = require('jsonfile')
const bodyParser = require('body-parser')
const request = require('request')
const http = require('http')
const Config = require('./const.js');
const querystring =  require('querystring');
const fetch = require('node-fetch');


var postBacksConstant = {
	Category : 'POSTBACK_CATEGORY_',
	Product : 'POSTBACK_PRODUCT_',
	BuyProduct :  'POSTBACK_BUY_PRODUCT_',
	ViewProduct : 'POSTBACK_VIEW_PRODUCT_',
	BestSell : 'POSTBACK_BEST_SELL_PRODUCT',


}

var phanloaiquan = {
	dahoatdong : {
		categories : [],
		payload : 'SAN_PHAM_QUAN_HOAT_DONG'
	},
	moihoatdong : {
		categories : [],
		payload : 'SAN_PHAM_QUAN_MOI_MO'
	}
}

let FBBotFramework = require('fb-bot-framework');




FBBotFramework.prototype.middleware2 = function(){
	var bot = this;

    return function (req, res) {
        if (req.method === 'GET') {
            return bot.verify(req, res);
        }

        if (req.method === 'POST') {

            // Read data from the request
            var data = '';
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                data += chunk;
            });

            req.on('end', function () {

                // Always return HTTP200 to Facebook's POST Request
                res.send({});

                var messageData = JSON.parse(data);
                var messagingEvent = messageData.entry[0].messaging;
                messagingEvent.forEach(function (event) {

                    // Extract senderID, i.e. recipient
                    var sender = event.sender.id;
                    // Trigger onMessage Listener
                    if (event.message && event.message.text) {
                        bot.emit('message', sender, event.message.text);
                    }

					if (event.message && event.message.quick_reply && event.message.quick_reply.payload){
						bot.emit('quickreply', sender, event.message.quick_reply.payload);
					}

                    // Trigger onPostback Listener
                    if (event.postback && event.postback.payload) {
                        bot.emit('postback', sender, event.postback.payload);
                    }

                    // Trigger onAttachment Listener
                    if (event.message && event.message.attachments) {
                        bot.emit('attachment', sender, event.message.attachments);
                    }

                });
            });

        }
    };
}


FBBotFramework.prototype.sendListMessage = function (recipient, elements, notificationType, cb) {
	var messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "list",
                elements: elements
            }
        }
    };

    this.send(recipient, messageData, notificationType, cb);
}
let bot = new FBBotFramework({
    page_token: Config.FB_PAGE_TOKEN,
    verify_token: Config.FB_VERIFY_TOKEN
});

bot.setGetStartedButton("GET_STARTED");


let app = express()

//app.use(bodyParser.json())
app.use('/webhook', bot.middleware2());


//var router = express.Router();
var jsonCategories = './data/categories.json'

function categories(){
	return fetch('https://tnt-react.herokuapp.com/api/categories').then((response) => response.json())
}


app.get('/updatedata', function (req, res) {
	request.get('http://tnt-react.herokuapp.com/api/categories', function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var categories = JSON.parse(body);
						var obj = {categories: categories}
						jsonfile.writeFile(jsonCategories, obj, function (err) {
						  console.error(err)
						})
            res.json({categories: categories, message: 'hooray! welcome to our api!' });
        }
    })
})


app.get('/products',function (req, res){
	request.get('https://tnt-react.herokuapp.com/api/products?'+querystring.stringify(req.query), function(err, response, body) {
				console.log(err)
				if (!err && response.statusCode == 200) {
            var products = JSON.parse(body);
						console.log(products);
						res.json({products: products });
        }
    })
})

function productById(productId){
	request.get('http://tnt-react.herokuapp.com/api/products/'+productId, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var products = JSON.parse(body);
						return products;
        }
    })
}

function productsByCategoryId(categoryId, per_page = 5){
	var data = {category: categoryId, per_page: per_page}
	return fetch('https://tnt-react.herokuapp.com/api/products?'+querystring.stringify(data)).then((response) => response.json())
}



bot.on('message', function(userId, message){
    bot.sendTextMessage(userId, "Echo Message:" + message);
});
/// Quickreply Payload Handler
bot.on('quickreply', function(userId, payload){
	console.log(payload)
	if(payload == phanloaiquan.dahoatdong.payload){
		getQuickReplyUsedShopPayload(userId);
	}

	if(payload == phanloaiquan.moihoatdong.payload){
		getQuickReplyNewShopPayload(userId)
	}
});

function getQuickReplyUsedShopPayload(userId){
	bot.sendTextMessage(userId, "Đối với quán đã hoạt động, quý khách có thể cần mua sản phẩm sau?");

	categories().then(function(categories){
		console.log(categories)
		var elements = []
		categories.map(function(category){
			var newElement = {
          "title": category.name,
          "image_url": category.image.src,
          "subtitle": category.description,
          "default_action": {
              "type": "web_url",
              "url": "tnt-react.herokuapp.com/categories/"+category.id,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
          },
          "buttons": [
                {
                    "title": "View",
                    "type": "web_url",
                    "url": "tnt-react.herokuapp.com/categories/"+category.id,
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall",
                    //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                }
          ]
      };
			elements.push(newElement);
		})
		console.log(elements)
		bot.sendListMessage(userId, elements);
	})
	/*var elements = [
		{
			"title": "Cafe nguyên chất",
			"image_url": "http://nguyenlieuphache.com.vn/upload/tra/coffee-tree-dac-biet.jpg",
			"subtitle": "Cà phê Robusta, Culi, Arabica nguyên chất pha máy, pha phin",
			"buttons": [
				{
					"type": "postback",
					"title": "Chọn mua cafe",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE"
				}
			]
		},
		{
			"title": "Mứt trái cây",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/mut-trai-cay01.png",
			"subtitle": "Mứt trái cây dùng cho thay thế trái cây tươi và làm được nhiều món hấp dẫn",
			"buttons": [
				{
					"type": "postback",
					"title": "Chọn mua mứt",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_JAM"
				}
			]
		},
		{
			"title": "Syrup pha chế",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/syrup-pha-che.png",
			"subtitle": "Syrup dùng trong các loại thức uống soda, smoothie,... mát lạnh",
			"buttons": [
				{
					"type": "postback",
					"title": "Chọn mua Syrup",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_SYRUP"
				}
			]
		},
		{
			"title": "Dụng cụ pha chế",
			"image_url": "http://nguyenlieuphache.com.vn/upload/thietbi/isi-binh-xit-kem.jpg",
			"subtitle": "Máy xay sinh tố, bình xịt kem, dụng cụ pha cafe, các món take away,...",
			"buttons": [
				{
					"type": "postback",
					"title": "Mua dụng cụ",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_BARTENDER_TOOL"
				}
			]
		},
	];
*/
	//bot.sendGenericMessage(userId, elements);
}

function getQuickReplyNewShopPayload(userId){
	bot.sendTextMessage(userId, "Đối với quán mới, quý khách có thể cần mua sản phẩm sau?");

	var elements = [
		{
			"title": "Máy Pha -  Xay cà phê",
			"image_url": "http://nguyenlieuphache.com.vn/upload/Mayxaycafe/may-xay-cafe-1-3-hp-1a.jpg",
			"subtitle": "Các loại Máy pha cafe Espresso và xay cà phê dành cho quán",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem Sản phẩm",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_MAKER"
				}
			]
		},
		{
			"title": "Dụng cụ pha chế",
			"image_url": "http://nguyenlieuphache.com.vn/upload/thietbi/isi-binh-xit-kem.jpg",
			"subtitle": "Máy xay sinh tố, bình xịt kem, dụng cụ pha cafe, các món take away,...",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem dụng cụ",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_BARTENDER_TOOL"
				}
			]
		},
		{
			"title": "Nguyên liệu pha chế",
			"image_url": "http://nguyenlieuphache.com.vn/upload/Mut/Berrino/kiwi.jpg",
			"subtitle": "Mứt trái cây, syrup, trà, matcha, sữa tươi pha chế các món takeaway và cafe",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem nguyên liệu",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_MATERIAL_BARTENDER"
				}
			]
		}
	];

	bot.sendGenericMessage(userId, elements);
}
/// End Quickreply Payload Handler




/// PostBack Payload Handler



bot.on('postback', function(userId, payload){

    if (payload == "GET_STARTED") {
        getStarted(userId);
    }

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COLLECTION"){
		showShopCollection(userId);
		console.log("Enter postback show collection");
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_START_SHOPPING"){
		getStartShoppingPostBack(userId);
	}


	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHARE_BOT"){
		getSharePostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_FEEDBACK_HELP_LEGAL"){
		getFHLPostBack(userId);
	}


	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE"){
		getShowCoffeePostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_JAM"){
		getShowJamPostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_SYRUP"){
		getShowSyrupPostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_BARTENDER_TOOL"){
		getShowBartenderToolPostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_MAKER"){
		getShowCoffeeMakerPostBack(userId);
	}

	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_MATERIAL_BARTENDER"){
		getShowBartenderMaterialPostBack(userId);
	}


	if (payload == "DEVELOPER_DEFINED_PAYLOAD_FOR_BUY_COFFEE_ROBUSTA"){
		getBuyCoffeeRobustaPostBack(userId);
	}


    // Other postback callbacks here
    // ...

});


function getStartShoppingPostBack(userId){
	var text = "Nguyên liệu pha chế có các sản phẩm theo danh mục saus:";
	bot.sendTextMessage(userId,text);
/*	categories().then(function(categories){
		var elements = []
		categories.map(function(index,category){
			if(index == 1 || index  == 2 || index == 3){
			var newElement = {
          "title": category.name,
          "image_url": category.image.src,
          "subtitle": category.description,
          "default_action": {
              "type": "web_url",
              "url": "tnt-react.herokuapp.com/categories/"+category.id,
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
          },
          "buttons": [
                {
                    "title": "View",
                    "type": "web_url",
                    "url": "tnt-react.herokuapp.com/categories/"+category.id,
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall",
                    //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                }
          ]
      };
			elements.push(newElement);
		}
	})*/

	  var elements = [
                {
                    "title": "Classic T-Shirt Collection",
                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/collection.png",
                    "subtitle": "See all our colors",
                    "default_action": {
                        "type": "web_url",
                        "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                		},
                    "buttons": [
                        {
                            "title": "View",
                            "type": "web_url",
                            "url": "https://peterssendreceiveapp.ngrok.io/collection",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                        }
                    ]
                },
                {
                    "title": "Classic White T-Shirt",
                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/white-t-shirt.png",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=100",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=100",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                        }
                    ]
                },
                {
                    "title": "Classic Blue T-Shirt",
                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=101",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=101",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                        }
                    ]
                },
                {
                    "title": "Classic Black T-Shirt",
                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/black-t-shirt.png",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=102",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                    },
                    "buttons": [
                        {
                            "title": "Shop Now",
                            "type": "web_url",
                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=102",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                        }
                    ]
                }
            ]

	//	console.log(elements)
		bot.sendListMessage(userId, elements);

}

function getSharePostBack(userId){
	var elements = [
		{
			"title": "Mua sắm mọi thứ dành cho quán cafe tại TNTDrink",
			"image_url": "https://scontent.fsgn2-2.fna.fbcdn.net/v/t1.0-9/12986925_1705723756336966_8557111046595659161_n.jpg?oh=08b611f25742ea7bebce3e661bd88311&oe=58D2919D",
			"subtitle": "Mua nguyên liệu, dụng cụ pha chế. Cafe nguyên chất, máy pha - xay cafe giá tốt. Thử ngay!",
			"item_url":"http://m.me/nguyenlieuphachecom",
			"buttons": [
				{
					"type": "element_share",
				}
			]
		},

	];
	bot.sendGenericMessage(userId, elements);
}


function getFHLPostBack(userId){

}


function getShowCoffeePostBack(userId){
	bot.sendTextMessage(userId, "Sản phẩm cafe sạch - cafe nguyên chất Coffee Tree");

	var elements = [
		{
			"title": "Robusta Nâu thượng hạng",
			"image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/hinh-ca-phe/robusta-image-228x228.png",
			"subtitle": "Giá 155.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
			"buttons": [
				{
					"type": "postback",
					"title": "Mua 155.000 VNĐ/Kg",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_BUY_COFFEE_ROBUSTA"
				}
			]
		},
		{
			"title": "Culi Nâu Đặc Biệt",
			"image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/hinh-ca-phe/culi-hat-228x228.png",
			"subtitle": "Giá 190.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem Sản phẩm",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_ROBUSTA"
				}
			]
		},
		{
			"title": "Arabica Nâu đặc biệt",
			"image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/hinh-ca-phe/arabica-bean-228x228.png",
			"subtitle": "Giá 290.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem Sản phẩm",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_ROBUSTA"
				}
			]
		},
		{
			"title": "Arabica Nâu Medium",
			"image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/ca-phe/arabica-medium-228x228.jpg",
			"subtitle": "Giá 250.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem Sản phẩm",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_ROBUSTA"
				}
			]
		},

		{
			"title": "Coffee tree special",
			"image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/ca-phe/coffee-tree-dac-biet-228x228.jpg",
			"subtitle": "Giá 200.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem Sản phẩm",
					"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_ROBUSTA"
				}
			]
		},
	];

	bot.sendGenericMessage(userId, elements);
}

function getShowJamPostBack(userId){
		var categoryId = 36;
		var elements = []
		var productsReq = productsByCategoryId(categoryId,5);

		productsReq.then(function(products) {
			//var products = JSON.parse(result);
			console.log(products);
			products.map(function(product) {
				console.log(product);
				var newElement = {
					"title": product.name,
					"image_url": product.images[0].src,
					"subtitle": product.description,
					"buttons": [
						{
							"type": "postback",
							"title": "Xem Sản phẩm",
							"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COFFEE_ROBUSTA"
						},
						{
							"type": "web_url",
							"title": "Mua Sản phẩm",
							"url": "http://tnt-react.herokuapp.com/products/"+product.id
						}
					]
				}
				elements.push(newElement)
			});
			bot.sendGenericMessage(userId, elements);
		})

}

function getShowSyrupPostBack(userId){

}

function getShowCoffeeMakerPostBack(userId){

}

function getShowBartenderMaterialPostBack(userId){

}

function getShowBartenderToolPostBack(userId){

}


function getBuyCoffeeRobustaPostBack(userId){
	var receipt = {
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

	bot.sendReceiptMessage(userId, receipt);
}

function getStarted(userId){

	bot.getUserProfile(userId, function (err, profile) {
		console.log(profile);
		var text = "Xin chào "+profile.first_name+" "+profile.last_name+", Cảm ơn quý bạn đã ghé thăm trang Nguyên liệu pha chế, tôi là \"Trợ lý mua sắm\" của bạn. Hãy xem qua hướng dẫn và bắt đầu mua sắm nhé. Cảm ơn ^^!";
		var buttons = [
			{
				"type": "web_url",
				"url": "http://nguyenlieuphache.com.vn",
				"title": "Ghé thăm trang web"
			},
			{
				"type": "postback",
				"title": "Bắt đầu mua hàng",
				"payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_START_SHOPPING"
			}
		];
		// Get started process
		bot.sendButtonMessage(userId, text, buttons);
	});

}


function showShopCollection(userId){
	var elements = [
		{
			"title": "Máy xay cà phê",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/may-xay-ca-phe.png",
			"subtitle": "Máy xay cà phê dành cho quán",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem sản phẩm",
					"payload": "VIEW_PRODUCT_1"
				}
			]
		},
		{
			"title": "Máy xay sinh tố",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/may-xay-sinh-to.png",
			"subtitle": "Máy sinh tố chuyên nghiệp dành cho quán",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem sản phẩm",
					"payload": "VIEW_PRODUCT_2"
				}
			]
		},
		{
			"title": "Mứt trái cây",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/mut-trai-cay01.png",
			"subtitle": "Mứt trái cây dùng cho thay thế trái cây tươi và làm được nhiều món hấp dẫn",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem sản phẩm",
					"payload": "VIEW_PRODUCT_3"
				}
			]
		},
		{
			"title": "Syrup pha chế",
			"image_url": "http://nguyenlieuphache.com/catalog/view/theme/nlpc2/images/syrup-pha-che.png",
			"subtitle": "Syrup dùng trong các loại thức uống soda, smoothie,... mát lạnh",
			"buttons": [
				{
					"type": "postback",
					"title": "Xem sản phẩm",
					"payload": "VIEW_PRODUCT_3"
				}
			]
		}
	];

	bot.sendGenericMessage(userId, elements);

}



/// End PostBack Payload Handler


// Setup listener for attachment
bot.on('attachment', function(userId, attachment){

    // Echo the audio attachment
    if (attachment[0].type == "audio") {
        bot.sendAudioAttachment(userId, attachment[0].payload.url);
    }

});





var menuButtons = [
    {
        "type": "postback",
        "title": "Top selling tại TNTDrink",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHOW_COLLECTION"
    },
    {
        "type": "postback",
        "title": "Bắt đầu mua sắm",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_START_SHOPPING"
    },
    {
        "type": "web_url",
        "title": "View Website",
        "url": "http://nguyenlieuphache.com.vn"
    },
	{
        "type": "postback",
        "title": "Chia sẻ",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_SHARE_BOT"
    },

	{
        "type": "postback",
        "title": "Feedback, help & legal",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_FEEDBACK_HELP_LEGAL"
    }
];
bot.setPersistentMenu(menuButtons);


http.createServer(app).listen((process.env.PORT || 5000))
