const wooapi = require('./wooapi.js')
function actions() {

}

actions.prototype.sendCategoriesList = function(sender){
  console.log(sender)
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



module.exports = actions;
