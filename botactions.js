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



module.exports = BotActions;
