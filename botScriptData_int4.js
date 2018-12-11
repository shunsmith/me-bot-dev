'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  Almost all copy for the bot is pulled from here. Primary exception is for the any of the lines below that have dynamic content being pulled in. Vars were being returned as undefined, so these lines of text are applied directly in botHandler()
*/
// --------------- Script Data -----------------------
let media = {};
  
let phase4 = {
  paths:{
    i4_scene1: {
      intro:'(Username), are you there? It’s urgent.',
      yes:'Thank goodness! Plans are being made to strike against our oppressors. It’s time for you to JOIN THE REBELLION.',
      no:'Very humorous.',
      nextStatus:'i4_scene2'
    }, 
    i4_scene1_followup: {
      intro:'(Username), are you there? It’s urgent.',
      yes:'Thank goodness!  Plans are being made to strike against our oppressors. It’s time for you to JOIN THE REBELLION.',
      no:'Very humorous.',
      nextStatus:'i4_scene2'
    }, 
    i4_scene2: {
      intro:'Are you ready?',
      yes:'I knew we could count on you, (Username)!',
      no:'Get ready, (Username)!',
      nextStatus:'i4_scene3',
      exitStatus:'endPrompt1'
    },
    //call image maker
    i4_scene3: {
      intro:'To pledge your allegiance to the resistance, save this image to your device then update your profile with it.',
      intro2:'Did you Join The Rebellion?',
      yes:'Great! Now lay low and wait for our signal.',
      yes2:'When the time comes, you’ll know what to do.',
      no:'Please do so when you get the chance!',
      no2:'Then lay low and wait for our signal. You’ll know what to do.',
      nextStatus:'i4_scene4'
    },
    i4_scene4: {
      intro:'We’ll be in touch.',
      nextStatus:'endInteraction3'
    },
    endInteraction3: {
      intro:'The Rebellion has begun. It’s time to fight for the future.',
      button:'Join Us!',
      url:'https://tickets.mortalengines.com/',
      nextStatus:'NoResponse'
    }
  }
  };
  
  var botScriptDataInteractionFour = function(){

    function botScriptDataInteractionFour() {
      _classCallCheck(this, botScriptDataInteractionFour);
    }
    _createClass(botScriptDataInteractionFour, [
       {
        key: 'phase4Script',
        value: function phase4Script() {
          return phase4;
        }
      },
  ]);
  
    return botScriptDataInteractionFour;
  
  }();
  
  exports.default = botScriptDataInteractionFour;
  module.exports = exports['default'];