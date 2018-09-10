'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let botConfig = {
    pageAccessToken: 'EAAEKZCP7pYS4BAOjn4vIZBJDQrOhFXoSHZAEc68PBDTMD5jfjspSCKUDHEea8Mod3IPZBGf1EQGCoD3HbStYI0cMnnCVwm21UB3G59txAzEnpP6Mgp6MvO4BDUpBOuesUnVWOJIKbae6Ni3oM0Sis1XSZAfsEnTZC59Q8wic1FcgZDZD',
    appID: '293556701454638',
    appSecret: '735601101a2e0a3ba6fae0d79ce7c727',
    verifyToken: "meBotMe",
    privkey: "/etc/letsencrypt/archive/stage-guildrep.mortalengines.com/privkey1.pem",
    cert: "/etc/letsencrypt/archive/stage-guildrep.mortalengines.com/cert1.pem",
    chain: "/etc/letsencrypt/archive/stage-guildrep.mortalengines.com/chain1.pem",
    pageID: '1913415872266963',
    database: {
        host: 'vpc-meschatbot-prod.ckvbtxg91kfo.us-west-2.rds.amazonaws.com',
        user: 'meguildpuser01',
        database: 'MEGUILDPDB01',
        password: 'CI9jkucU8J',
        port: '3306'    
      }  
};
var config = function(){

    function config() {
      _classCallCheck(this, config);
    }
    _createClass(config, [
       {
        key: 'configInfo',
        value: function configInfo() {
          return botConfig;
        }
      },
  ]);
  
    return config;
  
  }();
  
  exports.default = config;
  module.exports = exports['default'];