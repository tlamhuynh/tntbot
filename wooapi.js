const fetch = require('node-fetch');
const querystring =  require('querystring');
function WooAPI(opt) {
  if (!(this instanceof WooAPI)) {
      return new WooAPI(opt);
  }
}

WooAPI.prototype.getCategories = function(){
   return fetch('https://tnt-react.herokuapp.com/api/categories').then((response) => response.json())
}

WooAPI.prototype.productsByCategoryId = function(categoryId, per_page = 5){
  var data = {category: categoryId, per_page: per_page}
  return fetch('https://tnt-react.herokuapp.com/api/products?'+querystring.stringify(data)).then((response) => response.json())
}


WooAPI.prototype.productsPriceByName = function(search = ''){
  var data = {search: search, per_page: 1}
  return fetch('https://tnt-react.herokuapp.com/api/products?'+querystring.stringify(data)).then((response) => response.json())
}

WooAPI.prototype.productsByKeyword = function(search = ''){
  var data = {search: search, per_page: 5}
  return fetch('https://tnt-react.herokuapp.com/api/products?'+querystring.stringify(data)).then((response) => response.json())
}
module.exports = WooAPI;
