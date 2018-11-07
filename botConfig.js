'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

let botConfig = {
    pageAccessToken: 'EAAIxbPex8eIBAGEhnywRnwxZAUwu5ZA0gTxJTrjtLdHTTm9EnWZAnuV4Qt7wjEsaDY9no5XFQ9XyH5McOVpnROQAZC15oeGm9c0Ocb3DXyhJfBZAJs9b0DZB3wJfGz2gQ5MUeAYfqMwX46SuPUxLVgnp1eUWRttxgKx8zFZB2lZB7QZDZD',
    // pageAccessToken: 'EAAIxbPex8eIBAO7YWSp6FeDSbLetlhacmZAUKrDRZBkNOQ8FZB4DXtl3IADZAuD37ZAwF8fg0T20S8oAD1pCr0nUDsp6vMvZBVXZBAJFByF8Nds1FtIueTZBZBKXWFV02vW6E50GZB5r0p4u2H3Amx08KC2fPNa4qZAZC7TNI98DZBwm7gwZDZD',
    appID: '617294035284450',
    appSecret: 'a0a2bd892c79ec2943ca61cc1bbc9410',
    verifyToken: "meBotMe",
    privkey: "/etc/letsencrypt/archive/www.mebotengine.ml/privkey1.pem",
    cert: "/etc/letsencrypt/archive/www.mebotengine.ml/cert1.pem",
    chain: "/etc/letsencrypt/archive/www.mebotengine.ml/chain1.pem",
    pageID: '1913415872266963',
    database: {
      host: 'prjc-db.cerygvvcpfau.us-east-1.rds.amazonaws.com',
      user: 'prjc_admin',
      database: 'meguild',
      password: '7%C0475Fp}u440X',
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
    {
      key: 'initServer',
      value: function initServer(handler)  {
        const app = express().use(bodyParser.json());
        let pageToken = "";

        app.route('/webhook')
        .get((req, res) => {
          if (req.query['hub.verify_token'] === botConfig.verifyToken) {
            return res.send(req.query['hub.challenge']);
          }
          res.send('Error, wrong validation token');
        })
        .post((req, res) => {
          handler(req, res);
        });
      
      app.post('/token', (req, res) => {
        // console.log('token post', req.body);
        if (req.body.verifyToken === botConfig.verifyToken) {
          pageToken = req.body.token;
          return res.sendStatus(200);
        }
        res.sendStatus(403);
      });
      app.get('/token', (req, res) => {
        // console.log('token get', req.body);
        if (req.body.verifyToken === botConfig.verifyToken) {
          return res.send({
            token: pageToken
          });
        }
        res.sendStatus(403);
      });
      let server  = require('http').createServer(app);
      server.listen(process.env.PORT || 55555, () => {
        console.log('App is ready on port 55555');
      });


      // https.createServer({
      //   key: fs.readFileSync(botConfig.privkey),
      //   cert: fs.readFileSync(botConfig.cert),
      //   ca: fs.readFileSync(botConfig.chain)
      // }, app).listen(55555, function () {
      //   console.log('App is ready on port 55555');
      // });      
       
      }
    }    
]);

  return config;

}();

exports.default = config;
module.exports = exports['default'];