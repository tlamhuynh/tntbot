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
  let element = {
    "title": product + " thượng hạng",
    "image_url": "http://coffeetree.vn/ca-phe/image/cache/catalog/hinh-ca-phe/robusta-image-228x228.png",
    "subtitle": "Giá 155.000 VNĐ/Kg.Cà phê sạch Robusta Nâu Thượng Hạng có vị đắng vừa, mùi hương thơm nhẹ, cafein vừa, chát, hậu vị ngọt.",
    "buttons": [
      {
        "type": "postback",
        "title": "Mua 155.000 VNĐ/Kg",
        "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_BUY_COFFEE_ROBUSTA"
      }
    ]
  };

  botly.sendGeneric({id: sender, elements: element},function (err, data) {
      console.log("send generic cb:", err, data);
  });
}



module.exports = BotActions;
