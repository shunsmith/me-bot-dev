// MySQL handler v0.1 (PrjC SAS)


'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
let rejectStatus = '';
let rejectCount = 1;


let botConfig = require('./botConfig');
let config = new botConfig();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var messageHandler = function(){
  
  function messageHandler() {
    _classCallCheck(this, messageHandler);
    // this.initDB();
  }
  _createClass(messageHandler, [
    {
      key: 'sendTextMessage',
      value: function sendTextMessage(ID, str, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
  
        messenger.sendTextMessage(ID, str, function (err, body) {
          if (err) return console.error('error', err);
          if (callback !== null) {
            callback();
          }
        });
      }
    },
    {
      key: 'showTyping',
      value: function showTyping(ID, duration, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
        messenger.sendAction(ID, 'typing_on');
        setTimeout(() => {
          messenger.sendAction(ID, 'typing_off');
          callback();
        }, duration);
          }
    },
    {
      key: 'showSeen',
      value: function showSeen(ID, duration, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
        messenger.sendAction(ID, 'mark_seen');
        setTimeout(() => {
          callback();
        }, duration);
      }
    },

    {
      key: 'sendImage',
      value: function sendImage(ID, img, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
        messenger.sendImageMessage(ID, img, function (err, evt) {
          if (err) return console.log(err);
          callback();
        });
          }
    },

    {
      key: 'sendButtonMessage',
      value: function sendButtonMessage(ID, str, btnOptions, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
        var btnArray = [];
        for (var i = 0; i < btnOptions.length; i++) {
          btnArray.push({
            content_type: 'text',
            title: btnOptions[i].title,
            payload: btnOptions[i].payload
          });
        }
        messenger.sendQuickRepliesMessage(ID, str, btnArray, function (err, evt) {
          if (err) return console.log(err);
          try {
            callback();
          } catch (e) {
            /* */
          }
        });
    
        }
    },
    {
      key: 'sendRejectionMessage',
      value: function sendRejectionMessage(ID, YesNoCheck) {
        YesNoCheck = typeof YesNoCheck !== 'undefined' ? YesNoCheck : false;
        let selected = '';
        let responses = [
          'I’d wager 5 Quirkes if you rephrase that, I can better understand you.',
          'I hear you. But, I’m not certain what you mean. Yes or no?',
          'I’m afraid we’ll never fully understand this Ancient technology. Maybe try retyping your response as yes or no?',
          'This Ancient Tech can be so problematic. Please try again.',
          'Hmm. Maybe typing “yes” or “no” can help this ancient tech to function properly.',
          'The Guild of Engineers are still figuring out this Ancient Tech. Maybe answering “yes” or “no” will work better.'
        ];
        let yesnoResponses = [
          'I hear you. But, I’m not certain what you mean. Yes or no?',
          'Hmm. Maybe typing “yes” or “no” can help this ancient tech to function properly.',
          'I’m afraid we’ll never fully understand this Ancient technology.\nMaybe try retyping your response as yes or no?'
        ];
        if (user[ID].attempts < 1) {
          selected = responses[Math.floor(Math.random() * responses.length)];
          sendTextMessage(ID, selected);
          user[ID].attempts += 1;
        } else if (user[ID].attempts == 1) {
      
          selected = (YesNoCheck) ? yesnoResponses[Math.floor(Math.random() * yesnoResponses.length)] : responses[Math.floor(Math.random() * responses.length)];
          sendTextMessage(ID, selected);
          user[ID].attempts += 1;
        } else {
          sendTextMessage(ID, 'I thought you’d be more helpful than that.\nMaybe we can try again another time.\nGood bye.');
          user[ID].status = 'endInteraction1';
        }
        }
    },
    {
      key: 'resetAttempts',
      value: function resetAttempts(ID) {
        user[ID].attempts = 0;
        }
    },

    {
      key: 'showEmojiResponse',
      value: function showEmojiResponse(ID) {
        showTyping(ID, 2200, function () {
            sendTextMessage(ID, 'Seems this old tech cannot decipher icons of emotion.', () => {
              showTyping(ID, 1000, function () {
                sendTextMessage(ID, 'Let’s try a simple yes or no.');
              });
            });
          });
    }
    },
]);

  return messageHandler;
}();

exports.default = messageHandler;
module.exports = exports['default'];