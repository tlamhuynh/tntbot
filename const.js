'use strict';

// Wit.ai parameters
//const WIT_TOKEN = process.env.WIT_TOKEN;
const WIT_TOKEN = "ZH62LCXDJ4PQDSN6IMWJ77BA6GI262TP";
if (!WIT_TOKEN) {
  throw new Error('missing WIT_TOKEN');
}

// Messenger API parameters
//const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_PAGE_TOKEN = "EAAHwsu50wLoBAICcbDH6muNi0k3AFGLYmBz1O44pvCtp6oQNCfmemxarNfdIcW6oyqPJc0wO1qJzu7sz0xzRIfWWAeB5LtXnZABEzj6Tb4ZA2RgckDYcVuZCzACMWoSFLjSePu0p2q00DhQnqdllAilhmE286YCFxIJDYRuzgZDZD";

//const FB_APP_SECRECT = process.env.FB_APP_SECRECT;

const FB_APP_SECRECT = "5a0c8ecb38855d9aba177211203764db";

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

if (!FB_VERIFY_TOKEN) {
  FB_VERIFY_TOKEN = "tlamhuynhtntsmartbot";
}





module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  FB_APP_SECRECT: FB_APP_SECRECT,
};
