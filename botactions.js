const WooAPI = require('./wooapi.js')
const wooAPI = new WooAPI();
const Config = require('./const.js');
const Botly = require("botly");




const botly = new Botly({
    verifyToken: Config.FB_VERIFY_TOKEN,
    accessToken: Config.FB_PAGE_TOKEN
});



function BotActions() {
    if (!(this instanceof BotActions)) {
        return new BotActions();
    }
}

BotActions.prototype.sendCategoriesList = function(sender){
  wooAPI.getCategories().then(function (categories){
    console.log(sender)
    let elements = []
    categories.map(function(category){
        let element = {
            title: category.name,
            image_url: category.image.src,
            subtitle: category.description,
            buttons: [
                botly.createPostbackButton("Chọn "+category.name, "PRODUCT_BY_CATEGORY_"+category.id)
            ],

        };

       elements.push(element)
    })


    botly.sendGeneric({id: sender, elements: elements},function (err, data) {
        console.log("send generic cb:", err, data);
    });
  })

};


BotActions.prototype.sendProducts = function(sender,categoryId){
  wooAPI.productsByCategoryId(categoryId,5).then(function(products){
    let elements = [];
    products.map(function(product){
        let element = {
            title: product.name,
            image_url: product.images[0].src,
            subtitle: product.short_description,
            buttons: [
                botly.createWebURLButton("Mua", "http://tnt-react.herokuapp.com/products/"+product.id),
                botly.createPostbackButton("Thêm vào wishlist", "ADD_WISHLIST_PRODUCT_"+product.id)
            ],

        };

       elements.push(element)
    });

    botly.sendGeneric({id: sender, elements: elements},function (err, data) {
        console.log("send generic cb:", err, data);
    });
  })


}

BotActions.prototype.sendProduct = function(sender,product){
  wooAPI.productsPriceByName(product).then(function(products){
    product = products[0]; // we should call a weather API here

    let element = {
      "title": product.name,
      "image_url": product.images[0].src,
      "subtitle": product.short_description,
      "buttons": [
        {
          "type": "postback",
          "title": "Mua",
          "payload": "BUY_PRODUCT_BY_ID_"+product.id
        }
      ]
    };

    botly.sendGeneric({id: sender, elements: element},function (err, data) {
        console.log("send generic cb:", err, data);
    });
  });

}

BotActions.prototype.sendCoffeeList = function(sender){
  wooAPI.productsByCategoryId(86,4).then(function(products){
    let elements = []
    products.map(function(product){
      let element = botly.createListElement({
                      title: product.name,
                      image_url: product.images[0].src,
                      subtitle: 'Giá: '+product.price + ' VNĐ',
                      buttons: [
                          {title: "Mua", payload: "DO_WORK"},
                      ],
                      default_action: {
                          "url": "http://tnt-react.herokuapp.com/products/"+product.id,
                      }
                    });
      elements.push(element)
    })

    botly.sendList({id: sender, elements: elements, buttons: botly.createPostbackButton("Continue", "continue"), top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.LARGE},function (err, data) {
        console.log("send list cb:", err, data);
    });
  });
}

module.exports = BotActions;
