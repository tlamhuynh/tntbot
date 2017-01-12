'use strict';

// Wit.ai parameters
//const WIT_TOKEN = process.env.WIT_TOKEN;
const WIT_TOKEN = "wittoken";
if (!WIT_TOKEN) {
  throw new Error('missing WIT_TOKEN');
}

// Messenger API parameters
//const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_PAGE_TOKEN = "EAAHwsu50wLoBAGGRgSUg5xZCy3sHmdDW4AlkUXrZA9uZBk8IccCDbwzmBZBsmT88wB8w9ds0MXH754SnPpZCPayB5rnUw3DBBcxjEGcYiZAnifLvpH0N5DdeuO3NkdFHtzBc9qZB13s7U4YrYjm8py6obHhBu3sIU6ZBDp7rnCvk7wZDZD";

//const FB_APP_SECRECT = process.env.FB_APP_SECRECT;

const FB_APP_SECRECT = "5a0c8ecb38855d9aba177211203764db";

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

if (!FB_VERIFY_TOKEN) {
  FB_VERIFY_TOKEN = "anhtuandeptrailaday";
}



module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  FB_APP_SECRECT: FB_APP_SECRECT,
};