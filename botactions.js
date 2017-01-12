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
        let element = botly.createListElement({
            title: category.name,
            image_url: category.image.src,
            subtitle: category.description,
            buttons: [
                {title: "Xem sản phẩm", payload: "DO_WORK"},
            ],
            default_action: {
                "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
            }
        });

       elements.push(element)
    })


    botly.sendList({id: sender, elements: elements, buttons: botly.createPostbackButton("Continue", "continue"), top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.LARGE},function (err, data) {
        console.log("send list cb:", err, data);
    });
  })

};



module.exports = BotActions;
